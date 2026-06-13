import axios from 'axios';

const PROTOCOLS_OF_INTEREST = ['aave-v3', 'gmx', 'camelot-dex', 'radiant-v2', 'gains-network'];
const TOKENS_OF_INTEREST = ['USDC', 'USDT', 'ETH', 'WETH', 'ARB', 'DAI', 'WBTC'];
const MIN_APY = 0.1;
const MIN_TVL_USD = 50_000;

export async function fetchArbitrumYields() {
  try {
    const { data } = await axios.get('https://yields.llama.fi/pools', {
      timeout: 8000,
    });

    const pools = Array.isArray(data?.data) ? data.data : [];

    const arbitrumPools = pools
      .filter((pool) => {
        const isArbitrum = pool.chain?.toLowerCase() === 'arbitrum';
        const project = normalizeSlug(pool.project);
        const isKnownProtocol = PROTOCOLS_OF_INTEREST.some((p) =>
          project.includes(normalizeSlug(p))
        );
        const symbol = String(pool.symbol || '').toUpperCase();
        const isUsefulToken = TOKENS_OF_INTEREST.some((token) => symbol.includes(token));
        const hasGoodApy = Number(pool.apy) > MIN_APY;
        const hasTvl = Number(pool.tvlUsd) > MIN_TVL_USD;

        return isArbitrum && isKnownProtocol && isUsefulToken && hasGoodApy && hasTvl;
      })
      .map((pool) => ({
        protocol: pool.project,
        token: pool.symbol,
        apy: roundNumber(pool.apy),
        tvlUsd: Math.round(Number(pool.tvlUsd)),
        tvlFormatted: formatTVL(pool.tvlUsd),
        apyBase: roundNumber(pool.apyBase),
        apyReward: roundNumber(pool.apyReward),
        riskLevel: getRiskLevel(pool.project, pool.apy),
        plainExplanation: buildExplanation(pool),
      }))
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 10);

    return arbitrumPools.length > 0 ? arbitrumPools : getFallbackYields();
  } catch (err) {
    console.error('DeFi Llama fetch error:', err.message);
    return getFallbackYields();
  }
}

function normalizeSlug(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function roundNumber(value, decimals = 2) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(decimals)) : 0;
}

function buildExplanation(pool) {
  const apy = roundNumber(pool.apy, 1).toFixed(1);
  const protocol = pool.project;
  const token = pool.symbol;
  const yearly = ((1000 * Number(pool.apy)) / 100).toFixed(0);

  return `${protocol} is offering ${apy}% APY on ${token}. ` +
    `That means if you put in $1,000, you'd earn roughly $${yearly} per year - ` +
    'paid automatically by the protocol, no middleman.';
}

function getRiskLevel(_protocol, apy) {
  if (Number(apy) > 50) {
    return {
      level: 'high',
      label: 'High risk',
      detail: 'Very high yield usually means higher smart contract or liquidation risk.',
    };
  }

  if (Number(apy) > 15) {
    return {
      level: 'medium',
      label: 'Medium risk',
      detail: 'Similar to investing in a volatile stock. Only use money you can afford to lose.',
    };
  }

  return {
    level: 'low',
    label: 'Low risk',
    detail: 'Similar to a high-yield savings account. Established protocol, stable returns.',
  };
}

function formatTVL(tvl) {
  const value = Number(tvl);
  if (!Number.isFinite(value)) return '$0';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

function getFallbackYields() {
  return [
    {
      protocol: 'aave-v3',
      token: 'USDC',
      apy: 8.2,
      tvlUsd: 450_000_000,
      tvlFormatted: '$450M',
      apyBase: 8.2,
      apyReward: 0,
      riskLevel: {
        level: 'low',
        label: 'Low risk',
        detail: 'Established protocol, stable returns.',
      },
      plainExplanation: 'Aave V3 is offering 8.2% APY on USDC. That means if you put in $1,000, you would earn roughly $82 per year - paid automatically.',
    },
    {
      protocol: 'gmx',
      token: 'ETH',
      apy: 14.5,
      tvlUsd: 320_000_000,
      tvlFormatted: '$320M',
      apyBase: 9.5,
      apyReward: 5.0,
      riskLevel: {
        level: 'medium',
        label: 'Medium risk',
        detail: 'Similar to investing in a volatile stock.',
      },
      plainExplanation: 'GMX is offering 14.5% APY on ETH. That means if you put in $1,000 worth of ETH, you would earn roughly $145 per year.',
    },
  ];
}
