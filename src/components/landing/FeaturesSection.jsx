import { TrendingUp, BarChart3, PieChart, Target, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeaturesSection() {
    return (
        <section id="features" className="py-20 px-6 sm:px-12 lg:px-16 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
                        Features
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Powerful Analytics at Your Fingertips
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Comprehensive tools to help you make informed investment decisions
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">Performance Tracking</CardTitle>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Real-time portfolio monitoring with detailed P&amp;L analysis and historical trend visualization.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">Risk Assessment</CardTitle>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Advanced volatility analysis and risk metrics to understand portfolio exposure.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">Portfolio Insights</CardTitle>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Comprehensive asset allocation analysis with sector breakdown and diversification.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">Smart Optimization</CardTitle>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                AI-powered optimization suggestions based on modern portfolio theory.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">Instant Analysis</CardTitle>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Upload your data and get comprehensive analytics within seconds.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-pink-500 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">Visual Reports</CardTitle>
                            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Interactive charts and graphs that make complex data easy to understand.
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>
    );
}
