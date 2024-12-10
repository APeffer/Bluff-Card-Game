import React from "react";
import "./Card.css";

export default function Card({ rank, suit, onClick, isSelected, faceDown }) {
    // Map suits to numeric values
    const suitMap = {
        hearts: 2,
        diamonds: 4,
        spades: 5,
        clubs: 7,
    };

    // Map ranks for face cards
    const rankMap = {
        Ace: "A",
        King: "K",
        Queen: "Q",
        Jack: "J",
    };

    // Use mapped rank if applicable, otherwise use rank as is
    const displayRank = rankMap[rank] || rank;

    // Convert suit to numeric value
    const suitValue = suitMap[suit];
    if (!suitValue) {
        console.error("Invalid suit:", suit);
        return null; // Don't render if suit is invalid
    }

    // Determine image source based on faceDown prop
    const src = faceDown
        ? `/sprites/cards/Back2.png`
        : `/sprites/cards/${displayRank}.${suitValue}.png`;

    return (
        <div
            className={`card ${isSelected ? "selected" : ""}`}
            onClick={onClick}
        >
            <img src={src} alt={`Card rank: ${rank}, suit: ${suit}`} />
        </div>
    );
}
