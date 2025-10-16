export const formatCurrency = (amount) => {
    if (amount == null || Number.isNaN(Number(amount))) return '—';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Number(amount));
};

export const formatPercent = (percent) => {
    if (percent == null || !isFinite(percent)) return '—';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
};

export const numericSafe = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
};
