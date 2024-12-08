import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Gameboard from "../gameboard/Gameboard";

const WebSocketComponent = ({user}) => {
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [cardsToPlay, setCardsToPlay] = useState([])
  const [username, setUsername] = useState(user.email.split("@")[0]);

  useEffect(() => {
    const socketInstance = io("http://localhost:5000");
    setSocket(socketInstance);

    // Join the game
    socketInstance.emit("join", { username });


    // Handle incoming events
    socketInstance.on("player_joined", (data) => {
      setPlayers((prev) => [
        ...prev, 
        { username: data.username, hand: [] } // Initialize hand as empty array
      ]);
      setMessages((prev) => [...prev.slice(-5), `${data.username} joined the game!`]);
    });

    socketInstance.on("player_move", (data) => {
      setMessages((prev) => [...prev.slice(-5), `${data.username} made a move: ${data.move}`]);
    });

    socketInstance.on("player_left", (data) => {
      setPlayers((prev) => prev.filter((p) => p !== data.username));
      setMessages((prev) => [...prev.slice(-5), `${data.username} left the game.`]);
    });

    socketInstance.on("turn", (data) => {
      setCurrentTurn(data.username);
      console.log(`turn changed to ${data.username}`)
    });

    socketInstance.on("player_list_updated", (data) => {
      // Extract the usernames from the object values
      console.log(data)
      const playerList = Object.values(data.username);
      setPlayers(playerList);
      console.log(playerList); // Logs the list of players
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);//

  const handleMove = (cards) => {
    if (socket) {
      socket.emit("move", { move: cards.toString() });

    }


  };

  return (
    <>
    <Gameboard  />
    <div style={{position:'fixed', top:'200px', left: '30px', color:'white' }}>
      <h2>Players in the Game</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>

      <h2>Game Messages</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>

      <button onClick={() => handleMove(cardsToPlay)} disabled={currentTurn !== username}>Play Card A</button> 
    </div>
    </>
  );
};

export default WebSocketComponent;
