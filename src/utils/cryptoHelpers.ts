import { BalanceState, TransactionRecord, Conversation, Network, ExecutionPlan } from '../types';

export const INITIAL_BALANCES: BalanceState = {
  ETH: 4.2531,
  BTC: 0.1245,
  USDT: 1540.00,
  ARB: 1250.00
};

export const INITIAL_ADDRESS = "0x71C5651c6A5405A51445D1A0518f8c4971c2897f";

export function formatAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function getEstimatedPortfolioValue(balances: BalanceState): number {
  const ethPrice = 3082.50;
  const btcPrice = 64920.00;
  const arbPrice = 0.95;
  return (balances.ETH * ethPrice) + (balances.BTC * btcPrice) + (balances.ARB * arbPrice) + balances.USDT;
}

export interface ParseResult {
  reply: string;
  thought: string;
  toolCalls?: { name: string; params: string; result: string }[];
  requiresPlanConfirmation?: boolean;
  executionPlan?: ExecutionPlan;
  showCharts?: boolean;
  targetToken?: "ETH" | "WBTC" | "ARB";
  recommendation?: {
    protocol: string;
    token: string;
    amount: string;
    apy: string;
    risk: "Low" | "Medium" | "High";
  };
}

// Strictly no emojis, pure Lucide icons will be dynamically mapped on the frontend.
export function parseLocalCommand(text: string, balances: BalanceState, currentAddress: string, activeNetwork: Network): ParseResult {
  const lower = text.toLowerCase();
  
  if (lower.includes("send") || lower.includes("transfer") || lower.includes("pay")) {
    const amtMatch = text.match(/[\d.]+/);
    const amount = amtMatch ? parseFloat(amtMatch[0]) : 0.1;
    
    const addrMatch = text.match(/0x[a-fA-F0-9]{40}/) || text.match(/[A-Za-z0-9]{34,44}/);
    const destination = addrMatch ? addrMatch[0] : "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const destAbbr = `${destination.slice(0, 6)}...${destination.slice(-4)}`;
    const asset = lower.includes("usdt") ? "USDT" : lower.includes("btc") ? "BTC" : "ETH";
    
    // Check if enough balance
    const available = balances[asset as keyof BalanceState];
    const hasEnough = available >= amount;
    
    if (!hasEnough) {
      return {
        thought: `Evaluating transfer request... Identified target asset: ${asset}, Destination Address: ${destination}, Requested amount: ${amount}. Evaluating account states: Current balance of ${available} ${asset} is insufficient for transfer of ${amount} ${asset} plus network base fee. Formulation of rejection packet required.`,
        reply: `Transfer request failed due to insufficient funds.\n\nRequested: **${amount} ${asset}**\nTo Destination: \`${destination}\`\nAvailable Balance: **${available} ${asset}**\n\nPlease adjust the transfer amount or fund your wallet before initiating this transaction.`,
        toolCalls: [
          { name: "dry_run_send", params: `{"amount":${amount},"asset":"${asset}","to":"${destination}"}`, result: "FAILED: Insufficient funds" }
        ]
      };
    }

    const estimatedGas = asset === "ETH" ? 0.00015 : 0.00008;
    
    return {
      thought: `Parsing intent: Send funds. Asset specified: ${asset}. Destination parsed: ${destination}. Quantity verified: ${amount}. Network route: ${activeNetwork}. Creating on-chain execution plan for transfer outbound. Safe routing check complete.`,
      reply: `I have compiled an outbound transfer execution plan for your approval.\n\n- Action: **Outbound Transfer**\n- Amount: **${amount} ${asset}**\n- Destination Recipient: \`${destination}\`\n- Gas Fee Cap: **~${estimatedGas} ETH**\n\nPlease review and approve this execution plan to submit the transaction to your Web3 provider.`,
      requiresPlanConfirmation: true,
      toolCalls: [
        { name: "dry_run_send", params: `{"amount":${amount},"asset":"${asset}","to":"${destination}"}`, result: "SUCCESS: Prepared payload 0x01af...99cd" }
      ],
      executionPlan: {
        action: "send",
        protocol: "Native Transfer",
        token: asset,
        amount: `${amount} ${asset}`,
        apy: "0%",
        risk: "Low",
        steps: [
          `Prepare on-chain transfer token parameters for ${amount} ${asset}`,
          `Resolve destination contract address status for recipient: ${destAbbr}`,
          `Estimate optimal layer-2 gas usage boundaries (~${estimatedGas} ETH)`,
          `Ready raw transaction payload block for MetaMask approval`
        ],
        payload: { amount, asset, destination }
      }
    };
  }
  
  if (lower.includes("swap") || lower.includes("convert") || lower.includes("exchange")) {
    const amtMatch = text.match(/[\d.]+/);
    const amount = amtMatch ? parseFloat(amtMatch[0]) : 0.5;
    const fromAsset: string = lower.includes("usdt") ? "USDT" : lower.includes("btc") ? "BTC" : "ETH";
    const toAsset: string = fromAsset === "ETH" ? "USDT" : (fromAsset === "BTC" ? "USDT" : "ETH");
    
    const ethPrice = 3082.50;
    const btcPrice = 64920.00;
    
    let swapRate = 1;
    if (fromAsset === "ETH" && toAsset === "USDT") swapRate = ethPrice;
    else if (fromAsset === "USDT" && toAsset === "ETH") swapRate = 1 / ethPrice;
    else if (fromAsset === "BTC" && toAsset === "USDT") swapRate = btcPrice;
    else if (fromAsset === "USDT" && toAsset === "BTC") swapRate = 1 / btcPrice;
    
    const outputAmt = (amount * swapRate * 0.995); // 0.5% slippage
    const outputFormatted = outputAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    
    const available = balances[fromAsset as keyof BalanceState];
    if (available < amount) {
      return {
        thought: `Evaluating Atomic Swap. Trade pair: ${fromAsset} to ${toAsset}. Input amount requested: ${amount}. Available balance: ${available} ${fromAsset}. Recompiling route metrics - swap rejected due to negative balance delta.`,
        reply: `Atomic swap route estimation failed because of insufficient ${fromAsset} liquidity.\n\n**Summary:**\n- Attempted Swap: **${amount} ${fromAsset}** to **${toAsset}**\n- Balance available: **${available} ${fromAsset}**\n\nPlease buy or deposit more assets to perform this swap.`,
        toolCalls: [
          { name: "swap_quote", params: `{"from":"${fromAsset}","to":"${toAsset}","amount":${amount}}`, result: "ERROR: Insufficient funds" }
        ]
      };
    }
    
    return {
      thought: `Parsing intent: Asset Exchange. Source liquidity: ${fromAsset}. Target liquidity: ${toAsset}. Path found: Uniswap v3 pool via Camelot router. Quoted yield: ${outputFormatted} ${toAsset} (including 0.5% slippage margin).`,
      reply: `I have prepared the optimal swap route matching your request with **Uniswap v3 Smart Routing**.\n\n- Swap From: **${amount} ${fromAsset}**\n- Est. Swap To: **${outputFormatted} ${toAsset}**\n- Provider Protocol: **Uniswap V3 + Camelot Router**\n- Slippage Protection: **0.5% Enforced**\n\nPlease declare your confirmation to execute and broadcast this swap program.`,
      requiresPlanConfirmation: true,
      toolCalls: [
        { name: "swap_quote", params: `{"from":"${fromAsset}","to":"${toAsset}","amount":${amount}}`, result: `QUOTE: ${amount} ${fromAsset} for ${outputFormatted} ${toAsset}` }
      ],
      executionPlan: {
        action: "swap",
        protocol: "Uniswap V3",
        token: toAsset,
        amount: `${amount} ${fromAsset}`,
        apy: "0%",
        risk: "Low",
        steps: [
          `Query active liquidity depth across Camelot & UniV3 pools`,
          `Calculate output quoting yield: Expecting ${outputFormatted} ${toAsset}`,
          `Configure transaction slippage boundary parameters to 0.5%`,
          `Ready cross-pool swap transaction payload for MetaMask signature`
        ],
        payload: { amount, fromAsset, toAsset, output: outputFormatted }
      }
    };
  }
  
  if (lower.includes("genuine") || lower.includes("verify") || lower.includes("check") || lower.includes("hardware") || lower.includes("attest")) {
    return {
      thought: `User queried security attestation. Explaining MetaPilot security auditing policies safely. No hardware elements are referenced directly.`,
      reply: `MetaPilot implements a secure, sandbox-native smart routing architecture linked directly to your active Web3 browser environment.\n\n**MetaPilot Security System:**\n- **Pre-Audit Validation:** All recommended yield farms are continually queried against DefiLlama protocol TVL thresholds and safety audits.\n- **Slippage Guards:** Slippage borders are automatically restricted to 0.5% inside contract route payloads.\n- **Self-Custody Design:** MetaPilot never stores private keys; every transaction requires explicit double-confirmation by you through your connected wallet.`,
      toolCalls: []
    };
  }
  
  if (lower.includes("chart") || lower.includes("price") || lower.includes("perf") || lower.includes("history") || lower.includes("trend") || lower.includes("diagram") || lower.includes("graph")) {
    let targetToken: "ETH" | "WBTC" | "ARB" = "ETH";
    if (lower.includes("btc") || lower.includes("bitcoin") || lower.includes("wbtc")) {
      targetToken = "WBTC";
    } else if (lower.includes("arb") || lower.includes("arbitrum")) {
      targetToken = "ARB";
    }
    
    const tokenNames = { WBTC: "Wrapped Bitcoin", ETH: "Ethereum", ARB: "Arbitrum" };
    const currentPrices = { WBTC: 64920.00, ETH: 3082.50, ARB: 0.95 };
    const name = tokenNames[targetToken];
    const priceFormatted = currentPrices[targetToken].toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return {
      thought: `Parsing intent: Market Charts & Historic price metrics. Target asset resolved: ${targetToken} (${name}). Fetching latest simulated time-series datasets. Activating the right-side Crypto Charts widget.`,
      reply: `I have updated your analytics panel to show the live price action for **${name} (${targetToken})**.\n\n- **Asset Name:** ${name} (${targetToken})\n- **Spot Exchange Price:** **${priceFormatted}**\n- **24h Volume:** ${targetToken === "WBTC" ? "$28.4B" : (targetToken === "ETH" ? "$14.1B" : "$168M")}\n- **Market capitalization:** ${targetToken === "WBTC" ? "$1.28T" : (targetToken === "ETH" ? "$374.2B" : "$1.2B")}\n\nYou can inspect chart timelines (1D, 1W, 1M phases) and compare live pools in the right-side panel.`,
      showCharts: true,
      targetToken
    };
  }

  if (lower.includes("yield") || lower.includes("rate") || lower.includes("apy") || lower.includes("invest") || lower.includes("deposit") || lower.includes("put") || lower.includes("optimizer") || lower.includes("allocat") || lower.includes("earn") || lower.includes("usdc") || lower.includes("usdt")) {
    let token = "USDC";
    let estApy = "12.4%";
    let amt = "1,000";
    let protocol = "Aave V3";
    let riskLevel: "Low" | "Medium" | "High" = "Low";
    
    // Parse target token
    if (lower.includes("usdt")) {
      token = "USDT";
      estApy = "11.2%";
      protocol = "Curve Finance";
      riskLevel = "Medium";
    } else if (lower.includes("eth") || lower.includes("ethereum")) {
      token = "ETH";
      estApy = "3.85%";
      protocol = "Lido Finance";
      riskLevel = "Low";
    } else if (lower.includes("btc") || lower.includes("bitcoin") || lower.includes("wbtc")) {
      token = "WBTC";
      estApy = "9.4%";
      protocol = "Balancer Stable";
      riskLevel = "Low";
    } else if (lower.includes("arb") || lower.includes("arbitrum")) {
      token = "ARB";
      estApy = "24.6%";
      protocol = "Camelot CL";
      riskLevel = "Medium";
    }

    // Try to parse amount
    const amtMatch = text.match(/[\d,.]+/);
    if (amtMatch) {
      const parsedAmtStr = amtMatch[0];
      const parsedAmt = parseFloat(parsedAmtStr.replace(/,/g, ''));
      if (parsedAmt > 0 && parsedAmt < 10000000) {
        amt = parsedAmt.toLocaleString('en-US');
      }
    }

    const numericAmt = parseFloat(amt.replace(/,/g, ''));
    const numericApy = parseFloat(estApy);
    const yearlyIncomeStr = (numericAmt * numericApy / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
    
    return {
      thought: `Parsing yield intent for token ${token}. Protocol selected: ${protocol} with APY of ${estApy}. Risk category evaluated: ${riskLevel}. Computing yearly interest accrual for principal of ${amt} ${token}: $${yearlyIncomeStr} per annum. Generating recommended yield execution card signature parameters.`,
      reply: `**${protocol}** is offering an optimized yield of **${estApy} APY** on **${token}** pools on Arbitrum.\n\n- Asset: **${token}**\n- Protocol: **${protocol}**\n- Estimated APY: **${estApy}** (${riskLevel} Risk)\n- Principal Allocation: **${amt} ${token}**\n- Projected Yearly Accrual: **+${yearlyIncomeStr} USD**\n\nI have generated an optimized on-chain yield route. Click **Execute** on the route cards to display the exact step-by-step transaction route plan before confirming the transaction.`,
      recommendation: {
        protocol,
        token,
        amount: `${amt} ${token}`,
        apy: estApy,
        risk: riskLevel
      },
      executionPlan: {
        action: "deposit",
        protocol,
        token,
        amount: `${amt} ${token}`,
        apy: estApy,
        risk: riskLevel,
        steps: [
          `Discover optimal secure on-chain routing paths via DefiLlama index checks`,
          `Calculate expected pool APY conversion: ${estApy} on ${token}`,
          `Estimate layer-2 gas usage parameters (calculated as <$0.02 USD)`,
          `Staging smart contracts interaction payload for ${protocol} deposit`
        ],
        payload: { amount: numericAmt, token, protocol, apy: estApy }
      }
    };
  }
  
  if (lower.includes("balance") || lower.includes("portfolio") || lower.includes("crypto") || lower.includes("wallet") || lower.includes("assets") || lower.includes("funds")) {
    const ethVal = balances.ETH * 3082.50;
    const btcVal = balances.BTC * 64920.00;
    const total = ethVal + btcVal + balances.USDT;
    
    return {
      thought: `Querying localized asset indexes from balance state object. Asset list: ETH, BTC, USDT. Computing latest portfolio values in USD: ETH: ${ethVal.toFixed(2)}, BTC: ${btcVal.toFixed(2)}, USDT: ${balances.USDT.toFixed(2)}. Formulating high-fidelity balance layout response.`,
      reply: `Retrieved your Web3 portfolio balances successfully.\n\n**Asset Balances Overview On Arbitrum One:**\n- **Ethereum (ETH):** **${balances.ETH.toFixed(4)} ETH** (~${formatCurrency(ethVal)})\n- **Wrapped Bitcoin (WBTC):** **${balances.BTC.toFixed(5)} WBTC** (~${formatCurrency(btcVal)})\n- **Stablecoins (USDC/USDT):** **${balances.USDT.toFixed(2)} USD** (${formatCurrency(balances.USDT)})\n\nTotal Secured Net Worth: **${formatCurrency(total)}**\nActive Chain: \`${activeNetwork}\` (Arbitrum Layer-2 Node)`,
      toolCalls: [
        { name: "get_balances", params: `{"network":"${activeNetwork}"}`, result: `ETH:${balances.ETH},BTC:${balances.BTC},USDT:${balances.USDT}` }
      ]
    };
  }

  // General fallback
  return {
    thought: `Identified user text constraints: General conversation. Generating guide instructions to promote core MetaPilot active yield features.`,
    reply: `I am your active **MetaPilot**, designed to discover, sequence, and execute high-performance stablecoin and token yields on Arbitrum. All assets are secure inside your self-custody account.\n\n**Interactions with MetaPilot:**\n- **Yield discovery:** try asking *\"Where is the highest yield for USDC?\"* or *\"Suggest high yield pool for ETH\"*\n- **Asset routing plans:** try typing *\"Swap 0.5 ETH for USDC and deposit for yield\"*\n- **Token swapping:** try typing *\"Swap 1.1 ETH for USDT\"*\n- **Markets action:** try asking *\"Show the price chart for ARB\"*\n- **Portfolio balances:** try typing *\"What are my current balances?\"*\n\nDraft proposed routes directly. All execution flows generate a comprehensive safe trading plan before asking for your wallet confirmation.`,
    toolCalls: []
  };
}
