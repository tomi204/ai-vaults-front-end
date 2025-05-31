"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "./wagmi";
import { WalletProvider } from "@/contexts/wallet-context";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

// Add your World App ID here
const WORLD_APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || "";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={config.chains[0]}
          showRecentTransactions={false}
          coolMode={true}
        >
          <MiniKitProvider props={{ appId: WORLD_APP_ID }}>
            <WalletProvider>{children}</WalletProvider>
          </MiniKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
