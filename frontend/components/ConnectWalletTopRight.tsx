"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWalletTopRight() {
  return (
    <div className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
      <ConnectButton
        label="Connect Wallet"
        accountStatus="avatar"
        chainStatus="full"
        showBalance={false}
      />
    </div>
  );
}
