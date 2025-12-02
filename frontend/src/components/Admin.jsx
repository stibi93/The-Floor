import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

export default function Admin({ gameState }) {
  const [categories, setCategories] = useState([]);
  const [p1Name, setP1Name] = useState("Játékos 1");
  const [p2Name, setP2Name] = useState("Játékos 2");

  useEffect(() => {
    fetch('http://localhost:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const selectCategory = (name) => {
    socket.emit('select_category', { category: name });
  };

  const setupGame = () => {
    socket.emit('set_players', { p1: p1Name, p2: p2Name });
    socket.emit('start_game');
  };

  const sendAction = (action) => {
    socket.emit('game_action', { action });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState.state === 'playing' || gameState.state === 'showing_pass') {
        if (e.key === 'Enter') {
          sendAction('correct');
        } else if (e.key.toLowerCase() === 'p') {
          sendAction('pass');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.state]); // Re-bind when state changes to ensure correct context

  if (gameState.state === 'idle') {
    return (
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Játékmester - Kategória Választás</h1>
        <div className="grid grid-cols-4 gap-4">
          {categories.map(cat => (
            <button
              key={cat.name}
              disabled={gameState.played_categories.includes(cat.name)}
              onClick={() => selectCategory(cat.name)}
              className={`p-6 rounded-lg font-bold text-xl
                ${gameState.played_categories.includes(cat.name) 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500'
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
           <button 
             onClick={() => {
                if(confirm('Biztosan törölni akarod a pálya állapotát? (Minden lejátszott kategória újra elérhető lesz)')) {
                    sendAction('reset_board');
                }
             }}
             className="bg-red-900 text-red-200 px-4 py-2 rounded hover:bg-red-800"
           >
             Pálya Resetelése (Összes Kategória)
           </button>
        </div>
      </div>
    );
  }

  if (gameState.state === 'ready') {
    return (
      <div className="p-8 text-white max-w-2xl mx-auto">
        <h2 className="text-2xl mb-4">Játék Előkészítése: {gameState.category}</h2>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block mb-1">1. Játékos Neve (Kezdő)</label>
            <input 
              type="text" 
              value={p1Name} 
              onChange={e => setP1Name(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-1">2. Játékos Neve</label>
            <input 
              type="text" 
              value={p2Name} 
              onChange={e => setP2Name(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={setupGame} className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded text-xl font-bold flex-1">
            START
          </button>
          <button onClick={() => sendAction('reset')} className="bg-gray-600 hover:bg-gray-500 px-4 py-3 rounded">
            Mégse
          </button>
        </div>
      </div>
    );
  }

  if (gameState.state === 'playing' || gameState.state === 'showing_pass') {
    return (
      <div className="p-8 text-white flex flex-col items-center h-screen">
        <div className="mb-4 text-xl opacity-75">{gameState.category}</div>
        
        {/* Helper for GM showing current answer */}
        <div className="mb-8 p-4 bg-gray-800 rounded border border-gray-600">
           <span className="text-gray-400 text-sm block mb-1">Aktuális Megfejtés (Csak neked):</span>
           <span className="text-2xl font-mono text-yellow-400">
             {gameState.current_image ? gameState.current_image.replace(/\.(jpg|jpeg|png)$/i, '') : '...'}
           </span>
        </div>

        <div className="flex gap-6 w-full max-w-4xl">
           <button 
             onClick={() => sendAction('correct')}
             className="flex-1 bg-green-600 hover:bg-green-500 py-12 rounded-xl text-4xl font-bold shadow-lg transform hover:scale-105 transition-all"
           >
             HELYES (Enter)
           </button>
           <button 
             onClick={() => sendAction('pass')}
             className="flex-1 bg-yellow-600 hover:bg-yellow-500 py-12 rounded-xl text-4xl font-bold shadow-lg transform hover:scale-105 transition-all"
           >
             PASSZ (P)
           </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 w-full max-w-4xl">
           <div className={`p-4 rounded border-2 ${gameState.current_player === 'p1' ? 'border-green-500 bg-green-900/20' : 'border-transparent bg-gray-800'}`}>
              <div className="text-xl">{gameState.players.p1.name}</div>
              <div className="text-4xl font-mono">{Math.ceil(gameState.players.p1.time_left)}s</div>
           </div>
           <div className={`p-4 rounded border-2 ${gameState.current_player === 'p2' ? 'border-green-500 bg-green-900/20' : 'border-transparent bg-gray-800'}`}>
              <div className="text-xl">{gameState.players.p2.name}</div>
              <div className="text-4xl font-mono">{Math.ceil(gameState.players.p2.time_left)}s</div>
           </div>
        </div>

        <div className="mt-auto">
           <button onClick={() => sendAction('reset')} className="text-red-400 hover:text-red-300">
             Játék Megszakítása
           </button>
        </div>
      </div>
    );
  }

  if (gameState.state === 'game_over') {
    return (
      <div className="p-8 text-white text-center">
         <h1 className="text-4xl font-bold mb-4">Vége a Játéknak!</h1>
         <h2 className="text-6xl text-yellow-400 mb-8 font-extrabold">{gameState.winner_name} Nyert!</h2>
         <button 
           onClick={() => sendAction('reset')}
           className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded text-2xl font-bold"
         >
           Vissza a pályára
         </button>
      </div>
    );
  }

  return null;
}

