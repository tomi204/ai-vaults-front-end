"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWorldcoin, useWallet } from "@/contexts/wallet-context";

interface WalletConnectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletConnected?: () => void;
}

export function WalletConnectModal({
  isOpen,
  onOpenChange,
  onWalletConnected,
}: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [waitingForRainbowKit, setWaitingForRainbowKit] = useState(false);

  const { openConnectModal } = useConnectModal();
  const { connectWorldcoin, isInstalled } = useWorldcoin();
  const { markRainbowKitConnected } = useWallet();
  const { isConnected: rainbowConnected } = useAccount();

  // Detectar cuando RainbowKit se conecta después de abrir el modal
  useEffect(() => {
    if (waitingForRainbowKit && rainbowConnected) {
      markRainbowKitConnected();
      setWaitingForRainbowKit(false);
      onWalletConnected?.();
    }
  }, [
    rainbowConnected,
    waitingForRainbowKit,
    markRainbowKitConnected,
    onWalletConnected,
  ]);

  const handleRainbowKitConnect = () => {
    // Cerrar el modal inmediatamente
    onOpenChange(false);
    setWaitingForRainbowKit(true);

    // Abrir el modal de RainbowKit después de un pequeño delay
    setTimeout(() => {
      openConnectModal?.();
    }, 100);
  };

  const handleWorldcoinConnect = async () => {
    if (!isInstalled) {
      alert("Please install World App to continue");
      return;
    }

    // Cerrar el modal inmediatamente
    onOpenChange(false);
    setIsConnecting(true);

    try {
      // Add a small delay to ensure the modal is closed before starting the connection
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await connectWorldcoin();
      
      if (result.success) {
        console.log("Connected with Worldcoin:", {
          address: result.address,
          username: result.username
        });
        onWalletConnected?.();
      } else {
        throw new Error("Connection was not successful");
      }
    } catch (error) {
      console.error("Worldcoin connection failed:", error);
      
      // More specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes("not installed")) {
          alert("World App is not installed. Please install it to continue.");
        } else if (error.message.includes("user rejected")) {
          alert("Connection was rejected. Please try again.");
        } else if (error.message.includes("timeout")) {
          alert("Connection timed out. Please try again.");
        } else if (error.message.includes("Failed to get wallet address")) {
          alert("Failed to get wallet address. Please try again.");
        } else {
          alert("Connection failed: " + error.message);
        }
      } else {
        alert("Connection failed. Please try again.");
      }
      
      // Reopen the modal if connection fails
      onOpenChange(true);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400">
            Choose a wallet to connect to DEFAI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Worldcoin Option */}
          <Card className="transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌍</span>
                </div>
                <div>
                  <CardTitle className="text-base">Worldcoin</CardTitle>
                  <CardDescription className="text-sm">
                    Connect with World ID verification
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={handleWorldcoinConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  "Connect with Worldcoin"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* RainbowKit Option */}
          <Card className="transition-all hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌈</span>
                </div>
                <div>
                  <CardTitle className="text-base">MetaMask</CardTitle>
                  <CardDescription className="text-sm">
                    Connect with your browser wallet
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={handleRainbowKitConnect}
                disabled={waitingForRainbowKit}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {waitingForRainbowKit ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening MetaMask...
                  </div>
                ) : (
                  "Connect with MetaMask"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
          By connecting a wallet, you agree to DEFAI&apos;s Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  );
}
