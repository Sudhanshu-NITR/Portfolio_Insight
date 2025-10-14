import { NextRequest, NextResponse } from 'next/server';

const FLASK_URL = process.env.FLASK_BACKEND_URL || 'http://localhost:5000';

// Small helper to POST JSON to Flask with basic error handling
async function postJSON(path, body) {
    const r = await fetch(`${FLASK_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // App Router caching hint: cache at network level if desired
        // You can also set: next: { revalidate: 60 } to enable ISR-like caching
        body: JSON.stringify(body),
    });
    if (!r.ok) {
        const txt = await r.text().catch(() => '');
        throw new Error(`Flask ${path} ${r.status}: ${txt}`);
    }
    return r.json();
}

export async function POST(req) {
    try {
        const {
            tickers = [],
            includeIntraday = true,
            includeFundamentals = true,
            // pass-through options for future
            interval = '1d',
        } = await req.json();

        if (!Array.isArray(tickers) || tickers.length === 0) {
            return NextResponse.json({ error: 'tickers must be a non-empty array' }, { status: 400 });
        }

        // De-duplicate and upper-case keys for consistency on merge
        const uniqTickers = Array.from(new Set(tickers.map((t) => String(t).trim())));

        // Call all three Flask endpoints in parallel
        const [quotes, corp, analyst] = await Promise.all([
            postJSON('/market/quotes', { tickers: uniqTickers }),
            postJSON('/market/corporate-actions', { tickers: uniqTickers }),
            postJSON('/market/analyst/summary', { tickers: uniqTickers }),
        ]);


        // Optional: also call comprehensive (commented out, only if you exposed it)
        const comprehensive = await postJSON('/market/comprehensive', {
          tickers: uniqTickers, include_intraday: includeIntraday, include_fundamentals: includeFundamentals
        });

        // Merge per ticker
        const merged = {};
        for (const t of uniqTickers) {
            const key = String(t).toUpperCase();
            merged[key] = {
                symbol: key,
                // Quotes/OHLCV
                ...(quotes?.[key] ?? {}),
                // Corporate actions (dividends/splits)
                corporate_actions: corp?.[key] ?? {},
                // Analyst ratings/estimates
                analyst: analyst?.[key] ?? {},
                // Comprehensive data
                comprehensive: comprehensive?.[key] ?? {},
            };
        }

        // Optionally attach benchmark data if returned inside quotes (e.g., NIFTY/SENSEX were embedded)
        // If your Flask quotes include NIFTY/SENSEX under uppercase keys, bubble them up:
        const extras = {};
        for (const [k, v] of Object.entries(quotes || {})) {
            if (k === 'NIFTY50' || k === 'SENSEX') {
                extras[k] = v;
            }
        }

        return NextResponse.json({
            data: merged,
            benchmarks: Object.keys(extras).length ? extras : undefined,
            meta: {
                source: 'flask+yfinance',
                includeIntraday,
                includeFundamentals,
                interval,
                tickers: uniqTickers,
                ts: new Date().toISOString(),
            },
        });
    } catch (err) {
        return NextResponse.json({ error: err?.message ?? 'failed' }, { status: 500 });
    }
}
