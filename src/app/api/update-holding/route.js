import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/model/Portfolio.model";
import mongoose from "mongoose";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

const secret = process.env.NEXTAUTH_SECRET;

export async function PATCH(req) {
    try {
        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = token._id;
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        }

        const body = await req.json();
        const { holdingId, ticker, exchange, shares, purchase_price, purchase_date, sector, notes } = body;

        if (!holdingId) {
            return NextResponse.json({ error: "Holding ID is required" }, { status: 400 });
        }

        const allowed = ["ticker", "exchange", "shares", "purchase_price", "purchase_date", "sector", "notes"];
        const updateFields = {};

        for (const key of allowed) {
            if (body[key] !== undefined && body[key] !== "") {
                updateFields[key] = body[key];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
        }

        await dbConnect();

        const portfolio = await Portfolio.findOne({ user: userId }).exec();
        if (!portfolio) {
            return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
        }

        const holding = portfolio.holdings.id(holdingId);
        if (!holding) {
            return NextResponse.json({ error: "Holding not found" }, { status: 404 });
        }

        // Update fields
        if (updateFields.ticker !== undefined) holding.ticker = String(updateFields.ticker).toUpperCase();
        if (updateFields.exchange !== undefined) holding.exchange = updateFields.exchange;
        if (updateFields.shares !== undefined) holding.shares = Number(updateFields.shares);
        if (updateFields.purchase_price !== undefined) holding.purchase_price = Number(updateFields.purchase_price);
        if (updateFields.purchase_date !== undefined) {
            holding.purchase_date = updateFields.purchase_date ? new Date(updateFields.purchase_date) : null;
        }
        if (updateFields.sector !== undefined) holding.sector = updateFields.sector;
        if (updateFields.notes !== undefined) holding.notes = updateFields.notes;

        await portfolio.save();

        return NextResponse.json({
            ok: true,
            message: "Holding updated successfully",
            holding: {
                id: holding._id,
                ticker: holding.ticker,
                exchange: holding.exchange,
                shares: holding.shares,
                purchase_price: holding.purchase_price,
                purchase_date: holding.purchase_date,
                sector: holding.sector,
                notes: holding.notes
            }
        }, { status: 200 });

    } catch (err) {
        console.error("PATCH /api/update-holding error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
