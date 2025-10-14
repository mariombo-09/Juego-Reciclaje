import { useRecyclingGame } from "../lib/stores/useRecyclingGame";

interface WasteCardProps {
  className?: string;
}

export default function WasteCard({ className }: WasteCardProps) {
  const { currentWasteItem } = useRecyclingGame();

  if (!currentWasteItem) return null;

  return (
    <div className={`fixed top-4 right-4 z-20 ${className}`}>
      <div className="bg-white border-4 border-gray-800 rounded-lg shadow-2xl p-4 w-56">
        {/* Header */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-gray-800 mb-2">🗂️ Clasifica esto</h2>
          <div className="w-full h-1 bg-gradient-to-r from-green-400 via-blue-400 to-yellow-400 rounded"></div>
        </div>

        {/* Waste Item Display */}
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg p-3">
            <span className="text-2xl mb-1 block">🗑️</span>
            <h3 className="text-md font-bold text-gray-900">{currentWasteItem.name}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}