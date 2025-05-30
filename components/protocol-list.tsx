import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Protocol {
  id: string;
  name: string;
  description: string;
  blockchain: string[];
  category: string;
  tvl: string;
  apy: string;
  status: "active" | "maintenance" | "new";
  logo: string;
}

export function ProtocolList() {
  const protocols: Protocol[] = [
    {
      id: "1",
      name: "Morpho Blue",
      description:
        "Optimized lending and borrowing with enhanced capital efficiency",
      blockchain: ["Ethereum"],
      category: "Lending",
      tvl: "$1.2B",
      apy: "8.5%",
      status: "active",
      logo: "🔵",
    },
    {
      id: "2",
      name: "Aave V3",
      description:
        "Decentralized lending protocol with cross-chain capabilities",
      blockchain: ["Ethereum", "Polygon", "Arbitrum"],
      category: "Lending",
      tvl: "$6.8B",
      apy: "7.2%",
      status: "active",
      logo: "👻",
    },
    {
      id: "3",
      name: "GMX",
      description: "Decentralized perpetual exchange with liquidity pools",
      blockchain: ["Arbitrum"],
      category: "Perp Trading",
      tvl: "$450M",
      apy: "15.3%",
      status: "active",
      logo: "🔺",
    },
    {
      id: "4",
      name: "Camelot",
      description: "Native Arbitrum DEX with concentrated liquidity",
      blockchain: ["Arbitrum"],
      category: "DEX",
      tvl: "$120M",
      apy: "12.1%",
      status: "active",
      logo: "🏰",
    },
    {
      id: "5",
      name: "Compound",
      description:
        "Algorithmic money market protocol for lending and borrowing",
      blockchain: ["Ethereum", "Polygon"],
      category: "Lending",
      tvl: "$2.1B",
      apy: "6.8%",
      status: "active",
      logo: "💚",
    },
    {
      id: "6",
      name: "Velodrome",
      description: "Ve(3,3) DEX designed for Optimism ecosystem",
      blockchain: ["Optimism"],
      category: "DEX",
      tvl: "$180M",
      apy: "14.2%",
      status: "active",
      logo: "🌀",
    },
    {
      id: "7",
      name: "Beethoven X",
      description: "Balancer-based automated portfolio manager and DEX",
      blockchain: ["Optimism"],
      category: "DEX",
      tvl: "$95M",
      apy: "11.8%",
      status: "active",
      logo: "🎼",
    },
    {
      id: "8",
      name: "Stargate",
      description: "Cross-chain bridge protocol for seamless asset transfers",
      blockchain: ["Ethereum", "Arbitrum", "Polygon", "Optimism"],
      category: "Bridge",
      tvl: "$320M",
      apy: "9.5%",
      status: "new",
      logo: "🌟",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Lending":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "DEX":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "Perp Trading":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Bridge":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Integrated Protocols</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              DeFi protocols powering our AI strategies
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300">
            {protocols.length} Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {protocols.map((protocol) => (
            <div
              key={protocol.id}
              className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{protocol.logo}</span>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                      {protocol.name}
                    </h4>
                    <Badge
                      className={`text-xs ${getCategoryColor(
                        protocol.category
                      )}`}
                    >
                      {protocol.category}
                    </Badge>
                  </div>
                </div>
                <Badge className={`text-xs ${getStatusColor(protocol.status)}`}>
                  {protocol.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {protocol.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    TVL
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {protocol.tvl}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    APY
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {protocol.apy}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {protocol.blockchain.map((chain) => (
                  <Badge
                    key={chain}
                    className={`text-xs px-1.5 py-0.5 ${getBlockchainColor(
                      chain
                    )}`}
                  >
                    {chain}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
