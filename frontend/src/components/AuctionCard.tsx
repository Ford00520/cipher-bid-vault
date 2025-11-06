import { useState, useEffect } from "react";
import { Lock, Clock, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import BidDialog from "./BidDialog";

interface AuctionCardProps {
  id: number;
  title: string;
  description: string;
  currentBid: string;
  totalBids: number;
  endTime: Date;
  status: "active" | "revealing" | "ended";
  image?: string;
}

const AuctionCard = ({ 
  id,
  title, 
  description, 
  currentBid, 
  totalBids, 
  endTime, 
  status,
  image 
}: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [myBid, setMyBid] = useState<string | null>(null);
  const [decLoading, setDecLoading] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const distance = end - now;
      
      if (distance < 0) {
        setTimeLeft("Ended");
        setProgress(0);
        clearInterval(timer);
        return;
      }
      
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      
      // Calculate progress (assuming 24h auction)
      const totalDuration = 24 * 60 * 60 * 1000;
      const elapsed = totalDuration - distance;
      setProgress((elapsed / totalDuration) * 100);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endTime]);
  
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="bg-secondary text-secondary-foreground">Active Bidding</Badge>;
      case "revealing":
        return <Badge className="bg-accent text-accent-foreground animate-pulse-glow">Revealing Bids</Badge>;
      case "ended":
        return <Badge variant="outline">Ended</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-auction)] hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-card to-muted overflow-hidden">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Lock className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            {getStatusBadge()}
          </div>
          {status === "active" && (
            <div className="absolute top-3 left-3">
              <div className="bg-card/90 backdrop-blur rounded-full p-2 animate-lock-unlock">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Current High Bid</span>
            </div>
            <span className="text-lg font-bold text-primary">{currentBid}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Bids</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{totalBids}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Time Remaining</span>
              </div>
              <span className="text-sm font-semibold text-foreground animate-countdown">{timeLeft}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full" 
          disabled={status !== "active"}
          variant={status === "active" ? "default" : "outline"}
          type="button"
          aria-label={status === "active" ? "Place encrypted bid" : status === "revealing" ? "Revealing bids" : "View results"}
          onClick={() => {
            if (!isConnected) {
              toast({
                title: "Wallet not connected",
                description: "Please connect your Rainbow Wallet to place a bid",
                variant: "destructive",
              });
              return;
            }
            if (status === "active") {
              setBidDialogOpen(true);
            }
          }}
        >
          {status === "active" ? "Place Encrypted Bid" : status === "revealing" ? "Revealing..." : "View Results"}
        </Button>
      </CardFooter>

      <CardFooter className="p-6 pt-0 gap-2">
        <Button
          className="w-full"
          variant="secondary"
          disabled={!isConnected || decLoading}
          type="button"
          aria-label="Decrypt my bid"
          onClick={async () => {
            if (!isConnected) {
              toast({ title: "Wallet not connected", description: "Connect to decrypt your bid", variant: "destructive" });
              return;
            }
            setDecLoading(true);
            try {
              const { decryptMyBid } = await import("@/lib/cipherBidVault");
              const value = await decryptMyBid({ auctionId: BigInt(id) });
              // Interpret as wei-like integer value for demo; format as number
              setMyBid(value.toString());
              toast({ title: "Decryption successful", description: `Your bid is: ${value.toString()}` });
            } catch (e: any) {
              toast({ title: "Decryption failed", description: e?.message || String(e), variant: "destructive" });
            } finally {
              setDecLoading(false);
            }
          }}
        >
          {decLoading ? "Decrypting..." : "Decrypt My Bid"}
        </Button>
        {myBid && (
          <div className="text-xs text-muted-foreground w-full text-center">
            My bid (clear): {myBid}
          </div>
        )}
      </CardFooter>
      
      <BidDialog
        open={bidDialogOpen}
        onOpenChange={setBidDialogOpen}
        auctionTitle={title}
        currentBid={currentBid}
        auctionId={id}
      />
    </Card>
  );
};

export default AuctionCard;
