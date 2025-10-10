import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import InvestmentProfileModel from "@/model/InvestmentProfile.model";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(String(id));
}
const secret = process.env.NEXTAUTH_SECRET;

export async function PATCH(req) {
    try {
        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
        }

        const userId = token._id;
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ ok: false, error: "Invalid user id" }, { status: 400 });
        }

        const body = await req.json();
        const {
            riskTolerance,
            investmentGoal,
            timeHorizon,
            cashBalance,
            monthlyInvestment,
            experience,
            sectors,
            notes
        } = body;

        await dbConnect();

        const profile = await InvestmentProfileModel.findOne({ userId });
        if (!profile) {
            return NextResponse.json({ ok: false, error: "Investment profile not found" }, { status: 404 });
        }

        if (typeof riskTolerance === "string") profile.investmentProfile.riskTolerance = riskTolerance;
        if (typeof investmentGoal === "string") profile.investmentProfile.investmentGoal = investmentGoal;
        if (Array.isArray(timeHorizon) && timeHorizon.length > 0) {
            profile.investmentProfile.timeHorizon = Number(timeHorizon[0]);
        } else if (timeHorizon !== undefined && timeHorizon !== null) {
            const num = Number(timeHorizon);
            if (!Number.isNaN(num)) profile.investmentProfile.timeHorizon = num;
        }
        if (cashBalance !== undefined) {
            const num = Number(cashBalance === "" ? 0 : cashBalance);
            if (!Number.isNaN(num)) {
                profile.financials.cashBalance.amount = num;
                profile.financials.cashBalance.lastUpdated = Date.now();
            }
        }
        if (monthlyInvestment !== undefined) {
            const num = Number(monthlyInvestment === "" ? 0 : monthlyInvestment);
            if (!Number.isNaN(num)) profile.financials.monthlyInvestmentCapacity = num;
        }
        if (typeof experience === "string") profile.investmentProfile.experience = experience;
        if (Array.isArray(sectors)) {
            profile.investmentProfile.sectorPreferences = sectors.map(s => String(s));
        } else if (typeof sectors === "string" && sectors.length > 0) {
            profile.investmentProfile.sectorPreferences = sectors.split(",").map(s => s.trim()).filter(Boolean);
        }
        if (typeof notes === "string") profile.investmentProfile.notes = notes;
        profile.profileCompleted = true;

        await profile.save();

        return NextResponse.json(
            {
                ok: true,
                message: "Investment profile updated",
                profileCompleted: !!profile.profileCompleted,
                profile: {
                    riskTolerance: profile.investmentProfile.riskTolerance,
                    investmentGoal: profile.investmentProfile.investmentGoal,
                    timeHorizon: profile.investmentProfile.timeHorizon,
                    cashBalance: profile.financials.cashBalance.amount,
                    lastCashBalanceUpdateDate: profile.financials.cashBalance.lastUpdated,
                    monthlyInvestment: profile.financials.monthlyInvestmentCapacity,
                    experience: profile.investmentProfile.experience,
                    sectors: profile.investmentProfile.sectorPreferences,
                    notes: profile.investmentProfile.notes
                }
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("PATCH /api/update-investment-profile error:", err);
        return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
    }
}
