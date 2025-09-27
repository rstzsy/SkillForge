import React from 'react'
import HeaderComponent from '../Header/Header'

const Default = ({ children, showHeader = true }) => {
  return (
    <div>
      {showHeader && <HeaderComponent />}
      {children}
    </div>
  )
}

export default Default