import React from 'react'
import MessageEditor from './views/message'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Facility = React.lazy(() => import('./views/facility'))
const Message = React.lazy(() => import('./views/message'))
const WelcomePage =React.lazy(() => import('./views/welcomePage'))
const LiveTVPage =React.lazy(() => import('./views/liveTV'))
const BackgroundSettings = React.lazy(() => import('./views/background'))
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/facilities', name: 'Facility', element: Facility },
  { path: '/welcomepage', name: 'WelcomePage', element: WelcomePage },
  { path: '/messages', name: 'MessageEditor', element: MessageEditor },
  { path: '/live-tv', name: 'MessageEditor', element: LiveTVPage },
  { path: '/background', name: 'Background', element: BackgroundSettings },
]

export default routes
