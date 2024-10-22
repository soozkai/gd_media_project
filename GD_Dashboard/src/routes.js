import React from 'react'
import MessageEditor from './views/message'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Facility = React.lazy(() => import('./views/facility'))
const Message = React.lazy(() => import('./views/message'))
const WelcomePage = React.lazy(() => import('./views/welcomePage'))
const BackgroundSettings = React.lazy(() => import('./views/background'))
const Channel = React.lazy(() => import('./views/channel'))
const Group = React.lazy(() => import('./views/group')) // Added Group component
const App = React.lazy(() => import('./views/App'));
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/facilities', name: 'Facility', element: Facility },
  { path: '/welcomepage', name: 'WelcomePage', element: WelcomePage },
  { path: '/messages', name: 'MessageEditor', element: MessageEditor },
  { path: '/background', name: 'Background', element: BackgroundSettings },
  { path: '/channel', name: 'Channel', element: Channel },
  { path: '/group', name: 'Group', element: Group }, // Added Group route
  { path: '/apps', name: 'App', element: App },
]

export default routes
