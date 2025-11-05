import { http } from "viem";
import { localhost, sepolia } from "viem/chains";
import type { Chain } from "viem";
import type { Address } from "viem";
import { CipherBidVaultAddresses } from "./generated/CipherBidVaultAddresses";

// Centralized chain/network helpers inspired by shield-trade-loop

export const CHAIN_IDS = {
  localhost: localhost.id, // 31337
  sepolia: sepolia.id, // 11155111
} as const;

export type SupportedChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];

export function isSupportedChainId(id: number): id is SupportedChainId {
  return id === CHAIN_IDS.localhost || id === CHAIN_IDS.sepolia;
}

export function pickChain(id: number): Chain {
  return id === CHAIN_IDS.localhost ? localhost : sepolia;
}

export function rpcUrlFor(id: number): string {
  if (id === CHAIN_IDS.localhost)
    return import.meta.env.VITE_LOCAL_RPC_URL || "http://127.0.0.1:8545";
  return (
    import.meta.env.VITE_SEPOLIA_RPC_URL ||
    // Prefer public RPC fallback if env not provided
    "https://rpc.sepolia.org"
  );
}

export function transportFor(id: number) {
  return http(rpcUrlFor(id));
}

export async function detectWalletChainId(): Promise<number | undefined> {
  // Try to ask the injected provider for current chain
  const eth = (window as any)?.ethereum as {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  } | undefined;
  try {
    if (!eth) return undefined;
    const hex = (await eth.request({ method: "eth_chainId" })) as string; // e.g. "0x1"
    const id = Number.parseInt(hex, 16);
    return Number.isFinite(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

export async function getActiveChainId(): Promise<SupportedChainId> {
  // Prefer the connected wallet's chain when available
  const walletId = await detectWalletChainId();
  const fallback = Number(import.meta.env.VITE_ACTIVE_CHAIN_ID) || CHAIN_IDS.sepolia;
  const candidate = walletId ?? fallback;
  return isSupportedChainId(candidate) ? candidate : CHAIN_IDS.sepolia;
}

export function getContractAddressFor(chainId: number): Address | undefined {
  const entry = CipherBidVaultAddresses[chainId.toString() as keyof typeof CipherBidVaultAddresses];
  if (!entry) return undefined;
  const addr = (entry as any).address as string | undefined;
  if (!addr) return undefined;
  if (addr.toLowerCase() === "0x0000000000000000000000000000000000000000") return undefined;
  return addr as Address;
}

export async function ensureWalletOnChain(targetChainId: SupportedChainId) {
  const eth = (window as any)?.ethereum as {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  } | undefined;
  if (!eth) return; // Nothing to do in SSR or without wallet

  const current = await detectWalletChainId();
  if (current === targetChainId) return;

  const hexId = "0x" + targetChainId.toString(16);
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
    return;
  } catch (err: any) {
    // If chain not added in wallet
    if (err && (err.code === 4902 || err?.message?.includes("Unrecognized chain ID"))) {
      // Try to add the chain for localhost or sepolia
      const info = targetChainId === CHAIN_IDS.localhost
        ? {
            chainId: hexId,
            chainName: "Localhost 8545",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [rpcUrlFor(targetChainId)],
          }
        : {
            chainId: hexId,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [rpcUrlFor(targetChainId)],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          };
      await eth.request({ method: "wallet_addEthereumChain", params: [info] });
      return;
    }
    throw err;
  }
}

