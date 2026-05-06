import { useState, useEffect, useMemo, useRef } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LabelList, ResponsiveContainer,
} from 'recharts'
import { api6 } from '../api'
import FilterBar, { DownloadMenu } from '../components/FilterBar'
import Loader from '../components/Loader'

const MAGENTA = '#d946ef'
const TEAL    = '#1AAFBF'
const PURPLE  = '#7c3aed'
const WHITE   = '#ffffff'
const BG      = '#0d1f2d'
const BORDER  = '#1a3a4a'

const CLEARANCE_OPTIONS = [
  { value: 'All',        label: 'All' },
  { value: 'No Clearance', label: 'No Clearance' },
  { value: 'Secret',     label: 'Secret' },
  { value: 'Top Secret', label: 'Top Secret' },
  { value: 'TS/SCI',     label: 'TS/SCI' },
  { value: 'TS/SCI Poly', label: 'Polygraph+' },
]

// TS/SCI+ = TS/SCI + TS/SCI Poly
const TSSCI_PLUS = new Set(['TS/SCI', 'TS/SCI Poly'])

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#061020', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: '#fff' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <b>{p.name === 'Engagement Rate' ? `${(p.value * 100).toFixed(1)}%` : p.value?.toLocaleString()}</b>
        </p>
      ))}
    </div>
  )
}

function CountLabel({ x, y, width, value }) {
  if (!value) return null
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#b0ccd6">
      {value?.toLocaleString()}
    </text>
  )
}

function RateLabel({ x, y, value }) {
  if (value == null) return null
  return (
    <text x={x} y={y - 8} textAnchor="middle" fontSize={9} fill="#ffffff" fontWeight="bold">
      {`${(value * 100).toFixed(0)}%`}
    </text>
  )
}

export default function SubfamilyEngagement() {
  const [filters, setFilters]     = useState({ start_date: '', end_date: '' })
  const [clearance, setClearance] = useState('All')
  const [rawData, setRawData]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const chartRef = useRef(null)
  const [error, setError]         = useState(null)

  const hasFilter = filters.start_date || filters.end_date

  useEffect(() => {
    if (!hasFilter) { setRawData(null); return }
    setLoading(true)
    setError(null)
    api6(filters)
      .then(d => setRawData((d.series || []).filter(r => (r.re_engaged || 0) > 0 || (r.contacted || 0) > 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  // Pivot raw rows → one entry per subfamily
  const chartData = useMemo(() => {
    if (!rawData) return []

    // Group by subfamily
    const bySubfamily = {}
    for (const row of rawData) {
      const sf = row.job_subfamily
      if (!bySubfamily[sf]) bySubfamily[sf] = []
      bySubfamily[sf].push(row)
    }

    return Object.entries(bySubfamily).map(([sf, rows]) => {
      const all    = rows.reduce((s, r) => s + (r.re_engaged || 0), 0)
      const noClr  = rows.find(r => r.clearance === 'No Clearance')
      const tssci  = rows.filter(r => TSSCI_PLUS.has(r.clearance))
      const tssciE = tssci.reduce((s, r) => s + (r.re_engaged || 0), 0)
      const tssciC = tssci.reduce((s, r) => s + (r.contacted || 0), 0)

      // Rate line — driven by selected clearance toggle
      let rateRow = null
      if (clearance === 'All') {
        const totalC = rows.reduce((s, r) => s + (r.contacted || 0), 0)
        rateRow = totalC > 0 ? all / totalC : null
      } else if (clearance === 'TS/SCI+' || TSSCI_PLUS.has(clearance)) {
        rateRow = tssciC > 0 ? tssciE / tssciC : null
      } else {
        const match = rows.find(r => r.clearance === clearance)
        rateRow = match ? match.engagement_rate : null
      }

      return {
        name:             sf,
        'All Clearances': all,
        'No Clearance':   noClr?.re_engaged ?? 0,
        'TS/SCI+':        tssciE,
        rate:             rateRow,
      }
    })
  }, [rawData, clearance])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>SubFamily Engagement by Filter</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Engagement counts by job subfamily, segmented by clearance.</p>

      {/* Filters */}
      <div className="flex items-end justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <FilterBar filters={filters} onChange={setFilters} fields={['start_date', 'end_date']} />
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>Clearance (Rate Line)</label>
            <div className="flex flex-wrap gap-1">
              {CLEARANCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setClearance(opt.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: clearance === opt.value ? '#1AAFBF' : '#0d2030',
                    color:      clearance === opt.value ? '#fff'    : '#8ab0be',
                    border:     `1px solid ${clearance === opt.value ? '#1AAFBF' : '#1a3040'}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DownloadMenu chartRef={chartRef} filename="subfamily-engagement" />
      </div>

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a date range to view data.
        </div>
      )}

      {chartData.length > 0 && hasFilter && !loading && (
        <div ref={chartRef} className="rounded-lg p-5" style={{ background: BG, border: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-semibold mb-4 text-center tracking-wider" style={{ color: '#fff' }}>
            SubFamily Engagement by Clearance
          </h3>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={chartData} margin={{ top: 24, right: 50, left: 0, bottom: 60 }}>
              <CartesianGrid vertical={false} stroke="#1a3040" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8ab0be', fontSize: 10, fontWeight: 'bold' }}
                tickLine={false}
                axisLine={{ stroke: '#1a3a4a' }}
                interval={0}
              />
              <YAxis
                yAxisId="count"
                tick={{ fill: '#8ab0be', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              />
              <YAxis
                yAxisId="rate"
                orientation="right"
                tick={{ fill: '#ffffff', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
                    {payload.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {entry.type === 'line'
                          ? <svg width="24" height="12"><line x1="0" y1="6" x2="24" y2="6" stroke={entry.color} strokeWidth="2" /><circle cx="12" cy="6" r="3" fill={entry.color} /></svg>
                          : <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: entry.color }} />
                        }
                        <span style={{ fontSize: 11, color: '#b0ccd6' }}>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Bar yAxisId="count" dataKey="All Clearances" fill={MAGENTA} barSize={18} radius={[2,2,0,0]}>
                <LabelList content={<CountLabel />} />
              </Bar>
              <Bar yAxisId="count" dataKey="No Clearance"   fill={TEAL}   barSize={18} radius={[2,2,0,0]}>
                <LabelList content={<CountLabel />} />
              </Bar>
              <Bar yAxisId="count" dataKey="TS/SCI+"        fill={PURPLE} barSize={18} radius={[2,2,0,0]}>
                <LabelList content={<CountLabel />} />
              </Bar>
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="rate"
                name={`${clearance === 'All' ? 'All Clearances' : clearance} Engagement Rate`}
                stroke={WHITE}
                strokeWidth={2}
                dot={{ fill: WHITE, r: 3 }}
                activeDot={{ r: 5 }}
              >
                <LabelList content={<RateLabel />} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
