import React from 'react';

export default function Game({ gameState }) {
  const p1 = gameState.players.p1;
  const p2 = gameState.players.p2;
  const isP1 = gameState.current_player === 'p1';

  // Calculate widths for timer bars
  const w1 = (p1.time_left / 60) * 100;
  const w2 = (p2.time_left / 60) * 100;

  const imageUrl = gameState.current_image 
    ? `http://localhost:8000/images/${gameState.category}/${gameState.current_image}`
    : null;

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col relative">
      {/* Top Bar: Player 1 */}
      <div className="flex-1 flex flex-col justify-start relative">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-900 transition-all duration-100 ease-linear"
          style={{ width: `${w1}%`, opacity: isP1 ? 1 : 0.3 }}
        />
        <div className="relative z-10 p-8 flex justify-between items-center text-5xl font-bold drop-shadow-md">
          <span>{p1.name}</span>
          <span className="font-mono">{Math.ceil(p1.time_left)}</span>
        </div>
      </div>

      {/* Center: Image Area */}
      <div className="flex-[3] relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Quiz" 
            className="max-h-full max-w-full object-contain shadow-2xl"
          />
        )}

        {/* Pass Overlay */}
        {gameState.state === 'showing_pass' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300">
             <div className="text-center">
                <div className="text-4xl text-gray-400 mb-4">A helyes megfejtés:</div>
                <div className="text-8xl font-bold text-yellow-400 uppercase tracking-wider">
                  {gameState.current_answer}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Player 2 */}
      <div className="flex-1 flex flex-col justify-end relative">
         <div 
            className="absolute bottom-0 right-0 h-full bg-red-900 transition-all duration-100 ease-linear"
            style={{ width: `${w2}%`, opacity: !isP1 ? 1 : 0.3 }}
          />
          <div className="relative z-10 p-8 flex justify-between items-center text-5xl font-bold drop-shadow-md flex-row-reverse">
            <span>{p2.name}</span>
            <span className="font-mono">{Math.ceil(p2.time_left)}</span>
          </div>
      </div>

      {/* Winner Overlay */}
      {gameState.state === 'game_over' && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
           <h1 className="text-6xl text-gray-300 mb-8">A Győztes</h1>
           <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse">
             {gameState.winner_name}
           </div>
        </div>
      )}
    </div>
  );
}

