import React from 'react'
import HeaderComponent from '../Header/Header'
import FooterComponent from '../Footer/Footer'

const Default = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div>
      {showHeader && <HeaderComponent />}
      {children}
      {showFooter && <FooterComponent />}
    </div>
  )
}

export default Default