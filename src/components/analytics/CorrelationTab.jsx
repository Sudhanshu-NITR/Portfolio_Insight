'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Pearson correlation function
function pearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
    const sumX2 = x.reduce((acc, val) => acc + val ** 2, 0);
    const sumY2 = y.reduce((acc, val) => acc + val ** 2, 0);

    return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
}

// Build correlation matrix from performance data
function buildCorrelationMatrix(performance) {
    const assets = performance.map(p => p.name);
    const seriesMap = performance.reduce((acc, p) => {
        acc[p.name] = p.series.map(s => s.growthPct);
        return acc;
    }, {});

    const matrix = assets.map(asset1 => {
        const row = { asset: asset1 };
        assets.forEach(asset2 => {
            row[asset2.toLowerCase()] = asset1 === asset2
                ? 1
                : pearsonCorrelation(seriesMap[asset1], seriesMap[asset2]);
        });
        return row;
    });

    return matrix;
}

export default function CorrelationTab({ performance }) {
    const correlationMatrix = buildCorrelationMatrix(performance);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Correlation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center">
                    <div className="overflow-x-auto" style={{ maxWidth: '500px', width: '100%' }}>
                        <table className="mx-auto border-collapse border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="text-left p-2 border-b border-gray-200"></th>
                                    {correlationMatrix.map(item => (
                                        <th key={item.asset} className="text-center p-2 text-sm border-b border-gray-200">
                                            {item.asset}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {correlationMatrix.map(row => (
                                    <tr key={row.asset}>
                                        <td className="p-2 font-medium text-sm border-b border-gray-200">{row.asset}</td>
                                        {Object.keys(row)
                                            .filter(k => k !== 'asset')
                                            .map(k => (
                                                <td key={k} className="p-2 text-center border-b border-gray-200">
                                                    <Badge variant={Math.abs(row[k]) === 1 ? "default" : "secondary"}>
                                                        {row[k].toFixed(2)}
                                                    </Badge>
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
