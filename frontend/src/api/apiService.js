export async function startGame(numPlayers) {
    const response = await fetch("http://localhost:5000/start-game", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ num_players: numPlayers }),
    });
    return response.json();
}


export async function playerAction(actionData) {
    const response = await fetch("http://localhost:5000/player-action", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
    });
    return response.json();
}

export async function processBluff(bluff, playerIndex) {
    try{
        const response = await fetch("http://localhost:5000/process-bluff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({bluff, player_index: playerIndex}),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to process bluff");
        }

        return response.json();
    }
    catch (error) {
        console.error("Error processing bluff API:", error);
        throw error;
        alert("Failed to process bluff. Please try again.");
    }
}

export async function checkWinner() {
    const response = await fetch("http://localhost:5000/check-winner");
    return response.json();
}

export async function fetchGameState() {
    const response = await fetch("http://localhost:5000/game-state");
    return response.json();
}