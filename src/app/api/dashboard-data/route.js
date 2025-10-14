import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Portfolio from '@/model/Portfolio.model';
import { getToken } from 'next-auth/jwt';
import { computeHoldingValues, computePortfolioSummary } from '@/helpers/portfolioHelpers';
import { computePerformance } from '@/helpers/performanceHelpers';

const secret = process.env.NEXTAUTH_SECRET;

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

        const holdingsInfo = computeHoldingValues(priceMap, portfolio);
        const summary = computePortfolioSummary(priceMap, portfolio);
        const performance = computePerformance(priceMap, portfolio);

        const dto = {
            summary: {
                totalValue: summary.currentValue,
                totalInvested: summary.totalInvested,
                totalGainLoss: summary.totalGain,
                totalGainLossPercent: summary.totalGainPct,
                todayGainLoss: summary.todayGain,
                todayGainLossPercent: summary.todayGainPct,
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
            performance,
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
