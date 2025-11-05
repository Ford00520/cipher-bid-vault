import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createAuctionWrite } from "@/lib/cipherBidVault";

interface CreateAuctionDialogProps {
  onAuctionCreated?: () => void;
}

const CreateAuctionDialog = ({ onAuctionCreated }: CreateAuctionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [duration, setDuration] = useState("24");
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !startingBid) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const durationHours = Math.max(1, Number(duration || "0"));
      await createAuctionWrite({
        title,
        description,
        startingBidEth: startingBid,
        durationHours,
      });
      toast({
        title: "Auction created",
        description: `Your auction "${title}" is now live.`,
      });
      setTitle("");
      setDescription("");
      setStartingBid("");
      setDuration("24");
      setOpen(false);
      onAuctionCreated?.();
    } catch (err: any) {
      toast({
        title: "Failed to create auction",
        description: err?.message ?? "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create New Auction
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Auction</DialogTitle>
          <DialogDescription>
            Set up a new encrypted auction for your digital asset
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Auction Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Rare Digital Art Collection"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startingBid">Starting Bid (ETH) *</Label>
                <Input
                  id="startingBid"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                All bids will be encrypted and hidden until the auction ends. Results will be revealed transparently on-chain.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Auction"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAuctionDialog;
