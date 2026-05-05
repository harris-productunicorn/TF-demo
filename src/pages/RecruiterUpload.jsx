import { useState, useEffect, useRef } from 'react'
import { fmtDate } from '../utils/fmtDate'

const BASE   = ''
const BG     = '#0d1f2d'
const BORDER = '#1a3a4a'
const TEAL   = '#1AAFBF'

const EMPTY_FORM = {
  record_id: '', candidate_name: '', sector_name: '', sent_date: '',
  link_clicked: false, interview_date: '', hire_date: '', recruiter_name: '', notes: '',
}

async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function apiPostForm(path, formData) {
  const res = await fetch(`${BASE}${path}`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function apiGet(path, params = {}) {
  const qs = Object.entries(params).filter(([,v]) => v).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  const res = await fetch(qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

function Field({ label, name, type = 'text', value, onChange, small }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: '#7a9aaa' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, type === 'checkbox' ? e.target.checked : e.target.value)}
        className="rounded-lg px-3 py-2 text-sm outline-none"
        style={{ background: '#061020', border: `1px solid ${BORDER}`, color: '#e2e8f0', width: small ? 140 : '100%' }}
      />
    </div>
  )
}

export default function RecruiterUpload() {
  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg]   = useState(null)

  const [csvFile, setCsvFile]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const fileRef = useRef()

  const [records, setRecords]   = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loadingRecs, setLoadingRecs] = useState(false)

  const PAGE_SIZE = 50

  function loadRecords(p = 1) {
    setLoadingRecs(true)
    apiGet('/recruiter-upload/records', { page: p, page_size: PAGE_SIZE })
      .then(d => { setRecords(d.data || []); setTotal(d.total || 0); setPage(p) })
      .catch(() => {})
      .finally(() => setLoadingRecs(false))
  }

  useEffect(() => { loadRecords(1) }, [])

  function handleField(name, value) {
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMsg(null)
    apiPost('/recruiter-upload/entry', form)
      .then(() => {
        setSubmitMsg({ ok: true, text: 'Record saved.' })
        setForm({ ...EMPTY_FORM })
        loadRecords(1)
      })
      .catch(err => setSubmitMsg({ ok: false, text: err.message }))
      .finally(() => setSubmitting(false))
  }

  function doUpload(file) {
    if (!file) return
    setUploading(true)
    setUploadMsg(null)
    const fd = new FormData()
    fd.append('file', file)
    apiPostForm('/recruiter-upload/csv', fd)
      .then(d => {
        setUploadMsg({ ok: true, text: `Imported ${d.inserted ?? d.rows_inserted ?? '?'} rows.` })
        setCsvFile(null)
        if (fileRef.current) fileRef.current.value = ''
        loadRecords(1)
      })
      .catch(err => setUploadMsg({ ok: false, text: err.message }))
      .finally(() => setUploading(false))
  }

  function handleFileChange(e) {
    const file = e.target.files[0] || null
    setCsvFile(file)
    if (file) doUpload(file)
  }

  function handleUploadClick() {
    if (fileRef.current) fileRef.current.click()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>Recruiter Upload</h1>
      <p className="text-sm mb-6" style={{ color: '#7a9aaa' }}>Upload recruiter interview and hire data to power the Job Funnel.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* CSV Upload */}
        <div className="rounded-lg p-5" style={{ background: BG, border: `1px solid ${BORDER}` }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#fff' }}>CSV Upload</h2>
          <p className="text-xs mb-3" style={{ color: '#7a9aaa' }}>
            Columns: record_id, candidate_name, sector_name, sent_date, link_clicked, interview_date, hire_date, recruiter_name, notes
          </p>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: uploading ? '#1a3a4a' : TEAL,
                color: uploading ? '#4a6070' : '#fff',
                cursor: uploading ? 'default' : 'pointer',
              }}
            >
              {uploading ? 'Uploading…' : 'Upload CSV'}
            </button>
            {csvFile && !uploading && (
              <span className="text-xs" style={{ color: '#8ab0be' }}>{csvFile.name}</span>
            )}
          </div>
          {uploadMsg && (
            <p className="text-xs mt-2" style={{ color: uploadMsg.ok ? '#4ade80' : '#f87171' }}>
              {uploadMsg.text}
            </p>
          )}
        </div>

        {/* Manual Entry */}
        <div className="rounded-lg p-5" style={{ background: BG, border: `1px solid ${BORDER}` }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#fff' }}>Manual Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Record ID"      name="record_id"      value={form.record_id}      onChange={handleField} />
              <Field label="Candidate Name" name="candidate_name" value={form.candidate_name} onChange={handleField} />
              <Field label="Sector"         name="sector_name"    value={form.sector_name}    onChange={handleField} />
              <Field label="Recruiter Name" name="recruiter_name" value={form.recruiter_name} onChange={handleField} />
              <Field label="Sent Date"      name="sent_date"      value={form.sent_date}      onChange={handleField} type="date" />
              <Field label="Interview Date" name="interview_date" value={form.interview_date} onChange={handleField} type="date" />
              <Field label="Hire Date"      name="hire_date"      value={form.hire_date}      onChange={handleField} type="date" />
              <div className="flex flex-col gap-1 justify-center">
                <label className="text-xs" style={{ color: '#7a9aaa' }}>Link Clicked</label>
                <input
                  type="checkbox"
                  checked={form.link_clicked}
                  onChange={e => handleField('link_clicked', e.target.checked)}
                  className="w-4 h-4 mt-1"
                />
              </div>
            </div>
            <Field label="Notes" name="notes" value={form.notes} onChange={handleField} />
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold w-full"
              style={{ background: TEAL, color: '#fff', cursor: submitting ? 'default' : 'pointer' }}
            >
              {submitting ? 'Saving…' : 'Save Record'}
            </button>
            {submitMsg && (
              <p className="text-xs mt-2 text-center" style={{ color: submitMsg.ok ? '#4ade80' : '#f87171' }}>
                {submitMsg.text}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#061020', borderBottom: `1px solid ${BORDER}` }}>
          <span className="text-sm font-semibold" style={{ color: '#fff' }}>
            Records {total > 0 ? `(${total.toLocaleString()})` : ''}
          </span>
          <button onClick={() => loadRecords(1)} className="text-xs" style={{ color: TEAL }}>Refresh</button>
        </div>

        {loadingRecs ? (
          <div className="p-6 text-sm text-center" style={{ color: '#4a6070', background: BG }}>Loading…</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-sm text-center" style={{ color: '#4a6070', background: BG }}>No records yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ background: BG }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Candidate', 'Sector', 'Recruiter', 'Sent Date', 'Link Clicked', 'Interview Date', 'Hire Date', 'Notes'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider" style={{ color: '#7a9aaa', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? BG : '#061020', borderBottom: `1px solid #0d2a3a` }}>
                      <td className="px-4 py-2" style={{ color: '#e2e8f0' }}>{r.candidate_name || '—'}</td>
                      <td className="px-4 py-2" style={{ color: '#e2e8f0' }}>{r.sector_name || '—'}</td>
                      <td className="px-4 py-2" style={{ color: '#e2e8f0' }}>{r.recruiter_name || '—'}</td>
                      <td className="px-4 py-2" style={{ color: '#8ab0be' }}>{fmtDate(r.sent_date)}</td>
                      <td className="px-4 py-2 text-center" style={{ color: r.link_clicked ? '#4ade80' : '#4a6070' }}>
                        {r.link_clicked ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-2" style={{ color: '#8ab0be' }}>{fmtDate(r.interview_date)}</td>
                      <td className="px-4 py-2" style={{ color: '#8ab0be' }}>{fmtDate(r.hire_date)}</td>
                      <td className="px-4 py-2" style={{ color: '#7a9aaa', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3" style={{ background: '#061020', borderTop: `1px solid ${BORDER}` }}>
                <span className="text-xs" style={{ color: '#7a9aaa' }}>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadRecords(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded text-xs"
                    style={{ background: page > 1 ? '#1a3a4a' : '#0d2030', color: page > 1 ? '#e2e8f0' : '#4a6070' }}
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => loadRecords(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded text-xs"
                    style={{ background: page < totalPages ? '#1a3a4a' : '#0d2030', color: page < totalPages ? '#e2e8f0' : '#4a6070' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
