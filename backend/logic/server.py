import socketio
import eventlet

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')  # Allow all origins for development
app = socketio.WSGIApp(sio)

# Store rooms
rooms = {}

current_turn_index = 0

@sio.event
def joinRoom(sid, data):
    """Handles players creating or joining a room."""
    username = data.get("username")
    room_code = data.get("room")
    sio.enter_room(sid, room_code)


    # Create room if it doesn't exist
    if room_code not in rooms:
        rooms[room_code] = {"players": {}, "game_started": False}
    
    if not username or not room_code:
        sio.emit("error", {"message": "Username and room code are required!"}, to=sid)
        return

    # Add player to room
    user = rooms[room_code]["players"][sid] = {"username": username, "hand": []}
    print(f"{username} joined room {room_code}.")

    # Notify other players in the room
    sio.emit("player_joined_room", rooms[room_code]["players"].get(sid), room=room_code)
    print("EMITTED PLAYER_JOINED_ROOM")

    # Emit the usernames as an array
    players_in_room = [
        player_info["username"]
        for player_info in rooms[room_code]["players"].values()
    ]
    sio.emit("player_list_updated", {"players": players_in_room}, room=room_code)
    print("EMITTED PLAYER_LIST_UPDATED TO ", room_code)

    # Debugging logs
    print("TRIED TO SEND UPDATED PLAYER LIST")
    print("Printing room[room_code] data: ", rooms[room_code])
    print("DATA SENT: ", players_in_room)


    # Check if the room is ready to start the game
    if len(rooms[room_code]["players"]) in [2, 4]:
        print(f"Room {room_code} is ready. Starting the game!")
        sio.emit("game_start", {"room": room_code}, to=room_code)
    

@sio.event
def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
def move(sid, data):
    move = data.get("move")
    
    
    # Find the room the player is in
    room_id = next((room_code for room_code, room in rooms.items() if sid in room["players"]), None)

    if room_id is None:
        print(f"Error: Player with sid {sid} is not in any room.")
        return
    
    # Get the player's username from the room
    username = rooms[room_id]["players"][sid]["username"]
    print(f"{username} made a move: {move}")
    
    # Broadcast the move to all players in the same room
    sio.emit("player_move", {"username": username, "move": move},to=room_id)


@sio.event
def disconnect(sid):
    # Find the room the player was in
    room_id = next((room_code for room_code, room in rooms.items() if sid in room["players"]), None)

    if room_id is None:
        print(f"Error: Player with sid {sid} is not in any room.")
        return

    # Remove player from the room
    username = rooms[room_id]["players"].pop(sid, {}).get("username", "Unknown")
    print(f"{username} disconnected from room {room_id}.")
    
    # Notify all players in the room
    sio.emit("player_left", {"username": username}, room=room_id)


def start_game(room):
    print("GAME START")
    # Deal cards and start the game here
    # For example:
    # deck = create_shuffled_deck()  
    # hands = deal_cards(deck, len(players))
    # for i, sid in enumerate(players):
    #     sio.emit('your_hand', {'hand': hands[i]}, room=sid)


def start_turn():
    # Iterate over rooms and start turns
    for room_code, room in rooms.items():
        if room["players"]:
            player_sids = list(room["players"].keys())
            current_sid = player_sids[current_turn_index % len(player_sids)]
            current_player = room["players"][current_sid]
            print(f"It's {current_player['username']}'s turn!")
            sio.emit("turn", {"username": current_player["username"]}, room=room_code)


# Run the server
if __name__ == "__main__":
    eventlet.wsgi.server(eventlet.listen(("localhost", 8000)), app)
