from collections import deque
from flask import Flask, request, jsonify
from bluff import BluffGame
import pydealer

app = Flask(__name__)
game_instance = None

@app.route('/start-game', methods=['POST'])
def start_game():
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
    global game_instance
    
    try:
        data = request.json
        player_index = data['player_index']
        announced_rank = data['announced_rank']
        selected_cards = data['selected_cards']

        # Validate input
        if not isinstance(player_index, int) or not isinstance(announced_rank, str) or not isinstance(selected_cards, list):
            return jsonify({"error": "Invalid input"}), 400

        # convert indices to card objects
        try:
            player_hand = game_instance.players[player_index]
            selected_cards = [player_hand.cards[i] for i in selected_cards]     
        except (IndexError, AttributeError):
            return jsonify({"error": "Invalid card index"}), 400

        #remove selected cards from player's hand
        for i in sorted(selected_cards, reverse=True):
            del player_hand.cards[i]

        # update the center pile
        temp_stack = pydealer.Stack()
        temp_stack.card = deque(selected_cards)
        game_instance.center_pile.add(temp_stack)

        #update the game state
        game_instance.last_played_cards = selected_cards
        game_instance.announced_rank = announced_rank

        return jsonify({"message": "Player action successful"}),200
    
    except Exception as e:
        return jsonify({"error": "An error occurred while processing the action"}), 500


@app.route('/game_state', methods=['GET'])
def game_state():
    global game_instance
    if game_instance is None:
        return jsonify({"error": "Game not started"}), 400

    state = {
        "players":[
        {
            'index': i,
            'num_cards': len(player.cards)
        } for i, player in enumerate(game_instance.players)
        ],
        "center_pile":game_instance.get_card_names(game_instance.center_pile.cards),
    }

    return jsonify(state)

@app.route('/process-bluff', methods=['POST'])
def process_bluff():
    global game_instance
    try:
        data = request.json
        bluff = data.get("bluff")
        player_index = data.get("player_index")

        if bluff is None or player_index is None:
            return jsonify({"error": "Missing bluff or player index"}), 400
        
        last_played_cards = game_instance.last_played_cards
        announced_rank = game_instance.announced_rank

        was_bluffing = not all(card.value.strip().lower() == announced_rank.strip().lower() for card in last_played_cards)

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
        return jsonify({"error": "An error occurred while processing the bluff"}), 500



@app.route('/check-winner', methods=['GET'])
def check_winner():
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
    app.run(debug=True)