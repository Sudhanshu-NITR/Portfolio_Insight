import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection({ ctaHref }) {
    return (
        <section className="py-20 px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    Ready to Optimize Your Portfolio?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
                    Join thousands of investors who trust PortfolioInsight for their analytics needs.
                </p>

                <Link href={ctaHref} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    Start Analyzing Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Link>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        No credit card required
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Instant setup
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Enterprise-grade security
                    </span>
                </div>
            </div>
        </section>
    );
}
