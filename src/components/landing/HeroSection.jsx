import Link from "next/link";
import { TrendingUp, BarChart3, ArrowRight, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HeroSection({ ctaHref }) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-32 pb-20 px-6 sm:px-12 lg:px-16">
            {/* Decorative background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        AI-Powered Portfolio Management
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                        Advanced Portfolio
                        <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analytics Platform</span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                        Transform your investment data into actionable insights with AI-powered analytics and comprehensive risk assessments.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href={ctaHref} className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link href="#features" className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300 hover:shadow-md">
                            <BarChart3 className="mr-2 w-5 h-5" />
                            Explore Features
                        </Link>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            No credit card required
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            Free forever plan
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                        <CardContent className="pt-6 text-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                            <p className="text-sm text-muted-foreground">Active Users</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                        <CardContent className="pt-6 text-center">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">₹50Cr+</div>
                            <p className="text-sm text-muted-foreground">Assets Analyzed</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                        <CardContent className="pt-6 text-center">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">99.9%</div>
                            <p className="text-sm text-muted-foreground">Uptime</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
