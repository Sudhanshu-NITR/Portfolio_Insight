import mongoose from "mongoose";
import axios from "axios";
import { HoldingSchema } from "@/model/Holding.model";
const { Schema } = mongoose;

const PortfolioSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        index: true 
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        default: null, 
        trim: true 
    },
    currency: { 
        type: String, 
        default: "INR" 
    },
    holdings: { 
        type: [HoldingSchema], 
        default: [] 
    },
    tags: { 
        type: [String], 
        default: [] 
    },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

PortfolioSchema.index({ user: 1, name: 1 }, { unique: true });

PortfolioSchema.methods.getTotalInvested = function () {
    if (!this.holdings?.length) return 0;
    return this.holdings.reduce((sum, h) => sum + (h.shares * h.purchase_price), 0);
};

PortfolioSchema.methods.computeHoldingValues = function (priceMap = {}) {
    return this.holdings.map(h => {
        const ticker = String(h.ticker).toUpperCase();
        const market = priceMap[ticker] || priceMap[ticker.replace(/\.NSE|\.NS|\.BSE/gi, "")] || {};
        const marketPrice = (market && market.price != null) ? Number(market.price) : null;

        const invested = h.shares * h.purchase_price;
        const value = marketPrice != null ? h.shares * marketPrice : null;
        const gain = value != null ? value - invested : null;
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

PortfolioSchema.methods.computePortfolioSummary = function (priceMap = {}) {
    const holdingsInfo = this.computeHoldingValues(priceMap);
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

    return {
        totalInvested,
        currentValue,
        totalGain,
        totalGainPct,
        holdings: holdingsInfo,
        sectors
    };
};

PortfolioSchema.statics.enrichWithMarketPrices = async function (portfolioDoc) {
    const analyticsUrl = process.env.ANALYTICS_URL || "http://localhost:8000";
    const tickers = Array.from(new Set(portfolioDoc.holdings.map(h => String(h.ticker).toUpperCase())));
    if (!tickers.length) return {};

    try {
        const resp = await axios.post(`${analyticsUrl}/market/quotes`, { tickers }, { timeout: 15000 });
        if (resp.status >= 200 && resp.data) return resp.data;
        return {};
    } catch (err) {
        console.warn("enrichWithMarketPrices failed:", err.message);
        return {};
    }
};

PortfolioSchema.virtual("holdingCount").get(function () {
    return this.holdings.length;
});

const Portfolio = mongoose.models.Portfolio || mongoose.model("Portfolio", PortfolioSchema);
export default Portfolio;
