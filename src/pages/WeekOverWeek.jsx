import { useState, useEffect, useRef } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LabelList, ResponsiveContainer,
} from 'recharts'
import { api3 } from '../api'
import { YTD_MONTH_FILTERS } from '../utils/defaults'
import FilterBar, { DownloadMenu } from '../components/FilterBar'
import Loader from '../components/Loader'

const TEAL   = '#1AAFBF'
const PURPLE = '#a78bfa'
const WHITE  = '#f0c96e'
const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'

const CLEARANCE_OPTIONS = [
  { value: '',                   label: 'All' },
  { value: 'Security Clearance', label: 'Security Clearance' },
  { value: 'No Clearance',       label: 'No Clearance' },
]

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
    <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="#b0ccd6">
      {value?.toLocaleString()}
    </text>
  )
}

function RateLabel({ x, y, value }) {
  if (value == null) return null
  return (
    <text x={x} y={y - 8} textAnchor="middle" fontSize={9} fill={PURPLE} fontWeight="bold">
      {`${(value * 100).toFixed(0)}%`}
    </text>
  )
}

export default function WeekOverWeek() {
  const [filters, setFilters] = useState({ ...YTD_MONTH_FILTERS, clearance: '' })
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const chartRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api3(filters)
      .then(d => setData((d.weeks || []).filter(r => (r.targeted || 0) > 0 || (r.engaged || 0) > 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const chartData = (data || []).map((r, i) => ({
    name:            `Week ${i + 1}`,
    'Candidates':    r.targeted,
    'Engaged':       r.engaged,
    rate:            r.engagement_rate,
    wow_delta:       r.wow_engaged_delta,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Week over Week Engagement</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Weekly candidate targeting and engagement trends.</p>

      {/* Filters */}
      <div className="flex items-end justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            fields={['start_month', 'end_month']}
          />
          {/* Clearance toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#7a9aaa' }}>Audience Type</label>
            <div className="flex gap-1">
              {CLEARANCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilters(f => ({ ...f, clearance: opt.value }))}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: filters.clearance === opt.value ? '#1AAFBF' : '#0d2030',
                    color:      filters.clearance === opt.value ? '#fff'    : '#8ab0be',
                    border:     `1px solid ${filters.clearance === opt.value ? '#1AAFBF' : '#1a3040'}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DownloadMenu chartRef={chartRef} filename="week-over-week" />
      </div>

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}

      {chartData.length > 0 && !loading && (
        <div ref={chartRef}>
          {/* Chart */}
          <div className="rounded-lg p-5 mb-4" style={{ background: BG, border: `1px solid ${BORDER}` }}>
            <h3 className="text-sm font-semibold mb-4 text-center tracking-wider" style={{ color: '#fff' }}>
              Week Over Week Engagement
            </h3>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={chartData} margin={{ top: 24, right: 40, left: 0, bottom: 10 }}>
                <CartesianGrid vertical={false} stroke="#1a3040" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#8ab0be', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1a3a4a' }}
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
                  tick={{ fill: PURPLE, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={v => <span style={{ color: '#7a9aaa' }}>{v}</span>}
                />
                <Bar yAxisId="count" dataKey="Candidates" fill={TEAL} barSize={22} radius={[2,2,0,0]}>
                  <LabelList content={<CountLabel />} />
                </Bar>
                <Bar yAxisId="count" dataKey="Engaged" fill={WHITE} barSize={22} radius={[2,2,0,0]}>
                  <LabelList content={<CountLabel />} />
                </Bar>
                <Line
                  yAxisId="rate"
                  type="monotone"
                  dataKey="rate"
                  name="Engagement Rate"
                  stroke={PURPLE}
                  strokeWidth={2}
                  dot={{ fill: PURPLE, r: 3 }}
                  activeDot={{ r: 5 }}
                >
                  <LabelList content={<RateLabel />} />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Data table — weeks as columns, metrics as rows (PRD layout) */}
          <div className="rounded-lg overflow-x-auto" style={{ border: `1px solid ${BORDER}` }}>
            <table className="w-full text-xs" style={{ minWidth: `${chartData.length * 80 + 140}px` }}>
              <thead>
                <tr style={{ background: '#061020', borderBottom: `1px solid ${BORDER}` }}>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider sticky left-0" style={{ color: '#7a9aaa', background: '#061020', minWidth: 140 }}>
                    Metric
                  </th>
                  {chartData.map(row => (
                    <th key={row.name} className="px-3 py-3 text-center font-semibold uppercase tracking-wider" style={{ color: '#7a9aaa', minWidth: 72 }}>
                      {row.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Row 1 — Candidates */}
                <tr style={{ background: '#0d1f2d', borderBottom: `1px solid #1a3a4a` }}>
                  <td className="px-4 py-2 font-semibold sticky left-0" style={{ color: TEAL, background: '#0d1f2d' }}>Candidates</td>
                  {chartData.map((row, i) => (
                    <td key={i} className="px-3 py-2 text-center font-medium" style={{ color: TEAL }}>{row['Candidates']?.toLocaleString() ?? '—'}</td>
                  ))}
                </tr>
                {/* Row 2 — Engaged */}
                <tr style={{ background: '#061020', borderBottom: `1px solid #1a3a4a` }}>
                  <td className="px-4 py-2 font-semibold sticky left-0" style={{ color: WHITE, background: '#061020' }}>Engaged</td>
                  {chartData.map((row, i) => (
                    <td key={i} className="px-3 py-2 text-center font-medium" style={{ color: WHITE }}>{row['Engaged']?.toLocaleString() ?? '—'}</td>
                  ))}
                </tr>
                {/* Row 3 — Engagement Rate */}
                <tr style={{ background: '#0d1f2d', borderBottom: `1px solid #1a3a4a` }}>
                  <td className="px-4 py-2 font-semibold sticky left-0" style={{ color: PURPLE, background: '#0d1f2d' }}>Engagement Rate</td>
                  {chartData.map((row, i) => (
                    <td key={i} className="px-3 py-2 text-center font-medium" style={{ color: PURPLE }}>
                      {row.rate != null ? `${(row.rate * 100).toFixed(0)}%` : '—'}
                    </td>
                  ))}
                </tr>
                {/* Row 4 — WoW % Change */}
                <tr style={{ background: '#061020' }}>
                  <td className="px-4 py-2 font-semibold sticky left-0" style={{ color: '#7a9aaa', background: '#061020' }}>WoW Change</td>
                  {chartData.map((row, i) => {
                    const delta = row.wow_delta
                    const prevEngaged = i > 0 ? chartData[i - 1]['Engaged'] : null
                    const pct = (delta != null && prevEngaged) ? (delta / prevEngaged) * 100 : null
                    const color = pct == null ? '#7a9aaa' : pct > 0 ? '#4ade80' : pct < 0 ? '#f87171' : '#7a9aaa'
                    const label = pct == null ? '—' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
                    return (
                      <td key={i} className="px-3 py-2 text-center font-medium" style={{ color }}>
                        {i === 0 ? '—' : label}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
