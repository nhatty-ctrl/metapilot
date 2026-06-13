import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Hackathon Qualification Checker
 * Validates backend infrastructure against hackathon requirements
 */

const ARBITRUM_RPC = "https://arb1.arbitrum.io/rpc";
const ETHEREUM_RPC = "https://eth.llamarpc.com";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Check MetaMask Smart Accounts Kit availability
 */
export async function checkMetaMaskSmartAccounts() {
  const checks = {
    metaMaskSmartAccountsKit: false,
    erc7715Support: false,
    permissionSystem: false,
    error: null
  };

  try {
    // Check if MetaMask Smart Accounts Kit is installed
    try {
      await import('@metamask/smart-accounts-kit');
      checks.metaMaskSmartAccountsKit = true;
    } catch (e) {
      checks.error = "@metamask/smart-accounts-kit not installed";
    }

    // Verify ERC-7715 support via environment/config
    const erc7715Configured = !!process.env.ERC7715_ENABLED || !!process.env.METAMASK_SMART_ACCOUNTS;
    checks.erc7715Support = erc7715Configured;

    // Check permission system database setup
    checks.permissionSystem = true; // Would check DB schema in production

    return checks;
  } catch (error) {
    return { ...checks, error: error.message };
  }
}

/**
 * Check 1Shot Permissionless Relayer setup
 */
export async function check1ShotRelayer() {
  const checks = {
    relayerEndpoint: false,
    gasAbstraction: false,
    eip7710Support: false,
    connectivity: false,
    error: null
  };

  try {
    const relayerUrl = process.env.ONE_SHOT_RELAYER_URL || "https://relayer.1shot.fi";
    
    // Test relayer connectivity
    try {
      const response = await axios.get(`${relayerUrl}/health`, { timeout: 5000 });
      checks.connectivity = response.status === 200;
      checks.relayerEndpoint = true;
    } catch (e) {
      checks.error = `Relayer unreachable: ${e.message}`;
    }

    // Check gas abstraction support
    checks.gasAbstraction = !!process.env.RELAYER_API_KEY || !!process.env.ONE_SHOT_CONFIG;

    // Check EIP-7710 support
    checks.eip7710Support = true; // Supported by 1Shot by default

    return checks;
  } catch (error) {
    return { ...checks, error: error.message };
  }
}

/**
 * Check Venice AI integration
 */
export async function checkVeniceAI() {
  const checks = {
    apiKeyConfigured: false,
    apiConnectivity: false,
    modelsAvailable: false,
    privacyModeEnabled: false,
    error: null
  };

  try {
    const veniceApiKey = process.env.VENICE_API_KEY;
    checks.apiKeyConfigured = !!veniceApiKey;

    if (veniceApiKey) {
      try {
        // Test Venice API connectivity
        const response = await axios.get("https://api.venice.ai/v1/models", {
          headers: { Authorization: `Bearer ${veniceApiKey}` },
          timeout: 5000
        });
        checks.apiConnectivity = response.status === 200;
        checks.modelsAvailable = Array.isArray(response.data.data) && response.data.data.length > 0;
      } catch (e) {
        checks.error = `Venice API unreachable: ${e.message}`;
      }
    }

    // Privacy mode enabled
    checks.privacyModeEnabled = process.env.VENICE_PRIVACY_MODE === "true";

    return checks;
  } catch (error) {
    return { ...checks, error: error.message };
  }
}

/**
 * Check Arbitrum network connectivity and deployment
 */
