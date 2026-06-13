import { ethers } from 'ethers';

// Token contract addresses on Arbitrum One
const TOKEN_ADDRESSES = {
  WBTC: "0x2f2a2540f7e14c3656039b6eb99e8cea82fba64a",  // Wrapped Bitcoin
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",  // Tether
  ARB: "0x912CE59144191c1204e64559fe8253a0e108ff3e",   // Arbitrum Token
};

// ERC20 ABI for balance queries
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Arbitrum RPC endpoint
const ARBITRUM_RPC = "https://arb1.arbitrum.io/rpc";

export async function fetchWalletBalances(walletAddress) {
  try {
    const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
    
    // Fetch ETH balance
    const ethBalance = await provider.getBalance(walletAddress);
    const ethBalanceFormatted = parseFloat(ethers.formatEther(ethBalance));

    // Fetch ERC20 token balances
    const wbtcContract = new ethers.Contract(TOKEN_ADDRESSES.WBTC, ERC20_ABI, provider);
    const usdtContract = new ethers.Contract(TOKEN_ADDRESSES.USDT, ERC20_ABI, provider);
    const arbContract = new ethers.Contract(TOKEN_ADDRESSES.ARB, ERC20_ABI, provider);

    // Get decimals
    const [wbtcDecimals, usdtDecimals, arbDecimals] = await Promise.all([
      wbtcContract.decimals(),
      usdtContract.decimals(),
      arbContract.decimals()
    ]);

    // Get balances
    const [wbtcBalance, usdtBalance, arbBalance] = await Promise.all([
      wbtcContract.balanceOf(walletAddress),
      usdtContract.balanceOf(walletAddress),
      arbContract.balanceOf(walletAddress)
    ]);

    return {
      ETH: ethBalanceFormatted,
      BTC: parseFloat(ethers.formatUnits(wbtcBalance, wbtcDecimals)),
      USDT: parseFloat(ethers.formatUnits(usdtBalance, usdtDecimals)),
      ARB: parseFloat(ethers.formatUnits(arbBalance, arbDecimals))
    };
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    throw new Error("Failed to fetch wallet balances");
  }
}

export async function fetchTokenPrice(tokenSymbol) {
  try {
    // Use a simple price API (you can replace with your preferred provider)
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,arbitrum&vs_currencies=usd`);
    const data = await response.json();
    
    const priceMap = {
      ETH: data.ethereum?.usd || 3000,
      BTC: data.bitcoin?.usd || 65000,
      ARB: data.arbitrum?.usd || 0.95
    };
    
    return priceMap[tokenSymbol] || 0;
  } catch (error) {
    console.error("Error fetching token price:", error);
    return 0;
  }
}
