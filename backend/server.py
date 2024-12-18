import socketio
import eventlet

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')  # Allow all origins for development
app = socketio.WSGIApp(sio)

# Store rooms
rooms = {}
startingCard = "A"
current_turn_index = 0
cardOrder = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "J", "Q", "K"]

@sio.event
def joinRoom(sid, data):
    """Handles players creating or joining a room."""
    username = data.get("username")
    room_code = data.get("room")
    sio.enter_room(sid, room_code)
    print(f"{sid} ENTERED THE ROOM")
    # Create room if it doesn't exist
    if room_code not in rooms:
        rooms[room_code] = {"players": {}, "player_count": 0, "game_started": False, "claim_card": startingCard, "turn": 0, "pile": [], "last_move": {}}
    if not username or not room_code:
        sio.emit("error", {"message": "Username and room code are required!"}, to=sid)
        return
    # Add player to room
    rooms[room_code]["players"][sid] = {"username": username, "hand": [
        {"suit": "heart", "rank": "K"},
        {"suit": "diamond", "rank": "8"}]}
    rooms[room_code]["player_count"] += 1
    print(f"{username} joined room {room_code}.")
    # Notify other players in the room
    sio.emit("player_joined_room", rooms[room_code]["players"].get(sid), room=room_code)
    print("EMITTED PLAYER_JOINED_ROOM")
    # Emit the usernames as an array
    players_in_room = [
        {sid: {"username": player_info["username"], "card_count": len(player_info["hand"])}}
        for sid, player_info in rooms[room_code]["players"].items()
    ]
    sio.emit("player_list_updated", {"players": players_in_room}, room=room_code)
    print("EMITTED PLAYER_LIST_UPDATED TO ", room_code)
    # Update individual player
    sio.emit("player_individual_updated", {"player": rooms[room_code]["players"][sid]}, to=sid)
    # Check if the room is ready to start the game
    if len(rooms[room_code]["players"]) in [2, 4]:
        print(f"Room {room_code} is ready. Starting the game!")
        sio.emit("game_start", {"room": room_code}, room=room_code)

# @sio.event
# def updatePlayerOnServer(sid, data):
#     room_id = data.get("room")
#     username = data.get("user")
#     new_player_data = data.get("newData")  # This contains the new player data to update
    
#     # Find the SID of the player using their username
#     #player_sid = rooms[room_id]["players"].values

#     if player_sid:
#         # Update the player data using their SID
#         rooms[room_id]["players"][player_sid].update(new_player_data)

#         print(f"Player {username} updated successfully.")
#     else:
#         print(f"Player {username} not found in room {room_id}.")

# @sio.event
        
        
def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
def move(sid, data):
    #move = data.get("move")
    selectedCards = data.get("selectedCards")
    room_id = data.get("room")

    if room_id is None:
        print(f"Error: Player with sid {sid} is not in any room.")
        return

    amountOfCards = len(selectedCards)

    claimCard = rooms[room_id].get("claim_card")

    for card in selectedCards:
        if card.get("rank") != claimCard:
            bluff = True
        else:
            bluff = False
        
    username = data.get("username")
    userSid = get_sid_by_username(room_id, username)

    rooms[room_id]["last_move"] = {"sid": userSid, "username": username, "bluff": bluff}
    rooms[room_id]["pile"].extend(selectedCards)
    rooms[room_id]["turn"] = (rooms[room_id]["turn"] + 1) % len(rooms[room_id]["players"])
    nextCard = cardOrder[(cardOrder.index(claimCard) + 1) % 12]
    print(f"INDEX: {nextCard}")
    rooms[room_id]["claim_card"] = nextCard
    print(f"Turn: {rooms[room_id]["turn"] + 1}")

    print(f"{userSid}: {username} made a move: {selectedCards}")
    
    # Broadcast the move to all players in the same room
    sio.emit("player_move", {"username": username, "move": {"claim_amount": amountOfCards, "claim_value": claimCard}}, room=room_id)

@sio.event
def callBluff(sid, data):
    room_id = data.get("room")
    username = data.get("username")
    print(f"SENDER SID: {sid}")
    
    if room_id is None:
        print(f"Error: Player with sid {sid} is not in any room.")
        return
    
    pile = rooms[room_id]["pile"]
    print(f"PILE: {pile}")
    bluffLastTurn = rooms[room_id].get("last_move", {}).get("bluff")
    print(f"BLUFF LAST TURN?: {bluffLastTurn}")

    # If the bluff last turn is true, find the loser
    if bluffLastTurn:
        # Get the username of the player who lost the bluff
        loser_username = rooms[room_id].get("last_move", {}).get("username")
        
        # Find the SID of the player using the username (from rooms[room_id]["players"])
        loser_sid = None
        for player_sid, player_data in rooms[room_id]["players"].items():
            if player_data.get("username") == loser_username:
                loser_sid = player_sid
                break
        
        if loser_sid is None:
            print(f"Error: Could not find loser with username {loser_username}")
            return
        
        newHand = rooms[room_id]["players"][loser_sid].get("hand", [])
        newHand.extend(pile)
        sio.emit("bluff_response", {"username": loser_username, "callWas": True}, room=room_id)
        sio.emit("update_hand", {"username": loser_username, "hand": newHand}, room=room_id)
        print(f"UPDATED HAND IF: {newHand} SENT TO {loser_username}")
    
    else:
        # If the bluff call was not correct, the loser is the current player
        loser_username = username
        loser_sid = sid  # The current player who called the bluff
        
        newHand = rooms[room_id]["players"][loser_sid].get("hand", [])
        newHand.extend(pile)
        sio.emit("bluff_response", {"username": loser_username, "callWas": False}, room=room_id)
        sio.emit("update_hand", {"username": loser_username, "hand": newHand}, room=room_id)
        print(f"UPDATED HAND ELSE: {newHand} SENT TO {loser_username}")

    
        # Emit the usernames as an array
    players_in_room = [
        {sid: {"username": player_info["username"], "card_count": len(player_info["hand"])}}
        for sid, player_info in rooms[room_id]["players"].items()
    ]
    sio.emit("player_list_updated", {"players": players_in_room}, room=room_id)


@sio.event
def disconnect(sid):
    # Find the room the player was in
    room_id = next((room_code for room_code, room in rooms.items() if sid in room["players"]), None)

    if room_id is None:
        print(f"Error: Player with sid {sid} is not in any room.")
        return

    # Remove player from the room
    username = rooms[room_id]["players"].pop(sid, {}).get("username", "Unknown")
    rooms[room_id]["player_count"] -= 1
    playerCount = rooms[room_id]["player_count"]
    print(f"{username} disconnected from room {room_id}. Player count: {playerCount}")
    
    # Notify all players in the room
    sio.emit("player_left", {"username": username}, room=room_id)

def get_sid_by_username(room_id, username):
    # Loop through the players in the specified room
    for sid, userObject in rooms[room_id]["players"].items():
        if userObject.get('username') == username:
            return sid  # Return the sid if the username matches
    return None  # Return None if the username is not found

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
