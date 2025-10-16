import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/model/Portfolio.model";
import mongoose from "mongoose";

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines.split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 3) { // At least ticker, shares, price
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
    }

    return data;
}

function validateHoldingData(row) {
    const errors = [];

    // Required fields
    if (!row.ticker) errors.push('Ticker is required');
    if (!row.shares || isNaN(parseFloat(row.shares))) errors.push('Valid shares quantity is required');
    if (!row.purchase_price || isNaN(parseFloat(row.purchase_price))) errors.push('Valid purchase price is required');

    // Validate exchange
    const validExchanges = ['NSE', 'BSE'];
    if (row.exchange && !validExchanges.includes(row.exchange.toUpperCase())) {
        row.exchange = 'NSE'; // Default to NSE
    }

    // Validate date format if provided
    if (row.purchase_date && row.purchase_date !== '') {
        const date = new Date(row.purchase_date);
        if (isNaN(date.getTime())) {
            errors.push('Invalid purchase date format (use YYYY-MM-DD)');
        }
    }

    return { errors, isValid: errors.length === 0 };
}

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req) {
    try {
        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = token._id;
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
        }

        const csvText = await file.text();
        const csvData = parseCSV(csvText);

        if (csvData.length === 0) {
            return NextResponse.json({ error: "CSV file is empty or invalid format" }, { status: 400 });
        }

        await dbConnect();

        // Find or create portfolio
        let portfolio = await Portfolio.findOne({ user: userId }).exec();
        if (!portfolio) {
            portfolio = new Portfolio({
                user: userId,
                name: `${token.name || token.email}'s Portfolio`,
                holdings: []
            });
        }

        const validHoldings = [];
        const errors = [];

        // Validate each row
        csvData.forEach((row, index) => {
            const validation = validateHoldingData(row);
            if (validation.isValid) {
                validHoldings.push({
                    ticker: row.ticker.toUpperCase(),
                    exchange: row.exchange?.toUpperCase() || 'NSE',
                    shares: parseFloat(row.shares),
                    purchase_price: parseFloat(row.purchase_price),
                    purchase_date: row.purchase_date ? new Date(row.purchase_date) : null,
                    sector: row.sector || null,
                    notes: row.notes || null
                });
            } else {
                errors.push({
                    row: index + 2, // +2 because of header and 0-indexing
                    ticker: row.ticker || 'Unknown',
                    errors: validation.errors
                });
            }
        });

        if (validHoldings.length === 0) {
            return NextResponse.json({
                error: "No valid holdings found in CSV",
                details: errors
            }, { status: 400 });
        }

        // Check for duplicates and add new holdings
        let imported = 0;
        const duplicates = [];

        for (const holding of validHoldings) {
            const existingHolding = portfolio.holdings.find(h =>
                h.ticker === holding.ticker && h.exchange === holding.exchange
            );

            if (existingHolding) {
                duplicates.push(holding.ticker);
            } else {
                portfolio.holdings.push(holding);
                imported++;
            }
        }

        await portfolio.save();

        return NextResponse.json({
            message: "Import completed successfully",
            imported: imported,
            duplicates: duplicates,
            errors: errors,
            total_processed: csvData.length
        }, { status: 200 });

    } catch (err) {
        console.error("POST /api/import-holdings error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
