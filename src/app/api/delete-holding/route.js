import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/model/Portfolio.model";
import mongoose from "mongoose";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const secret = process.env.NEXTAUTH_SECRET;

export async function DELETE(req) {
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
    const { holdingId } = body;

    if (!holdingId || !isValidObjectId(holdingId)) {
      return NextResponse.json({ error: "Valid holding ID is required" }, { status: 400 });
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

    // Remove the holding
    holding.remove();
    await portfolio.save();

    // Optionally enrich with market prices for updated summary
    let priceMap = {};
    try {
      priceMap = await Portfolio.enrichWithMarketPrices(portfolio);
    } catch (err) {
      console.warn("price enrichment failed:", err.message || err);
    }

    return NextResponse.json({
      ok: true,
      message: "Holding deleted successfully",
      remainingHoldings: portfolio.holdings.length
    }, { status: 200 });

  } catch (err) {
    console.error("DELETE /api/delete-holding error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
