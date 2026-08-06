'use client';
export default function CategorySlider() {
  const categories = [1, 2, 3, 4, 5];

  return (
    <div className="flex overflow-x-auto space-x-4 p-4 bg-white shadow-sm no-scrollbar">
      {categories.map((item) => (
        <div key={item} className="flex-shrink-0 w-20 text-center cursor-pointer">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center text-xs font-semibold text-gray-600 border shadow-inner">
            Auto slider
          </div>
          <p className="text-xs mt-1 font-medium text-gray-700">Category</p>
        </div>
      ))}
    </div>
  );
}
