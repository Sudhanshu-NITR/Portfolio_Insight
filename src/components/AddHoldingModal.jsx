"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function AddHoldingModal({
  show,
  onClose,
  onAdded,
  // selectedPortfolioId,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ticker: "",
      shares: "",
      exchange: "",
      purchase_price: "",
      purchase_date: "",
      sector: "",
    },
  });
  const { data: session, status } = useSession();

  const onSubmit = async (data) => {
    const payload = {
      ticker: data.ticker.trim(),
      shares: Number(data.shares),
      exchange: data.exchange.trim(),
      purchase_price: Number(data.purchase_price),
      purchase_date: data.purchase_date || null,
      sector: data.sector || null,
    };

    try {
      const user_id = session.user?._id;
      
      if(!user_id){
        alert(err.message || "Error fetching user id");
      }
      
      const res = await axios.post(
        `/api/add-holding/`,
        payload,
        {
          withCredentials: true
        }
      );
      // console.log(res);

      reset();
      onAdded?.();
      onClose();
    } catch (err) {
      alert(err.message || "Error adding holding");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isSubmitting && onClose()}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Add Holding</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Ticker</label>
            <input
              {...register("ticker", { required: "Ticker is required" })}
              className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. TCS"
            />
            {errors.ticker && (
              <p className="text-sm text-red-600">{errors.ticker.message}</p>
            )}
          </div>
            
          {/* <div>
            <label className="block text-sm font-medium mb-1">Exchange</label>
            <option
              {...register("exchange", { required: "Exchange is required" })}
              className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select a Stock Exchange"
            />
            {errors.ticker && (
              <p className="text-sm text-red-600">{errors.ticker.message}</p>
            )}
          </div> */}
          <div>
            <label htmlFor="exchange-select" className="block text-sm font-medium mb-1">
              Exchange
            </label>
            
            <select
              id="exchange-select"
              {...register("exchange", { required: "Please select an exchange" })}
              className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="NSE" 
            >
              <option value="" disabled>
                Select a Stock Exchange
              </option>
              
              <option value="NSE">NSE (National Stock Exchange)</option>
              <option value="BSE">BSE (Bombay Stock Exchange)</option>
            </select> 

            {/* Display an error if the field is not selected */}
            {errors.exchange && (
              <p className="text-sm text-red-600 mt-1">{errors.exchange.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Shares</label>
              <input
                type="number"
                step="1"
                min="1"
                {...register("shares", {
                  required: "Number of shares is required",
                  min: { value: 1, message: "Must be at least 1 share" },
                })}
                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shares && (
                <p className="text-sm text-red-600">{errors.shares.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Purchase Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register("purchase_price", {
                  required: "Purchase price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.purchase_price && (
                <p className="text-sm text-red-600">
                  {errors.purchase_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                {...register("purchase_date")}
                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Sector (optional)
              </label>
              <input
                type="text"
                {...register("sector")}
                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. IT, Banking"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => !isSubmitting && onClose()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add Holding"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
