export const normalizeTickerKey = (tk) => {
    if (!tk) return tk;
    return String(tk).toUpperCase().replace(/\.NSE|\.NS|\.BSE/gi, "");
};

export const isMarketOpenToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday=0, Saturday=6
    return dayOfWeek !== 0 && dayOfWeek !== 6;
};

export const computeHoldingValues = (priceMap = {}, portfolio) => {
    return portfolio.holdings.map(h => {
        const ticker = String(h.ticker).toUpperCase();
        const market = priceMap[ticker] || priceMap[ticker.replace(/\.NSE|\.NS|\.BSE/gi, "")] || {};
        const marketPrice = (market && market.last_price != null) ? Number(market.last_price) : null;
        const invested = h.shares * h.purchase_price;
        const value = (marketPrice != null) ? (h.shares * marketPrice) : null;
        const gain = (value != null) ? (value - invested) : null;
        const gainPct = (gain != null && invested > 0) ? (gain / invested) * 100 : null;

        // Calculate today's gain
        let todayGain = null;
        let todayGainPct = null;
        if (market && Array.isArray(market.ohlcv) && market.ohlcv.length > 1) {
            // Get previous close from yesterday's data (second last item)
            const prevDay = market.ohlcv[market.ohlcv.length - 2];
            const prevClose = prevDay.Close || prevDay.close;
            if (prevClose && marketPrice != null) {
                todayGain = (marketPrice - prevClose) * h.shares;
                todayGainPct = ((marketPrice - prevClose) / prevClose) * 100;
            }
        }

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
            gainPct,
            todayGain,
            todayGainPct
        };
    });
};

export const computePortfolioSummary = (priceMap = {}, portfolio) => {
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
        // Sum today's gain across holdings with known values
        const validHoldings = holdingsInfo.filter(h => h.todayGain != null);
        const sumTodayGain = validHoldings.reduce((s, h) => s + h.todayGain, 0);
        todayGain = sumTodayGain;

        // Calculate portfolio today's gain pct based on previous day portfolio value
        const prevPortfolioValue = validHoldings.reduce((s, h) => {
            if (h.marketPrice != null && h.todayGainPct != null) {
                // Calculate previous close price for shares: marketPrice / (1 + todayGainPct/100)
                const prevClosePrice = h.marketPrice / (1 + (h.todayGainPct / 100));
                return s + (prevClosePrice * h.shares);
            }
            return s;
        }, 0);

        if (prevPortfolioValue > 0) {
            todayGainPct = (todayGain / prevPortfolioValue) * 100;
        }
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
