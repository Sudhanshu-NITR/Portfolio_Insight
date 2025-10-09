import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Portfolio from '@/model/Portfolio.model';
import { getToken } from 'next-auth/jwt';


// ========================================================================================== //


const secret = process.env.NEXTAUTH_SECRET;

const computeHoldingValues = function (priceMap = {}, portfolio) {
    // console.log("priceMap-> ", priceMap);

    return portfolio.holdings.map(h => {
        const ticker = String(h.ticker).toUpperCase();
        const market = priceMap[ticker] || priceMap[ticker.replace(/\.NSE|\.NS|\.BSE/gi, "")] || {};
        // console.log("market-> ", market);
        // console.log("\n")

        const marketPrice = (market && market.last_price != null) ? Number(market.last_price) : null;

        const invested = h.shares * h.purchase_price;
        const value = (marketPrice != null) ? (h.shares * marketPrice) : null;
        const gain = (value != null) ? (value - invested) : null;
        const gainPct = (gain != null && invested > 0) ? (gain / invested) * 100 : null;
        return {
            holdingId: h._id,
            ticker,
            shares: h.shares,
            purchase_price: h.purchase_price,
            purchase_date: h.purchase_date || null,
            sector: h.sector || null,
            exchange: h.exchange || null,
            marketPrice,
            invested,
            value,
            gain,
            gainPct
        };
    });
};

const isMarketOpenToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
    }
    return true;
};


const computePortfolioSummary = function (priceMap = {}, portfolio) {
    const holdingsInfo = computeHoldingValues(priceMap, portfolio);
    const totalInvested = holdingsInfo.reduce((s, h) => s + (h.invested || 0), 0);
    const missingPrices = holdingsInfo.some(h => h.value == null);
    const currentValue = missingPrices ? null : holdingsInfo.reduce((s, h) => s + (h.value || 0), 0);
    const totalGain = currentValue != null ? (currentValue - totalInvested) : null;
    const totalGainPct = (currentValue != null && totalInvested > 0) ? (totalGain / totalInvested) * 100 : null;

    const sectorMap = {};
    holdingsInfo.forEach(h => {
        const sector = h.sector || "Unknown";
        sectorMap[sector] = sectorMap[sector] || { invested: 0, value: 0 };
        sectorMap[sector].invested += h.invested || 0;
        sectorMap[sector].value += h.value || 0;
    });

    const sectors = Object.keys(sectorMap).map(k => {
        const { invested, value } = sectorMap[k];
        const pct = currentValue && currentValue > 0 ? (value / currentValue) * 100 : null;
        return { sector: k, invested, value, pct };
    });

    let todayGain = 0;
    let todayGainPct = 0;
    if (isMarketOpenToday()) {

    }

    return {
        totalInvested,
        currentValue,
        totalGain,
        totalGainPct,
        todayGain,
        todayGainPct,
        holdings: holdingsInfo,
        sectors
    };
};


// Helpers (place near your other helper functions)
const normalizeTickerKey = (tk) => {
    if (!tk) return tk;
    return String(tk).toUpperCase().replace(/\.NSE|\.NS|\.BSE/gi, "");
};

const pickMonths = (priceMap, monthsCount = 6) => {
    // Prefer using ^NSEI months if present; otherwise pick any instrument with monthly_ohlc.
    const idx = priceMap['^NSEI'] || priceMap['^NSEI.NS'] || priceMap['NSEI'] || null;
    let source = idx;
    if (!source) {
        // find first item with monthly_ohlc array
        for (const k of Object.keys(priceMap)) {
            if (priceMap[k] && Array.isArray(priceMap[k].monthly_ohlc) && priceMap[k].monthly_ohlc.length) {
                source = priceMap[k];
                break;
            }
        }
    }
    if (!source || !Array.isArray(source.monthly_ohlc)) return [];
    const arr = source.monthly_ohlc.slice(-monthsCount);
    // Normalize month to YYYY-MM
    return arr.map(m => {
        // If Month is like "2025-10-31" -> YYYY-MM
        if (m.Month) return m.Month.slice(0, 7);
        // else if Date-like fallback
        if (m.Date) {
            const d = new Date(m.Date);
            const yyyy = d.getUTCFullYear();
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            return `${yyyy}-${mm}`;
        }
        return null;
    }).filter(Boolean);
};

