import React, { useEffect } from 'react'
import { useState } from 'react'
import { onAuthStateChanged } from '@firebase/auth'
import { auth } from '../firebase.js'
import MainMenu from './mainmenu/MainMenu'
import Gameboard from './gameboard/Gameboard'
import SignUp from './signup/SignUp'
import Login from './login/Login'
import WebSocketComponent from './websocket/WebSocketComponent.js'


function Scene() {
  const [user, setUser] = useState(null)
  const [currentScene, setCurrentScene] = useState('mainmenu')
  const [lobbyCode, setLobbyCode] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed: ', currentUser);
      setUser(currentUser);
    })
    return () => unsubscribe();
  }, [user]);

  const renderScene = () => {
    switch (currentScene) {
        case 'mainmenu':
            return <MainMenu changeScene={setCurrentScene} user={user} changeLobbyCode={setLobbyCode}/>;
        case 'game':
            return <Gameboard />;
        case 'websockettest':
            return <WebSocketComponent changeScene={setCurrentScene} user={user} givenCode={lobbyCode} />; 
        case 'signup':
            return <SignUp changeScene={setCurrentScene} />
        case 'login':
            return <Login changeScene={setCurrentScene} />
        default:
            return <MainMenu changeScene={setCurrentScene} user={user}/>
    }
  };


  return (
    <div>
        {renderScene()}
    </div>
  )
}

export default Scene