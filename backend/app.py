from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
import asyncio
import os
from game_logic import GameState

# Setup paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")

# Initialize App
app = FastAPI()

# CORS for development (React on 5173, FastAPI on 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (Images)
app.mount("/images", StaticFiles(directory=DATA_DIR), name="images")

# Serve Frontend Static Assets (JS/CSS)
if os.path.exists(FRONTEND_DIST_DIR):
    assets_path = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# Game State
game = GameState(DATA_DIR)

@app.get("/api/categories")
def get_categories():
    categories = []
    if os.path.exists(DATA_DIR):
        for name in os.listdir(DATA_DIR):
            path = os.path.join(DATA_DIR, name)
            if os.path.isdir(path):
                # Count valid images
                images = [f for f in os.listdir(path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                if images:
                    categories.append({"name": name, "count": len(images)})
    return categories

# WebSocket Handlers
@sio.event
async def connect(sid, environ):
    await sio.emit('state_update', game.get_status(), to=sid)

@sio.event
async def select_category(sid, data):
    category_name = data.get("category")
    if game.load_category(category_name):
        await sio.emit('state_update', game.get_status())

@sio.event
async def set_players(sid, data):
    p1 = data.get("p1", "Játékos 1")
    p2 = data.get("p2", "Játékos 2")
    game.set_players(p1, p2)
    await sio.emit('state_update', game.get_status())

@sio.event
async def start_game(sid):
    if game.start_game():
        await sio.emit('state_update', game.get_status())

@sio.event
async def game_action(sid, data):
    action = data.get("action")
    changed = False
    if action == "correct":
        changed = game.handle_correct()
    elif action == "pass":
        changed = game.handle_pass()
    elif action == "reset":
        game.reset()
        changed = True
    elif action == "reset_board":
        game.reset_board()
        changed = True
    
    if changed:
        await sio.emit('state_update', game.get_status())

# Background Task for Timer
async def game_loop():
    while True:
        try:
            changed = game.tick()
            if game.state in ["playing", "showing_pass"] or changed:
                await sio.emit('state_update', game.get_status())
            
            await asyncio.sleep(0.1)
        except Exception as e:
            print(f"Error in game loop: {e}")
            await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(game_loop())

# Catch-all for React SPA (MUST BE LAST)
@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    if full_path.startswith("api") or full_path.startswith("socket.io"):
        return {"error": "Not found"} 
    
    if os.path.exists(os.path.join(FRONTEND_DIST_DIR, "index.html")):
         return FileResponse(os.path.join(FRONTEND_DIST_DIR, "index.html"))
    return {"message": "Frontend not built. Please run 'install.bat' to build frontend."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
