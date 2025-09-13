'use client';

export function RefreshButton() {
  return (
    <button 
      onClick={() => window.location.reload()} 
      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      Refresh Status
    </button>
  );
}
