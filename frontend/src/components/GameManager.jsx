import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import { ChevronLeft, RefreshCw, Play, X, Check, MinusCircle, Timer, RotateCcw, Eye, EyeOff } from 'lucide-react';

// --- WISE DESIGN COLORS ---
// Navy: #16335B (Main Background)
// Forest Green: #2ED06E (Actions / Success)
// Pale Green: #9FE870 (Accent / Buttons)
// White: #FFFFFF (Text)
// Light Grey: #F2F5F7 (Secondary text / Muted)

const THEME = {
  bg: 'bg-[#16335B]', // Wise Navy
  bgDark: 'bg-[#0E2240]', // Darker Navy
  success: 'bg-[#2ED06E]', // Forest Green
  accent: 'bg-[#9FE870]', // Pale Green
  accentHover: 'hover:bg-[#8CDD60]',
  text: 'text-white',
  textMuted: 'text-gray-300',
  card: 'bg-white text-[#16335B]',
};

// Main Unified Game Manager
export default function GameManager() {
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }
    function onStateUpdate(value) { setGameState(value); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('state_update', onStateUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state_update', onStateUpdate);
    };
  }, []);

  if (!gameState) return <div className={`flex h-screen items-center justify-center ${THEME.bg} text-white`}>Connecting...</div>;

  return (
    <div className={`${THEME.bg} text-white min-h-screen font-sans selection:bg-[#9FE870]/50`}>
       {gameState.state === 'idle' && <Dashboard gameState={gameState} />}
       {gameState.state === 'ready' && <SetupScreen gameState={gameState} />}
       {(gameState.state === 'playing' || gameState.state === 'showing_pass' || gameState.state === 'game_over') && 
          <ActiveGame gameState={gameState} />
       }
    </div>
  );
}

