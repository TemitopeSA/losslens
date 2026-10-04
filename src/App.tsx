import { AppStateProvider, useApp } from './state/AppState'
import { Sidebar, TopBar } from './components/Shell'
import { Toasts } from './components/Toasts'
import { IntegrationsPage, SalesforcePage } from './features/settings/Settings'
import { StudiesPage, StudyStudio } from './features/studies/Studies'
import { DealTimelinePage } from './features/deals/DealTimeline'
import { InterviewPage, RepositoryPage } from './features/repository/Repository'
import { WinLossPage } from './features/win-loss/WinLoss'
import { DashboardModals } from './features/win-loss/DashboardModals'
import { AskAIPanel } from './features/ask-ai/AskAIPanel'
import { AnalyticsPage, CandidatesPage, IncentivesPage } from './features/other/OtherPages'
import { TourButton, TourController, WelcomeModal } from './tour/Tour'

function CurrentView() {
  const { route } = useApp()
  switch (route) {
    case 'win-loss':
    case 'win-loss/deals':
      return <WinLossPage />
    case 'deal':
      return <DealTimelinePage />
    case 'studies':
      return <StudiesPage />
    case 'study':
      return <StudyStudio />
    case 'repository':
      return <RepositoryPage />
    case 'interview':
      return <InterviewPage />
    case 'candidates':
      return <CandidatesPage />
    case 'incentives':
      return <IncentivesPage />
    case 'analytics':
      return <AnalyticsPage />
    case 'settings':
      return <IntegrationsPage />
    case 'salesforce':
      return <SalesforcePage />
  }
}

function AppShell() {
  const { route } = useApp()
  return (
    <div className="flex h-full min-w-[1024px] overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main-scroll" className="print-root thin-scroll min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div key={route} className="anim-fade min-h-full pb-16">
            <CurrentView />
          </div>
        </main>
      </div>
      <AskAIPanel />
      <DashboardModals />
      <TourController />
      <WelcomeModal />
      <TourButton />
      <Toasts />
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  )
}
