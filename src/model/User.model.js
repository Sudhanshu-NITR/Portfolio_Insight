import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
        name: {
            type: String,   
            required: [true, "User name is required!!"],
            trim: true
        },
        email: {
            type: String,   
            required: [true, "User email is required!!"],
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please use a valid email address"],
            unique: true
        },
        password: {
            type: String,   
            required: [true, "Password is required!!"],
        }
    }, 
    {timestamps: true}
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
