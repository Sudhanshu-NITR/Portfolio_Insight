import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request){
    await dbConnect();

    try {
        const {name, email, password} = await request.json();
        const existingUserByEmail = await UserModel.findOne({email});

        if(existingUserByEmail){
            return NextResponse.json({ error: "user already exists with this email" }, { status: 400 });
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserModel({
                name,
                email,
                password: hashedPassword
            })

            await newUser.save();
        }

        return NextResponse.json({ message: "User Registered successfully. Please Sign in to start your journey" }, { status: 200 });
    } catch (error) {
        console.error("Error registering user, ", error);
        return NextResponse.json({ error: `Error registering user, error: ${error}` }, { status: 500 });
    }
}