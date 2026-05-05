import { downloadChart } from '../utils/downloadChart'
import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LabelList, ResponsiveContainer,
} from 'recharts'
import { api7 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'

const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'

// Pastel palette — one per salary bucket, matches PRD style
const PASTEL = [
  '#a8d8ea', // light blue
  '#7ec8a4', // mint green
  '#aad4a0', // sage
  '#c3e6a0', // light green
  '#f7e08a', // yellow
  '#f0c27f', // amber
  '#f4a96a', // orange
  '#e88a8a', // salmon
  '#c9a0dc', // lavender
  '#b0c4de', // steel blue
  '#98d4c8', // teal
  '#d4b0a0', // dusty rose
]

// Strip "Salary: " prefix for cleaner x-axis labels
function shortLabel(bucket) {
  return bucket.replace('Salary: ', '')
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#061020', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: '#fff' }}>{label}</p>
      <p className="text-xs" style={{ color: payload[0]?.color }}>
        Count: <b>{payload[0]?.value?.toLocaleString()}</b>
      </p>
    </div>
  )
}

function CountLabel({ x, y, width, value }) {
  if (!value) return null
  return (
    <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="#ccc">
      {value?.toLocaleString()}
    </text>
  )
}

export default function SalaryExpectations() {
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
    api7(filters)
      .then(d => setData((d.series || []).filter(r => r.count > 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const chartData = (data || []).map(r => ({
    name:  shortLabel(r.salary_bucket),
    count: r.count,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Salary Expectations</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Salary expectation distribution from re-engaged applicants.</p>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        fields={['start_date', 'end_date', 'job_subfamily', 'clearance']}
          chartRef={chartRef} downloadFilename="salary-expectations"
      />

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a filter to view data.
        </div>
      )}

      {chartData.length > 0 && hasFilter && !loading && (
        <div ref={chartRef} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <div
            className="px-5 py-3 text-center text-sm font-semibold tracking-wider"
            style={{ background: '#061020', borderBottom: `1px solid ${BORDER}`, color: '#fff' }}
          >
            Salary
          </div>
          <div className="p-5" style={{ background: BG }}>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={chartData} margin={{ top: 24, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid vertical={false} stroke="#1a3040" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#8ab0be', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1a3a4a' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fill: '#8ab0be', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="count" name="Count" radius={[2,2,0,0]} barSize={36}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PASTEL[i % PASTEL.length]} />
                  ))}
                  <LabelList content={<CountLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
