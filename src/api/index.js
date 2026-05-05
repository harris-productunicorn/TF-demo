const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://poppied-overclever-elisha.ngrok-free.dev'

async function get(path, params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  const url = qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`
  const res = await fetch(url, { headers: { 'ngrok-skip-browser-warning': 'true' } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const json = await res.json()
  return json.data ?? json
}

export const api1  = (p) => get('/viz/program-overview',    p)
export const api2  = (p) => get('/viz/applicant-engagement', p)
export const api3  = (p) => get('/viz/week-over-week',       p)
export const api4  = (p) => get('/viz/candidates-by-lob',    p)
export const api5  = (p) => get('/viz/engagement-heatmap',   p)
export const api6  = (p) => get('/viz/subfamily-engagement', p)
export const api7  = (p) => get('/viz/salary-expectations',  p)
export const api8  = (p) => get('/viz/call-outcome-summary', p)
export const api9  = (p) => get('/viz/recruiter-handoff',    p)
export const api10 = (p) => get('/viz/job-funnel',           p)
