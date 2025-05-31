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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
import {
  getTokenAddress,
  getTokenConfig,
  TokenName,
} from "@/constants/contracts";

interface VaultData {
  id: string;
  name: string;
  blockchain: string;
  chainId: number;
  contractAddress: string;
  supportedTokens: string[];
}

interface DepositModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vault: VaultData | null;
}

// Hardcoded token restrictions per vault
const VAULT_TOKEN_RESTRICTIONS = {
  "base-multi-token-vault": ["MockUSDC", "MockWBTC", "MockWETH"],
  "flow-testnet-multi-token-vault": ["MockUSDC"], // Only USDC for Flow testnet
} as const;

// ERC20 ABI for token operations
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// MultiTokenVault ABI (partial)
const VAULT_ABI = [
  {
    name: "depositToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "tokenAmount", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "previewTokenDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "tokenAmount", type: "uint256" },
    ],
    outputs: [{ name: "usdcEquivalent", type: "uint256" }],
  },
  {
    name: "previewDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "shares", type: "uint256" }],
  },
] as const;

export function DepositModal({
  isOpen,
  onOpenChange,
  vault,
}: DepositModalProps) {
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [needsApproval, setNeedsApproval] = useState(false);

  const { address: userAddress } = useAccount();
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Separate hooks for approval and deposit transactions
  const {
    writeContract: writeApproval,
    data: approvalHash,
    isPending: isApprovalPending,
  } = useWriteContract();

  const {
    writeContract: writeDeposit,
    data: depositHash,
    isPending: isDepositPending,
  } = useWriteContract();

  // Get allowed tokens for this vault
  const getAllowedTokens = (vaultId: string) => {
    return (
      VAULT_TOKEN_RESTRICTIONS[
        vaultId as keyof typeof VAULT_TOKEN_RESTRICTIONS
      ] || []
    );
  };

  const allowedTokens = vault ? getAllowedTokens(vault.id) : [];

  // Get token addresses
  const selectedTokenAddress = selectedToken
    ? getTokenAddress(
        vault?.blockchain === "Base" ? "base" : "flowTestnet",
        selectedToken as TokenName
      )
    : null;

  const selectedTokenConfig = selectedToken
    ? getTokenConfig(selectedToken as TokenName)
    : null;

  // Parse amount based on token decimals
  const parsedAmount =
    selectedTokenConfig && amount
      ? parseUnits(amount, selectedTokenConfig.decimals)
      : BigInt(0);

  // Read user's token balance
  const { data: tokenBalance } = useReadContract({
    address: selectedTokenAddress as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!selectedTokenAddress && !!userAddress },
  });

  // Read current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract(
    {
      address: selectedTokenAddress as Address,
      abi: ERC20_ABI,
      functionName: "allowance",
      args:
        userAddress && vault
          ? [userAddress, vault.contractAddress as Address]
          : undefined,
      query: { enabled: !!selectedTokenAddress && !!userAddress && !!vault },
    }
  );

  // Preview deposit (USDC equivalent)
  const { data: usdcEquivalent } = useReadContract({
    address: vault?.contractAddress as Address,
    abi: VAULT_ABI,
    functionName: "previewTokenDeposit",
    args:
      selectedTokenAddress && parsedAmount > BigInt(0)
        ? [selectedTokenAddress as Address, parsedAmount]
        : undefined,
    query: {
      enabled: !!selectedTokenAddress && parsedAmount > BigInt(0) && !!vault,
    },
  });

  // Preview shares
  const { data: expectedShares } = useReadContract({
    address: vault?.contractAddress as Address,
    abi: VAULT_ABI,
    functionName: "previewDeposit",
    args: usdcEquivalent ? [usdcEquivalent] : undefined,
    query: { enabled: !!usdcEquivalent && !!vault },
  });

  // Wait for approval transaction confirmation
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    });

  // Wait for deposit transaction confirmation
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({
      hash: depositHash,
    });

  // Check if approval is needed
  useEffect(() => {
    if (currentAllowance !== undefined && parsedAmount > BigInt(0)) {
      setNeedsApproval(currentAllowance < parsedAmount);
    } else {
      setNeedsApproval(false);
    }
  }, [currentAllowance, parsedAmount]);

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApprovalSuccess) {
      // Immediate refetch
      refetchAllowance();

      // Additional refetch after a short delay to ensure blockchain state is updated
      const timeout = setTimeout(() => {
        refetchAllowance();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isApprovalSuccess, refetchAllowance]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedToken("");
      setAmount("");
      setNeedsApproval(false);
    }
  }, [isOpen]);

  // Close modal on successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      // Small delay to show success state before closing
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  }, [isDepositSuccess, onOpenChange]);

  const handleApprove = async () => {
    if (!selectedTokenAddress || !vault || parsedAmount === BigInt(0)) return;

    try {
      writeApproval({
        address: selectedTokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [vault.contractAddress as Address, parsedAmount],
      });
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleDeposit = async () => {
    if (
      !vault ||
      !selectedTokenAddress ||
      !userAddress ||
      parsedAmount === BigInt(0)
    )
      return;

    try {
      // If depositing USDC, use the standard ERC4626 deposit function
      if (selectedToken === "MockUSDC") {
        writeDeposit({
          address: vault.contractAddress as Address,
          abi: VAULT_ABI,
          functionName: "deposit",
          args: [parsedAmount, userAddress],
        });
      } else {
        // For other tokens, use depositToken function
        writeDeposit({
          address: vault.contractAddress as Address,
          abi: VAULT_ABI,
          functionName: "depositToken",
          args: [selectedTokenAddress as Address, parsedAmount, userAddress],
        });
      }
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const formatBalance = (balance: bigint, decimals: number) => {
    return parseFloat(formatUnits(balance, decimals)).toFixed(4);
  };

  const isFormValid =
    selectedToken && amount && parseFloat(amount) > 0 && userAddress;
  const hasInsufficientBalance = tokenBalance && parsedAmount > tokenBalance;

  // Chain verification
  const isCorrectChain = currentChainId === vault?.chainId;
  const needsChainSwitch = vault && !isCorrectChain;

  // Button states
  const isApprovalNeeded = needsApproval && selectedToken !== "MockUSDC";
  const isApprovalInProgress = isApprovalPending || isApprovalConfirming;
  const isDepositInProgress = isDepositPending || isDepositConfirming;

  // Approval flow: force approval first for non-USDC tokens
  const showApprovalButton =
    isApprovalNeeded &&
    isFormValid &&
    !hasInsufficientBalance &&
    isCorrectChain;
  const showDepositButton =
    !isApprovalNeeded &&
    isFormValid &&
    !hasInsufficientBalance &&
    isCorrectChain;

  const handleSwitchChain = async () => {
    if (!vault) return;

    try {
      await switchChain({ chainId: vault.chainId });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  if (!vault) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Deposit to {vault.name}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400">
            Choose a token and amount to deposit into the vault
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wallet Connection Check */}
          {!userAddress && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                <div className="text-center">
                  💼 Please connect your wallet to deposit into this vault
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Chain Switch Warning */}
          {userAddress && needsChainSwitch && (
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <AlertDescription className="text-orange-700 dark:text-orange-300 text-sm">
                <div className="flex flex-col gap-3">
                  <div>
                    ⚠️ Wrong network detected! This vault is on{" "}
                    {vault.blockchain} (Chain ID: {vault.chainId}) but
                    you&apos;re connected to Chain ID: {currentChainId}
                  </div>
                  <Button
                    onClick={handleSwitchChain}
                    disabled={isSwitchingChain}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    size="sm"
                  >
                    {isSwitchingChain ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Switching to {vault.blockchain}...
                      </div>
                    ) : (
                      `Switch to ${vault.blockchain}`
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Only show form if wallet connected and on correct chain */}
          {userAddress && isCorrectChain && (
            <>
              {/* Token Selection */}
              <div className="space-y-2">
                <Label htmlFor="token">Select Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a token to deposit" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedTokens.map((token) => {
                      const config = getTokenConfig(token as TokenName);
                      return (
                        <SelectItem key={token} value={token}>
                          <div className="flex items-center justify-between w-full">
                            <span>{token}</span>
                            {config && (
                              <Badge variant="neutral" className="ml-2">
                                {config.decimals} decimals
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              {selectedToken && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">Amount</Label>
                    {tokenBalance && selectedTokenConfig && (
                      <div className="text-right">
                        <div className="text-sm text-slate-500">
                          Balance:{" "}
                          {formatBalance(
                            tokenBalance,
                            selectedTokenConfig.decimals
                          )}{" "}
                          {selectedToken}
                        </div>
                        <Button
                          type="button"
                          variant="neutral"
                          size="sm"
                          className="h-auto p-1 text-xs"
                          onClick={() =>
                            setAmount(
                              formatBalance(
                                tokenBalance,
                                selectedTokenConfig.decimals
                              )
                            )
                          }
                        >
                          Max
                        </Button>
                      </div>
                    )}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="any"
                    min="0"
                  />

                  {hasInsufficientBalance && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                        Insufficient balance. You have{" "}
                        {tokenBalance && selectedTokenConfig
                          ? formatBalance(
                              tokenBalance,
                              selectedTokenConfig.decimals
                            )
                          : "0"}{" "}
                        {selectedToken}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success message */}
                  {isDepositSuccess && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                      <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
                        ✅ Deposit successful! Transaction confirmed.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Approval success message */}
                  {isApprovalSuccess && needsApproval && (
                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                      <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                        ✅ Approval successful! You can now deposit.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Preview */}
              {usdcEquivalent && expectedShares && selectedTokenConfig && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Preview
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        USDC Equivalent:
                      </span>
                      <span className="font-medium">
                        ${formatBalance(usdcEquivalent, 6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Vault Shares:
                      </span>
                      <span className="font-medium">
                        {formatBalance(expectedShares, 18)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Step 1: Approval (required for non-USDC tokens) */}
                {showApprovalButton && (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
                      Step 1: Approve {selectedToken} for vault access
                    </div>
                    <Button
                      onClick={handleApprove}
                      disabled={isApprovalInProgress}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isApprovalInProgress ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Approving {selectedToken}...
                        </div>
                      ) : (
                        `Approve ${selectedToken}`
                      )}
                    </Button>
                  </div>
                )}

                {/* Step 2: Deposit (only available after approval) */}
                {showDepositButton && (
                  <div className="space-y-2">
                    {selectedToken !== "MockUSDC" && (
                      <div className="text-sm text-green-600 dark:text-green-400 text-center">
                        ✅ {selectedToken} approved! Step 2: Deposit to vault
                      </div>
                    )}
                    <Button
                      onClick={handleDeposit}
                      disabled={isDepositInProgress}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isDepositInProgress ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Depositing...
                        </div>
                      ) : (
                        "Deposit"
                      )}
                    </Button>
                  </div>
                )}

                {/* Waiting for approval message */}
                {isApprovalNeeded && !showApprovalButton && (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
                    Please complete the form above to proceed with approval
                  </div>
                )}
              </div>

              {/* Chain Info and Transaction Status */}
              <div className="space-y-2">
                <div className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Depositing on {vault.blockchain} (Chain ID: {vault.chainId})
                </div>

                {/* Transaction Hashes */}
                {approvalHash && (
                  <div className="text-xs text-center">
                    <span className="text-slate-500">Approval TX: </span>
                    <a
                      href={`https://${
                        vault.chainId === 8453
                          ? "basescan.org"
                          : "explorer.flow.com"
                      }/tx/${approvalHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 font-mono"
                    >
                      {approvalHash.slice(0, 6)}...{approvalHash.slice(-4)}
                    </a>
                  </div>
                )}

                {depositHash && (
                  <div className="text-xs text-center">
                    <span className="text-slate-500">Deposit TX: </span>
                    <a
                      href={`https://${
                        vault.chainId === 8453
                          ? "basescan.org"
                          : "explorer.flow.com"
                      }/tx/${depositHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 font-mono"
                    >
                      {depositHash.slice(0, 6)}...{depositHash.slice(-4)}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
