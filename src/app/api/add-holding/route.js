import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/models/Portfolio";
import mongoose from "mongoose";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function POST(req, { params }) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params;
        if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid portfolio id" }, { status: 400 });

        const body = await req.json();
        // expected fields: ticker, shares, purchase_price, purchase_date (optional), exchange, sector, notes
        const { ticker, shares, purchase_price, purchase_date = null, exchange = "NSE", sector = null, notes = null } = body;

        if (!ticker || shares == null || purchase_price == null || shares == 0) {
            return NextResponse.json({ error: "ticker, shares and purchase_price are required" }, { status: 400 });
        }

        await dbConnect();
        const p = await Portfolio.findById(id).exec();
        if (!p || p.user.toString() !== token.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const holding = {
            ticker: String(ticker).toUpperCase(),
            exchange,
            shares: Number(shares),
            purchase_price: Number(purchase_price),
            purchase_date: purchase_date ? new Date(purchase_date) : undefined,
            sector,
            notes
        };

        p.holdings.push(holding);
        await p.save();

        let priceMap = {};
        try {
            priceMap = await Portfolio.enrichWithMarketPrices(p);
        } catch (err) {
            console.warn("price enrichment failed:", err.message || err);
        }
        const summary = p.computePortfolioSummary(priceMap);

        const updated = await Portfolio.findById(id).lean().exec();
        return NextResponse.json({ ok: true, portfolio: updated, summary }, { status: 201 });
    } catch (err) {
        console.error("Error adding a holding, err: ", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
