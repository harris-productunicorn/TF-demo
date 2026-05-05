export default function StatCard({ label, value, sub, color = '#1AAFBF' }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-1" style={{ background: '#061020', border: '1px solid #1a3a4a' }}>
      <span className="text-xs uppercase tracking-widest" style={{ color: '#7a9aaa' }}>{label}</span>
      <span className="text-3xl font-bold" style={{ color }}>{value ?? '—'}</span>
      {sub && <span className="text-xs" style={{ color: '#7a9aaa' }}>{sub}</span>}
    </div>
  )
}
