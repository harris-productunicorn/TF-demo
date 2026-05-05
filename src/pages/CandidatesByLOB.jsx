import { useState, useEffect, useRef } from 'react'
import { downloadChart } from '../utils/downloadChart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LabelList, ResponsiveContainer,
} from 'recharts'
import { api4 } from '../api'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'

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
          {p.name}: <b>{p.value?.toLocaleString()}</b>
        </p>
      ))}
    </div>
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

export default function CandidatesByLOB() {
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
    api4(filters)
      .then(d => setData((d.series || []).filter(r => r.engaged > 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const chartData = (data || []).map(r => ({
    name:    r.sector,
    Engaged: r.engaged,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Candidates by LOB</h1>
        
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Engaged candidates by Line of Business.</p>

      <FilterBar filters={filters} onChange={setFilters} fields={['start_date', 'end_date']} chartRef={chartRef} downloadFilename="candidates-by-lob" />

      {loading && <Loader />}
      {error   && <p className="text-sm" style={{ color: '#e74c3c' }}>{error}</p>}
      {!hasFilter && !loading && (
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
          Select a date range to view data.
        </div>
      )}

      {chartData.length > 0 && hasFilter && !loading && (
        <div ref={chartRef} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <div
            className="px-5 py-3 text-center text-sm font-semibold tracking-wider"
            style={{ background: '#061020', borderBottom: `1px solid ${BORDER}`, color: '#fff' }}
          >
            Engaged Candidates
          </div>
          <div className="p-5" style={{ background: BG }}>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={chartData} margin={{ top: 24, right: 20, left: 0, bottom: 80 }}>
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
                <Bar dataKey="Engaged" fill={TEAL} barSize={30} radius={[2,2,0,0]}>
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
