import { useState, useEffect, useRef } from 'react'
import { downloadChart } from '../utils/downloadChart'

function DownloadMenu({ chartRef, filename = 'chart' }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const dl = (fmt) => { downloadChart(chartRef, `${filename}.${fmt}`, fmt); setOpen(false) }
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])
  return (
    <div ref={menuRef} className="hidden md:flex flex-col gap-1 relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="rounded-lg px-3 text-sm font-medium"
        style={{ background: '#1AAFBF', border: '1px solid #1AAFBF', color: '#061020', whiteSpace: 'nowrap', height: 36, boxSizing: 'border-box' }}
      >
        Export
      </button>
      {open && (
        <div className="absolute top-full mt-2 rounded-lg z-50"
          style={{ background: '#0d1f2d', border: '1px solid #1a3a4a', minWidth: 120, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', right: 0 }}>
          <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6070' }}>Format</div>
          <div className="px-2 pb-2 flex flex-col gap-1">
            <button onClick={() => dl('png')}
              className="w-full px-3 py-2 rounded-md text-sm text-left"
              style={{ color: '#e2e8f0', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3a4a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              PNG
            </button>
            <button onClick={() => dl('jpeg')}
              className="w-full px-3 py-2 rounded-md text-sm text-left"
              style={{ color: '#e2e8f0', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3a4a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              JPEG
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DownloadMenu }

export default function FilterBar({ filters, onChange, fields = ['start_date', 'end_date'], chartRef, downloadFilename, sectorOptions = [], className = '' }) {
  const input = 'rounded-lg px-3 py-2 text-sm outline-none focus:ring-1'
  const style = {
    background: '#061020',
    border: '1px solid #1AAFBF',
    color: '#1AAFBF',
    colorScheme: 'dark',
    accentColor: '#1AAFBF',
    width: 150,
    height: 36,
    boxSizing: 'border-box',
  }
  const focusStyle = { '--tw-ring-color': '#1AAFBF' }

  return (
    <div className={`flex items-end justify-between gap-3 ${chartRef ? 'mb-6' : ''} ${className}`}>
      <div className="flex flex-wrap items-end gap-3">
        {fields.includes('start_date') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>Start Date</label>
            <input type="date" className={input} style={{ ...style, ...focusStyle }}
              value={filters.start_date || ''}
              onChange={e => onChange({ ...filters, start_date: e.target.value })} />
          </div>
        )}
        {fields.includes('end_date') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>End Date</label>
            <input type="date" className={input} style={{ ...style, ...focusStyle }}
              value={filters.end_date || ''}
              onChange={e => onChange({ ...filters, end_date: e.target.value })} />
          </div>
        )}
        {fields.includes('start_month') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>Start Month</label>
            <input type="month" className={input} style={{ ...style, ...focusStyle }}
              value={filters.start_month || ''}
              onChange={e => onChange({ ...filters, start_month: e.target.value })} />
          </div>
        )}
        {fields.includes('end_month') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>End Month</label>
            <input type="month" className={input} style={{ ...style, ...focusStyle }}
              value={filters.end_month || ''}
              onChange={e => onChange({ ...filters, end_month: e.target.value })} />
          </div>
        )}
        {fields.includes('clearance') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>Clearance</label>
            <select className={input} style={{ ...style, ...focusStyle }}
              value={filters.clearance || ''}
              onChange={e => onChange({ ...filters, clearance: e.target.value })}>
              <option value="">All</option>
              {['No Clearance','Public Trust','Secret','Top Secret','TS/SCI','TS/SCI Poly','DOE','ADP','NACI','Other']
                .map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {fields.includes('job_subfamily') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>Job Subfamily</label>
            <select className={input} style={{ ...style, ...focusStyle }}
              value={filters.job_subfamily || ''}
              onChange={e => onChange({ ...filters, job_subfamily: e.target.value })}>
              <option value="">All</option>
              {['BD/Capture','Contracts','Cyber Ops','Data/Research Scientist','Proj and Prog Mgmt','SW Engineer/Dev','Systems/Network/EE']
                .map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        {fields.includes('sector') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>Sector</label>
            <select className={input} style={{ ...style, ...focusStyle }}
              value={filters.sector || ''}
              onChange={e => onChange({ ...filters, sector: e.target.value })}>
              <option value="">All</option>
              {sectorOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>
      {chartRef && <DownloadMenu chartRef={chartRef} filename={downloadFilename} />}
    </div>
  )
}
