import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export const authOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Enter your email id" },
                password: { label: "Password", type: "password", placeholder: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                try {
                    await dbConnect();
                    const user = await UserModel.findOne({ email: credentials.email });
                    if (!user) throw new Error("No user found with this email!!");

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) throw new Error("Incorrect Password!!");

                    
                    return {
                        id: user._id.toString(),
                        email: user.email,
                    };
                } catch (err) {
                    
                    throw new Error(err?.message ?? String(err));
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            
            if (user) {
                token._id = user.id ?? user._id ?? null; 
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    _id: token._id,
                    email: token.email,
                };
            }
            return session;
        },
    },

    pages: {
        signIn: "/sign-in", 
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
