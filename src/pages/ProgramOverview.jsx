import { useState, useEffect, useRef } from 'react'
import { api1 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'
import { downloadChart } from '../utils/downloadChart'

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000) return n.toLocaleString()
  return String(n)
}
function pct(n) {
  return n == null ? '—' : `${(n * 100).toFixed(1)}%`
}

function Tile({ label, value, span = 1, highlight = false, size = 'lg' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-5 px-4 ${span === 2 ? 'col-span-2' : ''}`}
      style={{
        border: '1px solid #1a3a4a',
        background: highlight ? 'transparent' : 'transparent',
        outline: highlight ? '2px solid #1AAFBF' : 'none',
        outlineOffset: '-2px',
      }}
    >
      <span
        className={`font-bold leading-none mb-2 ${size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'}`}
        style={{ color: '#1AAFBF' }}
      >
        {value}
      </span>
      <span className="text-xs text-center uppercase tracking-wide" style={{ color: '#7a9aaa' }}>
        {label}
      </span>
    </div>
  )
}

export default function ProgramOverview() {
  const [filters, setFilters] = useState({ start_date: '', end_date: '' })
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const chartRef = useRef(null)

  const hasFilter = filters.start_date || filters.end_date

  useEffect(() => {
    if (!hasFilter) { setData(null); return }
    setLoading(true)
    setError(null)
    api1(filters)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Program Overview</h1>
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>High-level campaign performance metrics across all candidates.</p>

      <FilterBar filters={filters} onChange={setFilters} fields={['start_date', 'end_date']} chartRef={chartRef} downloadFilename="program-overview" />

      {loading && <Loader />}
      {error   && <p className="text-sm mb-4" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a date range to view data.
        </div>
      )}

      {data && !loading && (
        <div
          ref={chartRef}
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid #1a3a4a', background: '#061020' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: '#061020', borderBottom: '1px solid #1a3a4a' }}
          >
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold tracking-widest" style={{ color: '#1AAFBF' }}>
                ▐▌ TALENT<br />
                <span style={{ color: '#1AAFBF' }}>FREQUENCY</span>
              </div>
              <div className="text-xs ml-4" style={{ color: '#7a9aaa' }}>
                {filters.start_date && <>Period Start: <b style={{ color: '#fff' }}>{filters.start_date}</b>&nbsp;&nbsp;</>}
                {filters.end_date   && <>Period Ending: <b style={{ color: '#fff' }}>{filters.end_date}</b></>}
                {!filters.start_date && !filters.end_date && <span style={{ color: '#4a6070' }}>All dates (YTD)</span>}
              </div>
            </div>
            <div className="text-sm font-semibold tracking-wider" style={{ color: '#fff' }}>
              PROGRAM PERFORMANCE OVERVIEW
            </div>
          </div>

          {/* Row 1 — 3 tiles */}
          <div className="grid grid-cols-3" style={{ borderBottom: '1px solid #1a3a4a' }}>
            <Tile label="Total Applicants Dispositioned" value={fmt(data.dispositioned)} size="xl" />
            <Tile label="Total Applicants Re-Engaged"    value={fmt(data.re_engaged)}    size="xl" />
            <Tile label="Total Screenings (full/partial)" value={fmt(data.screenings)}   size="xl" />
          </div>

          {/* Row 2 — 4 tiles */}
          <div className="grid grid-cols-4" style={{ borderBottom: '1px solid #1a3a4a' }}>
            <Tile label="Total Applicants Contacted" value={fmt(data.contacted)}              size="lg" />
            <Tile label="Engagement Rate"            value={pct(data.engagement_rate)}        size="lg" />
            <Tile label="Screen Rate (answered)"     value={pct(data.screen_rate)}            size="lg" />
            <Tile label="Total Hours Saved"          value={fmt(data.hours_saved != null ? Math.round(data.hours_saved) : null)} size="lg" highlight />
          </div>

          {/* Row 3 — 3 tiles */}
          <div className="grid grid-cols-3">
            <Tile label="Applicants Target Rate"     value={pct(data.target_rate)}            size="md" />
            <Tile label="Conversion to Hire"         value={pct(data.conversion_to_hire)}     size="md" />
            <Tile label="Seeking New Role"           value={pct(data.seeking_new_role_pct)}   size="md" />
          </div>
        </div>
      )}
    </div>
  )
}
