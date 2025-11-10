"use client";

import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { useCipherBidVault } from "@/hooks/useCipherBidVault";
import { AuctionCard } from "@/components/AuctionCard";
import { CreateAuctionDialog } from "@/components/CreateAuctionDialog";

export function AuctionBoard() {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
  } = useMetaMaskEthersSigner();

  const { instance: fhevmInstance } = useFhevm({
    provider,
    chainId,
    initialMockChains: { 31337: "http://127.0.0.1:8545" }, // Use mock for local hardhat
    enabled: true,
  });

  const vault = useCipherBidVault({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  });

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Live Auctions</h2>
          <p className="text-muted-foreground">Place your encrypted bids on premium digital assets</p>
          <div className="mt-6 flex justify-center">
            <CreateAuctionDialog
              onCreate={vault.createAuction}
              disabled={!isConnected || !vault.canUseWrite}
            />
          </div>
        </div>

        {!isConnected && (
          <div className="alert alert-warning text-sm">
            <span>Connect your wallet in the top-right to load and interact with auctions.</span>
          </div>
        )}

        {vault.error && (
          <div className="alert alert-error text-sm">
            <span>{vault.error}</span>
          </div>
        )}

        {!vault.error && vault.loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {!vault.loading && !vault.error && (!vault.auctions || vault.auctions.length === 0) && (
          <div className="text-sm text-base-content/70 py-8 text-center">
            No auctions found yet. Be the first to create one.
          </div>
        )}

        {!vault.loading && !vault.error && vault.auctions && vault.auctions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vault.auctions.map((a) => (
              <AuctionCard
                key={a.id.toString()}
                id={a.id}
                title={a.title}
                description={a.description}
                endTime={new Date(Number(a.endTime) * 1000)}
                status={a.ended ? "ended" : "active"}
                isConnected={isConnected}
                onPlaceBid={async (auctionId, amount) => {
                  await vault.placeEncryptedBid({ auctionId, clearBid: amount });
                }}
                onDecryptMyBid={async (auctionId) => vault.decryptMyBid(auctionId)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
