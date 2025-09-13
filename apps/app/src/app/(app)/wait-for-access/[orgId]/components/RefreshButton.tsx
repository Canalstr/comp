'use client';

export function RefreshButton() {
  return (
    <button 
      onClick={() => window.location.reload()} 
      className="text-green-600 hover:text-green-700 underline text-sm font-medium"
    >
      Check status manually
    </button>
  );
}
