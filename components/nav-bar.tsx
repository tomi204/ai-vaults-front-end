import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NavBar() {
  const mockWallet = {
    address: "0x8Ba1...3f2E",
    balance: "$42,350",
    network: "Ethereum",
    connected: true,
  };

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

  return (
    <nav className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Welcome back! 👋
          </h2>
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300">
            🟢 All Systems Active
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Network Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Network:
            </span>
            <Badge className={getNetworkColor(mockWallet.network)}>
              {mockWallet.network}
            </Badge>
          </div>

          {/* Wallet Info */}
          {mockWallet.connected ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {mockWallet.balance}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {mockWallet.address}
                </div>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              🔗 Connect Wallet
            </Button>
          )}

          {/* Settings */}
          <Button size="sm" variant="neutral">
            ⚙️
          </Button>
        </div>
      </div>
    </nav>
  );
}