// Build a quick lookup of monthly OHLC by tickerKey + YYYY-MM
const buildMonthlyLookup = (priceMap) => {
    const lookup = {};
    for (const rawKey of Object.keys(priceMap)) {
        const keyNorm = normalizeTickerKey(rawKey);
        const item = priceMap[rawKey];
        if (!item || !Array.isArray(item.monthly_ohlc)) continue;
        lookup[keyNorm] = {};
        for (const rec of item.monthly_ohlc) {
            // Month field expected e.g. "2025-10-31"
            let monthKey = null;
            if (rec.Month) monthKey = rec.Month.slice(0, 7);
            else if (rec.Date) {
                const d = new Date(rec.Date);
                monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
            }
            if (!monthKey) continue;
            lookup[keyNorm][monthKey] = {
                open: typeof rec.Open === 'number' ? rec.Open : null,
                close: typeof rec.Close === 'number' ? rec.Close : null,
                high: rec.High,
                low: rec.Low,
                volume: rec.Volume
            };
        }
    }
    return lookup;
};

/**
 * computePerformance(priceMap, portfolio)
 * returns array: [ { name: 'Portfolio', series: [{ month: 'YYYY-MM', growthPct: 1.23 }, ... ] }, 
 *                 { name: 'Nifty', series: [...] }, 
 *                 { name: 'Sensex', series: [...] } ]
 */
const computePerformance = (priceMap = {}, portfolio = {}) => {
    const months = pickMonths(priceMap, 6); // latest 6 months in YYYY-MM
    if (!months || months.length === 0) return [];

    const monthlyLookup = buildMonthlyLookup(priceMap);

    // Helper to compute growth series for a single instrument keyed by normalized tickerKey
    const computeInstrumentSeries = (tickerKey) => {
        const series = [];
        const lk = monthlyLookup[normalizeTickerKey(tickerKey)];
        if (!lk) {
            for (const m of months) series.push({ month: m, growthPct: null });
            return series;
        }
        const firstOpen = lk[months[0]] && (lk[months[0]].open != null) ? lk[months[0]].open : null;
        if (firstOpen == null) {
            for (const m of months) series.push({ month: m, growthPct: null });
            return series;
        }
        for (const m of months) {
            const rec = lk[m];
            if (!rec || rec.close == null) {
                series.push({ month: m, growthPct: null });
                continue;
            }
            // <-- changed formula: comparative percentage (close / firstOpen * 100) -->
            const compPct = (rec.close / firstOpen) * 100;
            series.push({ month: m, growthPct: Math.round(compPct * 100) / 100 });
        }
        return series;
    };

    // Nifty & Sensex
    const niftySeries = computeInstrumentSeries('^NSEI');
    const sensexSeries = computeInstrumentSeries('^BSESN');

    // Portfolio series:
    // For each month:
    //   portfolioOpenRef = sum(shares * open_of_first_month_for_that_instrument)  <-- that's the "opening of the 1st month" reference for portfolio
    //   monthlyCloseValue = sum(shares * close_of_that_month_for_that_instrument)
    // growthPct = (monthlyCloseValue - portfolioOpenRef) / portfolioOpenRef * 100
    const holdings = (portfolio && portfolio.holdings) || [];
    const portfolioSeries = [];

    // Build per-holding lookup of normalized ticker and shares
    const holdingDefs = holdings.map(h => {
        return {
            tickerRaw: h.ticker,
            tickerKey: normalizeTickerKey(h.ticker),
            shares: Number(h.shares || 0)
        };
    });

    // compute portfolio reference open (sum of shares * open of first month for each holding)
    let portfolioOpenRef = 0;
    let anyMissingInOpenRef = false;
    for (const hd of holdingDefs) {
        const lk = monthlyLookup[hd.tickerKey];
        if (!lk || !lk[months[0]] || lk[months[0]].open == null) {
            anyMissingInOpenRef = true;
            break;
        }
        portfolioOpenRef += hd.shares * lk[months[0]].open;
    }

    // If missing reference open for any holding, we cannot compute portfolio growth reliably -> set nulls
    if (anyMissingInOpenRef || portfolioOpenRef === 0) {
        for (const m of months) portfolioSeries.push({ month: m, growthPct: null });
    } else {
        for (const m of months) {
            let monthCloseValue = 0;
            let anyMissing = false;
            for (const hd of holdingDefs) {
                const lk = monthlyLookup[hd.tickerKey];
                if (!lk || !lk[m] || lk[m].close == null) {
                    anyMissing = true;
                    break;
                }
                monthCloseValue += hd.shares * lk[m].close;
            }
            if (anyMissing) {
                portfolioSeries.push({ month: m, growthPct: null });
            } else {
                // <-- changed formula: comparative percentage (monthCloseValue / portfolioOpenRef * 100) -->
                const compPct = (monthCloseValue / portfolioOpenRef) * 100;
                portfolioSeries.push({ month: m, growthPct: Math.round(compPct * 100) / 100 });
            }
        }
    }

    return [
        { name: 'Portfolio', series: portfolioSeries },
        { name: 'Nifty', series: niftySeries },
        { name: 'Sensex', series: sensexSeries }
    ];
};



