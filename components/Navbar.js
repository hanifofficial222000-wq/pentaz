'use client';
export default function Navbar({ searchTerm, setSearchTerm }) {
  return (
    <div className="px-4 py-3 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-bold text-base text-slate-800">Ayaat Sport Shop</h1>
      </div>
      <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-4 py-2">
        <span className="mr-2 text-gray-400">🔍</span>
        <input 
          type="text" 
          placeholder="Search bar" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none text-sm bg-transparent" 
        />
        {searchTerm && (
          <span onClick={() => setSearchTerm('')} className="text-gray-400 cursor-pointer">✖</span>
        )}
      </div>
    </div>
  );
}
