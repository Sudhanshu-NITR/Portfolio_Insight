import { dbConnect } from "@/lib/dbConnect"
import UsersModel from "@/model/Users.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server";
import Portfolio from "@/models/Portfolio";

export async function GET(req) {
    await dbConnect();

    try {
        const { user_id } = req.body;

        if(!user_id){
            return NextResponse.json()
        }
    } catch (err) {
        
    }
}