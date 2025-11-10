"use client";

import { Lock, Shield, Eye } from "lucide-react";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

export function Hero() {
  const { isConnected } = useMetaMaskEthersSigner();

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-card border border-primary/20 px-4 py-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          Blockchain-Verified Fairness
        </div>
        
        <h2 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent">
            Fair Auctions,
          </span>
          <br />
          <span className="text-foreground">Fully Encrypted</span>
        </h2>
        
        <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Place bids privately with encrypted values. All bids are revealed transparently 
          after the auction ends, ensuring complete fairness for every participant.
        </p>
        
        <div className="mb-12">
          {isConnected ? (
            <p className="text-muted-foreground">
              Your wallet is connected. Scroll down to create or join an encrypted auction.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Connect your wallet in the top-right to start creating or joining encrypted auctions.
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-8 justify-center items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-card p-3 border border-border">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Encrypted Bids</p>
              <p className="text-xs text-muted-foreground">Private until reveal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-card p-3 border border-border">
              <Eye className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Transparent Results</p>
              <p className="text-xs text-muted-foreground">Verifiable on-chain</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
