"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });
    setIsLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const resp = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || `Signup failed (${resp.status})`);
      }

      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemoLogin() {
    setIsLoading(true);
    signIn("credentials", { redirect: false, email: "demo@portfolioinsight.in", password: "demo" })
      .then((res) => {
        if (res?.error) setError(res.error);
        else router.push("/dashboard");
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Link href={"/"}>
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PortfolioInsight</h1>
              <p className="text-sm text-muted-foreground">India</p>
            </div>
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  {error ? <div className="text-red-600 text-sm">{error}</div> : null}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm">Full Name</label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-email" className="text-sm">Email</label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="text-sm">Password</label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm">Confirm Password</label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  {error ? <div className="text-red-600 text-sm">{error}</div> : null}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-border">
              <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
                Try Demo Account
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signIn } from "next-auth/react";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// const schema = z.object({
//   email: z.string().email(),
//   password: z.string().min(1)
// });

// export default function SignInPage() {  
//   const router = useRouter();
//   const [error, setError] = useState(null);
//   const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });

//   async function onSubmit(values) {
//     setError(null);
//     const res = await signIn("credentials", { redirect: false, email: values.email, password: values.password });
//     if (res?.error) {
//       setError(res.error);
//     } else {
//       // signed in, go to dashboard
//       router.push("/(app)/dashboard");
//     }
//   }

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-semibold mb-4">Sign in</h2>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div>
//           <label className="block text-sm">Email</label>
//           <input type="email" {...register("email")} className="w-full mt-1 p-2 border rounded" />
//         </div>
//         <div>
//           <label className="block text-sm">Password</label>
//           <input type="password" {...register("password")} className="w-full mt-1 p-2 border rounded" />
//         </div>
//         {error && <div className="text-red-600">{error}</div>}
//         <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</button>
//       </form>
//     </div>
//   );
// }
