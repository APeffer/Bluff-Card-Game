from flask import Flask, request, jsonify
from bluff import BluffGame

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
    player_index = request.json['player_index']
    announced_rank = request.json['announced_rank']
    selected_cards = request.json['selected_cards']

    # Validate input
    if not isinstance(player_index, int) or not isinstance(announced_rank, str):
        return jsonify({"error": "Invalid input"}), 400

    # convert indices to card objects
    try:
        player_hand = game_instance.players[player_index]
        selected_cards = [player_hand.cards[i] for i in selected_cards]     
    except (IndexError, AttributeError):
        return jsonify({"error": "Invalid card index"}), 400
    
    # Play turn
    try:
        player_cards, rank = game_instance.play_turn(player_index)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Handle bluff calling
    if request.json.get('challenge', False):
        try:
            challenger_index = (player_index + 1) % len(game_instance.players)
            game_instance.call_bluff(player_index, challenger_index, announced_rank, selected_cards)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Action processed", "next_turn": (player_index + 1) % len(game_instance.players)})

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

@app.route('/check-winner', methods=['GET'])
def check_winner():
    global game_instance
    if game_instance is None:
        return jsonify({"error": "Game not started"}), 400
    try:
        winner_index = game_instance.check_winner()
        if winner_index != -1:
            return jsonify({"winner": winner_index})
        else:
            return jsonify({"winner": None, "message": "No winner yet"})
    except Exception as e:
        return jsonify({"error": "unable to determine the winner", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)