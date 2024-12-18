from typing import List, Tuple
import pydealer
from pydealer import Stack, Card
from collections import deque

class BluffGame:
    """
    A simplified implementation of the Bluff card game.
    Allows Multiple players to play the game with basic gasmeplay mechanics such as card selection, declaring ranks and bluff calling.
    """
    
    def __init__(self, num_players: int = 2) -> None:
        """
        Initialize the game with shuffled deck and dealt cards.

        Args:
            num_players (int): Number of players in the game
                
        Returns:
            None
        """
        self.deck = pydealer.Deck()
        self.deck.shuffle()
        cards_per_player = 52 // num_players
        self.players = [self.deck.deal(cards_per_player) for _ in range(num_players)]
        self.center_pile = pydealer.Stack()

    def get_card_names(self, cards: List[Card]) -> str:
        """
        Convert a list of cards to a readable string format.
        
        Args: 
            cards (List[Card]): List of cards to convert to string
        
        Returns:
            str: A string representation of the cards    
        """
        return ', '.join(str(card) for card in cards)

    def select_cards(self, player_hand: Stack) -> List[Card]:
        """
        Handle card selection from player's hand.
        
        Args:
            player_hand (Stack): The player's current hand
            
        Returns:
            List[Card]: List of selected cards
        """
        while True:
            try:
                indices_input = input("Enter card indices to play (comma-separated, 0-based): ")
                indices = [int(i.strip()) for i in indices_input.split(',')]
                
                # Check if indices are within bounds
                if not all(0 <= idx < len(player_hand) for idx in indices):
                    print(f"Please enter numbers between 0 and {len(player_hand)-1}")
                    continue
                
                # Get selected cards
                cards_list = list(player_hand.cards)
                selected_cards = []
                
                # Remove selected cards from the player's hand
                for idx in sorted(indices, reverse=True):
                    selected_cards.insert(0, cards_list[idx])
                    cards_list.pop(idx)
                
                # Update the player's hand
                player_hand.cards = deque(cards_list)
                
                return selected_cards
                
            except ValueError:
                print("Please enter numbers separated by commas.")
            except IndexError:
                print(f"Your hand has {len(player_hand)} cards.")

    def play_turn(self, player_index: int) -> Tuple[List[Card], str]:
        """
        Handle a player's turn, allowing them to select and play cards.
        
        Args:
            player_index (int): Index of the current player
        
        Returns:
            Tuple[List[Card], str]: Selected cards and the announced rank
        """
        player_hand = self.players[player_index]
        print(f"\nPlayer {player_index + 1}'s turn")
        print(f"Your hand ({len(player_hand)} cards):")
        for i, card in enumerate(player_hand.cards):
            print(f"{i}: {card}")
        
        selected_cards = self.select_cards(player_hand)
        
        announced_rank = input("Declare the rank of your cards (e.g., Ace, 2, King): ")
        print(f"Player {player_index + 1} plays {len(selected_cards)} {announced_rank}(s)")
        
        # Add selected cards to center pile
        temp_stack = pydealer.Stack()
        temp_stack.cards = deque(selected_cards)
        self.center_pile.add(temp_stack)
        
        return selected_cards, announced_rank

    def call_bluff(self, player_index: int, challenger_index: int, announced_rank: str, selected_cards: List[Card]) -> None:
        """
        Handle bluff calling and card distribution.
        
        Args:
            player_index (int): Index of the player whose turn it is
            challenger_index (int): Index of the player calling the bluff
            announced_rank (str): The rank announced by the player
            selected_cards (List[Card]): List of cards played by the player
        
        Returns:
            None
        """
        print(f"Player {challenger_index + 1} calls bluff!")
        
        # Check if the last played cards match the announced rank
        was_bluffing = any(card.value.lower() != announced_rank.lower() for card in selected_cards)
        
        print("Cards played were:", self.get_card_names(selected_cards))
        
        if was_bluffing:
            print(f"Bluff caught! Player {player_index + 1} takes the center pile.")
            self.players[player_index].add(self.center_pile)
        else:
            print(f"No bluff! Player {challenger_index + 1} takes the center pile.")
            self.players[challenger_index].add(self.center_pile)
        
        # Clear the center pile
        self.center_pile = pydealer.Stack()

    def check_winner(self) -> int:
        """
        Check if there's a winner (player with no cards).
        
        Args:
            None
        
        Returns:
            int: Index of the winning player, -1 if no winner
        """
        for i, player in enumerate(self.players):
            if len(player) == 0:
                return i
        return -1

    def play_game(self) -> None:
        """
        Main game loop that manages the flow of the game.
        
        Args:
            None

        Returns:
            None    
        """
        current_player = 0
        
        while True:
            # Play turn
            selected_cards, announced_rank = self.play_turn(current_player)
            
            # Handle bluff calling
            challenger = (current_player + 1) % len(self.players)
            if input(f"Player {challenger + 1}, call bluff? (y/n): ").lower() == 'y':
                self.call_bluff(current_player, challenger, announced_rank, selected_cards)
            
            # Check for winner
            winner = self.check_winner()
            if winner != -1:
                print(f"\nPlayer {winner + 1} wins!")
                break
            
            # Show current hand sizes
            for i, player in enumerate(self.players):
                print(f"Player {i + 1} has {len(player)} cards")
            
            current_player = challenger

def main() -> None:
    """
    Entry point for the Bluff card game.
    """
    game = BluffGame(num_players=2)
    game.play_game()

if __name__ == "__main__":
    main()