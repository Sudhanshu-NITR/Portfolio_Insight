import { Target, Smile, Shield, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutSection() {
    const highlights = [
        {
            icon: TrendingUp,
            title: "Real-time Updates",
            description: "Live market data integration for accurate portfolio valuation"
        },
        {
            icon: Activity,
            title: "Advanced Analytics",
            description: "AI-powered insights and predictive modeling"
        },
        {
            icon: Smile,
            title: "User-Friendly Interface",
            description: "Intuitive and easy-to-use platform for all investors"
        }
    ];

    return (
        <section id="about" className="py-20 px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
                        About Us
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Empowering Smarter Investment Decisions
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        PortfolioInsight is India's leading portfolio analytics platform, designed to help investors make data-driven decisions.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                Our Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                To democratize professional-grade portfolio analytics and make sophisticated investment tools accessible to every Indian investor. We believe that informed decisions lead to better financial outcomes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                Why Choose Us
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Built specifically for the Indian market with support for NSE/BSE stocks, mutual funds, and bonds. Our platform combines cutting-edge AI technology with deep market insights.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {highlights.map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <item.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                            <p className="text-muted-foreground text-sm">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
