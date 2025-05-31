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
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const { address: userAddress } = useAccount();
  const {
    writeContract,
    data: hash,
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
  const { data: currentAllowance } = useReadContract({
    address: selectedTokenAddress as Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      userAddress && vault
        ? [userAddress, vault.contractAddress as Address]
        : undefined,
    query: { enabled: !!selectedTokenAddress && !!userAddress && !!vault },
  });

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

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if approval is needed
  useEffect(() => {
    if (currentAllowance !== undefined && parsedAmount > BigInt(0)) {
      setNeedsApproval(currentAllowance < parsedAmount);
    }
  }, [currentAllowance, parsedAmount]);

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
    if (isSuccess) {
      onOpenChange(false);
    }
  }, [isSuccess, onOpenChange]);

  const handleApprove = async () => {
    if (!selectedTokenAddress || !vault || parsedAmount === BigInt(0)) return;

    setIsApproving(true);
    try {
      writeContract({
        address: selectedTokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [vault.contractAddress as Address, parsedAmount],
      });
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsApproving(false);
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
        writeContract({
          address: vault.contractAddress as Address,
          abi: VAULT_ABI,
          functionName: "deposit",
          args: [parsedAmount, userAddress],
        });
      } else {
        // For other tokens, use depositToken function
        writeContract({
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
                  <span className="text-sm text-slate-500">
                    Balance:{" "}
                    {formatBalance(tokenBalance, selectedTokenConfig.decimals)}{" "}
                    {selectedToken}
                  </span>
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
                    Insufficient balance
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
            {needsApproval && selectedToken !== "MockUSDC" && (
              <Button
                onClick={handleApprove}
                disabled={
                  !isFormValid || isApproving || Boolean(hasInsufficientBalance)
                }
                className="w-full"
                variant="neutral"
              >
                {isApproving ? "Approving..." : `Approve ${selectedToken}`}
              </Button>
            )}

            <Button
              onClick={handleDeposit}
              disabled={
                !isFormValid ||
                Boolean(hasInsufficientBalance) ||
                needsApproval ||
                isDepositPending ||
                isConfirming
              }
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isDepositPending || isConfirming ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isConfirming ? "Confirming..." : "Depositing..."}
                </div>
              ) : (
                "Deposit"
              )}
            </Button>
          </div>

          {/* Chain Info */}
          <div className="text-xs text-center text-slate-500 dark:text-slate-400">
            Depositing on {vault.blockchain} (Chain ID: {vault.chainId})
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
