'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetricsOverview({ metrics }) {
    const formatPercent = (percent) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatPercent(metrics.totalReturn)}
                    </div>
                    <p className="text-xs text-muted-foreground">Since inception</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.sharpeRatio}</div>
                    <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Volatility</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.volatility}%</div>
                    <p className="text-xs text-muted-foreground">Annualized</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatPercent(metrics.maxDrawdown)}
                    </div>
                    <p className="text-xs text-muted-foreground">Peak to trough</p>
                </CardContent>
            </Card>
        </div>
    );
}
