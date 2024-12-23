import React, { useState } from 'react';
import "./Gameboard.css";


function Gameboard({ children, roomCode }) {
  const [hidePopup, setHidePopup] = useState(true);
  const [showCode, setShowCode] = useState(false);

  function handleCopyClick() {
    navigator.clipboard.writeText(roomCode)
    //const popup = document.getElementById("copyPopup")
    if (setHidePopup){
      setHidePopup(false)
    }
    setTimeout(()=> {
      setHidePopup(true)
    }, 1000)
  }

  function handleShowClick() {
    const code = document.getElementById("roomCode")
    if (showCode){
      code.classList.add("blur");
      setShowCode(false);
    }
    else{
      code.classList.remove("blur");
      setShowCode(true);
    }

  }

  return (
    <div className='gameboard'>
        {children}
        <div id='RoomCodeContainer'>
          <p>Room Code:  
            <span id='roomCode' className='blur'>
               {roomCode ? roomCode : "No Room"}
            </span>
          </p>
          <button onClick={handleShowClick}>{showCode ? "Hide" : "Show"}</button>
          <button onClick={handleCopyClick}>Copy</button>
          <span id='copyPopup' hidden={hidePopup}>Copied!</span>
        </div>
    </div>
  )
}

export default Gameboard