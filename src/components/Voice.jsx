import React, { useEffect } from 'react'

export default function Voice({listenHandle}) {
  
  return (
    <div className=''>
         
        <div style={{
         zIndex: 1000,
         display: 'flex',
         alignItems: 'center',
         height: '10vh',
         width:"7%",
         position: 'fixed',
         top: "40%",
         left: "50%",
         right: 0,
         background: '#fff',
         justifyContent:"center"
      }}
      className="shadow-lg  mb-5 bg-body rounded"
      >
          <div>
           <img src='https://cdn.dribbble.com/users/2790075/screenshots/5571604/microphone_ui_animation.gif' className='voice-assistant' />
          </div>
     
      <div className='color-overlay d-flex align-items-end justify-content-center'>
      <i className="fa-solid fa-3x fa-power-off mb-3 text-dark" onClick={listenHandle}style={{zIndex:1001,cursor: "pointer" }}></i>
      </div>
        </div>
        
        
    </div>
  )
}
