import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { useWallet } from "@/contexts/wallet-context";
import { useChainId, useSwitchChain } from "wagmi";

export function NavBar() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showChainMenu, setShowChainMenu] = useState(false);
  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".chain-menu-container")) {
        setShowChainMenu(false);
      }
    };

    if (showChainMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showChainMenu]);

  // Map chain names to display names - only for supported chains
  const getDisplayChainName = (chainId: number) => {
    switch (chainId) {
      case 545: // Flow Testnet
        return "Flow Testnet";
      case 31: // Rootstock Testnet
        return "Rootstock Testnet";
      default:
        // If not a supported chain, suggest switching
        return wallet.isConnected ? "Switch Chain" : "No Chain";
    }
  };

  const displayChainName = getDisplayChainName(chainId);
  const shortChainName = displayChainName.includes("Testnet")
    ? displayChainName.replace(" Testnet", "")
    : displayChainName.split(" ")[0];

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 545: // Flow Testnet
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 31: // Rootstock Testnet
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        // Unsupported chain - show warning color
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
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

  const isUnsupportedChain = chainId !== 545 && chainId !== 31;

  const handleChainSwitch = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
      setShowChainMenu(false);
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
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
            <div className="hidden sm:flex items-center gap-2 relative">
              <span className="hidden lg:block text-sm text-slate-600 dark:text-slate-400">
                Network:
              </span>
              <div className="relative chain-menu-container">
                <Badge
                  className={`${getNetworkColor(
                    chainId
                  )} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                  onClick={() => setShowChainMenu(!showChainMenu)}
                >
                  <span className="hidden sm:block">
                    {isSwitchingChain ? "Switching..." : displayChainName}
                  </span>
                  <span className="sm:hidden">
                    {isSwitchingChain ? "..." : shortChainName}
                  </span>
                  <span className="text-xs">▼</span>
                </Badge>
                {showChainMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 min-w-[180px] z-50">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleChainSwitch(545)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm flex items-center gap-2 ${
                          chainId === 545
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                            : ""
                        }`}
                        disabled={isSwitchingChain}
                      >
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>🌊 Flow Testnet</span>
                        {chainId === 545 && (
                          <span className="ml-auto text-green-600 dark:text-green-400">
                            ✓
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleChainSwitch(31)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm flex items-center gap-2 ${
                          chainId === 31
                            ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                            : ""
                        }`}
                        disabled={isSwitchingChain}
                      >
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>₿ Rootstock Testnet</span>
                        {chainId === 31 && (
                          <span className="ml-auto text-orange-600 dark:text-orange-400">
                            ✓
                          </span>
                        )}
                      </button>
                      {isUnsupportedChain && (
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                          <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                            ⚠️ Current network not supported
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
          <div className="flex items-center justify-center gap-2 relative">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Network:
            </span>
            <div className="relative chain-menu-container">
              <Badge
                className={`text-xs ${getNetworkColor(
                  chainId
                )} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                onClick={() => setShowChainMenu(!showChainMenu)}
              >
                {isSwitchingChain ? "Switching..." : displayChainName}
                <span className="text-xs">▼</span>
              </Badge>
              {showChainMenu && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 min-w-[180px] z-50">
                  <div className="space-y-1">
                    <button
                      onClick={() => handleChainSwitch(545)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm flex items-center gap-2 ${
                        chainId === 545
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : ""
                      }`}
                      disabled={isSwitchingChain}
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>🌊 Flow Testnet</span>
                      {chainId === 545 && (
                        <span className="ml-auto text-green-600 dark:text-green-400">
                          ✓
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleChainSwitch(31)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm flex items-center gap-2 ${
                        chainId === 31
                          ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                          : ""
                      }`}
                      disabled={isSwitchingChain}
                    >
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>₿ Rootstock Testnet</span>
                      {chainId === 31 && (
                        <span className="ml-auto text-orange-600 dark:text-orange-400">
                          ✓
                        </span>
                      )}
                    </button>
                    {isUnsupportedChain && (
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                          ⚠️ Current network not supported
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
