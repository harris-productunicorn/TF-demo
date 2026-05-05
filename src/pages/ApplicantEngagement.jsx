import { useState, useEffect, useRef } from 'react'
import { downloadChart } from '../utils/downloadChart'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LabelList, ResponsiveContainer,
} from 'recharts'
import { api2 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'

const PURPLE = '#a78bfa'
const WHITE  = '#f0c96e'
const TEAL   = '#1AAFBF'
const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'

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

function PctLabel({ x, y, width, value }) {
  if (value == null) return null
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={10} fill={TEAL}>
      {`${(value * 100).toFixed(0)}%`}
    </text>
  )
}

function CountLabel({ x, y, width, value }) {
  if (!value) return null
  return (
    <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={10} fill="#b0ccd6">
      {value?.toLocaleString()}
    </text>
  )
}

export default function ApplicantEngagement() {
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
    api2(filters)
      .then(d => setData((d.series || []).filter(r => r.re_engaged > 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const chartData = (data || []).map(r => ({
    name:            r.job_subfamily,
    'Outbound Call': r.contacted,
    'Engaged':       r.re_engaged,
    rate:            r.engagement_rate,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Applicant Engagement</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Candidate engagement across job subfamilies.</p>

      <FilterBar filters={filters} onChange={setFilters} fields={['start_date', 'end_date']} chartRef={chartRef} downloadFilename="applicant-engagement" />

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a date range to view data.
        </div>
      )}

      {chartData.length > 0 && !loading && (
        <div ref={chartRef} className="rounded-lg p-5" style={{ background: BG, border: `1px solid ${BORDER}` }}>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={chartData} margin={{ top: 30, right: 40, left: 10, bottom: 60 }}>
              <CartesianGrid vertical={false} stroke="#1a3040" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8ab0be', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#1a3a4a' }}
                angle={-15}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                yAxisId="count"
                tick={{ fill: '#8ab0be', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              />
              <YAxis
                yAxisId="rate"
                orientation="right"
                tick={{ fill: TEAL, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
              <Legend
                wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => <span style={{ color: '#7a9aaa' }}>{v}</span>}
              />
              <Bar yAxisId="count" dataKey="Outbound Call" fill={PURPLE} barSize={28} radius={[2,2,0,0]}>
                <LabelList content={<CountLabel />} />
              </Bar>
              <Bar yAxisId="count" dataKey="Engaged" fill={WHITE} barSize={28} radius={[2,2,0,0]}>
                <LabelList content={<CountLabel />} />
              </Bar>
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="rate"
                name="Engagement Rate"
                stroke={TEAL}
                strokeWidth={2}
                dot={{ fill: TEAL, r: 4 }}
                activeDot={{ r: 6 }}
              >
                <LabelList content={<PctLabel />} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
