import mongoose from "mongoose";

const { Schema } = mongoose;

export const HoldingSchema = new Schema({
    ticker: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true
    },
    exchange: {
        type: String,
        default: "NSE",
        trim: true
    },
    shares: {
        type: Number,
        required: true,
        min: 0
    },
    purchase_price: {
        type: Number,
        required: true,
        min: 0
    },
    purchase_date: {
        type: Date,
        default: null
    },
    currency: {
        type: String,
        default: "INR"
    },
    sector: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

export default HoldingSchema;
