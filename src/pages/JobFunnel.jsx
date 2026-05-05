import { downloadChart } from '../utils/downloadChart'
import { useState, useEffect, useRef } from 'react'
import { api10 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'

const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'

const STAGE_COLORS = ['#f59e0b', '#93c5fd', '#1AAFBF', '#f0c96e', '#3b82f6']

// Renders a centered trapezoid as an SVG polygon
// topW and botW are widths as fractions of total canvas width (0–1)
function Trapezoid({ x, y, totalW, topW, botW, h, color }) {
  const cx    = x + totalW / 2
  const halfT = (totalW * topW) / 2
  const halfB = (totalW * botW) / 2
  const pts   = [
    `${cx - halfT},${y}`,
    `${cx + halfT},${y}`,
    `${cx + halfB},${y + h}`,
    `${cx - halfB},${y + h}`,
  ].join(' ')
  return <polygon points={pts} fill={color} opacity={0.9} />
}

export default function JobFunnel() {
  const [filters, setFilters]   = useState({ start_date: '', end_date: '', sector: '' })
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const chartRef                = useRef(null)
  const [error, setError]       = useState(null)
  const [sectorOpts, setSectorOpts] = useState([])

  useEffect(() => {
    fetch('/data/filters').then(r => r.json()).then(d => setSectorOpts(d.sector || [])).catch(() => {})
  }, [])

  const hasFilter = filters.start_date || filters.end_date || filters.sector

  useEffect(() => {
    if (!hasFilter) { setData(null); return }
    setLoading(true)
    setError(null)
    api10(filters)
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const stages = data?.stages || []
  const maxCount = stages.find(s => s.count != null)?.count || 1

  // SVG layout
  const SVG_W       = 480
  const FUNNEL_W    = 220   // max funnel width
  const FUNNEL_X    = 20    // left offset for funnel
  const STAGE_H     = 60
  const GAP         = 4
  const LABEL_X     = FUNNEL_X + FUNNEL_W + 24
  const SVG_H       = stages.length * (STAGE_H + GAP) + 20

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Job Funnel</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Candidate progression from outreach through influenced hire.</p>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        fields={['start_date', 'end_date', 'sector']}
        sectorOptions={sectorOpts}
        chartRef={chartRef}
        downloadFilename="job-funnel"
      />

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a filter to view data.
        </div>
      )}

      {stages.length > 0 && hasFilter && !loading && (
        <div ref={chartRef} className="rounded-lg p-6" style={{ background: BG, border: `1px solid ${BORDER}` }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width="100%"
            style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
          >
            {stages.map((stage, i) => {
              const hasData = stage.count != null
              const count   = hasData ? stage.count : 0
              const topW    = hasData ? count / maxCount : 0.04
              const nextCount = stages[i + 1]?.count ?? 0
              const botW    = i < stages.length - 1
                ? (stages[i + 1]?.count != null ? nextCount / maxCount : 0.04)
                : topW * 0.15
              const y     = i * (STAGE_H + GAP) + 10
              const color = STAGE_COLORS[i % STAGE_COLORS.length]

              return (
                <g key={i}>
                  <Trapezoid
                    x={FUNNEL_X}
                    y={y}
                    totalW={FUNNEL_W}
                    topW={Math.max(topW, 0.04)}
                    botW={Math.max(botW, 0.04)}
                    h={STAGE_H}
                    color={hasData ? color : '#1a3a4a'}
                  />
                  {/* Stage name */}
                  <text x={LABEL_X} y={y + STAGE_H / 2 - 6} fontSize={11} fill="#b0ccd6">
                    {stage.stage}
                  </text>
                  {/* Count */}
                  <text x={LABEL_X} y={y + STAGE_H / 2 + 10} fontSize={13} fontWeight="bold" fill={hasData ? color : '#4a6070'}>
                    {hasData
                      ? `${count.toLocaleString()}${stage.conversion_from_prev != null ? `  (${(stage.conversion_from_prev * 100).toFixed(1)}%)` : ''}`
                      : '—'}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </div>
  )
}