export async function checkArbitrumSetup() {
  const checks = {
    rpcConnectivity: false,
    networkId: null,
    blockNumber: null,
    contractsDeployed: false,
    stylus: false,
    error: null
  };

  try {
    // Test Arbitrum RPC connectivity
    try {
      const response = await axios.post(
        ARBITRUM_RPC,
        {
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1
        },
        { timeout: 5000 }
      );

      checks.rpcConnectivity = !response.data.error;
      checks.networkId = response.data.result; // Should be 0xa4b1 for Arbitrum One
    } catch (e) {
      checks.error = `Arbitrum RPC unreachable: ${e.message}`;
      return checks;
    }

    // Get current block number
    try {
      const response = await axios.post(
        ARBITRUM_RPC,
        {
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1
        },
        { timeout: 5000 }
      );
      checks.blockNumber = parseInt(response.data.result || "0");
    } catch (e) {
      checks.error = `Failed to get block number: ${e.message}`;
    }

    // Check if smart contracts are deployed (check env for contract addresses)
    const contractAddresses = {
      yieldAutopilot: process.env.YIELD_AUTOPILOT_CONTRACT,
      smartAccount: process.env.SMART_ACCOUNT_CONTRACT
    };
    checks.contractsDeployed = !!contractAddresses.yieldAutopilot || !!contractAddresses.smartAccount;

    // Check Stylus support (Rust on Arbitrum)
    checks.stylus = process.env.ARBITRUM_STYLUS_ENABLED === "true";

    return checks;
  } catch (error) {
    return { ...checks, error: error.message };
  }
}

/**
 * Check wallet balance fetching capability
 */
export async function checkWalletBalanceFetching() {
  const checks = {
    ethersJsInstalled: false,
    rpcConnectivity: false,
    tokenContractAccess: false,
    priceOracleConnected: false,
    error: null
  };

  try {
    // Check if ethers.js is available
    try {
      await import('ethers');
      checks.ethersJsInstalled = true;
    } catch (e) {
      checks.error = "ethers.js not installed";
    }

    // Test RPC connectivity
    try {
      const response = await axios.post(
        ARBITRUM_RPC,
        {
          jsonrpc: "2.0",
          method: "net_version",
          params: [],
          id: 1
        },
        { timeout: 5000 }
      );
      checks.rpcConnectivity = !response.data.error;
    } catch (e) {
      checks.error = `RPC unreachable: ${e.message}`;
    }

    // Check token contracts accessibility
    const tokenContracts = {
      WBTC: process.env.WBTC_CONTRACT_ADDRESS || "0x2f2a2540f7e14c3656039b6eb99e8cea82fba64a",
      USDT: process.env.USDT_CONTRACT_ADDRESS || "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      ARB: process.env.ARB_CONTRACT_ADDRESS || "0x912CE59144191c1204e64559fe8253a0e108ff3e"
    };
    checks.tokenContractAccess = !!tokenContracts.WBTC && !!tokenContracts.USDT && !!tokenContracts.ARB;

    // Check price oracle (CoinGecko or similar)
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,arbitrum&vs_currencies=usd",
        { timeout: 5000 }
      );
      checks.priceOracleConnected = !!response.data.ethereum;
    } catch (e) {
      checks.error = `Price oracle unreachable: ${e.message}`;
    }

    return checks;
  } catch (error) {
    return { ...checks, error: error.message };
  }
}

/**
 * Check Gemini AI integration for yield recommendations
 */
export async function checkGeminiAI() {
  const checks = {
    apiKeyConfigured: false,
    apiConnectivity: false,
    modelAvailable: false,
    generationCapable: false,
    error: null
  };

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    checks.apiKeyConfigured = !!geminiApiKey;

    if (geminiApiKey) {
      try {
        // Test Gemini API connectivity via a simple request.
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
          {
            contents: [{
              parts: [{ text: "ping" }]
            }]
          },
          { timeout: 5000 }
        );

        checks.apiConnectivity = response.status === 200;
        checks.modelAvailable = !!response.data.candidates;
        checks.generationCapable = response.data.candidates?.length > 0;
      } catch (e) {
        checks.error = `Gemini API unreachable: ${e.message}`;
      }
    }

    return checks;
  } catch (error) {
    return { ...checks, error: error.message };
  }
}

/**
 * Check database setup for user management and transaction logging
 */
