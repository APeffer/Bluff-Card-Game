import React, { useState } from 'react';
import "./Gameboard.css";


function Gameboard({ children, roomCode }) {
  const [hidePopup, setHidePopup] = useState(true);

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

  return (
    <div className='gameboard'>
        {children}
        <div id='NavRoomCode'>
          <p>Room Code: {roomCode ? roomCode : "No Room"}</p>
          <button onClick={handleCopyClick}>Copy</button>
          <span id='copyPopup' hidden={hidePopup}>Copied!</span>
        </div>
    </div>
  )
}

export default Gameboard