// ========================================================================================== //


export async function GET(req) {
    try {
        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = token._id;

        await dbConnect();

        const portfolio = await Portfolio.findOne({ user: userId }).lean(false);
        if (!portfolio) {
            return NextResponse.json({
                summary: null,
                holdings: [],
                performance: [],
                sectorAllocation: [],
                topPerformers: [],
                riskMetrics: null,
            }, { status: 200 });
        }

        const priceMap = await Portfolio.enrichWithMarketPrices(portfolio);

        console.log(priceMap);

        // const holdingsInfo = portfolio.computeHoldingValues(priceMap);
        // const summary = portfolio.computePortfolioSummary(priceMap);
        const holdingsInfo = computeHoldingValues(priceMap, portfolio);
        const summary = computePortfolioSummary(priceMap, portfolio);
        // console.log("priceMap-> ", priceMap);
        // console.log("priceMap['ohlcv']-> ", priceMap["INFY"]["ohlcv"]);
        // console.log("holdingsInfo-> ", holdingsInfo);
        // console.log("summary-> ", summary);

        const performance = computePerformance(priceMap, portfolio);

        const dto = {
            summary: {
                totalValue: summary.currentValue,
                totalInvested: summary.totalInvested,
                totalGainLoss: summary.totalGain,
                totalGainLossPercent: summary.totalGainPct,
                todayGainLoss: null,
                todayGainLossPercent: null,
            },
            holdings: holdingsInfo.map(h => ({
                id: h.holdingId,
                ticker: h.ticker,
                shares: h.shares,
                purchasePrice: h.purchase_price,
                purchaseDate: h.purchase_date,
                sector: h.sector,
                exchange: h.exchange,
                marketPrice: h.marketPrice,
                invested: h.invested,
                value: h.value,
                gain: h.gain,
                gainPct: h.gainPct,
            })),
            performance: performance,
            sectorAllocation: summary.sectors.map(s => ({
                name: s.sector,
                value: s.pct,
                amount: s.value,
            })),
            topPerformers: holdingsInfo
                .filter(h => h.gainPct !== null)
                .sort((a, b) => b.gainPct - a.gainPct)
                .slice(0, 5)
                .map(h => ({
                    symbol: h.ticker,
                    exchange: h.exchange,
                    name: h.ticker,
                    gain: h.gainPct,
                    value: h.value,
                })),
            riskMetrics: {
                sharpeRatio: null,
                volatility: null,
                maxDrawdown: null,
                beta: null,
            },
        };

        return NextResponse.json(dto, { status: 200 });
    } catch (err) {
        console.error('dashboard route error', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
