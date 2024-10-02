import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilRoom,
  cilTag,
  cilStar,
  cilDescription,
  cilEnvelopeOpen,
  cilBuilding,
  cilCommentSquare
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Room List',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Welcome Page',
    to: '/welcomepage',
    icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Background',
    to: '/background',
    icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Home Page',
    to: '/home-page',
    icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Live TV',
    to: '/live-tv',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Apps',
    to: '/feedback',
    icon: <CIcon icon={cilCommentSquare} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Facilities',
    to: '/facilities',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Message',
    to: '/messages',
    icon: <CIcon icon={cilEnvelopeOpen} customClassName="nav-icon" />,
  },


]

export default _nav
