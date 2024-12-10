import React, { useEffect, useState } from "react";
import { fetchGameState, playerAction, processBluff, checkWinner } from "../../api/apiService";
import Card from "../cards/Card";
import "./Gameboard.css";

const GameBoard = () => {
    const [gameState, setGameState] = useState(null);
    const [winner, setWinner] = useState(null);
    const [selectedCards, setSelectedCards] = useState([]);
    const [announcedRank, setAnnouncedRank] = useState("");
    const [awaitingBluff, setAwaitingBluff] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [showActionModal, setShowActionModal] = useState(false);

    useEffect(() => {
        const fetchState = async () => {
            try {
                const data = await fetchGameState();
                setGameState(data);
            } catch (error) {
                console.error("Error fetching game state:", error);
            }
        };
        fetchState();
    }, []);

    const toggleCardSelection = (index) => {
        setSelectedCards((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleAction = async () => {
        if (selectedCards.length === 0 || !announcedRank) {
            alert("Please select cards and declare a rank!");
            return;
        }

        const actionData = {
            player_index: currentPlayer,
            selected_indices: selectedCards,
            announced_rank: announcedRank,
        };

        try {
            await playerAction(actionData);
            setAwaitingBluff(true);
            setShowActionModal(false);
        } catch (error) {
            console.error("Error making player action:", error);
            alert(error.message || "Failed to make action. Please try again.");
        }
    };

    const handleBluffDecision = async (bluff) => {
        setAwaitingBluff(false);
        try {
            const result = await processBluff(bluff, currentPlayer);

            const winnerResponse = await checkWinner();
            if (winnerResponse.winner !== null) {
                setWinner(winnerResponse.message);
            } else {
                const updatedState = await fetchGameState();
                setGameState(updatedState);
                setSelectedCards([]);
                setAnnouncedRank("");
                setCurrentPlayer((prev) => (prev + 1) % gameState.players.length);
            }
        } catch (error) {
            console.error("Error processing bluff:", error);
            alert(error.message || "Failed to process bluff. Please try again.");
        }
    };

    if (!gameState) return <p>Loading...</p>;

    const nextPlayerIndex = (currentPlayer + 1) % (gameState?.players?.length || 1);
    const nextPlayerName = `Player ${nextPlayerIndex + 1}`;
    const currentPlayerName = `Player ${currentPlayer + 1}`;
    const declaredMessage = `${currentPlayerName} declared ${selectedCards.length} ${announcedRank}s`;


    return (
      <div className="container">
    <div className={`gameboard ${awaitingBluff ? "modal-active" : ""}`}>
        {winner ? (
            <div className="winner-container">
                <h3 className="winner-text">{winner}</h3>
            </div>
        ) : (
            <>
                <div className="players-left">
                    {gameState.players.map((player) => (
                        <div key={player.index} className="player-info">
                            <p>Player {player.index + 1}</p>
                            <p>{player.num_cards} cards left</p>
                        </div>
                    ))}
                </div>

                <div className="center-pile">
                    {Array.isArray(gameState.center_pile) && gameState.center_pile.length > 0 ? (
                        gameState.center_pile.map((card, index) => (
                            <Card 
                                key={index}
                                rank={card.rank}
                                suit={card.suit}
                                faceDown={true}
                                className="small-card"
                            />
                        ))
                    ) : (
                        <></>
                    )}
                </div>

                <div className="player-hand">
                    <h2 className="current-player-text">Player {currentPlayer + 1}'s Turn</h2>
                    <div className="hand">
                        {gameState.players[currentPlayer]?.cards?.map((card, index) => (
                            <Card
                                key={index}
                                rank={card.rank}
                                suit={card.suit}
                                onClick={() => toggleCardSelection(index)}
                                isSelected={selectedCards.includes(index)}
                                faceDown={false}
                            />
                        ))}
                    </div>
                    <button
                        className="btn btn-success btn-move"
                        onClick={() => setShowActionModal(true)}
                    >
                        Make Move
                    </button>
                </div>
            </>
        )}
    </div>

    {awaitingBluff && <div className="modal-active-bg"></div>}

    {awaitingBluff && (
        <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{nextPlayerName}, Bluff Decision</h5>
                    </div>
                    <div className="modal-body text-center">
                        <p>{declaredMessage}</p>
                        <p>Do you want to call a bluff?</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" onClick={() => handleBluffDecision(true)}>
                            Call Bluff
                        </button>
                        <button className="btn btn-success" onClick={() => handleBluffDecision(false)}>
                            Do Not Call Bluff
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )}

    {showActionModal && (
        <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Declare a Rank</h5>
                        <button className="btn-close" onClick={() => setShowActionModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        <div>
                            <div className="d-flex flex-wrap gap-2 justify-content-center p-5">
                                {["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"].map((rank) => (
                                    <button 
                                        key={rank}
                                        className={`btn btn-sm ${announcedRank === rank ? "btn-success" : "btn-outline-dark"}`}
                                        onClick={() => setAnnouncedRank(rank)}
                                    >
                                        {rank}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowActionModal(false)}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-success" onClick={handleAction}>
                            Make Move
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )}
</div>
    );
};

export default GameBoard;
