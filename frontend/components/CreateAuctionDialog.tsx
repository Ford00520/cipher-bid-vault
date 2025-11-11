"use client";

import { useState, type FormEvent } from "react";

export type CreateAuctionDialogProps = {
  onCreate: (params: {
    title: string;
    description: string;
    startingBid: string;
    durationHours: number;
  }) => Promise<void>;
  disabled?: boolean;
};

export function CreateAuctionDialog({ onCreate, disabled }: CreateAuctionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [duration, setDuration] = useState("24");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!title || !description || !startingBid) { 
      setMessage("Please fill all required fields");
      return;
    }
    const durationHours = Number(duration || "0");
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      setMessage("Duration must be positive");
      return;
    }
    try {
      setBusy(true);
      await onCreate({ title, description, startingBid, durationHours });
      setTitle("");
      setDescription("");
      setStartingBid("");
      setDuration("24");
      setOpen(false);
      setMessage("Auction created");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create auction";
      setMessage(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Create New Auction
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-lg mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Create New Auction</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set up a new encrypted auction for your asset.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
                <input
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rare digital art"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Description *</label>
                <textarea
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your auction item..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Starting Bid *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    min={0}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Duration (hours)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min={1}
                    placeholder="24"
                  />
                </div>
              </div>
              {message && (
                <p className="text-xs text-muted-foreground">{message}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={busy}
                >
                  {busy ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
