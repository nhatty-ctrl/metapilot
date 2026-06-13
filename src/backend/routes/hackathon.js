import express from 'express';
import { 
  generateQualificationReport,
  checkMetaMaskSmartAccounts,
  check1ShotRelayer,
  checkVeniceAI,
  checkArbitrumSetup,
  checkWalletBalanceFetching,
  checkGeminiAI,
  checkDatabaseSetup
} from '../services/hackathonQualifier.js';

const router = express.Router();

/**
 * GET /api/hackathon/qualification
 * Get comprehensive hackathon qualification report
 */
router.get('/qualification', async (req, res) => {
  try {
    const report = await generateQualificationReport();
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating qualification report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate qualification report',
      message: error.message
    });
  }
});

/**
 * GET /api/hackathon/qualification/metamask
 * Check MetaMask hackathon qualification only
 */
router.get('/qualification/metamask', async (req, res) => {
  try {
    const report = await generateQualificationReport();
    
    res.json({
      success: true,
      qualified: report.qualifications.metamaskHackathon,
      checks: {
        smartAccounts: report.checks.metaMaskSmartAccounts,
        relayer: report.checks.oneShortRelayer,
        veniceAI: report.checks.veniceAI,
        database: report.checks.database
      },
      recommendations: report.summary.recommendations.filter(r => 
        r.includes('MetaMask') || r.includes('1Shot') || r.includes('Venice')
      ),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check MetaMask qualification',
      message: error.message
    });
  }
});

/**
 * GET /api/hackathon/qualification/arbitrum
 * Check Arbitrum hackathon qualification only
 */
router.get('/qualification/arbitrum', async (req, res) => {
  try {
    const report = await generateQualificationReport();
    
    res.json({
      success: true,
      qualified: report.qualifications.arbitrumHackathon,
      checks: {
        arbitrumSetup: report.checks.arbitrumSetup,
        walletBalanceFetching: report.checks.walletBalanceFetching,
        geminiAI: report.checks.geminiAI,
        database: report.checks.database
      },
      recommendations: report.summary.recommendations.filter(r => 
        r.includes('Arbitrum') || r.includes('ethers') || r.includes('Database')
      ),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check Arbitrum qualification',
      message: error.message
    });
  }
});

/**
 * GET /api/hackathon/requirements
 * Get detailed requirements for both hackathons
 */
router.get('/requirements', (req, res) => {
  res.json({
    success: true,
    requirements: {
      metaMaskHackathon: {
        name: "MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off",
        status: "1 day left",
        prizePool: "$14,000 USD",
        requiredComponents: [
          {
            component: "MetaMask Smart Accounts Kit",
            required: true,
            verification: "npm list @metamask/smart-accounts-kit",
            docs: "https://docs.metamask.io/wallet/smart-accounts/"
          },
          {
            component: "ERC-7715 Advanced Permissions",
            required: true,
            verification: "Check permission system database",
            docs: "https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7715.md"
          },
          {
            component: "1Shot Permissionless Relayer",
            required: true,
            verification: "Test relayer connectivity",
            docs: "https://1shot.fi/docs"
          },
          {
            component: "Venice AI Integration",
            required: true,
            verification: "Check VENICE_API_KEY environment",
            docs: "https://venice.ai"
          },
          {
            component: "Database System",
            required: true,
            verification: "Check PostgreSQL tables",
            docs: "Database configuration in .env"
          }
        ],
        prizeBreakdown: [
          "Best x402 + ERC-7710 - $3,000",
          "Best Agent - $3,000",
          "Best A2A coordination - $3,000",
          "Best use of Venice AI - $3,000",
          "Best Use of 1Shot Permissionless Relayer - $1,000 USDC",
          "Best Social Media presence - $500",
          "Best Feedback - $500"
        ]
      },
      arbitrumHackathon: {
        name: "Arbitrum Open House London: Online Buildathon",
        status: "1 day left",
        prizePool: "$115,000 USD",
        requiredComponents: [
          {
            component: "Arbitrum Network Connectivity",
            required: true,
            verification: "RPC test at https://arb1.arbitrum.io/rpc",
            docs: "https://docs.arbitrum.io"
          },
          {
            component: "Smart Contract Deployment",
            required: true,
            verification: "Check deployed contract addresses",
            docs: "https://docs.arbitrum.io/stylus"
          },
          {
            component: "Ethers.js / Web3.js",
            required: true,
            verification: "npm list ethers",
            docs: "https://docs.ethers.org"
          },
          {
            component: "Wallet Integration",
            required: true,
            verification: "Balance fetching operational",
            docs: "https://docs.metamask.io"
          },
          {
            component: "Database System",
            required: true,
            verification: "PostgreSQL tables created",
            docs: "Database configuration in .env"
          }
        ],
        prizeBreakdown: [
          "Overall Prize Pool - $70,000 USDC",
          "Best Agentic Project - $15,000 USDC",
          "Grants - $30,000 USDC",
          "IRL Founder House London - Top 3 teams"
        ]
      }
    }
  });
});

/**
 * POST /api/hackathon/check-all
 * Run all checks and return results
 */
router.post('/check-all', async (req, res) => {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      checks: {
        metaMaskSmartAccounts: await checkMetaMaskSmartAccounts(),
        oneShortRelayer: await check1ShotRelayer(),
        veniceAI: await checkVeniceAI(),
        arbitrumSetup: await checkArbitrumSetup(),
        walletBalanceFetching: await checkWalletBalanceFetching(),
        geminiAI: await checkGeminiAI(),
        database: await checkDatabaseSetup()
      }
    };

    // Calculate pass/fail
    const flattenedChecks = Object.values(results.checks);
    const totalBooleanChecks = flattenedChecks.reduce((sum, check) => {
      return sum + Object.values(check).filter(v => typeof v === 'boolean').length;
    }, 0);

    const passedChecks = flattenedChecks.reduce((sum, check) => {
      return sum + Object.values(check).filter(v => v === true).length;
    }, 0);

    results.summary = {
      totalChecks: totalBooleanChecks,
      passedChecks,
      failureRate: ((totalBooleanChecks - passedChecks) / totalBooleanChecks * 100).toFixed(2) + "%",
      statusOK: passedChecks / totalBooleanChecks >= 0.8
    };

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to run checks',
      message: error.message
    });
  }
});

export default router;
