import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Card from "../cards/Card";
import "./Hand.css";

// Assuming you're connecting to the server on localhost:8000
const socket = io("http://localhost:8000");

function Hand({ player, roomCode }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [cantBluff, setCantBluff] = useState(true);
  const [hand, setHand] = useState(player?.hand || []); // Local state for hand
  const [username, setUsername] = useState(player?.username || "undefinedUsername")
  const [cardCount, setCardCount] = useState(
    player?.card_count ? player.card_count  : 
    player?.hand ? player.hand.length : 0)

  const handleCardClick = (card) => {
    setSelectedCards((prevSelectedCards) => {
      // If the card is already selected, remove it
      if (prevSelectedCards.includes(card)) {
        return prevSelectedCards.filter((selectedCard) => selectedCard !== card);
      } else {
        // Only allow adding the card if less than 4 cards are selected
        if (prevSelectedCards.length < 4) {
          return [...prevSelectedCards, card];
        }
        // If 4 cards are already selected, don't allow further selection
        return prevSelectedCards;
      }
    });
  };

  const handleSubmitMove = () => {
    // Emit the selected cards to the server when the player submits their move
    if (player?.username && roomCode) {
      socket.emit('move', {
        username: player.username, // player's username
        room: roomCode, // The room code
        selectedCards: selectedCards, // The selected cards
      });
      setSelectedCards([]);
      setCantBluff(false);
    }
  };

  const handleCallBluff = () => {
    if (player?.username && roomCode) {
      socket.emit('callBluff', {
        username: player.username, // player's username
        room: roomCode, // The room code
      });
      setCantBluff(true);
    }
  };

  // Update the local hand state when the player's hand changes
  useEffect(() => {
    if (player?.username){
      setUsername(player.username)
    }
    if (player?.hand) {
      setHand(player.hand);
      
    } 
    else {
      if (player?.card_count) {
        setCardCount(player.card_count)
      }
      
    }
  }, [player]); // Only run when `player` changes

  return (
    <div className="player">
      {player ? (
        <>
          <div className="playerHand">
            {Array.isArray(hand) && hand.length > 0 ? (
              hand.map((card, index) => (
                <div
                  key={index}
                  className={`card-container ${selectedCards.includes(card) ? 'selected' : ''}`}
                  onClick={() => handleCardClick(card)} // Passes the card to handleCardClick
                >
                  <Card rank={card.rank} suit={card.suit} />
                </div>
              ))
            ) : (
              Array.from({ length: cardCount }).map((_, i) => (
                <Card key={i} rank={"?"} suit={"?"} />
              ))
              
            )}
          </div>
          <div className="playerName">{username}</div>
          <button onClick={handleSubmitMove}>Submit Move</button>
          <button onClick={handleCallBluff} disabled={cantBluff}>BLUFF!</button>
        </>
      ) : (
        <p>Player doesn't exist</p>
      )}
    </div>
  );
}

export default Hand;
