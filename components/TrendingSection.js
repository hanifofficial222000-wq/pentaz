'use client';
export default function TrendingSection() {
  const trendingVideos = [1, 2, 3, 4];

  return (
    <div className="px-4 mt-4">
      <h3 className="text-sm font-bold mb-2 flex items-center text-gray-800">
        Treding video <span className="ml-1">🔥</span>
      </h3>
      <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar">
        {trendingVideos.map((vid) => (
          <div 
            key={vid} 
            className="w-28 h-40 bg-gray-300 rounded-lg flex-shrink-0 relative shadow-inner flex items-center justify-center text-xs text-gray-600 font-semibold cursor-pointer hover:opacity-90"
          >
            Video {vid}
          </div>
        ))}
      </div>
    </div>
  );
}
