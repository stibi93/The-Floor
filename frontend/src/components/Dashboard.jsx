import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

export default function Dashboard({ gameState }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const cols = Math.ceil(Math.sqrt(categories.length));
  
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div 
        className="grid gap-4 w-full h-full max-w-7xl max-h-[90vh]"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          aspectRatio: '1/1'
        }}
      >
        {categories.map((cat) => {
          const isPlayed = gameState.played_categories.includes(cat.name);
          return (
            <div 
              key={cat.name}
              className={`
                flex items-center justify-center text-center p-4 rounded-xl text-xl font-bold uppercase tracking-wider
                transition-all duration-300
                ${isPlayed 
                  ? 'bg-neutral-800 text-neutral-500 border-2 border-neutral-700' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg hover:shadow-blue-500/50 hover:scale-105'
                }
              `}
              onClick={() => {
                if (!isPlayed) {
                  // In board view, click does nothing or triggers selection if authorized?
                  // Only Admin should select. 
                  // But user requirement says "Game Master" uses UI.
                  // If this is the Board view, maybe it shouldn't be clickable?
                  // But usually Board and GM are separate.
                  // GM selects on their screen.
                  // Wait, Admin component will have category selection?
                  // Or Admin sees the dashboard too?
                  // Let's make it clickable here but maybe prompt for confirmation or check if /admin?
                  // Actually, let's assume Admin also sees Dashboard in Admin view to select.
                  // We'll reuse Dashboard in Admin?
                }
              }}
            >
              {cat.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

