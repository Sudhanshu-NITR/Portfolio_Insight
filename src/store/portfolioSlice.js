import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDashboard = createAsyncThunk(
    'portfolio/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get('/api/dashboard-data');
            console.log(res.data);
            
            return res.data;
        } catch (e) {
            return rejectWithValue(e?.message || 'Network error');
        }
    }
);

const initialState = {
    summary: null,
    holdings: [],
    performance: [],
    sectorAllocation: [],
    topPerformers: [],
    riskMetrics: null,
    loading: false,
    error: null,
};

const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    reducers: {
        setSummary(state, action) {
            state.summary = action.payload;
        },
        setHoldings(state, action) {
            state.holdings = action.payload;
        },
        addHolding(state, action) {
            state.holdings.push(action.payload);
        },
        removeHolding(state, action) {
            state.holdings = state.holdings.filter(h => h.id !== action.payload);
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        clearPortfolio(state) {
            state.summary = null;
            state.holdings = [];
            state.performance = [];
            state.sectorAllocation = [];
            state.topPerformers = [];
            state.riskMetrics = null;
            state.error = null;
        },
        setDashboardData(state, action) {
            const { summary, performance, sectorAllocation, topPerformers, riskMetrics, holdings } = action.payload || {};
            state.summary = summary ?? null;
            state.performance = performance ?? [];
            state.sectorAllocation = sectorAllocation ?? [];
            state.topPerformers = topPerformers ?? [];
            state.riskMetrics = riskMetrics ?? null;
            state.holdings = holdings ?? [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const payload = action.payload || {};
                state.summary = payload.summary ?? null;
                state.performance = payload.performance ?? [];
                state.sectorAllocation = payload.sectorAllocation ?? [];
                state.topPerformers = payload.topPerformers ?? [];
                state.riskMetrics = payload.riskMetrics ?? null;
                state.holdings = payload.holdings ?? [];
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            });
    },
});

export const {
    setSummary,
    setHoldings,
    addHolding,
    removeHolding,
    setLoading,
    clearPortfolio,
    setDashboardData,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
