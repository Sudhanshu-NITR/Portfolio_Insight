"use client"
import Link from "next/link";
import { TrendingUp, BarChart3, PieChart, Target, ArrowRight, Shield, Zap } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { status } = useSession();
  const ctaHref = status === "authenticated" ? "/dashboard" : "/sign-in";

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative px-6 py-24 sm:px-12 lg:px-16 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-8 animate-fadeIn">
              <TrendingUp className="w-4 h-4 mr-2" />
              Advanced Portfolio Analytics Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent mb-8 animate-fadeIn">
              PortaLyze
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed animate-fadeIn">
              Transform your investment data into actionable insights with our
              <span className="text-indigo-600 font-semibold"> AI-powered analytics platform</span>
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto animate-fadeIn">
              Upload your portfolio data and get instant analysis of performance metrics, risk assessments, 
              and optimization recommendations powered by advanced algorithms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn">
              <Link href={ctaHref} className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-300">
                <BarChart3 className="mr-2 w-5 h-5" />
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Analytics at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite of tools helps you make informed investment decisions with confidence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time portfolio performance monitoring with detailed P&L analysis, returns calculation, and historical trend visualization.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Risk Assessment</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced volatility analysis, maximum drawdown calculations, and risk metrics to help you understand portfolio exposure.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive asset allocation analysis with sector breakdown and diversification recommendations for optimal portfolio balance.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="group card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered portfolio optimization suggestions based on modern portfolio theory and market analysis algorithms.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="group card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your CSV data and get comprehensive analytics within seconds. No complex setup or configuration required.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="group card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visual Reports</h3>
              <p className="text-gray-600 leading-relaxed">
                Beautiful, interactive charts and graphs that make complex financial data easy to understand and share.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-12 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Optimize Your Portfolio?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
            Join thousands of investors who trust PortaLyze for their portfolio analytics and optimization needs.
          </p>
          
          <Link href={ctaHref} className="group inline-flex items-center px-10 py-5 bg-white text-indigo-600 font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300">
            Start Analyzing Now
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          
          <div className="mt-12 text-indigo-200 text-sm">
            <p>✓ No credit card required  ✓ Instant setup  ✓ Enterprise-grade security</p>
          </div>
        </div>
      </section>
    </main>
  );
}
