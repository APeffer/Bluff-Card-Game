import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Gameboard from "../gameboard/Gameboard";
import Hand from "../hand/Hand";

const WebSocketComponent = ({changeScene, user, givenCode }) => {
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [cardsToPlay, setCardsToPlay] = useState([]);
  const username = user.email.split("@")[0];
  const [hand, setHand] = useState([{suit: "heart", rank: "K"}, {suit: "diamond", rank: "8"}])
  const [userInfo, setUserInfo] = useState({player: {username: username, hand: hand}})
  const [roomCode, setRoomCode] = useState(givenCode);

  useEffect(() => {
    const socketInstance = io("http://localhost:8000");
    setSocket(socketInstance);

    // Handle incoming events
    socketInstance.on("player_joined_room", (data) => {
      console.log(`Data to parse: ${JSON.stringify(data)}`); 
      //setPlayers(data.players);
      setMessages((prev) => [...prev.slice(-5), `${data.sid}: ${data.username} joined the game!`]);
    });

    socketInstance.on("player_move", (data) => {
      setMessages((prev) => [
        ...prev.slice(-5),
        `${data.username} move: ${JSON.stringify(data.move.claim_amount)} ${data.move.claim_value}s`,
      ]);
    }); 

    socketInstance.on("player_left", (data) => {
      setPlayers((prev) => prev.filter((p) => p.username !== data.username)); // Correct filtering
      setMessages((prev) => [
        ...prev.slice(-5), 
        `${data.username} left the game.`,
      ]);
    });

    socketInstance.on("turn", (data) => {
      setCurrentTurn(data.username);
      console.log(`Turn changed to ${data.username}`);
    });

    socketInstance.on("bluff_response", (data) => {
      setMessages((prev) => [
        ...prev.slice(-5), 
        `${data.username} called the bluff ${data.callWas ? "correct" : "wrong"}`,
      ])
    })

    socketInstance.on("update_hand", (data) => {
      console.log(`TRYING TO UPDATE HAND`);
      if (userInfo.player.username == data.username){
        setUserInfo({player: data})
        setHand(data.hand)
        console.log(`Setting user's hand to: ${data.updated_hand}`);
        //socketInstance.emit("updatePlayerOnServer", {user: userInfo, room: roomCode})
      }
      else{
        console.log("Not updating your hand");
      }
      
      
    })

    socketInstance.on("player_list_updated", (data) => {
      console.log("Updated players:", data.players);
      setPlayers(data.players || {}); // Update players
    });


    socketInstance.on("player_individual_updated", (data) => {
      console.log("PLAYER INDIVIDUAL UPDATE RECIEVED");
      console.log(`Data to parse: ${JSON.stringify(data)}`); 
      setUserInfo(data);
    })

    return () => {
      socketInstance.disconnect();
      console.error("disconnected");
    };
  }, []); // Effect will run once after component mounts

  useEffect(() => {
    if (socket) {
      console.log(`Room code: ${roomCode}`);

      if (roomCode === "") {
        console.log(`No Room Code String, creating room`);
        handleCreateRoom(socket);
      } else {
        handleJoinRoom(roomCode, socket);
      }
    }
  }, [socket, roomCode]); // This effect runs after `socket` is initialized

  useEffect(() => {
    console.log(`Individual player Updated: ${JSON.stringify(userInfo)}`);
    console.log("Players updated:", JSON.stringify(players));
  }, [userInfo]);

  const handleJoinRoom = () => {
    if (!username) {
      console.error(`ERROR, username: ${username} code: ${roomCode}`);
      alert("No username");
      return;
    }
    if (!roomCode) {
      return;
    }
    console.log(`Joining room ${roomCode}`);
    socket.emit("joinRoom", { username: username, room: roomCode });
    console.log(`Joined room: ${roomCode} successfully`)
  };

  const handleCreateRoom = () => {
    const newRoomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    console.log(`Creating a room and setting code to: ${newRoomCode}`);
    setRoomCode(newRoomCode);
    handleJoinRoom(); // Use the same logic for joining the new room
  };

  return (
    <>
      {players.map((playerObj, index) => {
        const playerEntry = Object.entries(playerObj)[0]; // Get the first entry
        if (!playerEntry) return null; // Skip if invalid

        const [playerId, playerData] = playerEntry;

        // Only render if this player is not the current user
        return playerData.username !== userInfo.player.username ? (
          <Hand key={playerId} player={playerData} roomCode={roomCode} />
        ) : null;
      })}
      <Hand player={userInfo.player} roomCode={roomCode} />
      <div className="gameMessages" style={{ position: "fixed", top: "90px", left: "10px", color: "white" }}>
        <h2>Players in the Game</h2>
        <ul>
          {(players || []).map((playerObj, index) => {
            const [playerId, playerData] = Object.entries(playerObj)[0];
            return(
              <li key={playerId}>
                {playerData.username}
              </li>
            )})}
        </ul>
        <h2>Game Messages</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        {currentTurn && <h3>It's {currentTurn}'s turn!</h3>}
        
      </div>
    </>
  );
};

export default WebSocketComponent;
