import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../global/Footer/Footer'
import Navbar from '../global/Navbar/Navbar'

const Guest = () => {
  return (
    <>
        <Navbar />
        <Outlet />
        <Footer />
    </>
  )
}

export default Guest
