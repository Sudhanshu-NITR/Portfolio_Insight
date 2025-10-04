"use client";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import portfolioReducer from "./portfolioSlice";

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
  },
});

export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
