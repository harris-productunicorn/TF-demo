import { useState, useEffect } from 'react'
import ProgramOverview from './pages/ProgramOverview'
import ApplicantEngagement from './pages/ApplicantEngagement'
import WeekOverWeek from './pages/WeekOverWeek'
import CandidatesByLOB from './pages/CandidatesByLOB'
import EngagementHeatmap from './pages/EngagementHeatmap'
import SubfamilyEngagement from './pages/SubfamilyEngagement'
import SalaryExpectations from './pages/SalaryExpectations'
import CallOutcomeSummary from './pages/CallOutcomeSummary'
import RecruiterHandoff from './pages/RecruiterHandoff'
import JobFunnel from './pages/JobFunnel'
import RecruiterUpload from './pages/RecruiterUpload'
import DataTable from './pages/DataTable'

const NAV = [
  { id: 'api1',   label: 'Program Overview' },
  { id: 'api2',   label: 'Applicant Engagement' },
  { id: 'api3',   label: 'Week over Week' },
  { id: 'api4',   label: 'Candidates by LOB' },
  { id: 'api5',   label: 'Engagement Heatmap' },
  { id: 'api6',   label: 'Subfamily × Clearance' },
  { id: 'api7',   label: 'Salary Expectations' },
  { id: 'api8',   label: 'Call Outcome Summary' },
  { id: 'api9',   label: 'Recruiter Handoff' },
  { id: 'api10',  label: 'Job Funnel' },
  { id: 'upload', label: 'Recruiter Upload' },
  { id: 'table',  label: 'Data Table' },
]

const PAGES = {
  api1:   ProgramOverview,
  api2:   ApplicantEngagement,
  api3:   WeekOverWeek,
  api4:   CandidatesByLOB,
  api5:   EngagementHeatmap,
  api6:   SubfamilyEngagement,
  api7:   SalaryExpectations,
  api8:   CallOutcomeSummary,
  api9:   RecruiterHandoff,
  api10:  JobFunnel,
  upload: RecruiterUpload,
  table:  DataTable,
}

export default function App() {
  const [active, setActive]       = useState('api1')
  const [sidebarOpen, setSidebar] = useState(false)
  const Page = PAGES[active]

  useEffect(() => {
    const close = () => { if (window.innerWidth >= 768) setSidebar(false) }
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  const go = (id) => { setActive(id); setSidebar(false) }

  return (
    <div className="flex min-h-screen" style={{ background: '#0a1628' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setSidebar(false)} />
      )}

      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-56 flex flex-col py-6 px-3 gap-1 transition-transform duration-250 md:relative md:translate-x-0 md:shrink-0"
        style={{
          background: '#061020',
          borderRight: '1px solid #0d4a50',
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
      >
        <style>{`@media(max-width:767px){aside{transform:${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}!important}}`}</style>

        <div className="px-3 mb-6 flex items-center justify-between">
          <div className="text-lg font-bold" style={{ color: '#1AAFBF' }}>Talent Frequency</div>
          <button className="md:hidden" onClick={() => setSidebar(false)} style={{ color: '#7a9aaa', fontSize: 18 }}>✕</button>
        </div>

        {NAV.map(n => (
          <button key={n.id} onClick={() => go(n.id)}
            className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: active === n.id ? '#1AAFBF' : 'transparent',
              color:      active === n.id ? '#fff'    : PAGES[n.id] ? '#b0ccd6' : '#4a6070',
              cursor: PAGES[n.id] ? 'pointer' : 'default',
            }}>
            {n.label}
            {!PAGES[n.id] && <span className="ml-2 text-xs" style={{ color: '#0d3040' }}>soon</span>}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto flex flex-col">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30 shrink-0"
          style={{ background: '#061020', borderBottom: '1px solid #0d4a50' }}>
          <button onClick={() => setSidebar(true)} style={{ color: '#1AAFBF', fontSize: 24, lineHeight: 1 }}>☰</button>
          <span className="text-sm font-bold" style={{ color: '#1AAFBF' }}>Talent Frequency</span>
        </div>

        <div className="flex-1 p-4 md:p-8 min-w-[1400px] md:min-w-0">
          {Page
            ? <Page />
            : <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>Coming soon</div>
          }
        </div>
      </main>
    </div>
  )
}
