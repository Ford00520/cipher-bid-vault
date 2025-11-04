import { useEffect, useState } from "react";
import AuctionCard from "./AuctionCard";
import { fetchAuctions, type AuctionView } from "@/lib/cipherBidVault";
import CreateAuctionDialog from "./CreateAuctionDialog";

const AuctionBoard = () => {
  const [auctions, setAuctions] = useState<AuctionView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchAuctions()
      .then(setAuctions)
      .catch((e) => setError(e?.message ?? "Failed to load auctions"));
  }, []);
  
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Live Auctions</h2>
          <p className="text-muted-foreground">Place your encrypted bids on premium digital assets</p>
          <div className="mt-6 flex justify-center">
            <CreateAuctionDialog onAuctionCreated={async () => {
              try {
                setError(null);
                setAuctions(null);
                const data = await fetchAuctions();
                setAuctions(data);
              } catch (e: any) {
                setError(e?.message ?? "Failed to refresh auctions");
              }
            }} />
          </div>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        {!error && auctions === null && (
          <div className="flex justify-center"><span className="loading loading-spinner loading-lg" /></div>
        )}
        {!error && auctions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((a) => (
              <AuctionCard
                key={Number(a.id)}
                id={Number(a.id)}
                title={a.title}
                description={a.description}
                currentBid={"—"}
                totalBids={0}
                endTime={new Date(Number(a.endTime) * 1000)}
                status={a.ended ? "ended" : "active"}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AuctionBoard;
