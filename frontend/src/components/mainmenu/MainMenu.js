import React, { useState } from 'react';
import "./MainMenu.css";
import { auth } from '../../firebase.js';
import { signOut } from '@firebase/auth';

function MainMenu({ changeScene, user, changeLobbyCode}) {
  const [code, setCode] = useState('')

  const handleNewGame = () => {
    changeLobbyCode('')
    //changeScene('game')
    changeScene('websockettest')
  }

  const handleJoinGame = () => {
    changeLobbyCode(code)
    changeScene('websockettest');
  }

  const handleChangeToSignUp = () => {
    changeScene('signup');
  }

  const handleChangeToLogin = () => {
    changeScene('login');
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert(`${user.email} Signed Out Successfully`)
      changeScene('mainmenu');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }
  return (
    <div className='mainMenu'>
        <h1>Bluff!</h1>
        <h2>A card game of fooling your friends!</h2>

        {user ? 
          (
            <div>
              <h4>Welcome {user.email} </h4>
              <button id="btn_newGame" onClick={handleNewGame}>New Game</button>
              <button id="btn_WSNew" onClick={handleNewGame}>wsNew</button>  {/* TEST BUTTON TO TEST WEB SOCKET */}
              <button id="btn_WSJoin" onClick={handleJoinGame}>wsJoin</button>  {/* TEST BUTTON TO TEST WEB SOCKET */}
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}/>

              <button id="btn_logout" onClick={handleLogout}>Log Out</button>
            </div>
          ) : (
            <div>
              <button id="btn_signUp" onClick={handleChangeToSignUp}>Sign Up</button>
              <button id="btn_login" onClick={handleChangeToLogin}>Log In</button>
            </div>
          )
        }
        
        
        <small>Developed by <a href='http://apeffer.dev'>Alex Peffer</a>, Muhammad Qassim, Yan Qi</small>
    </div>
  );
}

export default MainMenu;