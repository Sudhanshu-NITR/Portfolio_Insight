import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/models/Portfolio";
import mongoose from "mongoose";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function PATCH(req) {
    try {
        const { id, hid } = params;
        if (!isValidObjectId(id) || !isValidObjectId(hid)) return NextResponse.json({ error: "Invalid id(s)" }, { status: 400 });

        const body = await req.json();
        const allowed = ["ticker", "exchange", "shares", "purchase_price", "purchase_date", "sector", "notes"];
        const updateFields = {};
        for (const key of allowed) {
            if (body[key] !== undefined) updateFields[key] = body[key];
        }
        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
        }

        await dbConnect();
        const p = await Portfolio.findById(id).exec();
        if (!p || p.user.toString() !== token.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const holding = p.holdings.id(hid);
        if (!holding) return NextResponse.json({ error: "Holding not found" }, { status: 404 });

        if (updateFields.ticker !== undefined) holding.ticker = String(updateFields.ticker).toUpperCase();
        if (updateFields.exchange !== undefined) holding.exchange = updateFields.exchange;
        if (updateFields.shares !== undefined) holding.shares = Number(updateFields.shares);
        if (updateFields.purchase_price !== undefined) holding.purchase_price = Number(updateFields.purchase_price);
        if (updateFields.purchase_date !== undefined) holding.purchase_date = updateFields.purchase_date ? new Date(updateFields.purchase_date) : null;
        if (updateFields.sector !== undefined) holding.sector = updateFields.sector;
        if (updateFields.notes !== undefined) holding.notes = updateFields.notes;

        await p.save();

        let priceMap = {};
        try {
            priceMap = await Portfolio.enrichWithMarketPrices(p);
        } catch (err) {
            console.warn("price enrichment failed:", err.message || err);
        }
        const summary = p.computePortfolioSummary(priceMap);

        const updated = await Portfolio.findById(id).lean().exec();
        return NextResponse.json({ ok: true, portfolio: updated, summary });

    } catch (err) {
        console.error("PATCH /api/portfolios/[id]/holdings/[hid] error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
