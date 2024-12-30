import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { socket } from "../../socket"
import Gameboard from "../gameboard/Gameboard";
import Hand from "../hand/Hand";

const WebSocketComponent = ({changeScene, user, givenCode }) => {
const [sid, setSid] = useState("");
//const [sock, setSock] = useState(undefined);
const [players, setPlayers] = useState({});
const [messages, setMessages] = useState([]);
const [currentTurn, setCurrentTurn] = useState(null);
const [cardsToPlay, setCardsToPlay] = useState([]);
const username = user.email.split("@")[0];
const [hand, setHand] = useState([{suit: "heart", rank: "K"}, {suit: "diamond", rank: "8"}])
const [userInfo, setUserInfo] = useState({player: {sid: sid, username: username, hand: hand}})
const [roomCode, setRoomCode] = useState(givenCode);



  useEffect(() => {
    //const socket = io("http://localhost:8000", {
      //query: {"playerId": user.email}
    //})
    

    socket.connect()

    //setSock(socket)

    //if (socket) {
      
      // Handle incoming events
      socket.on("player_joined_room", (data) => {
        setMessages((prev) => [...prev.slice(-5), `${data.username} joined the game!`]);
      });

      socket.on("player_move", (data) => {
        setMessages((prev) => [
          ...prev.slice(-5),
          `${data.username} move: ${JSON.stringify(data.move.claim_amount)} ${data.move.claim_value}s`,
        ]);
      }); 

      socket.on("player_left", (data) => {
        setPlayers((prev) => prev.filter((p) => p.username !== data.username)); // Correct filtering
        setMessages((prev) => [
          ...prev.slice(-5), 
          `${data.username} left the game.`,
        ]);
      });

      socket.on("turn", (data) => {
        setCurrentTurn(data.username);
        console.log(`Turn changed to ${data.username}`);
      });

      socket.on("bluff_response", (data) => {
        setMessages((prev) => [
          ...prev.slice(-5), 
          `${data.username} called the bluff ${data.callWas ? "correct" : "wrong"}`,
        ])
      })

      socket.on("update_hand", (data) => {
        console.log(`TRYING TO UPDATE HAND`);
        //if (userInfo.player.username === data.username){
          setUserInfo({player: data})
          setHand(data.hand)
          console.log(`Setting user's hand to: ${data.updated_hand}`);
          //socket.emit("updatePlayerOnServer", {user: userInfo, room: roomCode})
        //}
        //else{
          console.log("Not updating your hand");
        //}
      })

      socket.on("player_list_updated", (data) => {
        setPlayers(data || {}); // Update players object
      });

      socket.on("player_individual_updated", (data) => {
        setUserInfo(data);
      })

      socket.on("error", (data) => {
        console.log(JSON.stringify(data))
      })
    //}

    return () => {
      if (socket) {
        socket.disconnect();
      }
      console.error("disconnected");
    };
  }, []); // Effect will run once after component mounts

  useEffect(() => {
    if (socket) {
      console.log(`Socket: ${socket}`)
      console.log(`Room code: ${roomCode}`);

      if (roomCode === "") {
        console.log(`No Room Code String, creating room`);
        handleCreateRoom(socket);
      } else {
        handleJoinRoom(roomCode, socket);
      }
    }
  }, [roomCode, socket]); // This effect runs after `socket` is initialized

  useEffect(() => {
    console.log(`Individual player Updated:\nusername: ${JSON.stringify(userInfo.player.username)}\nhand: ${JSON.stringify(userInfo.player.hand)}`);
      
    console.log("Player list updated:\n")
    //Object.keys(players), JSON.stringify(Object.values(players)))
    Object.keys(players).forEach(key => {
      // Print the key and the JSON string of the value
      console.log(`${key}: ${JSON.stringify(players[key])}`);
    });
    
    checkPlayer1(players, username)
  }, [players, userInfo]);

  const handleJoinRoom = () => {
    if (!username) {
      console.error(`ERROR, username: ${username} code: ${roomCode}`);
      alert("No username");
      return;
    }
    if (!roomCode) {
      return;
    }
    socket.emit("joinRoom", { username: username, room: roomCode });
    console.log(`Joined room: ${roomCode} successfully`)
  };

  const handleCreateRoom = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    console.log(`Creating a room and setting code to: ${newRoomCode}`);
    setRoomCode(newRoomCode);
    handleJoinRoom(); // Use the same logic for joining the new room
  };

  function checkPlayer1(p, u){
    if (Object.keys(p).length !== 0){
      const first_player_username = Object.values(p)[0].username
      if (username === first_player_username){
        return true
      }
    }
    
    return false
  }

  return (
    <Gameboard roomCode={roomCode}>
      <h3>MySid {sid}</h3>
      
      { /* MAP OTHER PLAYERS TO A HAND */
        (Object.values(players) || []).map((playerObj, index) => {

        // Only render opposing players, not current user.
        return (
          playerObj.username !== userInfo.player.username ? 
          <Hand key={index} player={playerObj} roomCode={roomCode} /> :
          null
        );
      })}

      {/* ADD USER'S HAND */}
      <Hand player={userInfo.player} roomCode={roomCode} />

      {/* PLAYER LIST */}
      <div className="gameMessages" style={{ position: "fixed", top: "90px", left: "10px", color: "white" }}>
        <h2>Players in the Game</h2>
        <ul>
          {(Object.values(players) || []).map((playerObj, index) => {
            return(
              <li key={index}>
                {playerObj.username}
              </li>
            )})}
        </ul>

        {/* GAME MESSAGE EVENTS */}
        <h2>Game Messages</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        {currentTurn && <h3>It's {currentTurn}'s turn!</h3>}
        
      </div>
      {checkPlayer1(players, username) && <button>START GAME</button>}

    </Gameboard>
  );
};

export default WebSocketComponent;
