import { downloadChart } from '../utils/downloadChart'
import { useState, useEffect, useRef } from 'react'
import { api5 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'

const BORDER = '#1a3a4a'

// Fixed color palette cycling per tile — matches PRD solid-block style
const TILE_COLORS = [
  '#7a5c2e', // tan/khaki
  '#5a3d8a', // purple
  '#2e7a52', // green
  '#6b6b28', // olive
  '#2e7a7a', // teal
  '#3a4f8a', // blue
  '#7a2e5c', // rose
  '#4a6b28', // yellow-green
  '#2e5a7a', // steel blue
  '#7a4a2e', // brown
  '#3a7a5c', // mint
  '#5c2e7a', // violet
]

export default function EngagementHeatmap() {
  const [filters, setFilters] = useState({ start_date: '', end_date: '' })
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const chartRef = useRef(null)
  const [error, setError]     = useState(null)

  const hasFilter = filters.start_date || filters.end_date

  useEffect(() => {
    if (!hasFilter) { setData(null); return }
    setLoading(true)
    setError(null)
    api5(filters)
      .then(d => {
        const sorted = [...(d.series || [])]
          .filter(item => item.engagement_rate > 0)
          .sort((a, b) => b.engagement_rate - a.engagement_rate)
        setData(sorted)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Engagement Heatmap</h1>
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Engagement rate by Line of Business.</p>

      <FilterBar filters={filters} onChange={setFilters} fields={['start_date', 'end_date']} chartRef={chartRef} downloadFilename="engagement-heatmap" />

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a date range to view data.
        </div>
      )}

      {data && hasFilter && !loading && (
        <div ref={chartRef} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          {/* Header */}
          <div
            className="px-5 py-3 text-center text-sm font-semibold tracking-wider"
            style={{ background: '#1AAFBF', color: '#fff' }}
          >
            Engagement Rate
          </div>

          {/* 2-column tile grid */}
          <div className="grid grid-cols-2">
            {data.map((item, i) => {
              const rate  = item.engagement_rate ?? 0
              const color = TILE_COLORS[i % TILE_COLORS.length]
              return (
                <div
                  key={item.sector ?? i}
                  className="flex flex-col items-center justify-center py-8 px-4 text-center"
                  style={{
                    background:  color,
                    borderRight: i % 2 === 0 ? '1px solid rgba(0,0,0,0.2)' : 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.2)',
                  }}
                >
                  <span className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {item.sector}
                  </span>
                  <span className="text-3xl font-extrabold" style={{ color: '#fff' }}>
                    {`${(rate * 100).toFixed(0)}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
