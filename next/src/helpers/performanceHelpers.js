import { normalizeTickerKey } from '@/helpers/portfolioHelpers';

export const pickMonths = (priceMap, monthsCount = 6) => {
    const idx = priceMap['^NSEI'] || priceMap['^NSEI.NS'] || priceMap['NSEI'] || null;
    let source = idx;

    if (!source) {
        for (const k of Object.keys(priceMap)) {
            if (priceMap[k] && Array.isArray(priceMap[k].monthly_ohlc) && priceMap[k].monthly_ohlc.length) {
                source = priceMap[k];
                break;
            }
        }
    }

    if (!source || !Array.isArray(source.monthly_ohlc)) {
        return [];
    }

    const arr = source.monthly_ohlc.slice(-monthsCount);

    return arr.map(m => {
        if (m.Month) return m.Month.slice(0, 7);
        if (m.Date) {
            const d = new Date(m.Date);
            const yyyy = d.getUTCFullYear();
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            return `${yyyy}-${mm}`;
        }
        return null;
    }).filter(Boolean);
};

export const buildMonthlyLookup = (priceMap) => {
    const lookup = {};
    for (const rawKey of Object.keys(priceMap)) {
        const keyNorm = normalizeTickerKey(rawKey);
        const item = priceMap[rawKey];
        if (!item || !Array.isArray(item.monthly_ohlc)) continue;
        lookup[keyNorm] = {};
        for (const rec of item.monthly_ohlc) {
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
                volume: rec.Volume,
            };
        }
    }
    return lookup;
};

export const computePerformance = (priceMap = {}, portfolio = {}) => {
    const months = pickMonths(priceMap, 6);
    if (!months || months.length === 0) {
        return [];
    }

    const monthlyLookup = buildMonthlyLookup(priceMap);

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

        months.forEach(m => {
            const rec = lk[m];
            if (!rec || rec.close == null) {
                series.push({ month: m, growthPct: null });
            } else {
                const compPct = (rec.close / firstOpen) * 100;
                series.push({ month: m, growthPct: Math.round(compPct * 100) / 100 });
            }
        });

        return series;
    };

    const niftySeries = computeInstrumentSeries('^NSEI');
    const sensexSeries = computeInstrumentSeries('^BSESN');

    const holdings = (portfolio && portfolio.holdings) || [];

    const portfolioSeries = [];
    const holdingDefs = holdings.map(h => ({
        tickerRaw: h.ticker,
        tickerKey: normalizeTickerKey(h.ticker),
        shares: Number(h.shares || 0),
    }));

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
