import React, { useEffect } from 'react'

export default function AnswerCall({callingUser,receieved,remoteId,myPeer,declineIncommingCall}) {
    
  return (
    <>
      <div className=' answerPanel position-relative'>
          <div className='d-flex justify-content-center'>
          <img src={callingUser.picture_url} className="card-img-top round-img big-round-pic mt-5"/>
          </div>
          <h3 className='text-center mt-3'>{callingUser.firstname +" "+ callingUser.lastname}</h3>
          <h3 className='text-center mt-3'>Incoming Call</h3>
          <div className='d-flex justify-content-between'>
          <div className=' d-flex justify-content-center align-items-center mt-4 answerCall' onClick={()=>receieved(myPeer)}><i className="fa-solid fa-2x fa-video bg-success round-img big-round-pic d-flex justify-content-center align-items-center text-white"></i></div>
          <div className=' d-flex justify-content-center align-items-center mt-4 declineCall' onClick={()=>declineIncommingCall()}><i className="fa-solid fa-2x fa-phone-slash  bg-danger round-img big-round-pic d-flex justify-content-center align-items-center text-white"></i></div>
          </div>

      </div>
    </>
  )
}
