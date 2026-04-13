export function formatNumber(value) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatPercent(value) {
  return `${formatNumber(value)}%`;
}
