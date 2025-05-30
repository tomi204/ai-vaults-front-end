import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VaultData {
  id: string;
  name: string;
  description: string;
  blockchain: string;
  apy: number;
  tvl: number;
  riskLevel: string;
  aiStrategy: string;
  performance: number;
  deposits: number;
  allocation: Record<string, number>;
}

interface VaultCardProps {
  vault: VaultData;
  onSelect: () => void;
  isSelected: boolean;
  showFullDetails?: boolean;
}

const getBlockchainColor = (blockchain: string) => {
  switch (blockchain) {
    case "Ethereum":
      return "from-blue-500 to-blue-600";
    case "Arbitrum":
      return "from-purple-500 to-purple-600";
    case "Polygon":
      return "from-violet-500 to-violet-600";
    case "Optimism":
      return "from-red-500 to-red-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "High":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export function VaultCard({
  vault,
  onSelect,
  isSelected,
  showFullDetails,
}: VaultCardProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""
      }`}
      onClick={onSelect}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getBlockchainColor(
          vault.blockchain
        )} rounded-t-lg`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{vault.name}</CardTitle>
            <Badge variant="neutral" className="text-xs">
              {vault.blockchain}
            </Badge>
          </div>
          <Badge className={getRiskColor(vault.riskLevel)}>
            {vault.riskLevel}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {vault.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {vault.apy.toFixed(1)}%
            </div>
            <div className="text-xs text-green-600/70 dark:text-green-400/70 font-medium">
              APY
            </div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              ${(vault.tvl / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">
              TVL
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Performance
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              +{vault.performance.toFixed(1)}%
            </span>
          </div>
          <Progress value={(vault.performance / 20) * 100} className="h-2" />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">AI Strategy:</span> {vault.aiStrategy}
        </div>

        {showFullDetails && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Strategy Allocation
            </div>
            <div className="space-y-2">
              {Object.entries(vault.allocation).map(
                ([strategy, percentage]) => (
                  <div
                    key={strategy}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600 dark:text-slate-400">
                      {strategy}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-slate-900 dark:text-white font-medium w-8">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            💰 Deposit
          </Button>
          <Button size="sm" variant="neutral" className="flex-1">
            📊 Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
