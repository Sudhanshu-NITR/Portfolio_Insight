import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/model/Portfolio.model";
import mongoose from "mongoose";
import UsersModel from "@/model/User.model";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req) {
    try {
        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userId = token._id;
        if (!isValidObjectId(userId)) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        
        const body = await req.json();
        // expected fields: ticker, shares, purchase_price, purchase_date (optional), exchange, sector, notes
        const { ticker, shares, purchase_price, purchase_date = null, exchange = "NSE", sector = null, notes = null } = body;
        
        if (!ticker || shares == null || purchase_price == null || shares == 0) {
            return NextResponse.json({ error: "ticker, shares and purchase_price are required" }, { status: 400 });
        }

        await dbConnect();
        
        let portfolio;
        const existingPortfolio = await Portfolio.findOne({ user: userId }).exec();
        
        if (existingPortfolio) {
            portfolio = existingPortfolio;
            const duplicateHolding = portfolio.holdings.find(
                h => h.ticker === String(ticker).trim().toUpperCase() && h.exchange === exchange
            );

            if (duplicateHolding) {
                return NextResponse.json(
                    { error: "Holding already exists. Please modify or delete the existing one." }, 
                    { status: 409 }
                );
            }
        } else {
            portfolio = new Portfolio({
                user: userId,
                name: `${token.name}'s Portfolio`,
                holdings: []
            });
        }
        
        const holding = {
            ticker: String(ticker).trim().toUpperCase(),
            exchange,
            shares: Number(shares),
            purchase_price: Number(purchase_price),
            purchase_date: purchase_date ? new Date(purchase_date) : null,
            sector,
            notes
        };
        
        portfolio.holdings.push(holding);
        await portfolio.save();
        
        let priceMap = {};
        try {
            priceMap = await Portfolio.enrichWithMarketPrices(portfolio);
        } catch (err) {
            console.warn("price enrichment failed:", err.message || err);
        }
        const summary = portfolio.computePortfolioSummary(priceMap);
        
        // const updated = await Portfolio.findById(id).lean().exec();
        return NextResponse.json({ ok: true, portfolio: portfolio.toObject(), summary }, { status: 201 });
    } catch (err) {
        console.error("Error adding a holding, err: ", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
