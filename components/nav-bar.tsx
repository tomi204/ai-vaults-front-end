import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { useWallet } from "@/contexts/wallet-context";

export function NavBar() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const wallet = useWallet();

  const getNetworkColor = (network: string) => {
    switch (network) {
      case "Ethereum":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Arbitrum":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Polygon":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300";
      case "Optimism":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const parts = balance.split(" ");
    if (parts.length === 2) {
      const amount = parseFloat(parts[0]);
      return `$${amount.toFixed(2)}`;
    }
    return balance;
  };

  return (
    <>
      <nav className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
          {/* Left Side - Welcome Message (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Welcome back! 👋
            </h2>
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300">
              🟢 All Systems Active
            </Badge>
          </div>

          {/* Mobile - Compact Status */}
          <div className="flex md:hidden items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {wallet.isConnected ? "Connected" : "Active"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Network Selector - Responsive */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="hidden lg:block text-sm text-slate-600 dark:text-slate-400">
                Network:
              </span>
              <Badge className={getNetworkColor("Ethereum")}>
                <span className="hidden sm:block">Ethereum</span>
                <span className="sm:hidden">ETH</span>
              </Badge>
            </div>

            {/* Wallet Info - Responsive */}
            {wallet.isConnected ? (
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    <span className="hidden sm:inline">
                      {wallet.balance
                        ? formatBalance(wallet.balance)
                        : "Connected"}
                    </span>
                    <span className="sm:hidden">Connected</span>
                  </div>
                  <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {wallet.address ? formatAddress(wallet.address) : ""}
                  </div>
                </div>
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs">
                    {wallet.address
                      ? wallet.address.slice(2, 4).toUpperCase()
                      : "W"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={wallet.disconnect}
                  size="sm"
                  variant="neutral"
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">🔗 Connect Wallet</span>
                <span className="sm:hidden">🔗 Connect</span>
              </Button>
            )}

            {/* Settings - Responsive */}
            <Button
              size="sm"
              variant="neutral"
              className="w-8 h-8 sm:w-auto sm:h-auto p-1 sm:p-2"
            >
              <span className="text-sm">⚙️</span>
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>

        {/* Mobile Network Info - Shows below main nav on small screens */}
        <div className="sm:hidden px-3 py-2 border-t border-slate-200/40 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Network:
            </span>
            <Badge className={`text-xs ${getNetworkColor("Ethereum")}`}>
              Ethereum
            </Badge>
          </div>
        </div>
      </nav>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        onWalletConnected={() => {
          console.log("Wallet connected successfully!");
          setIsWalletModalOpen(false);
        }}
      />
    </>
  );
}
