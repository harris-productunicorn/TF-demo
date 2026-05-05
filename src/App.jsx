import { useState } from 'react'
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
  const [active, setActive] = useState('api1')
  const Page = PAGES[active]

  return (
    <div className="flex min-h-screen" style={{ background: '#0a1628' }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col py-6 px-3 gap-1"
        style={{ background: '#061020', borderRight: '1px solid #0d4a50' }}>
        <div className="px-3 mb-6">
          <div className="text-lg font-bold" style={{ color: '#1AAFBF' }}>Talent Frequency</div>
        </div>
        {NAV.map(n => (
          <button key={n.id}
            onClick={() => setActive(n.id)}
            className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: active === n.id ? '#1AAFBF' : 'transparent',
              color: active === n.id ? '#ffffff' : PAGES[n.id] ? '#b0ccd6' : '#4a6070',
              cursor: PAGES[n.id] ? 'pointer' : 'default',
            }}>
            {n.label}
            {!PAGES[n.id] && <span className="ml-2 text-xs" style={{ color: '#0d3040' }}>soon</span>}
          </button>
        ))}
      </aside>

      {/* Main — light tone */}
      <main className="flex-1 p-8 overflow-auto">
        {Page
          ? <Page />
          : <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#4a6070' }}>
              Coming soon
            </div>
        }
      </main>
    </div>
  )
}
