export default function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: '#061020', border: '1px solid #1a3a4a' }}>
      {title && <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#7a9aaa' }}>{title}</h3>}
      {children}
    </div>
  )
}
