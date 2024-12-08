import socketio
import eventlet

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins="*") # Allow all origins for development

#
app = socketio.WSGIApp(sio)

# Store connected players
connected_players = {}
current_turn_index = 0

@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
def join(sid, data):
    username = data.get("username", f"Player-{sid[:4]}")
    connected_players[sid] = username
    print(f"{username} joined the game! {sid}")
    
    # Notify all players
    sio.emit("player_joined", {"username": username})
    # Add player to list
    sio.emit('player_list_updated', connected_players)

    if len(connected_players) >= 0:
        start_turn()

@sio.event
def move(sid, data):
    move = data.get("move")
    username = connected_players.get(sid, "Unknown")
    print(f"{username} made a move: {move}")
    
    # Broadcast the move to all players
    sio.emit("player_move", {"username": username, "move": move})


@sio.event
def disconnect(sid):
    username = connected_players.pop(sid, "Unknown")
    print(f"{username} disconnected.")
    
    # Notify all players
    sio.emit("player_left", {"username": username})

def start_turn():
    if connected_players:
        if current_turn_index in connected_players:
            current_player = connected_players[current_turn_index]
            print(f"It's {current_player['username']}'s turn!")
            sio.emit("turn", {"username": current_player["username"]})
        else:
            print("Error: Invalid current_turn_index", current_turn_index)
            # Handle this case, maybe reset or adjust the index

        


# Run the server
if __name__ == "__main__":
    eventlet.wsgi.server(eventlet.listen(("localhost", 5000)), app)