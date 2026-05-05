import { downloadChart } from '../utils/downloadChart'
import { useState, useEffect, useRef } from 'react'
import { api8 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'

const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'

const TYPE_STYLES = {
  positive: { row: '#0d2a1a', label: '#4ade80', badge: '#14532d', badgeText: '#86efac' },
  neutral:  { row: '#2a260d', label: '#f0c96e', badge: '#4a3a0d', badgeText: '#fde68a' },
  negative: { row: '#2a0d0d', label: '#f87171', badge: '#4a1414', badgeText: '#fca5a5' },
}


export default function CallOutcomeSummary() {
  const [filters, setFilters] = useState({ start_date: '', end_date: '', job_subfamily: '', clearance: '' })
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const chartRef = useRef(null)
  const [error, setError]     = useState(null)

  const hasFilter = filters.start_date || filters.end_date || filters.job_subfamily || filters.clearance

  useEffect(() => {
    if (!hasFilter) { setData(null); return }
    setLoading(true)
    setError(null)
    api8(filters)
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const rows  = data?.rows  || []
  const total = data?.total || 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Call Outcome Summary</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Breakdown of call outcomes by type across re-engaged applicants.</p>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        fields={['start_date', 'end_date', 'job_subfamily', 'clearance']}
          chartRef={chartRef} downloadFilename="call-outcome-summary"
      />

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a filter to view data.
        </div>
      )}

      {rows.length > 0 && hasFilter && !loading && (
        <div ref={chartRef} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          {/* Header */}
          <div
            className="px-5 py-3 text-center text-sm font-semibold tracking-wider"
            style={{ background: '#061020', borderBottom: `1px solid ${BORDER}`, color: '#fff' }}
          >
            Call Outcome Breakdown
          </div>

          {/* Table */}
          <table className="w-full text-sm" style={{ background: BG }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-xs" style={{ color: '#7a9aaa', width: '50%' }}>Call Outcome</th>
                <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-xs" style={{ color: '#7a9aaa', width: '25%' }}># of Applicants</th>
                <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-xs" style={{ color: '#7a9aaa', width: '25%' }}>% Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const s = TYPE_STYLES[row.outcome_type] || TYPE_STYLES.neutral
                return (
                  <tr
                    key={i}
                    style={{
                      background: s.row,
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <td className="px-5 py-3 font-medium" style={{ color: s.label }}>
                      {row.outcome}
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums" style={{ color: '#e2e8f0' }}>
                      {row.count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums" style={{ color: '#e2e8f0' }}>
                      {(row.pct * 100).toFixed(1)}%
                    </td>
                  </tr>
                )
              })}

              {/* Totals row */}
              <tr style={{ background: '#061020', borderTop: `2px solid ${BORDER}` }}>
                <td className="px-5 py-3 font-bold" style={{ color: '#fff' }}>Total</td>
                <td className="px-5 py-3 text-right font-bold tabular-nums" style={{ color: '#fff' }}>
                  {total.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-bold" style={{ color: '#fff' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
