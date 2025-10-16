import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/model/Portfolio.model";
import mongoose from "mongoose";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T'); // YYYY-MM-DD format
}

function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req) {
    try {
        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = token._id;
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        }

        await dbConnect();

        const portfolio = await Portfolio.findOne({ user: userId }).exec();
        if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
            return NextResponse.json({ error: "No holdings found" }, { status: 404 });
        }

        // Create CSV content
        const headers = [
            'ticker',
            'exchange',
            'shares',
            'purchase_price',
            'purchase_date',
            'sector',
            'notes'
        ];

        let csvContent = headers.join(',') + '\n';

        portfolio.holdings.forEach(holding => {
            const row = [
                escapeCSV(holding.ticker),
                escapeCSV(holding.exchange || 'NSE'),
                escapeCSV(holding.shares),
                escapeCSV(holding.purchase_price),
                escapeCSV(formatDate(holding.purchase_date)),
                escapeCSV(holding.sector || ''),
                escapeCSV(holding.notes || '')
            ];
            csvContent += row.join(',') + '\n';
        });

        // Return CSV file
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="holdings-${new Date().toISOString().split('T')}.csv"`,
            },
        });

    } catch (err) {
        console.error("GET /api/export-holdings error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
