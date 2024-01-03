import React from 'react'
import { Outlet } from 'react-router-dom'

const Protected = () => {
  return (
    <>  
    <Outlet />
    </>
  )
}

export default Protected
