import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Portfolio from "@/model/Portfolio.model";
import mongoose from "mongoose";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseCSV(csvText) {
  const raw = csvText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  function splitCSVLine(line) {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((v) => v.trim());
  }
  if (lines.length === 0) return [];
  const rawHeaders = splitCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => {
    let k = h.toLowerCase().replace(/\s+/g, "_").replace(/-+/g, "_");
    if (k === "purchaseprice") k = "purchase_price";
    if (k === "purchasedate") k = "purchase_date";
    return k;
  });
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.every((v) => v === "")) continue;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    if (row.exchange === "") row.exchange = undefined;
    if (row.sector === "") row.sector = undefined;
    if (row.notes === "") row.notes = undefined;
    data.push(row);
  }
  return data;
}

function validateHoldingData(row) {
  const errors = [];
  if (!row.ticker) errors.push("Ticker is required");
  if (!row.shares || isNaN(parseFloat(row.shares))) errors.push("Valid shares quantity is required");
  if (!row.purchase_price || isNaN(parseFloat(row.purchase_price))) errors.push("Valid purchase price is required");
  const validExchanges = ["NSE", "BSE"];
  if (row.exchange && !validExchanges.includes(String(row.exchange).toUpperCase())) {
    row.exchange = "NSE";
  }
  if (row.purchase_date && row.purchase_date !== "") {
    const date = new Date(row.purchase_date);
    if (isNaN(date.getTime())) {
      errors.push("Invalid purchase date format (use YYYY-MM-DD)");
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
    const userId = token._id || token.id || token.sub;
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "text/csv" && !(file.name || "").toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }
    const csvText = await file.text();
    const csvData = parseCSV(csvText);
    if (csvData.length === 0) {
      return NextResponse.json({ error: "CSV file is empty or invalid format" }, { status: 400 });
    }
    await dbConnect();
    let portfolio = await Portfolio.findOne({ user: userId }).exec();
    if (!portfolio) {
      portfolio = new Portfolio({
        user: userId,
        name: `${token.name || token.email || "User"}'s Portfolio`,
        holdings: []
      });
    }
    const validHoldings = [];
    const errors = [];
    csvData.forEach((row, index) => {
      const validation = validateHoldingData(row);
      if (validation.isValid) {
        validHoldings.push({
          ticker: String(row.ticker).trim().toUpperCase(),
          exchange: (row.exchange ? String(row.exchange) : "NSE").toUpperCase(),
          shares: parseFloat(row.shares),
          purchase_price: parseFloat(row.purchase_price),
          purchase_date: row.purchase_date ? new Date(row.purchase_date) : null,
          sector: row.sector || null,
          notes: row.notes || null
        });
      } else {
        errors.push({
          row: index + 2,
          ticker: row.ticker || "Unknown",
          errors: validation.errors
        });
      }
    });
    if (validHoldings.length === 0) {
      return NextResponse.json(
        { error: "No valid holdings found in CSV", details: errors },
        { status: 400 }
      );
    }
    let imported = 0;
    const duplicates = [];
    for (const holding of validHoldings) {
      const existingHolding = portfolio.holdings.find(
        (h) => h.ticker === holding.ticker && h.exchange === holding.exchange
      );
      if (existingHolding) {
        if (!duplicates.includes(holding.ticker)) duplicates.push(holding.ticker);
      } else {
        portfolio.holdings.push(holding);
        imported++;
      }
    }
    await portfolio.save();
    return NextResponse.json(
      {
        message: "Import completed successfully",
        imported,
        duplicates,
        errors,
        total_processed: csvData.length
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
