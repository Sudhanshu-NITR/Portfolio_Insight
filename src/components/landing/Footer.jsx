"use client";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 py-10 px-6 sm:px-12 lg:px-16">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 text-gray-700 dark:text-gray-400">

                <div>
                    <p className="text-sm">&copy; {new Date().getFullYear()} PortfolioInsight. All rights reserved.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <Link href="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Contact
                    </Link>
                </div>

            </div>
        </footer>
    );
}
