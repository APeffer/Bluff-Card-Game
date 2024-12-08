from flask import Flask, request, jsonify
from bluff import BluffGame

app = Flask(__name__)
game_instance = None

@app.route('/start-game', methods=['POST'])
def start_game():
    global game_instance
    num_players = request.json['num_players']
    game_instance = BluffGame(num_players=num_players)
    initial_state = {
        "players" : []
    }
    for i in range(num_players):
        player_info = {
            "player_id": i,
            "num_cards": len(game_instance.players[i].cards)
        }
        initial_state["players"].append(player_info)
        
    return jsonify(initial_state)
