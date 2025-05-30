"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VaultCard } from "./vault-card";
import { StatsOverview } from "./stats-overview";
import { TransactionHistory } from "./transaction-history";
import { NavBar } from "./nav-bar";
import { ProtocolList } from "./protocol-list";

const MOCK_VAULTS = [
  {
    id: "1",
    name: "Ethereum Prime Vault",
    description: "High-yield DeFi strategies on Ethereum",
    blockchain: "Ethereum",
    apy: 12.5,
    tvl: 2840000,
    riskLevel: "Medium",
    aiStrategy: "Morpho Blue + Aave V3 Optimization",
    performance: 8.2,
    deposits: 1200000,
    allocation: {
      Lending: 45,
      "Yield Farming": 35,
      "Liquidity Mining": 20,
    },
  },
  {
    id: "2",
    name: "Arbitrum Velocity Vault",
    description: "Aggressive L2 yield optimization",
    blockchain: "Arbitrum",
    apy: 18.7,
    tvl: 890000,
    riskLevel: "High",
    aiStrategy: "GMX + Camelot Dynamic Rebalancing",
    performance: 15.3,
    deposits: 650000,
    allocation: {
      "Perp Trading": 50,
      "LP Farming": 30,
      Lending: 20,
    },
  },
  {
    id: "3",
    name: "Polygon Stable Vault",
    description: "Conservative stablecoin strategies",
    blockchain: "Polygon",
    apy: 6.8,
    tvl: 1560000,
    riskLevel: "Low",
    aiStrategy: "Aave + Compound Stable Optimization",
    performance: 6.1,
    deposits: 980000,
    allocation: {
      "Stable Lending": 70,
      "Stable LPs": 30,
    },
  },
  {
    id: "4",
    name: "Optimism Growth Vault",
    description: "Balanced growth on Optimism",
    blockchain: "Optimism",
    apy: 14.2,
    tvl: 720000,
    riskLevel: "Medium",
    aiStrategy: "Velodrome + Beethoven X Strategy",
    performance: 11.8,
    deposits: 520000,
    allocation: {
      "DEX LPs": 40,
      "Yield Farming": 35,
      Lending: 25,
    },
  },
];

export function DashboardLayout() {
  const [selectedVault, setSelectedVault] = useState(MOCK_VAULTS[0]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <nav className="grid grid-cols-3 gap-2 mb-4">
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
              </nav>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs"
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
            </nav>

            <div className="mt-8 space-y-3">
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 px-3">
                Quick Actions
              </h3>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                🚀 Deploy New Vault
              </Button>
              <Button size="sm" variant="neutral" className="w-full">
                💰 Add Funds
              </Button>
              <Button size="sm" variant="neutral" className="w-full">
                📤 Withdraw
              </Button>
            </div>

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
                <StatsOverview vaults={MOCK_VAULTS} />

                {/* Vaults Section */}
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                        Your Active Vaults
                      </h2>
                      <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">
                        AI-managed strategies across multiple chains
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto"
                    >
                      🚀 Create New Vault
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                    {MOCK_VAULTS.map((vault) => (
                      <VaultCard
                        key={vault.id}
                        vault={vault}
                        onSelect={() => setSelectedVault(vault)}
                        isSelected={selectedVault.id === vault.id}
                      />
                    ))}
                  </div>

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
                      Discover and invest in algorithmic trading strategies
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto"
                  >
                    🚀 Create New Vault
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                  {MOCK_VAULTS.map((vault) => (
                    <VaultCard
                      key={vault.id}
                      vault={vault}
                      onSelect={() => setSelectedVault(vault)}
                      isSelected={selectedVault.id === vault.id}
                      showFullDetails
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="portfolio"
                className="space-y-4 lg:space-y-6 mt-0"
              >
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                  <div className="xl:col-span-2">
                    <TransactionHistory />
                  </div>
                  <div className="space-y-4 lg:space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg lg:text-xl">
                          Portfolio Allocation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {MOCK_VAULTS.map((vault) => (
                            <div
                              key={vault.id}
                              className="flex items-center justify-between"
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
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
