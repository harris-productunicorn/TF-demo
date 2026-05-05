export function fmtDate(val) {
  if (!val) return '—'
  const m = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return val
  return `${m[3]}/${m[2]}/${m[1].slice(2)}`
}
