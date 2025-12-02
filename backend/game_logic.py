import asyncio
import time
import random
import os

class GameState:
    def __init__(self, data_dir):
        self.data_dir = data_dir
        self.played_categories = set()
        self.reset()

    def reset(self):
        self.players = {
            "p1": {"name": "", "time_left": 60.0},
            "p2": {"name": "", "time_left": 60.0}
        }
        self.current_player = "p1" # "p1" or "p2"
        self.state = "idle" # idle, playing, showing_pass, game_over
        self.category = None
        self.images = [] # List of filenames
        self.current_image_index = 0
        self.last_tick = 0
        self.pass_end_time = 0
        self.winner = None

    def reset_board(self):
        self.played_categories = set()
        self.reset()

    def load_category(self, category_name):
        cat_path = os.path.join(self.data_dir, category_name)
        if not os.path.exists(cat_path):
            return False
        
        self.images = [f for f in os.listdir(cat_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        # Sort images to respect 01_... ordering
        self.images.sort()
        
        self.category = category_name
        self.current_image_index = 0
        self.state = "ready"
        return True

    def set_players(self, p1_name, p2_name):
        self.players["p1"]["name"] = p1_name
        self.players["p2"]["name"] = p2_name
        self.players["p1"]["time_left"] = 60.0
        self.players["p2"]["time_left"] = 60.0
        self.current_player = "p1"

    def start_game(self):
        if self.state == "ready":
            self.state = "playing"
            self.last_tick = time.time()
            return True
        return False

    def tick(self):
        """Updates the timer based on elapsed time."""
        if self.state not in ["playing", "showing_pass"]:
            self.last_tick = time.time() # Reset tick delta to avoid huge jumps
            return

        now = time.time()
        delta = now - self.last_tick
        self.last_tick = now

        # Timer runs for the current player
        self.players[self.current_player]["time_left"] -= delta

        # Check for time out
        if self.players[self.current_player]["time_left"] <= 0:
            self.players[self.current_player]["time_left"] = 0
            self.state = "game_over"
            # Winner is the OTHER player
            self.winner = "p2" if self.current_player == "p1" else "p1"
            if self.category:
                self.played_categories.add(self.category)
            return True # Game state changed

        # Check pass penalty expiration
        if self.state == "showing_pass":
            if now >= self.pass_end_time:
                self.state = "playing"
                self.next_image()
                return True # State changed
        
        return False # No major state change, just time update

    def next_image(self):
        self.current_image_index += 1
        if self.current_image_index >= len(self.images):
            # No more images
            self.state = "game_over"
            # Winner is who has MORE time
            t1 = self.players["p1"]["time_left"]
            t2 = self.players["p2"]["time_left"]
            if t1 > t2:
                self.winner = "p1"
            else:
                self.winner = "p2"
            if self.category:
                self.played_categories.add(self.category)
        return

    def handle_correct(self):
        # If currently showing pass answer, "correct" (Enter) skips the delay
        if self.state == "showing_pass":
            self.state = "playing"
            self.next_image()
            return True

        if self.state != "playing":
            return False
        
        # Switch player
        self.current_player = "p2" if self.current_player == "p1" else "p1"
        self.next_image()
        return True

    def handle_pass(self):
        if self.state != "playing":
            return False
        
        # Enter pass state (show answer), keep timer running
        self.state = "showing_pass"
        self.pass_end_time = time.time() + 5.0
        return True

    def get_status(self):
        current_image = None
        current_answer = None
        if 0 <= self.current_image_index < len(self.images):
            current_image = self.images[self.current_image_index]
            # Remove extension
            base_name = os.path.splitext(current_image)[0]
            # Remove ##_ prefix if present (e.g., 01_Citrom -> Citrom)
            if '_' in base_name:
                parts = base_name.split('_', 1)
                if parts[0].isdigit():
                    current_answer = parts[1]
                else:
                    current_answer = base_name
            else:
                current_answer = base_name

        return {
            "state": self.state,
            "players": self.players,
            "current_player": self.current_player,
            "category": self.category,
            "current_image": current_image,
            "current_answer": current_answer if self.state == "showing_pass" else None, # Only send answer if showing pass
            "winner": self.winner,
            "winner_name": self.players[self.winner]["name"] if self.winner else None,
            "played_categories": list(self.played_categories)
        }

