import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { http, WagmiProvider, createConfig } from "wagmi";
import { WalletProvider } from "@/contexts/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, localhost } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Check if we have a valid WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const hasValidProjectId = projectId && projectId !== "your_project_id_here";

let config;

if (hasValidProjectId) {
  // Use RainbowKit with WalletConnect support
  config = getDefaultConfig({
    appName: "Cipher Bid Vault",
    projectId: projectId!,
    chains: [localhost, sepolia],
    transports: {
      [localhost.id]: http(import.meta.env.VITE_LOCAL_RPC_URL || "http://127.0.0.1:8545"),
      [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"),
    },
    ssr: false,
    enableAnalytics: false,
    enableOnramp: false,
  });
} else {
  // Fallback: Use basic config with injected connector only (MetaMask, etc.)
  if (import.meta.env.DEV) {
    console.warn(
      "⚠️  No valid WalletConnect Project ID configured. Using injected wallet (MetaMask) only.\n" +
      "To enable WalletConnect support:\n" +
      "1. Get a free Project ID at https://cloud.walletconnect.com/\n" +
      "2. Add it to frontend/.env as VITE_WALLETCONNECT_PROJECT_ID"
    );
  }

  config = createConfig({
    chains: [localhost, sepolia],
    connectors: [
      injected({
        shimDisconnect: true,
      }),
    ],
    transports: {
      [localhost.id]: http(import.meta.env.VITE_LOCAL_RPC_URL || "http://127.0.0.1:8545"),
      [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"),
    },
  });
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config as unknown as ReturnType<typeof createConfig>}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={lightTheme()}>
        <WalletProvider>
          <App />
        </WalletProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
);
