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
    holdings: {
        type: [HoldingSchema],
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


PortfolioSchema.statics.enrichWithMarketPrices = async function (portfolioDoc) {
    const flaskBackendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";
    const tickers = Array.from(new Set(portfolioDoc.holdings.map(h => String(h.ticker).toUpperCase())));
    if (!tickers.length) return {};

    try {
        const resp = await axios.post(`${flaskBackendUrl}/market/quotes/get-pricemap`, { tickers }, { timeout: 15000 });
        if (!(resp.status >= 200 && resp.data)) return {};

        const raw = resp.data || {};
        const normalized = {};

        Object.keys(raw).forEach(k => {
            const keyUpper = String(k).toUpperCase();
            const stripped = keyUpper.replace(/(\.NSE|\.NS|\.BSE)$/i, "");
            normalized[keyUpper] = raw[k];
            normalized[stripped] = raw[k];
            normalized[k] = raw[k];
        });

        tickers.forEach(t => {
            const stripped = t.replace(/(\.NSE|\.NS|\.BSE)$/i, "");
            if (!normalized[t] && raw[t]) normalized[t] = raw[t];
            if (!normalized[stripped] && raw[stripped]) normalized[stripped] = raw[stripped];
        });
        return normalized;
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
