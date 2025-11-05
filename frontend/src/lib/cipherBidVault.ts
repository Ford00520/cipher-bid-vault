import { Address, createPublicClient, createWalletClient, custom, getContract, parseEther } from "viem";
import { CipherBidVaultABI } from "./generated/CipherBidVaultABI";
import {
  CHAIN_IDS,
  getActiveChainId,
  pickChain,
  transportFor,
  getContractAddressFor,
  ensureWalletOnChain,
} from "./networks";

// Use generated ABI from deployments
export const cipherBidVaultAbi = CipherBidVaultABI.abi;

export type AuctionView = {
  id: bigint;
  title: string;
  description: string;
  creator: Address;
  startingBid: bigint;
  highestBidder: Address;
  endTime: bigint;
  ended: boolean;
  finalized: boolean;
};

export async function getCipherBidVaultClient() {
  // Prefer the wallet chain when available; fallback to env/default
  const chainId = await getActiveChainId();
  const chain = pickChain(chainId);
  const transport = transportFor(chainId);
  const address = getContractAddressFor(chainId);
  if (!address) throw new Error("CipherBidVault address not configured for selected network.");
  const publicClient = createPublicClient({ chain, transport });
  return getContract({ address, abi: cipherBidVaultAbi, client: publicClient });
}

export async function fetchAuctions(): Promise<AuctionView[]> {
  const contract = await getCipherBidVaultClient();
  const total = await contract.read.getAuctionCount();
  const ids = Array.from({ length: Number(total) }, (_, i) => BigInt(i + 1));
  const items: AuctionView[] = [];
  for (const id of ids) {
    const result = await contract.read.getAuction([id]);
    items.push({
      id: result[0],
      title: result[1],
      description: result[2],
      creator: result[3] as Address,
      startingBid: result[4],
      highestBidder: result[6] as Address,
      endTime: result[7],
      ended: result[8],
      finalized: result[9],
    });
  }
  return items;
}

export async function createAuctionWrite(params: {
  title: string;
  description: string;
  startingBidEth: string;
  durationHours: number;
}) {
  const chainId = await getActiveChainId();
  const chain = pickChain(chainId);
  const address = getContractAddressFor(chainId);
  if (!address) throw new Error("CipherBidVault address not configured for selected network.");
  if (!(window as any).ethereum) throw new Error("No injected wallet found. Please install MetaMask or similar.");

  // Ensure wallet is on the same chain to avoid cross-network calls
  await ensureWalletOnChain(chainId);

  const publicClient = createPublicClient({ chain, transport: transportFor(chainId) });
  const walletClient = createWalletClient({
    chain,
    transport: custom((window as any).ethereum),
  });

  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("Wallet not connected.");

  const contract = getContract({
    address,
    abi: cipherBidVaultAbi,
    client: { public: publicClient, wallet: walletClient },
  });

  const startingBidWei = parseEther(params.startingBidEth || "0");
  try {
    const hash = await contract.write.createAuction([
      params.title,
      params.description,
      BigInt(startingBidWei),
      BigInt(params.durationHours),
    ], { account });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (err: any) {
    // Normalize user rejection error from MetaMask and others
    if (err?.code === 4001 || /User denied transaction/i.test(err?.message || "")) {
      throw new Error("User rejected the transaction request.");
    }
    throw err;
  }
}

export async function placeBidWrite(params: {
  auctionId: bigint;
  clearBid: number;
}) {
  const chainId = await getActiveChainId();
  const chain = pickChain(chainId);
  const address = getContractAddressFor(chainId);
  if (!address) throw new Error("CipherBidVault address not configured for selected network.");
  if (!(window as any).ethereum) throw new Error("No injected wallet found. Please install MetaMask or similar.");
  const relayerUrl = import.meta.env.VITE_FHE_RELAYER_URL as string | undefined;
  if (!relayerUrl) throw new Error("Relayer URL not configured (VITE_FHE_RELAYER_URL).");

  // Ensure wallet is on the same chain to avoid cross-network calls
  await ensureWalletOnChain(chainId);

  const publicClient = createPublicClient({ chain, transport: transportFor(chainId) });
  const walletClient = createWalletClient({
    chain,
    transport: custom((window as any).ethereum),
  });

  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("Wallet not connected.");

  // Ask relayer to generate encrypted input for euint64
  const resp = await fetch(relayerUrl + "/encrypt-input", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chainId,
      contractAddress: address,
      caller: account,
      type: "euint64",
      value: Number(params.clearBid),
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Relayer encryption failed: ${text}`);
  }
  const data = await resp.json() as { handles: string[]; inputProof: `0x${string}` };
  const handle0 = BigInt(data.handles[0]);

  const contract = getContract({
    address,
    abi: cipherBidVaultAbi,
    client: { public: publicClient, wallet: walletClient },
  });

  try {
    const hash = await contract.write.placeBid([params.auctionId, handle0, data.inputProof], { account });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (err: any) {
    if (err?.code === 4001 || /User denied transaction/i.test(err?.message || "")) {
      throw new Error("User rejected the transaction request.");
    }
    throw err;
  }
}

export async function decryptMyBid(params: { auctionId: bigint }): Promise<bigint> {
  const chainId = await getActiveChainId();
  const chain = pickChain(chainId);
  const address = getContractAddressFor(chainId);
  if (!address) throw new Error("CipherBidVault address not configured for selected network.");
  const relayerUrl = import.meta.env.VITE_FHE_RELAYER_URL as string | undefined;
  if (!relayerUrl) throw new Error("Relayer URL not configured (VITE_FHE_RELAYER_URL).");

  if (!(window as any).ethereum) throw new Error("No injected wallet found. Please install MetaMask or similar.");
  const publicClient = createPublicClient({ chain, transport: transportFor(chainId) });
  const walletClient = createWalletClient({ chain, transport: custom((window as any).ethereum) });
  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("Wallet not connected.");

  // Fetch encrypted bid for the current user
  const contract = getContract({ address, abi: cipherBidVaultAbi, client: publicClient });
  const encBid = await contract.read.getBid([params.auctionId, account]);

  // Ask relayer to decrypt or re-encrypt to user and return a clear value
  // Endpoint name may vary across deployments; try a primary path and fall back.
  const payload = {
    chainId,
    contractAddress: address,
    caller: account,
    type: "euint64" as const,
    ciphertext: encBid as `0x${string}`,
  };

  const tryPaths = ["/decrypt-output", "/reencrypt-output", "/decrypt"] as const;
  let lastError: any;
  for (const p of tryPaths) {
    try {
      const resp = await fetch(relayerUrl.replace(/\/$/, "") + p, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = (await resp.json()) as any;
      // Accept several shapes: { value }, { clearValue }, { result }
      const v = data?.value ?? data?.clearValue ?? data?.result;
      if (v === undefined || v === null) throw new Error("Invalid relayer response");
      const bi = typeof v === "string" ? BigInt(v) : BigInt(Math.floor(Number(v)));
      return bi;
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error(`Relayer decryption failed: ${lastError?.message || lastError}`);
}