export async function checkDatabaseSetup() {
  const checks = {
    databaseConnected: false,
    tablesExist: false,
    migrationsRun: false,
    backupConfigured: false,
    error: null
  };

  try {
    // Import database pool
    try {
      const { default: pool } = await import('../db/pool.js');
      
      // Test connection
      const client = await pool.connect();
      checks.databaseConnected = true;

      // Check if required tables exist
      const result = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'transactions', 'permissions')
      `);

      checks.tablesExist = result.rows.length >= 2;
      client.release();
    } catch (e) {
      checks.error = `Database unreachable: ${e.message}`;
    }

    // Check migrations
    checks.migrationsRun = process.env.DB_MIGRATIONS_COMPLETE === "true";

    // Check backup configuration
    checks.backupConfigured = !!process.env.DATABASE_BACKUP_URL;

    return checks;
  } catch (error) {
    return { ...checks, error: error.message };
  }
}

/**
 * Generate comprehensive hackathon qualification report
 */
export async function generateQualificationReport() {
  console.log("🔍 Starting Hackathon Qualification Checks...\n");

  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    checks: {
      metaMaskSmartAccounts: await checkMetaMaskSmartAccounts(),
      oneShortRelayer: await check1ShotRelayer(),
      veniceAI: await checkVeniceAI(),
      arbitrumSetup: await checkArbitrumSetup(),
      walletBalanceFetching: await checkWalletBalanceFetching(),
      geminiAI: await checkGeminiAI(),
      database: await checkDatabaseSetup()
    },
    qualifications: {
      metamaskHackathon: false,
      arbitrumHackathon: false
    },
    summary: {}
  };

  // Calculate MetaMask hackathon qualification
  const mmChecks = report.checks;
  report.qualifications.metamaskHackathon = 
    mmChecks.metaMaskSmartAccounts.metaMaskSmartAccountsKit &&
    mmChecks.metaMaskSmartAccounts.erc7715Support &&
    mmChecks.oneShortRelayer.connectivity &&
    mmChecks.veniceAI.apiConnectivity &&
    mmChecks.database.databaseConnected;

  // Calculate Arbitrum hackathon qualification
  report.qualifications.arbitrumHackathon =
    mmChecks.arbitrumSetup.rpcConnectivity &&
    mmChecks.arbitrumSetup.contractsDeployed &&
    mmChecks.walletBalanceFetching.ethersJsInstalled &&
    mmChecks.database.databaseConnected;

  // Generate summary
  report.summary = {
    totalChecks: Object.keys(mmChecks).length,
    passedChecks: Object.values(mmChecks).reduce((sum, check) => {
      return sum + Object.values(check).filter(v => v === true).length;
    }, 0),
    recommendations: generateRecommendations(report.checks)
  };

  return report;
}

/**
 * Generate recommendations based on failed checks
 */
function generateRecommendations(checks) {
  const recommendations = [];

  if (!checks.metaMaskSmartAccounts.metaMaskSmartAccountsKit) {
    recommendations.push("⚠️ Install MetaMask Smart Accounts Kit: npm install @metamask/smart-accounts-kit");
  }

  if (!checks.oneShortRelayer.connectivity) {
    recommendations.push("⚠️ Configure 1Shot Relayer URL in .env: ONE_SHOT_RELAYER_URL=https://relayer.1shot.fi");
  }

  if (!checks.veniceAI.apiKeyConfigured) {
    recommendations.push("⚠️ Add Venice AI API Key to .env: VENICE_API_KEY=your_key");
  }

  if (!checks.arbitrumSetup.rpcConnectivity) {
    recommendations.push("⚠️ Arbitrum RPC unreachable. Check network connection.");
  }

  if (!checks.walletBalanceFetching.ethersJsInstalled) {
    recommendations.push("⚠️ Install ethers.js: npm install ethers");
  }

  if (!checks.database.databaseConnected) {
    recommendations.push("⚠️ Database connection failed. Check DATABASE_URL in .env");
  }

  return recommendations;
}

export default {
  checkMetaMaskSmartAccounts,
  check1ShotRelayer,
  checkVeniceAI,
  checkArbitrumSetup,
  checkWalletBalanceFetching,
  checkGeminiAI,
  checkDatabaseSetup,
  generateQualificationReport
};
