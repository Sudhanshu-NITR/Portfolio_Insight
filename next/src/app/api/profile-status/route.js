import mongoose from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import InvestmentProfile from '@/model/InvestmentProfile.model';

const secret = process.env.NEXTAUTH_SECRET;

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(String(id));
}

export async function GET(req) {
    try {
        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
        }
        const userId = token._id;
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ ok: false, error: 'Invalid user id' }, { status: 400 });
        }

        await dbConnect();

        const profile = await InvestmentProfile.findOne({ userId: userId }).lean();

        if (!profile) {
            const profile = new InvestmentProfile({
                userId: userId,
                profileCompleted: false,
            });
            await profile.save();
        }
        
        return NextResponse.json({
            ok: true,
            profileCompleted: !!profile.profileCompleted,
            updatedAt: profile.updatedAt || profile.createdAt || null,
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
        }, { status: 200 });

    } catch (error) {
        console.error('profile-status error', error);
        return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
}
