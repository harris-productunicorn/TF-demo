import { downloadChart } from '../utils/downloadChart'
import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LabelList, ResponsiveContainer, Cell,
} from 'recharts'
import { api9 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'

const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'
const TEAL   = '#1AAFBF'
const PURPLE = '#a78bfa'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#061020', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: '#fff' }}>{label}</p>
      <p className="text-xs" style={{ color: payload[0]?.fill }}>
        Count: <b>{payload[0]?.value > 0 ? payload[0].value.toLocaleString() : '—'}</b>
      </p>
    </div>
  )
}

function CountLabel({ x, y, width, value, index, chartData }) {
  const hasData = chartData?.[index]?.hasData
  return (
    <text x={x + width + 8} y={y + 13} fontSize={11} fill="#e2e8f0" fontWeight="600">
      {hasData ? value.toLocaleString() : '—'}
    </text>
  )
}

export default function RecruiterHandoff() {
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
    api9(filters)
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const chartData = data ? [
    { name: 'SMS Sent',     value: data.sms_sent     ?? 0, color: TEAL,   hasData: data.sms_sent != null },
    { name: 'Link Clicked', value: data.link_clicked ?? 0, color: PURPLE, hasData: data.link_clicked != null },
  ] : []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Recruiter Handoff</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>SMS outreach sent and recruiter link engagement.</p>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        fields={['start_date', 'end_date', 'job_subfamily', 'clearance']}
          chartRef={chartRef} downloadFilename="recruiter-handoff"
      />

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a filter to view data.
        </div>
      )}

      {data && hasFilter && !loading && (
        <div ref={chartRef} className="rounded-lg p-5" style={{ background: BG, border: `1px solid ${BORDER}` }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 80, left: 20, bottom: 10 }}>
              <CartesianGrid horizontal={false} stroke="#1a3040" />
              <XAxis
                type="number"
                tick={{ fill: '#8ab0be', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#1a3a4a' }}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#8ab0be', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="value" barSize={28} radius={[0,2,2,0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.hasData ? entry.color : '#1a3a4a'} />
                ))}
                <LabelList content={(props) => <CountLabel {...props} chartData={chartData} />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
