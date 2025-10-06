import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Portfolio from '@/model/Portfolio.model';
import { getToken } from 'next-auth/jwt';

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
        // const holdingsInfo = portfolio.computeHoldingValues(priceMap);
        // const summary = portfolio.computePortfolioSummary(priceMap);
        const holdingsInfo = computeHoldingValues(priceMap, portfolio);
        const summary = computePortfolioSummary(priceMap, portfolio);
        // console.log("priceMap-> ", priceMap);
        // console.log("priceMap['ohlcv']-> ", priceMap["INFY"]["ohlcv"]);
        // console.log("holdingsInfo-> ", holdingsInfo);
        // console.log("summary-> ", summary);


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
                marketPrice: h.marketPrice,
                invested: h.invested,
                value: h.value,
                gain: h.gain,
                gainPct: h.gainPct,
            })),
            performance: [],
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
