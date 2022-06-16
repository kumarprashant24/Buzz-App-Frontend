import React from 'react'

export default function ProcessingCall({calltofriend,declineIncommingCall}) {
  return (
    <>
       <div className=' answerPanelUser position-relative'>
          <div className='d-flex justify-content-center'>
          <img src={calltofriend.profile_pic} className="card-img-top round-img big-round-pic mt-5"/>
          </div>
          <h3 className='text-center mt-3'>{calltofriend.firstname +" "+ calltofriend.lastname}</h3>
          <h3 className='text-center mt-3'>Waiting for response...</h3>
          <div className='d-flex justify-content-center mt-5'><img src='https://threearches2.com/wp-content/uploads/2017/05/tooltip_pulse.gif' style={{width:"200px",height:"200px"}}/></div>
          <div className='d-flex justify-content-between'>
          <div className=' d-flex justify-content-center align-items-center mt-4 declineCallUser' onClick={()=>declineIncommingCall()}><i className="fa-solid fa-2x fa-phone-slash  bg-danger round-img big-round-pic d-flex justify-content-center align-items-center text-white"></i></div>
          </div>

      </div>

    </>
  )
}
