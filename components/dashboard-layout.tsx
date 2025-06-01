"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VaultCard } from "@/components/vault-card";
import { StatsOverview } from "@/components/stats-overview";
import { TransactionHistory } from "@/components/transaction-history";
import { NavBar } from "@/components/nav-bar";
import { ProtocolList } from "@/components/protocol-list";
import { UserPositions } from "@/components/user-positions";
import { TokenFaucet } from "@/components/token-faucet";
import { CreateVaultModal } from "@/components/create-vault-modal";
import { getVaultAddress } from "@/constants/contracts";
import { getVaults } from "@/lib/supabase";
import { useChainId } from "wagmi";

interface VaultData {
  id: string;
  name: string;
  description: string;
  blockchain: string;
  chainId: number;
  contractAddress: string;
  apy: number;
  tvl: number;
  riskLevel: string;
  aiStrategy: string;
  performance: number;
  deposits: number;
  allocation: Record<string, number>;
  supportedTokens: string[];
}

interface SupabaseVault {
  id: number;
  vaultaddress: string;
  blockchain: string;
  nombre: string;
  symbol: string;
}

// Real vault data based on deployed contracts
const REAL_VAULTS: VaultData[] = [
  {
    id: "flow-testnet-multi-token-vault",
    name: "Flow Testnet Multi-Token Vault",
    description:
      "AI-powered USDC vault on Flow Testnet for optimized yield strategies",
    blockchain: "Flow Testnet",
    chainId: 545,
    contractAddress:
      getVaultAddress("flowTestnet", "MultiTokenVault") ||
      "0x7C65F77a4EbEa3D56368A73A12234bB4384ACB28",
    apy: 16.5,
    tvl: 450000,
    riskLevel: "High",
    aiStrategy: "AI-Powered USDC Yield Optimization",
    performance: 13.2,
    deposits: 320000,
    allocation: {
      "USDC Strategies": 100,
    },
    supportedTokens: ["MockUSDC"],
  },
  {
    id: "rootstock-testnet-vault",
    name: "Rootstock Testnet Vault",
    description:
      "AI-powered USDC vault on Rootstock Testnet with Bitcoin DeFi integration",
    blockchain: "Rootstock Testnet",
    chainId: 31,
    contractAddress:
      getVaultAddress("rootstockTestnet", "Vault") ||
      "0x8fDE7A649c782c96e7f4D9D88490a7C5031F51a9",
    apy: 18.2,
    tvl: 750000,
    riskLevel: "Medium",
    aiStrategy: "Bitcoin-backed USDC Yield Optimization",
    performance: 15.1,
    deposits: 580000,
    allocation: {
      "USDC Lending": 100,
    },
    supportedTokens: ["MockUSDC"],
  },
];

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false);
  const [supabaseVaults, setSupabaseVaults] = useState<VaultData[]>([]);
  const [isLoadingVaults, setIsLoadingVaults] = useState(true);
  const [selectedVault, setSelectedVault] = useState<VaultData | null>(null);

  // Get current chain ID to filter vaults and faucet
  const currentChainId = useChainId();

  // Combine hardcoded vaults with Supabase vaults and filter by current chain
  const allVaults = [...REAL_VAULTS, ...supabaseVaults];
  const filteredVaults = allVaults.filter(
    (vault) => vault.chainId === currentChainId
  );

  // Update selectedVault when filteredVaults changes
  useEffect(() => {
    if (
      filteredVaults.length > 0 &&
      (!selectedVault || !filteredVaults.find((v) => v.id === selectedVault.id))
    ) {
      setSelectedVault(filteredVaults[0]);
    } else if (filteredVaults.length === 0) {
      setSelectedVault(null);
    }
  }, [filteredVaults, selectedVault]);

  // Map Supabase vault to VaultData format
  const mapSupabaseVaultToVaultData = (vault: SupabaseVault): VaultData => {
    // Get chain ID based on blockchain name
    const getChainIdFromBlockchain = (blockchain: string): number => {
      switch (blockchain.toLowerCase()) {
        case "flow testnet":
        case "flowTestnet":
        case "flowtestnet":
          return 545;
        case "rootstock testnet":
        case "rootstockTestnet":
        case "rootstocktestnet":
          return 31;
        default:
          return 1; // Default to mainnet
      }
    };

    const chainId = getChainIdFromBlockchain(vault.blockchain);

    return {
      id: `supabase-${vault.id}`,
      name: vault.nombre,
      description: `AI-managed vault created by users on ${vault.blockchain}`,
      blockchain: vault.blockchain,
      chainId,
      contractAddress: vault.vaultaddress,
      apy: 12.5, // Default values for user-created vaults
      tvl: 0, // Will be updated when we can read from contract
      riskLevel: "Medium",
      aiStrategy: "AI-Powered Multi-Asset Strategy",
      performance: 8.7,
      deposits: 0,
      allocation: {
        "USDC Strategies": 100, // Since all user vaults use USDC
      },
      supportedTokens: ["MockUSDC"], // All user vaults support USDC
    };
  };

  const goToFaucet = () => {
    setActiveTab("faucet");
    setIsMobileMenuOpen(false);
  };

  // Load vaults from Supabase
  const loadSupabaseVaults = async () => {
    try {
      setIsLoadingVaults(true);
      const vaults = await getVaults();
      const mappedVaults = vaults.map(mapSupabaseVaultToVaultData);
      setSupabaseVaults(mappedVaults);
    } catch (error) {
      console.error("Error loading vaults from Supabase:", error);
    } finally {
      setIsLoadingVaults(false);
    }
  };

  // Load vaults on component mount
  useEffect(() => {
    loadSupabaseVaults();
  }, []);

  // Reload vaults when modal closes (in case a new vault was created)
  useEffect(() => {
    if (!isCreateVaultModalOpen) {
      loadSupabaseVaults();
    }
  }, [isCreateVaultModalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <NavBar />
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900 dark:text-white">
                  DEFAI
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI-Powered Vaults
                </p>
              </div>
            </div>
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="p-4 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/60 dark:border-slate-800/60">
              <nav className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant={activeTab === "overview" ? "default" : "neutral"}
                  className="text-xs"
                  onClick={() => {
                    setActiveTab("overview");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  📊 Overview
                </Button>
                <Button
                  variant={activeTab === "vaults" ? "default" : "neutral"}
                  className="text-xs"
                  onClick={() => {
                    setActiveTab("vaults");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🏦 Vaults
                </Button>
                <Button
                  variant={activeTab === "portfolio" ? "default" : "neutral"}
                  className="text-xs"
                  onClick={() => {
                    setActiveTab("portfolio");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  💼 Portfolio
                </Button>
                <Button
                  variant={activeTab === "faucet" ? "default" : "neutral"}
                  className="text-xs"
                  onClick={() => {
                    setActiveTab("faucet");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🚰 Faucet
                </Button>
              </nav>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs"
                  onClick={() => {
                    setIsCreateVaultModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🚀 Deploy New Vault
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="neutral" className="text-xs">
                    💰 Add Funds
                  </Button>
                  <Button size="sm" variant="neutral" className="text-xs">
                    📤 Withdraw
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
          <div className="p-6 h-screen overflow-y-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-900 dark:text-white">
                  DEFAI
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  AI-Powered Vaults
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              <Button
                variant={activeTab === "overview" ? "default" : "neutral"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
              >
                📊 Overview
              </Button>
              <Button
                variant={activeTab === "vaults" ? "default" : "neutral"}
                className="w-full justify-start"
                onClick={() => setActiveTab("vaults")}
              >
                🏦 Vaults
              </Button>
              <Button
                variant={activeTab === "portfolio" ? "default" : "neutral"}
                className="w-full justify-start"
                onClick={() => setActiveTab("portfolio")}
              >
                💼 Portfolio
              </Button>
              <Button
                variant={activeTab === "faucet" ? "default" : "neutral"}
                className="w-full justify-start"
                onClick={() => setActiveTab("faucet")}
              >
                🚰 Faucet
              </Button>
            </nav>

            <div className="mt-8">
              <Alert className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
                <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm">
                  🤖 AI is actively optimizing your portfolio. Next rebalance in
                  2h 15m.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop NavBar */}
          <div className="hidden lg:block">
            <NavBar />
          </div>

          <main className="flex-1 p-3 sm:p-4 lg:p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full h-full"
            >
              <TabsContent
                value="overview"
                className="space-y-4 lg:space-y-6 mt-0"
              >
                {/* Stats Overview */}
                <StatsOverview vaults={filteredVaults} />

                {/* Loading indicator */}
                {isLoadingVaults && (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      Loading vaults...
                    </span>
                  </div>
                )}

                {/* Vaults Section */}
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                        Your Active Vaults
                      </h2>
                      <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">
                        AI-managed strategies on{" "}
                        {currentChainId === 545
                          ? "Flow Testnet"
                          : currentChainId === 31
                          ? "Rootstock Testnet"
                          : "your current network"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto"
                      onClick={() => setIsCreateVaultModalOpen(true)}
                    >
                      🚀 Create New Vault
                    </Button>
                  </div>

                  {!isLoadingVaults && filteredVaults.length === 0 ? (
                    <div className="text-center py-12">
                      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 max-w-lg mx-auto">
                        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-3xl">🏦</span>
                            <div>
                              <strong>
                                No vaults available on this network
                              </strong>
                              <p className="mt-1 text-sm">
                                Switch to Flow Testnet or Rootstock Testnet to
                                see available vaults, or create a new vault on
                                your current network.
                              </p>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                      {filteredVaults.map((vault) => (
                        <VaultCard
                          goToFaucet={goToFaucet}
                          key={vault.id}
                          vault={vault}
                          onSelect={() => setSelectedVault(vault)}
                          isSelected={selectedVault?.id === vault.id}
                        />
                      ))}
                    </div>
                  )}

                  {/* Protocol Integrations */}
                  <ProtocolList />
                </div>
              </TabsContent>

              <TabsContent
                value="vaults"
                className="space-y-4 lg:space-y-6 mt-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                      AI-Managed Vaults
                    </h2>
                    <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">
                      Discover and invest in algorithmic trading strategies on{" "}
                      {currentChainId === 545
                        ? "Flow Testnet"
                        : currentChainId === 31
                        ? "Rootstock Testnet"
                        : "your current network"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto"
                    onClick={() => setIsCreateVaultModalOpen(true)}
                  >
                    🚀 Create New Vault
                  </Button>
                </div>

                {!isLoadingVaults && filteredVaults.length === 0 ? (
                  <div className="text-center py-12">
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 max-w-lg mx-auto">
                      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-3xl">🚀</span>
                          <div>
                            <strong>No vaults found on this network</strong>
                            <p className="mt-1 text-sm">
                              Switch to Flow Testnet or Rootstock Testnet to
                              discover existing vaults, or be the first to
                              create a vault on your current network!
                            </p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredVaults.map((vault) => (
                      <VaultCard
                        goToFaucet={goToFaucet}
                        key={vault.id}
                        vault={vault}
                        onSelect={() => setSelectedVault(vault)}
                        isSelected={selectedVault?.id === vault.id}
                        showFullDetails
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="portfolio"
                className="space-y-4 lg:space-y-6 mt-0"
              >
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                  {/* User Positions - takes up 2 columns */}
                  <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                    <UserPositions />
                    <TransactionHistory />
                  </div>

                  {/* Side panel - Portfolio summary */}
                  <div className="space-y-4 lg:space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg lg:text-xl">
                          Portfolio Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filteredVaults.map((vault) => (
                            <div
                              key={vault.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                <span className="text-sm font-medium">
                                  {vault.name.split(" ")[0]}
                                </span>
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                ${vault.deposits.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg lg:text-xl">
                          Performance Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Total PnL
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            +$12,450
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            24h Change
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            +2.1%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Best Performer
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            Arbitrum
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="faucet"
                className="space-y-4 lg:space-y-6 mt-0"
              >
                <TokenFaucet />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Create Vault Modal */}
      <CreateVaultModal
        isOpen={isCreateVaultModalOpen}
        onOpenChange={setIsCreateVaultModalOpen}
      />
    </div>
  );
}
