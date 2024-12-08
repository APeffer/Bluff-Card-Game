import React from 'react';
import "./Gameboard.css";
import Hand from '../hand/Hand';
import { auth } from "../../firebase.js";

function Gameboard({ children }) {
  

  // sample player object
  const player1 = {
    name: "Alex",
    hand: [
      {suit: "heart", rank: "K"},
      {suit: "club", rank: "6"},
      {suit: "diamond", rank: "J"},
      {suit: "spade", rank: "9"},
      {suit: "heart", rank: "A"}
    ]
  }

  const player2 = {
    name: "Yan",
    hand: [
      {suit: "heart", rank: "K"},
      {suit: "club", rank: "6"},
      {suit: "diamond", rank: "J"},
      {suit: "spade", rank: "9"},
      {suit: "heart", rank: "A"}
    ]
  }

  const player3 = {
    name: "Muhammad",
    hand: [
      {suit: "heart", rank: "K"},
      {suit: "club", rank: "6"},
      {suit: "diamond", rank: "J"},
      {suit: "spade", rank: "9"},
      {suit: "heart", rank: "A"}
    ]
  }



  return (
    <div className='gameboard'>
        <Hand player={player1}/>
        <Hand player={player2}/>
        <Hand player={player3}/>
    </div>
  )
}

export default Gameboard