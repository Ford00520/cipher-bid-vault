import { createContext, useContext, ReactNode, useMemo } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnectAsync } = useDisconnect();

  const value = useMemo<WalletContextType>(
    () => ({
      isConnected: !!isConnected,
      address,
      connect: () => {
        // Use RainbowKit modal to connect
        if (openConnectModal) openConnectModal();
      },
      disconnect: () => {
        // Disconnect via wagmi
        disconnectAsync().catch(() => {});
      },
    }),
    [address, isConnected, openConnectModal, disconnectAsync],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
