"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { MiniKit } from "@worldcoin/minikit-js";

// Add type declarations for window.MiniKit
declare global {
  interface Window {
    MiniKit?: {
      walletAddress?: string;
      user?: {
        username?: string;
      };
    };
  }
}

interface WalletContextType {
  // Estado general
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  connector: "rainbowkit" | "worldcoin" | null;

  // Funciones
  disconnect: () => void;
  markRainbowKitConnected: () => void;

  // Estados específicos de Worldcoin
  isWorldcoinInstalled: boolean;
  worldcoinAddress: string | null;
  setWorldcoinAddress: (address: string | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connector, setConnector] = useState<"rainbowkit" | "worldcoin" | null>(
    null
  );
  const [worldcoinAddress, setWorldcoinAddress] = useState<string | null>(null);
  const [userHasConnected, setUserHasConnected] = useState(false);

  // RainbowKit hooks
  const { address: rainbowAddress, isConnected: rainbowConnected } =
    useAccount();
  const { data: rainbowBalance } = useBalance({ address: rainbowAddress });
  const { disconnect: rainbowDisconnect } = useDisconnect();

  // Worldcoin state - Handle the case when MiniKit is not available
  const isWorldcoinInstalled = typeof window !== 'undefined' ? MiniKit?.isInstalled?.() || false : false;

  // Determinar estado general
  const isConnected =
    userHasConnected && (rainbowConnected || !!worldcoinAddress);
  const address = userHasConnected ? rainbowAddress || worldcoinAddress : null;
  const balance =
    userHasConnected && rainbowBalance
      ? `${parseFloat(rainbowBalance.formatted).toFixed(4)} ${
          rainbowBalance.symbol
        }`
      : null;

  // Función para marcar RainbowKit como conectado manualmente
  const markRainbowKitConnected = () => {
    setUserHasConnected(true);
    setConnector("rainbowkit");
  };

  // Función de desconexión universal
  const disconnect = () => {
    if (connector === "rainbowkit") {
      rainbowDisconnect();
    } else if (connector === "worldcoin") {
      setWorldcoinAddress(null);
    }
    setConnector(null);
    setUserHasConnected(false);
  };

  // Detectar cuando RainbowKit se conecta/desconecta
  useEffect(() => {
    if (rainbowConnected && userHasConnected && !worldcoinAddress) {
      setConnector("rainbowkit");
    } else if (!rainbowConnected && connector === "rainbowkit") {
      // Si RainbowKit se desconecta, resetear todo
      setConnector(null);
      setUserHasConnected(false);
    }
  }, [rainbowConnected, userHasConnected, worldcoinAddress, connector]);

  // Detectar cuando Worldcoin se conecta/desconecta
  useEffect(() => {
    if (worldcoinAddress && userHasConnected && !rainbowConnected) {
      setConnector("worldcoin");
    } else if (!worldcoinAddress && connector === "worldcoin") {
      setConnector(null);
      setUserHasConnected(false);
    }
  }, [worldcoinAddress, userHasConnected, rainbowConnected, connector]);

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connector,
    disconnect,
    markRainbowKitConnected,
    isWorldcoinInstalled,
    worldcoinAddress,
    setWorldcoinAddress: (addr) => {
      setWorldcoinAddress(addr);
      if (addr) {
        setUserHasConnected(true);
        setConnector("worldcoin");
      }
    },
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

// Hook específico para funciones de Worldcoin
export function useWorldcoin() {
  const wallet = useWallet();

  const connectWorldcoin = async () => {
    if (!wallet.isWorldcoinInstalled) {
      throw new Error("World App not installed");
    }

    try {
      // Generate nonce
      const nonceRes = await fetch("/api/nonce");
      const { nonce } = await nonceRes.json();

      // Authentication with wallet
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: "0",
        expirationTime: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "Connect to DEFAI - AI-Powered Vaults",
      });

      if (finalPayload.status === "error") {
        throw new Error("Worldcoin authentication failed");
      }

      // Verify in backend
      const response = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      });

      const result = await response.json();
      
      if (result.status === "success" && result.isValid) {
        // Get the wallet address from MiniKit
        const walletAddress = window.MiniKit?.walletAddress;
        if (!walletAddress) {
          throw new Error("Failed to get wallet address");
        }
        
        // Get the username if available
        const username = window.MiniKit?.user?.username;
        
        // Set the wallet address in our context
        wallet.setWorldcoinAddress(walletAddress);
        
        return {
          success: true,
          address: walletAddress,
          username: username
        };
      } else {
        throw new Error(result.message || "Worldcoin verification failed");
      }
    } catch (error) {
      console.error("Worldcoin connection error:", error);
      throw error;
    }
  };

  return {
    connectWorldcoin,
    isInstalled: wallet.isWorldcoinInstalled,
    address: wallet.worldcoinAddress,
  };
}
