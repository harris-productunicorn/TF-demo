import { useState, useEffect, useRef } from 'react'
import { fmtDate } from '../utils/fmtDate'
import { apiFetch } from '../api/index'

const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'
const TEAL   = '#1AAFBF'

const COLUMNS = [
  { key: 'Rounds',              label: 'Round' },
  { key: 'Sent Date',           label: 'Sent Date' },
  { key: 'Job Subfamily',       label: 'Job SubFamily' },
  { key: 'First Name',          label: 'First Name' },
  { key: 'Last Name',           label: 'Last Name' },
  { key: 'Location',            label: 'Location' },
  { key: 'Candidate Clearance', label: 'Candidate Clearance' },
  { key: 'Sector Name',         label: 'Sector Name' },
  { key: 'Opt',                 label: 'Opt' },
  { key: 'Seeking',             label: 'Seeking' },
  { key: 'Salary',              label: 'Salary' },
  { key: 'Work Arrangement',    label: 'Work Arrangement' },
  { key: 'Call Outcome',        label: 'Call Outcome' },
  { key: 'Date',                label: 'Call Date' },
  { key: 'Source',              label: 'Source' },
  { key: 'recruiter_name',      label: 'Recruiter Name' },
]

const OUTCOME_COLOR = {
  Positive: '#4ade80',
  Neutral:  '#f0c96e',
  Negative: '#f87171',
  Other:    '#8ab0be',
}

function buildQS(filters, page, page_size) {
  const p = { ...filters, page, page_size }
  return Object.entries(p)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://poppied-overclever-elisha.ngrok-free.dev'

function buildExportURL(filters, format) {
  const p = { ...filters, format }
  const qs = Object.entries(p)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return `${API_BASE}/data/export?${qs}`
}

function ExportMenu({ filters }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])
  return (
    <div ref={menuRef} className="flex flex-col gap-1 relative justify-end">
      <button onClick={() => setOpen(o => !o)}
        className="rounded-lg px-3 text-sm font-medium"
        style={{ background: '#1AAFBF', border: '1px solid #1AAFBF', color: '#061020', whiteSpace: 'nowrap', height: 36, boxSizing: 'border-box' }}>
        Export
      </button>
      {open && (
        <div className="absolute top-full mt-2 rounded-lg z-50"
          style={{ background: '#0d1f2d', border: '1px solid #1a3a4a', minWidth: 120, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', right: 0 }}>
          <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6070' }}>Format</div>
          <div className="px-2 pb-2 flex flex-col gap-1">
            <a href={buildExportURL(filters, 'csv')} download onClick={() => setOpen(false)}
              className="w-full px-3 py-2 rounded-md text-sm text-left block"
              style={{ color: '#e2e8f0' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3a4a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              CSV
            </a>
            <a href={buildExportURL(filters, 'xlsx')} download onClick={() => setOpen(false)}
              className="w-full px-3 py-2 rounded-md text-sm text-left block"
              style={{ color: '#e2e8f0' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3a4a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Excel
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterInput({ label, value, onChange, type = 'text' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: '#7a9aaa' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg px-3 py-2 text-sm outline-none"
        style={{
          background: '#061020',
          border: '1px solid #1AAFBF',
          color: '#1AAFBF',
          width: 150,
          height: 36,
          boxSizing: 'border-box',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: '#7a9aaa' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg px-3 py-2 text-sm outline-none"
        style={{ background: '#061020', border: '1px solid #1AAFBF', color: '#1AAFBF', width: 150, height: 36, boxSizing: 'border-box' }}
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function DataTable() {
  const [filters, setFilters] = useState({
    start_date: '', end_date: '', job_subfamily: '', sector: '', clearance: '', call_outcome: '',
  })
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [opts, setOpts]       = useState({ job_subfamily: [], sector: [], clearance: [], call_outcome: [] })

  const PAGE_SIZE = 50

  useEffect(() => {
    apiFetch('/data/filters').then(r => r.json()).then(setOpts).catch(() => {})
  }, [])

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    const qs = buildQS(filters, page, PAGE_SIZE)
    apiFetch(`/data/table?${qs}`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
      .then(d => { setRows(d.data || []); setTotal(d.total || 0); setPages(d.pages || 1) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters, page])

  const DATE_COLS = new Set(['Sent Date', 'Date'])

  function formatCell(key, val) {
    if (val == null || val === '') return '—'
    if (DATE_COLS.has(key)) return fmtDate(val)
    if (typeof val === 'string') {
      return val.replace(/^\[?'?|'?\]?$/g, '').replace("['", '').replace("']", '')
    }
    return String(val)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Data Table</h1>
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Freeform filtered view of all candidate records. Phone numbers and email excluded.</p>

      {/* Filters */}
      <div className="flex items-end justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <FilterInput label="Start Date"    value={filters.start_date}    onChange={v => setFilter('start_date', v)}    type="date" />
          <FilterInput label="End Date"      value={filters.end_date}      onChange={v => setFilter('end_date', v)}      type="date" />
          <FilterSelect label="Job Subfamily" value={filters.job_subfamily} onChange={v => setFilter('job_subfamily', v)} options={opts.job_subfamily} />
          <FilterSelect label="Sector"        value={filters.sector}        onChange={v => setFilter('sector', v)}        options={opts.sector} />
          <FilterSelect label="Clearance"     value={filters.clearance}     onChange={v => setFilter('clearance', v)}     options={opts.clearance} />
          <FilterSelect label="Call Outcome"  value={filters.call_outcome}  onChange={v => setFilter('call_outcome', v)}  options={opts.call_outcome} />
        </div>
        <ExportMenu filters={filters} />
      </div>

      {/* Row count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: '#7a9aaa' }}>
          {loading ? 'Loading…' : `${total.toLocaleString()} records`}
        </span>
        {pages > 1 && (
          <span className="text-xs" style={{ color: '#7a9aaa' }}>
            Page {page} of {pages}
          </span>
        )}
      </div>

      {error && <p className="text-sm mb-3" style={{ color: '#f87171' }}>{error}</p>}

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ background: BG, minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#061020', borderBottom: `1px solid ${BORDER}` }}>
                <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#7a9aaa', width: 56 }}>#</th>
                {COLUMNS.map(col => (
                  <th key={col.key} className="px-3 py-3 text-left font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#7a9aaa' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-8 text-center" style={{ color: '#4a6070' }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? BG : '#061020', borderBottom: `1px solid #0d2a3a` }}>
                    <td className="px-3 py-2 tabular-nums" style={{ color: '#4a6070' }}>
                      {((page - 1) * PAGE_SIZE) + i + 1}
                    </td>
                    {COLUMNS.map(col => {
                      const val = formatCell(col.key, row[col.key])
                      return (
                        <td key={col.key} className="px-3 py-2 whitespace-nowrap" style={{ color: '#e2e8f0', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {val}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ background: '#061020', borderTop: `1px solid ${BORDER}` }}>
            <span className="text-xs" style={{ color: '#7a9aaa' }}>Page {page} of {pages} · {total.toLocaleString()} total rows</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1 rounded text-xs"
                style={{ background: page > 1 ? '#1a3a4a' : '#0d2030', color: page > 1 ? '#e2e8f0' : '#4a6070' }}>
                Prev
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                className="px-3 py-1 rounded text-xs"
                style={{ background: page < pages ? '#1a3a4a' : '#0d2030', color: page < pages ? '#e2e8f0' : '#4a6070' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
