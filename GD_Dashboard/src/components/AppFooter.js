import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://gd-strem.com" target="_blank" rel="noopener noreferrer">
          GD Strem
        </a>
        <span className="ms-1">&copy; 2024 GD Strem.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
