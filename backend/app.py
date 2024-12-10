from collections import deque
from flask import Flask, request, jsonify
from bluff import BluffGame
import pydealer
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
game_instance = None

@app.route('/start-game', methods=['POST'])
def start_game() -> any:
    '''
    Start a new game with the specified number of players

    Request body:
        num_players: int - Number of players in the game

    Returns:
        JSON object containing:
            Initial state of the game, including the number of players and their cards (http status 200)
            Error message if the number of players is invalid (http status 400)

    '''

    global game_instance
    num_players = request.json['num_players']

    # Validate input
    if not isinstance(num_players, int) or num_players < 2:
        return jsonify({"error": "Invalid number of players"}), 400

    game_instance = BluffGame(num_players=num_players)
    initial_state = {
        "players" : []
    }

    # Get initial state
    for i in range(num_players):
        player_info = {
            "index": i,
            "num_cards": len(game_instance.players[i].cards)
        }
        initial_state["players"].append(player_info)

    return jsonify(initial_state)

@app.route('/player-action', methods=['POST'])

def player_action():
    '''
    Processes a players turn, allowing them to play selected cards and announce a rank.

    Request body:
        player_index: int - Index of the player making the move
        announced_rank: str - Rank announced by the player
        selected_indices: list - Indices of the selected cards in the player's hand

    Returns:
        JSON response:
            Success message if the player action was processed successfully (http status 200)
            Error message if the player action could not be processed (http status 500)
    '''
    global game_instance
    try:
        data = request.json
        print("Player action data received:", data)  # Debugging

        player_index = data['player_index']
        announced_rank = data['announced_rank']
        selected_indices = data['selected_indices']

        # Convert indices to card objects
        player_hand = game_instance.players[player_index]
        selected_cards = [player_hand.cards[i] for i in selected_indices]

        # Remove selected cards from player's hand
        for i in sorted(selected_indices, reverse=True):
            del player_hand.cards[i]

        # Update the center pile
        temp_stack = pydealer.Stack()
        temp_stack.cards = deque(selected_cards)
        game_instance.center_pile.add(temp_stack)

        # Update game state
        game_instance.last_played_cards = selected_cards
        game_instance.announced_rank = announced_rank

        return jsonify({"message": "Player action successful"}), 200
    except Exception as e:
        print("Error in /player-action:", e)  # Log exception
        return jsonify({"error": "An error occurred while processing the action"}), 500



@app.route('/game-state', methods=['GET'])
def game_state():
    '''
    Retrieve the current state of the game, including the players' cards and the center pile.

    Returns:
        JSON object containing the current state of the game (http status 200)
        Error message if the game has not been started (http status 400)
    '''
    global game_instance
    if game_instance is None:
        return jsonify({"error": "Game not started"}), 400

    try:
        state = {
            "players": [
                {
                    'index': i,
                    'num_cards': len(player.cards),
                    'cards': [
                        {
                            'rank': card.value,
                            'suit': card.suit.lower()  # Ensure suit matches frontend naming
                        }
                        for card in player.cards
                    ]
                } for i, player in enumerate(game_instance.players)
            ],
            # Always send center_pile as an array
            "center_pile": [
                {
                    'rank': card.value,
                    'suit': card.suit.lower()
                }
                for card in game_instance.center_pile.cards
            ],
        }
        return jsonify(state)
    except Exception as e:
        print("Error in /game_state:", e)
        return jsonify({"error": str(e)}), 500



@app.route('/process-bluff', methods=['POST'])
def process_bluff():
    '''
    Process a player's bluff call and distribute cards accordingly.

    Request body:
        bluff: bool - Whether the player is calling a bluff
        player_index: int - Index of the player making the bluff call
    
    Returns:
        JSON response indicating the result of the bluff call (HTTP 200).
    '''
    global game_instance
    try:
        data = request.json
        print("Bluff data received:", data)  # Debugging

        bluff = data.get("bluff")
        player_index = data.get("player_index")

        if bluff is None or player_index is None:
            return jsonify({"error": "Missing bluff or player index"}), 400

        last_played_cards = game_instance.last_played_cards
        announced_rank = game_instance.announced_rank

        was_bluffing = not all(
            card.value.strip().lower() == announced_rank.strip().lower()
            for card in last_played_cards
        )

        if bluff:
            if was_bluffing:
                game_instance.players[player_index].add(game_instance.center_pile.cards)
                game_instance.center_pile = pydealer.Stack()
                return jsonify({"message": "Bluff called correctly", "was_bluffing": was_bluffing})
            else:
                challenger_index = (player_index + 1) % len(game_instance.players)
                game_instance.players[challenger_index].add(game_instance.center_pile.cards)
                game_instance.center_pile = pydealer.Stack()
                return jsonify({"message": "Bluff not called correctly", "was_bluffing": was_bluffing})
        else:
            return jsonify({"message": "Bluff not called", "was_bluffing": was_bluffing})
    except Exception as e:
        print("Error in /process-bluff:", e)  # Log exception
        return jsonify({"error": "An error occurred while processing the bluff"}), 500



@app.route('/check-winner', methods=['GET'])
def check_winner():
    '''
    Check if there is a winner in the game.

    Returns:
        JSON response indicating the winner of the game, if any (HTTP 200).
    '''
    global game_instance
    if game_instance is None:
        return jsonify({"error": "Game not started"}), 400
    try:
        winner_index = game_instance.check_winner()
        if winner_index is not None:
            return jsonify({"winner": winner_index, "message": f"Player {winner_index + 1} won the game!"}),200
        else:
            return jsonify({"winner": None, "message": "No winner yet"}),200
    except Exception as e:
        return jsonify({"error": "unable to determine the winner", "details": str(e)}), 500

if __name__ == '__main__':
    '''
    Run the Flask app
    '''
    app.run(debug=True)