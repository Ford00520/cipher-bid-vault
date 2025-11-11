"use client";

import { useEffect, useState } from "react";

export type AuctionStatus = "active" | "ended";

export type AuctionCardProps = {
  id: bigint;
  title: string;
  description: string;
  endTime: Date;
  status: AuctionStatus;
  onPlaceBid: (auctionId: bigint, amount: number) => Promise<void>;
  onDecryptMyBid: (auctionId: bigint) => Promise<bigint>;
  isConnected: boolean;
};

export function AuctionCard({
  id,
  title,
  description,
  endTime,
  status,
  onPlaceBid,
  onDecryptMyBid,
  isConnected,
}: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);
  const [bidInput, setBidInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [decryptBusy, setDecryptBusy] = useState(false);
  const [myBid, setMyBid] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const end = endTime.getTime();
      const distance = end - now;
      if (distance <= 0) {
        setTimeLeft("Ended");
        setProgress(0);
        clearInterval(timer);
        return;
      }
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      const totalDuration = 24 * 60 * 60 * 1000;
      const elapsed = Math.min(totalDuration, Math.max(0, totalDuration - distance));
      setProgress((elapsed / totalDuration) * 100);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const handlePlaceBid = async () => {
    setMessage(null);
    if (!isConnected) {
      setMessage("Connect wallet first");
      return;
    }
    const value = Number(bidInput || "0");
    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a valid positive bid amount");
      return;
    }
    try {
      setBusy(true);
      await onPlaceBid(id, value);
      setMessage("Encrypted bid submitted");
      setBidInput("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to submit bid";
      setMessage(message);
    } finally {
      setBusy(false);
    }
  };

  const handleDecrypt = async () => {
    setMessage(null);
    if (!isConnected) {
      setMessage("Connect wallet first");
      return;
    }
    try {
      setDecryptBusy(true);
      const value = await onDecryptMyBid(id);
      setMyBid(value.toString());
      setMessage("Bid decrypted successfully");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to decrypt bid";
      setMessage(message);
    } finally {
      setDecryptBusy(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <div className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full capitalize">{status}</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Time remaining</span>
            <span className="font-mono text-foreground">{timeLeft}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Your bid (integer units)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              min={0}
            />
          </div>
          <button
            type="button"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handlePlaceBid}
            disabled={busy || status !== "active"}
          >
            {busy ? "Submitting..." : "Submit Encrypted Bid"}
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleDecrypt}
            disabled={decryptBusy}
          >
            {decryptBusy ? "Decrypting..." : "Decrypt My Bid"}
          </button>
          {myBid && (
            <p className="text-xs text-muted-foreground text-center">
              My bid (clear): <span className="font-mono font-semibold text-foreground">{myBid}</span>
            </p>
          )}
          {message && (
            <p className="text-xs text-muted-foreground text-center">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
