import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import ScrollToBottom from "react-scroll-to-bottom";
import { picChat } from "../services/userservice";
import { Howl } from "howler";
import io from "socket.io-client";
import { getSpecificUser } from "../services/userservice";
import { API_URL } from "../config";
import FullPageSpinner from "./FullPageSpinner";
import Voice from "./Voice";
import AnswerCall from "./AnswerCall";
import ProcessingCall from "./ProcessingCall";
const socketURL = API_URL.split("/api");
const socket = io.connect(socketURL[0]);
let room = "";
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();
mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-IN";

function Messenger({ user }) {
  const [isListening, setIsListening] = useState(false);
  const [isAnswered, setIsAnswered] = useState(true);
  const [processingCall, setProcessingCall] = useState(false);
  const [peerid, setPeerid] = useState("");
  const [uniquePeer, setUniquePeer] = useState("");
  const [userEnd, setUserEnd] = useState({});
  const [answerCall, setAnswerCall] = useState(false);
  const [onVideo, setOnVideo] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [preview, setPreview] = useState(false);
  const [disable, setDisable] = useState(true);
  let [sendPic, setSendPic] = useState("");
  let [conversation, setConversation] = useState([]);
  const [changeUser, setChangeUser] = useState(true);
  const [box, setBox] = useState(false);
  const [lastMsg, setLastMsg] = useState([]);
  const [columnOne, setColumnOne] = useState(true);
  const [columnTwo, setColumnTwo] = useState(true);
  const [chk, setChk] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const photoRef = useRef(null);
  const [personDetails, setPersonDetails] = useState({
    profile_pic: "",
    firstname: "",
    lastname: "",
    recieverId: "",
  });

  const [myPeerId, setMyPeerId] = useState("");
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);

  //  ========================================================= Ringtone  setup [start] ==================================================================
  const tone = require("../tone/messenger.mp3");
  const ringing = require("../tone/incoming_call.mp3");
  const callMySound = (src) => {
    const sound = new Howl({
      src,
      html5: true,
     
    });
    sound.play();
  };
    const IncomingCall = new Howl({
      src:ringing,
      html5: true,
      loop:true
    });

  //  ========================================================= Ringtone setup [end] ==================================================================

  //  ======================================================= for Responsive [start] ====================================================================
  const backbtn = () => {
    setColumnTwo(false);
    setColumnOne(true);
  };
  //  ======================================================= for Responsive [end] ====================================================================

  //  ================================================== selecting users in friends list  and joining room [start] ========================================
  const selectUser = (
    personId,
    userId,
    personPic,
    personFirstName,
    personLastName
  ) => {
    if (window.matchMedia("(max-width: 700px)").matches) {
      setColumnTwo(true);
      setColumnOne(false);
    }
    setMessageInput("");
    setDisable(true);
    setBox(true);
    setTyping(false);
    let count = 0;
    setLastMsg([]);
    getSpecificUser(user._id).then((res) => {
      setChk(res.data.conversations);
      res.data.conversations.map((element, index) => {
        if (element.recieverId === personId) {
          setChangeUser(true);
          setConversation(element.chats);
        } else {
          count++;
        }
        if (count === user.conversations.length) {
          setConversation([]);
        }
      });
    });

    setPersonDetails({
      profile_pic: personPic,
      firstname: personFirstName,
      lastname: personLastName,
      recieverId: personId,
    });

    if (personId > userId) {
      room = personId + "-" + userId;
    } else {
      room = userId + "-" + personId;
    }
    socket.emit("join_room", { room: room, peerid: peerid, mypeer: myPeerId });
  };

  //  ================================================== selecting users in friends list  and joining room [end] ========================================

  // ===================================================== this is for when user recieve new message [start]=================================================
  socket.off("recieve_message").on("recieve_message", (data) => {
    setTyping(false);
    let duplicate = data;
    if (data.senderId === user._id) {
    } else {
      console.log("executed");
      duplicate.float = false;
      callMySound(tone);
    }
    setLastMsg(data);
    setChk(user.conversations);
    setConversation([...conversation, duplicate]);

    setMessageInput("");
    socket.off();
  });
  // ===================================================== this is for when user recieve new message [end] =================================================

  // ===================================================== this is for getting peer id for video call [start] =================================================
  socket.on("getPeerId", (data) => {
    data.peerid = myPeerId;
    setPeerid(data.mypeer);
    socket.emit("transfer", data);
  });
  socket.on("takeAway", (data) => {
    if (data.peerid === myPeerId) {
      setUniquePeer(data.mypeer);
    } else {
      setUniquePeer(data.peerid);
    }
  });
  // ===================================================== this is for getting peer id for video call [end] =================================================

  // =================================================== for sending chat to anyone [start]===========================================================
  const sendChat = (e) => {
    e.preventDefault();
    setTyping(false);
    let today = new Date();
    let hours = today.getHours();
    let min = today.getMinutes().toString();
    if (min.length === 1) min = "0" + today.getMinutes();

    let time = hours > 12 ? "PM" : "AM";
    if (hours > 12) {
      hours = hours - 12;
    }
    let current_time = hours + ":" + min + " " + time;
    if (sendPic === "") {
      socket.emit("send_message", {
        message: messageInput,
        room: room,
        senderId: user._id,
        recieverId: personDetails.recieverId,
        time: current_time,
        float: true,
      });
    } else {
      socket.emit("send_message", {
        message: messageInput,
        pic: sendPic,
        room: room,
        senderId: user._id,
        recieverId: personDetails.recieverId,
        time: current_time,
        float: true,
      });
    }
    setSendPic("");
    setPreview(false);
    setDisable(true);
    setIsListening(false);
    setMessageInput("");
    socket.off();
  };

  // =================================================== for sending chat to anyone [end]===========================================================

  // =================================================== for preview setup of sending picture [start]================================================

  const inputpic = async (e) => {
    setLoading(true);
    setDisable(false);
    const file = e.target.files[0];
    console.log(file);
    await picChat(user._id, file).then((res) => {
      setSendPic(res.data.secure_url);
      setPreview(true);
      setLoading(false);
    });
  };
  const OnInputChange = (e) => {
    if (e.target.value.length == 0) {
      setDisable(true);
    } else {
      setDisable(false);
    }

    setMessageInput(e.target.value);

    socket.emit("typing", "Typing...");
  };
  socket.on("recieve_signal", (text) => {
    setTyping(true);
  });

  const cancelPreview = () => {
    setSendPic("");
    setPreview(false);
  };
  useEffect(() => {
    setChk(user.conversations);
  }, []);
  // =================================================== for preview setup of sending picture [end]================================================

  //=================================================== Voice Recognition Setup [start]=============================================================

  useEffect(() => {
    handleListen();
  }, [isListening]);

  const handleListen = () => {
    if (isListening) {
      mic.start();
      mic.onend = () => {
        mic.start();
      };
    } else {
      mic.stop();
      mic.onend = () => {};
    }
    mic.onstart = () => {};
    mic.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setMessageInput(transcript);
      setDisable(false);
      mic.onerror = (e) => {};
    };
  };

  const switchListening = () => setIsListening((prev) => !prev);
  //=================================================== Voice Recognition Setup [end]=============================================================

  // ==================================================video calling setup [start]============================================

  const declineCall = () => {
    socket.emit("disconnect-call", user);
  };
  socket.on("disconnection-both", (data) => {
    let userVideo = document.getElementsByClassName("remoteVideoBox")[0];
    let myvideo = document.getElementsByClassName("myVideoBox")[0];
    if (userVideo.srcObject === null) {
      myvideo.srcObject.getTracks()[0].stop();
    } else if (myvideo.srcObject === null) {
      userVideo.srcObject.getTracks()[0].stop();
    } else {
      userVideo.srcObject.getTracks()[0].stop();
      myvideo.srcObject.getTracks()[0].stop();
    }
    setProcessingCall(false);
    setOnVideo(false);
    setChangeUser(true);
    setIsAnswered(true);
  });

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setMyPeerId(id);
    });

    peer.on("call", (call) => {
      setChangeUser(false);
      setOnVideo(true);
      var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true }, (mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        call.answer(mediaStream);
        call.on("stream", function (remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      });
    });

    peerInstance.current = peer;
  }, []);

  const call = () => {
    setIsAnswered(false);
    setProcessingCall(true);
    socket.emit("video-calling", user);
  };
  const acceptVideoCall = (remotePeerId) => {
    IncomingCall.stop();
    setAnswerCall(false);
    setOnVideo(true);
    setIsAnswered(true);
   
    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia({ video: true }, (mediaStream) => {
      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play();

      const call = peerInstance.current.call(remotePeerId, mediaStream);

      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play();
      });
    });
    socket.emit('connection-both',{})
  };

  socket.off("accept-video").on("accept-video", (data) => {
  
    setUserEnd(data);
    setAnswerCall(true);
    setChangeUser(false);
    setIsAnswered(false);
    IncomingCall.play();
  
  });

  const declineIncommingCall = () => {
    socket.emit('call-decline',{})
  };
  socket.on('call-rejected',(data)=>{
    IncomingCall.stop();
    setProcessingCall(false);
    setOnVideo(false);
    setChangeUser(true);
    setIsAnswered(true);
    setAnswerCall(false);
  })
  socket.on('remove-call-panel',(data)=>{
    IncomingCall.stop();
    setProcessingCall(false);
    setOnVideo(true);
    setIsAnswered(true);
  })
  // ==================================================video calling [end] ============================================

  return (
    <div>
      {loading ? <FullPageSpinner></FullPageSpinner> : ""}
      {isListening ? <Voice listenHandle={switchListening}></Voice> : ""}
      <div className="container bg-white margin-top">
        <div className="row">
          {columnOne ? (
            <div
              className="col-md-4 pt-5 px-0 shadow"
              style={{ borderRight: "5px solid #ecebeb" }}
            >
              <h5 className="mb-3 mx-4 chat-list border-bottom">Messages</h5>

              <div style={{ height: "70vh", overflow: "auto" }}>
                {user.friends.myFriends.map((data) => (
                  <div
                    className="d-flex align-items-center my-1 bg-light   py-3"
                    onClick={() => {
                      selectUser(
                        data._id,
                        user._id,
                        data.picture_url,
                        data.firstname,
                        data.lastname
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="mx-4 d-flex   w-100 ">
                      <div className="d-flex align-items-center">
                        {data.picture_url ? (
                          <img
                            src={data.picture_url}
                            className="card-img-top medium-round-pic round-img "
                            alt="..."
                          />
                        ) : (
                          <i
                            className="fa-solid fa-user fa-2x  card-img-top medium-round-pic round-img round-img text-success d-flex justify-content-center align-items-center"
                            style={{ backgroundColor: "#F0F2F7" }}
                          ></i>
                        )}
                      </div>

                      <div className=" w-100 d-flex flex-column ms-2 border-bottom ">
                        <h5 className="m-0 ms-2 ">
                          {data.firstname + " " + data.lastname}
                        </h5>
                        <span className="my-1 ms-2">
                          {data._id === lastMsg.recieverId ||
                          data._id === lastMsg.senderId
                            ? lastMsg.message.substring(0, 25)
                            : chk.map((e) => {
                                if (data._id === e.recieverId) {
                                  const str =
                                    e.chats[e.chats.length - 1].message;
                                  return str.substring(0, 25);
                                }
                              })}
                        </span>
                      </div>

                      <span className="w-50 text-end border-bottom time ">
                        {data._id === lastMsg.recieverId ||
                        data._id === lastMsg.senderId
                          ? lastMsg.time
                          : chk.map((e) => {
                              if (data._id === e.recieverId) {
                                return e.chats[e.chats.length - 1].time;
                              }
                            })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            ""
          )}

          {columnTwo ? (
            <div className="col-md-8 px-0 bg-light   bg-danger justify-content-between  position-relative high">
              {box ? (
                <div className="chat-box" style={{ height: "100%" }}>
                  {isAnswered ? (
                    <div className="chat" id="chatBox">
                      <div className="shadow-lg p-2 bg-body rounded head">
                        {personDetails.firstname === "" ? (
                          ""
                        ) : (
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex ">
                              <div
                                className=" align-items-center back-btn"
                                onClick={backbtn}
                              >
                                <i className="fa-solid fa-arrow-left fa-2x me-2 text-white"></i>
                              </div>
                              {personDetails.profile_pic === undefined ? (
                                <i className="fa-solid fa-user fa-2x card-img-top medium-round-pic round-img bg-warning d-flex justify-content-center align-items-center"></i>
                              ) : (
                                <img
                                  src={personDetails.profile_pic}
                                  alt=""
                                  className="card-img-top round-img medium-round-pic"
                                />
                              )}

                              <div className="d-flex align-items-center  fw-bolder ms-2 fs-5">
                                {personDetails.firstname +
                                  " " +
                                  personDetails.lastname}
                              </div>
                            </div>

                            <div style={{ cursor: "pointer" }}>
                              <i
                                className="fa-solid font-size fa-video me-3 text-white float-end"
                                onClick={() => call()}
                              ></i>
                            </div>
                          </div>
                        )}
                      </div>
                      <div></div>

                      <div className="position-relative">
                        <div
                          className="position-relative "
                          style={{ height: "100%" }}
                        >
                          {onVideo ? (
                            <>
                              <video
                                allow=""
                                ref={remoteVideoRef}
                                className="remoteVideoBox videoPanel"
                              ></video>
                              <video
                                ref={currentUserVideoRef}
                                className="position-absolute top-0 start-0 w-25 myVideoBox myVideo"
                              ></video>
                            </>
                          ) : (
                            ""
                          )}
                        </div>

                        {onVideo ? (
                          <div
                            className=" d-flex justify-content-center align-items-center mt-4 decline"
                            onClick={declineCall}
                          >
                            <i className="fa-solid  fa-phone-slash call-end bg-danger round-img medium-round-pic d-flex justify-content-center align-items-center text-white"></i>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>

                      {changeUser ? (
                        <ScrollToBottom className="scroll-bottom little-padding ">
                          {conversation.map((element) => {
                            return (
                              <>
                                <ChatBubble
                                  my={element.float}
                                  message={element.message}
                                  typing={typing}
                                  chatPic={"pic" in element ? element.pic : ""}
                                  name={
                                    element.float
                                      ? `You`
                                      : personDetails.firstname +
                                        " " +
                                        personDetails.lastname
                                  }
                                  time={element.time}
                                  pic={
                                    element.float
                                      ? user.picture_url
                                      : personDetails.profile_pic
                                  }
                                />
                              </>
                            );
                          })}
                          {typing ? (
                            <ChatBubble
                              my={false}
                              message="Typing..."
                              chatPic=""
                              name={
                                personDetails.firstname +
                                " " +
                                personDetails.lastname
                              }
                              time=""
                              pic={personDetails.profile_pic}
                            />
                          ) : (
                            ""
                          )}
                        </ScrollToBottom>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    ""
                  )}

                  {answerCall ? (
                    <AnswerCall
                      callingUser={userEnd}
                      receieved={acceptVideoCall}
                      remoteId={peerid}
                      myPeer={uniquePeer}
                      declineIncommingCall={declineIncommingCall}
                    ></AnswerCall>
                  ) : (
                    ""
                  )}
                  {processingCall ? (
                    <ProcessingCall
                      calltofriend={personDetails}
                      declineIncommingCall={declineIncommingCall}
                    ></ProcessingCall>
                  ) : (
                    ""
                  )}

                  <div className="chatinput p-0 m-0">
                    <div className="input-group input-group-lg">
                      {preview ? (
                        <div className="card  ms-3 mb-1 preview rounded-3">
                          <div className="card-body position-relative">
                            <img
                              className="rounded-3"
                              ref={photoRef}
                              src={sendPic}
                              style={{ width: "200px", height: "200px" }}
                            />
                            <div
                              className="bg-danger round-img  small-round-pic d-flex justify-content-center align-items-center position-absolute top-0 end-0"
                              onClick={cancelPreview}
                            >
                              <i className="fa-solid text-white fa-xmark"></i>
                            </div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                      {changeUser ? (
                        <div className="d-flex w-100 mb-2 mt-3">
                          <div className="d-flex w-100 position-relative">
                            <input
                              type="text"
                              className="form-control rounded-pill ms-2 "
                              placeholder="Your message.."
                              autoComplete="off"
                              value={messageInput}
                              onChange={(e) => OnInputChange(e)}
                            />

                            <div className="d-flex align-items-center position-absolute end-0 slick-margin ">
                              <div
                                className=" d-flex align-items-center"
                                onClick={() => switchListening()}
                                style={{ cursor: "pointer" }}
                              >
                                {isListening ? (
                                  <i className="fa-solid font-size text-danger fa-microphone bg-white"></i>
                                ) : (
                                  <i className="fa-solid font-size text-success ps-2 bg-white fa-microphone"></i>
                                )}
                              </div>
                              <input
                                type="file"
                                className="gallery  me-2 bg-white"
                                onChange={(e) => inputpic(e)}
                              />
                            </div>
                          </div>
                          <button
                            className="border-0 ms-2  rounded-circle bg-success d-flex justify-content-center p-1 me-2"
                            disabled={disable}
                            onClick={sendChat}
                            style={{ cursor: "pointer" }}
                          >
                            {disable ? (
                              <i className="fa-solid fa-2x fa-paper-plane  round-img d-flex justify-content-center align-items-center p-2"></i>
                            ) : (
                              <i className="fa-solid fa-2x fa-paper-plane text-white round-img d-flex justify-content-center align-items-center p-2"></i>
                            )}
                          </button>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className=" justify-content-center flex-column empty-conversation ">
                  <img
                    src="https://ssl.gstatic.com/dynamite/images/new_chat_room_1x.png"
                    className=""
                  />
                  <h3>Select a conversation</h3>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

export default Messenger;

function ChatBubble({ my, message, chatPic, name, time, pic }) {
  if (!pic) {
    pic = require("../images/blank-profile.png");
  }
  return (
    <div className={`d-flex my-2 chatbubble ${my && "myMessage"}`}>
      {!my && (
        <img
          src={pic}
          className="card-img-top round-img"
          alt="pic"
          style={{
            width: "40px",
            height: "40px",
          }}
        />
      )}
      <div className="flex-column px-2 my-1">
        <div className="d-flex flex-column bubbletext">
          {message === "Typing..." ? (
            <img
              className="typing"
              src="http://leadfunnel.co.in/Livechat/public/img/loading.gif"
            />
          ) : (
            <p className="m-0">{message}</p>
          )}

          <div>
            {chatPic === "" ? (
              ""
            ) : (
              <img className="rounded-3 chat-img" src={chatPic} alt="no pic" />
            )}
          </div>
          <div className="  ">
            <div className="time d-flex justify-content-end ">{time}</div>
          </div>
        </div>
      </div>
      {my && (
        <img
          src={pic}
          className="card-img-top round-img"
          alt="pic"
          style={{
            width: "40px",
            height: "40px",
          }}
        />
      )}
    </div>
  );
}
