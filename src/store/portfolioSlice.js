import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    summary: null,
    holdings: [],
    loading: false,
};

const portfolioSlice = createSlice({
    name: "portfolio",
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
            state.holdings = state.holdings.filter(h => h._id !== action.payload);
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        clearPortfolio(state) {
            state.summary = null;
            state.holdings = [];
        },
    },
});

export const {
    setSummary,
    setHoldings,
    addHolding,
    removeHolding,
    setLoading,
    clearPortfolio,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
