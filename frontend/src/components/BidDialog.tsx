import { useState } from "react";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { placeBidWrite } from "@/lib/cipherBidVault";

interface BidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionTitle: string;
  currentBid: string;
  auctionId?: number;
}

const BidDialog = ({ open, onOpenChange, auctionTitle, currentBid, auctionId }: BidDialogProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast({
        title: "Invalid bid amount",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    if (!auctionId) {
      toast({
        title: "Missing auction",
        description: "No auction selected for bidding",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      // For now we pass a numeric value; relayer will encrypt to euint64
      const clear = Math.floor(parseFloat(bidAmount) * 1e6) / 1e6; // limit decimals
      await placeBidWrite({ auctionId: BigInt(auctionId), clearBid: Math.round(clear) });
      toast({
        title: "Bid submitted",
        description: `Your encrypted bid has been submitted.`,
      });
      setBidAmount("");
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Failed to submit bid",
        description: err?.message ?? "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Place Encrypted Bid
          </DialogTitle>
          <DialogDescription>
            Your bid will be encrypted and hidden until the auction ends
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="auction">Auction Item</Label>
              <Input id="auction" value={auctionTitle} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current">Current High Bid</Label>
              <Input id="current" value={currentBid} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bid">Your Bid (ETH)</Label>
              <Input
                id="bid"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                🔒 Your bid will be encrypted on submission and hidden from all participants until the auction ends
              </p>
            </div>
          </div>
          
          <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Encrypted Bid"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidDialog;