// 1. Dashboard View
function Dashboard({ gameState }) {
  const [categories, setCategories] = useState([]);
  // Initialize from localStorage or default to false
  const [mysteryMode, setMysteryMode] = useState(() => {
    const saved = localStorage.getItem('mysteryMode');
    return saved === 'true';
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Persist mystery mode whenever it changes
  useEffect(() => {
    localStorage.setItem('mysteryMode', mysteryMode);
  }, [mysteryMode]);

  const selectCategory = (name) => {
    if (mysteryMode) {
        // In mystery mode, clicking flips the card temporarily or permanently?
        // The user requirement says: "Clicking it once again flips all the buttons back in original positions" - this refers to the toggle button.
        // If a user clicks a mystery card, it should probably act as selecting that category.
        // But maybe they want to see what it is first? The prompt implies "Only ??? instead of category name".
        // So selecting it starts the game with that category.
    }
    if (gameState.played_categories.includes(name)) return;
    socket.emit('select_category', { category: name });
  };

  const resetBoard = () => {
    if(confirm('Biztosan törölni akarod a pálya állapotát?')) {
        socket.emit('game_action', { action: 'reset_board' });
    }
  };

  const toggleMysteryMode = () => {
    setMysteryMode(!mysteryMode);
  };

  const count = categories.length;
  const cols = Math.ceil(Math.sqrt(count));
  
  return (
    <div className={`h-screen flex flex-col p-8 ${THEME.bg}`}>
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div 
          className="grid gap-4 w-full h-full max-h-full"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${Math.ceil(count / cols)}, minmax(0, 1fr))`,
            maxWidth: '100%',
            maxHeight: '85vh'
          }}
        >
          {categories.map((cat) => {
            const isPlayed = gameState.played_categories.includes(cat.name);
            return (
              <button 
                key={cat.name}
                disabled={isPlayed}
                onClick={() => selectCategory(cat.name)}
                className={`
                  relative flex items-center justify-center text-center p-2 rounded-xl
                  font-bold uppercase tracking-wide transition-all duration-500 w-full h-full
                  ${isPlayed 
                    ? 'bg-[#0E2240]/50 text-gray-500 cursor-not-allowed' 
                    : mysteryMode 
                        ? 'bg-[#2ED06E] text-[#16335B] hover:scale-[1.02] hover:shadow-xl shadow-lg rotate-y-180' 
                        : 'bg-white text-[#16335B] hover:scale-[1.02] hover:shadow-xl shadow-lg'
                  }
                `}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <span className="text-[clamp(0.5rem,2vw,1.5rem)] leading-tight break-words w-full px-1">
                  {mysteryMode && !isPlayed ? '???' : cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 flex justify-center pb-8 gap-4">
          <button 
            onClick={resetBoard}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0E2240] text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium"
          >
            <RotateCcw size={18} />
            Pálya Reset
          </button>

          <button 
            onClick={toggleMysteryMode}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors font-bold ${mysteryMode ? 'bg-[#2ED06E] text-[#16335B]' : 'bg-[#0E2240] text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            {mysteryMode ? <EyeOff size={18} /> : <Eye size={18} />}
            {mysteryMode ? 'Mystery Mode BE' : 'Mystery Mode'}
          </button>
      </div>
    </div>
  );
}

// 2. Setup Screen
function SetupScreen({ gameState }) {
  const [p1, setP1] = useState("Játékos 1");
  const [p2, setP2] = useState("Játékos 2");

  const startGame = () => {
    socket.emit('set_players', { p1, p2 });
    socket.emit('start_game');
  };

  return (
    <div className={`h-screen flex flex-col items-center justify-center ${THEME.bg}`}>
      <div className="w-full max-w-xl p-12 bg-white rounded-[32px] shadow-2xl text-[#16335B]">
        <h2 className="text-4xl font-bold mb-2 text-center">{gameState.category}</h2>
        <div className="text-gray-500 text-center mb-12 font-medium">PÁRBAJ ELŐKÉSZÍTÉSE</div>

        <div className="space-y-6 mb-12">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-gray-500">Kihívó (Kezdő)</label>
            <input 
              value={p1} onChange={e => setP1(e.target.value)}
              className="w-full bg-[#F2F5F7] border-2 border-transparent focus:border-[#2ED06E] rounded-xl px-6 py-4 text-xl outline-none transition-colors font-bold text-[#16335B]"
              placeholder="1. Játékos neve"
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-gray-500">Kihívott</label>
            <input 
              value={p2} onChange={e => setP2(e.target.value)}
              className="w-full bg-[#F2F5F7] border-2 border-transparent focus:border-[#2ED06E] rounded-xl px-6 py-4 text-xl outline-none transition-colors font-bold text-[#16335B]"
              placeholder="2. Játékos neve"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => socket.emit('game_action', { action: 'reset' })} 
            className="flex-1 py-4 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Mégse
          </button>
          <button 
            onClick={startGame}
            className="flex-[2] py-4 rounded-full bg-[#2ED06E] hover:bg-[#25a959] text-white font-bold text-xl shadow-lg transition-transform active:scale-95"
          >
            INDÍTÁS
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Active Game View
function ActiveGame({ gameState }) {
  const p1 = gameState.players.p1;
  const p2 = gameState.players.p2;
  const isP1 = gameState.current_player === 'p1';
  
  const sendAction = (action) => {
    socket.emit('game_action', { action });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ONLY Trigger if playing or showing pass
      if (gameState.state !== 'playing' && gameState.state !== 'showing_pass') return;
      
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default behavior if any
        sendAction('correct');
      }
      if (e.key.toLowerCase() === 'p') {
         sendAction('pass');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]); // Depend on whole gameState to ensure latest state context if needed

  const imageUrl = gameState.current_image 
    ? `http://localhost:8000/images/${gameState.category}/${gameState.current_image}`
    : null;

  // Game Over Screen
  if (gameState.state === 'game_over') {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${THEME.bg} text-white text-center overflow-hidden relative`}>
         {/* Minimal background animation */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2ED06E]/20 via-[#16335B] to-[#0E2240] animate-pulse pointer-events-none" />
         
         {/* Floating particles */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {[...Array(12)].map((_, i) => (
                 <div 
                    key={i}
                    className="absolute bg-[#9FE870]/30 rounded-full animate-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 100 + 20}px`,
                        height: `${Math.random() * 100 + 20}px`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 5 + 5}s`
                    }}
                 />
             ))}
         </div>

         <div className="mb-8 animate-in fade-in zoom-in duration-700 w-full max-w-4xl relative z-10">
            <div className="text-xl font-bold text-[#9FE870] uppercase tracking-[0.5em] mb-6 drop-shadow-md">Győztes</div>
            <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#9FE870] mb-12 text-shine drop-shadow-2xl">
                {gameState.winner_name}
            </div>
            
            {/* Show remaining times if available */}
            <div className="flex justify-center gap-12 mb-16">
                <div className="bg-[#0E2240]/80 backdrop-blur-sm p-8 rounded-3xl min-w-[220px] border border-white/10 shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="text-gray-400 text-sm uppercase mb-3 font-bold tracking-wider">{p1.name}</div>
                    <div className={`text-5xl font-mono font-black ${gameState.winner === 'p1' ? 'text-[#2ED06E]' : 'text-white'}`}>{Math.ceil(p1.time_left)}s</div>
                </div>
                <div className="bg-[#0E2240]/80 backdrop-blur-sm p-8 rounded-3xl min-w-[220px] border border-white/10 shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="text-gray-400 text-sm uppercase mb-3 font-bold tracking-wider">{p2.name}</div>
                    <div className={`text-5xl font-mono font-black ${gameState.winner === 'p2' ? 'text-[#2ED06E]' : 'text-white'}`}>{Math.ceil(p2.time_left)}s</div>
                </div>
            </div>

            <button 
              onClick={() => sendAction('reset')}
              className="group px-10 py-5 bg-white text-[#16335B] hover:bg-[#9FE870] rounded-full font-bold text-xl transition-all flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(159,232,112,0.5)]"
            >
              <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> 
              Vissza a pályára
            </button>
         </div>
      </div>
    );
  }

  // Active Game Layout
  return (
    <div className="h-screen flex flex-col bg-[#16335B] text-white overflow-hidden">
      
      {/* --- TOP SECTION: Player 1 --- */}
      <div className={`relative h-24 flex-none flex items-center px-8 transition-colors duration-300 overflow-hidden ${isP1 ? 'bg-[#2ED06E]' : 'bg-[#0E2240]'}`}>
         {/* Moving Time Bar Background for Player 1 */}
         {isP1 && (
            <div 
              className="absolute top-0 right-0 h-full bg-[#16335B]/20 pointer-events-none transition-all duration-100 linear"
              style={{ width: `${100 - (p1.time_left / 60 * 100)}%` }}
            />
         )}
         <div className="relative z-10 flex-1 text-3xl font-bold">{p1.name}</div>
         <div className="relative z-10 text-5xl font-mono font-black tabular-nums">{Math.ceil(p1.time_left)}</div>
      </div>

      {/* --- MIDDLE SECTION: Image --- */}
      <div className="flex-1 relative bg-[#F2F5F7] flex items-center justify-center p-8 overflow-hidden">
         {imageUrl && (
           <img 
             src={imageUrl} 
             alt="Quiz" 
             className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
           />
         )}

         {/* Pass Overlay */}
         {gameState.state === 'showing_pass' && (
           <div className="absolute inset-0 bg-[#16335B]/95 backdrop-blur flex flex-col items-center justify-center z-20 animate-in fade-in duration-200">
              <div className="text-2xl font-bold text-gray-400 mb-4 uppercase tracking-widest">A helyes válasz</div>
              <div className="text-6xl md:text-8xl font-black text-[#9FE870] text-center px-4 mb-8">
                 {gameState.current_answer}
              </div>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-[#9FE870] animate-[shrink_5s_linear_forwards]" style={{width: '100%'}} />
              </div>
              <div className="mt-8 text-sm text-gray-400 animate-pulse">Nyomj Entert a tovább lépéshez</div>
           </div>
         )}

         {/* Helper Text (Subtle) - REMOVED as per request */}
         {/* <div className="absolute top-4 right-4 text-gray-300 text-xs font-mono pointer-events-none mix-blend-difference">
            {gameState.current_image ? gameState.current_image.split('_').slice(1).join('_').replace(/\.[^/.]+$/, "") : ""}
         </div> */}
      </div>

      {/* --- BOTTOM SECTION: Player 2 + Controls --- */}
      <div className="flex-none flex flex-col">
          
          {/* Controls Bar (Neutral Zone) */}
          <div className="h-24 bg-[#0E2240] flex items-center justify-center gap-6 border-y border-white/5">
              <button 
                onClick={() => sendAction('correct')}
                className="h-16 px-12 bg-[#2ED06E] hover:bg-[#25a959] text-white rounded-full font-bold text-xl shadow-lg flex items-center gap-3 transition-transform active:scale-95"
              >
                <Check size={28} /> HELYES (Enter)
              </button>
              
              <button 
                onClick={() => sendAction('pass')}
                className="h-16 px-12 bg-[#E8BA70] hover:bg-[#d9aa5e] text-[#16335B] rounded-full font-bold text-xl shadow-lg flex items-center gap-3 transition-transform active:scale-95"
              >
                <MinusCircle size={28} /> PASSZ (P)
              </button>

              <div className="w-px h-10 bg-white/10 mx-2"></div>

              <button 
                 onClick={() => { if(confirm('Megszakítod a játékot?')) sendAction('reset'); }}
                 className="h-12 w-12 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
              >
                 <X size={24} />
              </button>
          </div>


          {/* Player 2 Bar */}
          <div className={`relative h-24 flex items-center px-8 transition-colors duration-300 overflow-hidden ${!isP1 ? 'bg-[#2ED06E]' : 'bg-[#0E2240]'}`}>
             {/* Moving Time Bar Background for Player 2 */}
             {!isP1 && (
                <div 
                  className="absolute top-0 left-0 h-full bg-[#16335B]/20 pointer-events-none transition-all duration-100 linear"
                  style={{ width: `${100 - (p2.time_left / 60 * 100)}%` }}
                />
             )}
             <div className="relative z-10 flex-1 text-3xl font-bold text-right">{p2.name}</div>
             <div className="relative z-10 text-5xl font-mono font-black tabular-nums order-first">{Math.ceil(p2.time_left)}</div>
          </div>
      </div>

    </div>
  );
}
