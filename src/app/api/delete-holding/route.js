import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/models/Portfolio";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function DELETE(req, { params }) {
  try {
    const { id, hid } = params;
    if (!isValidObjectId(id) || !isValidObjectId(hid)) return NextResponse.json({ error: "Invalid id(s)" }, { status: 400 });
    await dbConnect();
    const p = await Portfolio.findById(id).exec();
    if (!p || p.user.toString() !== token.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const holding = p.holdings.id(hid);
    if (!holding) return NextResponse.json({ error: "Holding not found" }, { status: 404 });

    holding.remove();
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
    console.error("DELETE /api/portfolios/[id]/holdings/[hid] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
