import mongoose from "mongoose";
import HoldingSchema from "@/model/Holding.model";

const InvestmentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    investmentProfile: {
        riskTolerance: {
            type: String,
            enum: ['conservative', 'moderate', 'aggressive'],
            default: 'moderate'
        },
        investmentGoal: {
            type: String,
            enum: ['growth', 'income', 'balanced', 'preservation'],
            default: 'growth'
        },
        timeHorizon: {
            type: Number,
            default: 5
        },
        experience: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        sectorPreferences: {
            type: [String],
            default: []
        },
        notes: String
    },
    financials: {
        cashBalance: {
            amount: {
                type: Number,
                default: 0
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        monthlyInvestmentCapacity: {
            type: Number,
            default: 0
        }
    },
    holdings: [HoldingSchema],
    chatHistory: [{
        userMessage: String,
        aiResponse: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

export default mongoose.models.investmentProfile || mongoose.model("investmentProfile", InvestmentProfileSchema);