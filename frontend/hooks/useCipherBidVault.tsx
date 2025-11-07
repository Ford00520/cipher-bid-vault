"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";

import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { CipherBidVaultABI } from "@/abi/CipherBidVaultABI";
import { CipherBidVaultAddresses } from "@/abi/CipherBidVaultAddresses";

export type AuctionView = {
  id: bigint;
  title: string;
  description: string;
  creator: string;
  startingBid: bigint;
  highestBidder: string;
  endTime: bigint;
  ended: boolean;
  finalized: boolean;
};

export type UseCipherBidVaultParams = {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
};

export function useCipherBidVault({
  instance,
  fhevmDecryptionSignatureStorage,
  chainId,
  ethersSigner,
  ethersReadonlyProvider,
}: UseCipherBidVaultParams) {
  const [auctions, setAuctions] = useState<AuctionView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txPending, setTxPending] = useState(false);
  const [message, setMessage] = useState<string>("");

  const contractInfo = useMemo(() => {
    if (!chainId) return { abi: CipherBidVaultABI.abi } as const;
    const entry =
      CipherBidVaultAddresses[chainId.toString() as keyof typeof CipherBidVaultAddresses];
    const address = entry?.address as `0x${string}` | undefined;
    return { abi: CipherBidVaultABI.abi, address, chainId: entry?.chainId ?? chainId } as const;
  }, [chainId]);

  const contractAddressRef = useRef<`0x${string}` | undefined>(undefined);
  useEffect(() => {
    contractAddressRef.current = contractInfo.address;
  }, [contractInfo.address]);

  const canUseRead = useMemo(() => {
    return Boolean(contractInfo.address && ethersReadonlyProvider);
  }, [contractInfo.address, ethersReadonlyProvider]);

  const canUseWrite = useMemo(() => {
    return Boolean(contractInfo.address && instance && ethersSigner);
  }, [contractInfo.address, instance, ethersSigner]);

  const refreshAuctions = useCallback(async () => {
    if (!canUseRead || !contractInfo.address || !ethersReadonlyProvider) {
      setAuctions(null);
      return;
    }

    const thisAddress = contractInfo.address;
    const thisRunner = ethersReadonlyProvider;

    setLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(
        thisAddress,
        contractInfo.abi,
        thisRunner,
      );

      const total: bigint = await contract.getAuctionCount();
      const items: AuctionView[] = [];
      const count = Number(total);

      for (let i = 1; i <= count; i++) {
        // getAuction returns a tuple matching ABI ordering
        const a = await contract.getAuction(BigInt(i));
        items.push({
          id: a[0] as bigint,
          title: a[1] as string,
          description: a[2] as string,
          creator: a[3] as string,
          startingBid: a[4] as bigint,
          highestBidder: a[6] as string,
          endTime: a[7] as bigint,
          ended: a[8] as boolean,
          finalized: a[9] as boolean,
        });
      }

      // Only apply if contract has not changed
      if (contractAddressRef.current === thisAddress) {
        setAuctions(items);
      }
    } catch (e: any) {
      if (contractAddressRef.current === contractInfo.address) {
        setError(e?.message ?? "Failed to load auctions");
      }
    } finally {
      if (contractAddressRef.current === contractInfo.address) {
        setLoading(false);
      }
    }
  }, [canUseRead, contractInfo.address, contractInfo.abi, ethersReadonlyProvider]);

  useEffect(() => {
    void refreshAuctions();
  }, [refreshAuctions]);

  const createAuction = useCallback(
    async (params: { title: string; description: string; startingBid: string; durationHours: number }) => {
      if (!canUseWrite || !contractInfo.address || !instance || !ethersSigner) {
        throw new Error("Wallet or FHEVM not ready");
      }

      const thisAddress = contractInfo.address;
      const signer = ethersSigner;
      const contract = new ethers.Contract(thisAddress, contractInfo.abi, signer);

      const startingBidNum = Number(params.startingBid || "0");
      if (!Number.isFinite(startingBidNum) || startingBidNum <= 0) {
        throw new Error("Invalid starting bid");
      }

      const startingBid = BigInt(Math.floor(startingBidNum));

      setTxPending(true);
      setMessage("Creating auction...");

      try {
        const tx: ethers.TransactionResponse = await contract.createAuction(
          params.title,
          params.description,
          startingBid,
          BigInt(Math.max(1, params.durationHours || 1)),
        );
        await tx.wait();
        setMessage("Auction created");
        await refreshAuctions();
      } finally {
        setTxPending(false);
      }
    },
    [canUseWrite, contractInfo.address, contractInfo.abi, ethersSigner, instance, refreshAuctions],
  );

  const placeEncryptedBid = useCallback(
    async (params: { auctionId: bigint; clearBid: number }) => {
      if (!canUseWrite || !contractInfo.address || !instance || !ethersSigner) {
        throw new Error("Wallet or FHEVM not ready");
      }

      const thisAddress = contractInfo.address;
      const signer = ethersSigner;
      const contract = new ethers.Contract(thisAddress, contractInfo.abi, signer);

      const value = params.clearBid;
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Invalid bid value");
      }

      setTxPending(true);
      setMessage("Encrypting bid...");

      try {
        const input = instance.createEncryptedInput(thisAddress, signer.address as `0x${string}`);
        input.add64(BigInt(Math.floor(value)));
        const enc = await input.encrypt();

        setMessage("Submitting encrypted bid...");

        const tx: ethers.TransactionResponse = await contract.placeBid(
          params.auctionId,
          enc.handles[0],
          enc.inputProof,
        );

        await tx.wait();
        setMessage("Bid submitted");
      } finally {
        setTxPending(false);
      }
    },
    [canUseWrite, contractInfo.address, contractInfo.abi, ethersSigner, instance],
  );

  const decryptMyBid = useCallback(
    async (auctionId: bigint): Promise<bigint> => {
      if (!contractInfo.address || !instance || !ethersSigner) {
        throw new Error("Wallet or FHEVM not ready");
      }

      const thisAddress = contractInfo.address;
      const signer = ethersSigner;
      const runner = ethersReadonlyProvider ?? signer;
      const contract = new ethers.Contract(thisAddress, contractInfo.abi, runner);

      setMessage("Fetching encrypted bid...");

      const encBid: string = await contract.getBid(auctionId, await signer.getAddress());
      if (!encBid || encBid === ethers.ZeroHash) {
        throw new Error("No bid found for this auction");
      }

      const thisHandle = encBid as `0x${string}`;

      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [thisAddress],
        signer,
        fhevmDecryptionSignatureStorage,
      );

      if (!sig) {
        throw new Error("Unable to authorize decryption");
      }

      setMessage("Decrypting bid...");

      const res = await instance.userDecrypt(
        [{ handle: thisHandle, contractAddress: thisAddress }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays,
      );

      const value = res[thisHandle];
      if (value === undefined || value === null) {
        throw new Error("Decryption failed: empty result");
      }

      return typeof value === "bigint" ? value : BigInt(value);
    },
    [contractInfo.address, contractInfo.abi, instance, ethersSigner, ethersReadonlyProvider, fhevmDecryptionSignatureStorage],
  );

  return {
    contractAddress: contractInfo.address,
    auctions,
    loading,
    error,
    message,
    txPending,
    refreshAuctions,
    createAuction,
    placeEncryptedBid,
    decryptMyBid,
    canUseRead,
    canUseWrite,
  };
}
