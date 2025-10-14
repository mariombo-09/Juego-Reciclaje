import { useEffect, useState } from "react";
import { useRecyclingGame } from "../lib/stores/useRecyclingGame";
import { TrashType } from "../types/game";

interface WasteItemIconProps {
  type: TrashType;
  size?: 'small' | 'medium' | 'large';
}

function WasteItemIcon({ type, size = 'large' }: WasteItemIconProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  };

  const iconSize = sizeClasses[size];

  switch (type) {
    case 'plastic':
      return (
        <div className={`${iconSize} relative flex items-center justify-center`}>
          {/* Plastic bottle with high detail */}
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
            {/* Bottle body */}
            <path d="M18 20 L18 52 Q18 58 24 58 L40 58 Q46 58 46 52 L46 20 Z" 
                  fill="#FFD700" stroke="#FFA000" strokeWidth="2"/>
            {/* Bottle neck */}
            <path d="M26 8 L26 20 L38 20 L38 8 Q38 4 34 4 L30 4 Q26 4 26 8 Z" 
                  fill="#FFD700" stroke="#FFA000" strokeWidth="2"/>
            {/* Cap */}
            <rect x="24" y="2" width="16" height="6" rx="3" 
                  fill="#FF6B35" stroke="#E55100" strokeWidth="1.5"/>
            {/* Label wrap */}
            <rect x="20" y="28" width="24" height="16" rx="2" 
                  fill="#FFFFFF" fillOpacity="0.8" stroke="#CCC" strokeWidth="1"/>
            {/* Recycling symbol */}
            <circle cx="32" cy="36" r="6" fill="none" stroke="#4CAF50" strokeWidth="2"/>
            <path d="M28 33 L32 29 L36 33" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
            <path d="M28 39 L32 43 L36 39" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
            {/* Bottle ridges */}
            <line x1="20" y1="24" x2="44" y2="24" stroke="#FFA000" strokeWidth="1"/>
            <line x1="20" y1="50" x2="44" y2="50" stroke="#FFA000" strokeWidth="1"/>
          </svg>
        </div>
      );

    case 'glass':
      return (
        <div className={`${iconSize} relative flex items-center justify-center`}>
          {/* Glass bottle with high detail */}
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
            {/* Bottle body - wine bottle shape */}
            <path d="M20 25 L20 52 Q20 58 26 58 L38 58 Q44 58 44 52 L44 25 Q44 22 42 20 L40 18 L40 12 Q40 8 36 8 L28 8 Q24 8 24 12 L24 18 L22 20 Q20 22 20 25 Z" 
                  fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" fillOpacity="0.9"/>
            {/* Bottle neck */}
            <rect x="28" y="4" width="8" height="16" 
                  fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" fillOpacity="0.9"/>
            {/* Cork/cap */}
            <rect x="26" y="2" width="12" height="4" rx="2" 
                  fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5"/>
            {/* Glass highlight */}
            <path d="M26 12 L26 50 Q26 54 28 54 L30 54" 
                  fill="none" stroke="#A5D6A7" strokeWidth="2" strokeOpacity="0.6"/>
            {/* Label */}
            <rect x="22" y="30" width="20" height="18" rx="2" 
                  fill="#FFFFFF" fillOpacity="0.7" stroke="#CCC" strokeWidth="1"/>
            {/* Glass recycling symbol */}
            <circle cx="32" cy="39" r="5" fill="none" stroke="#2E7D32" strokeWidth="2"/>
            <text x="32" y="42" textAnchor="middle" fill="#2E7D32" fontSize="8" fontWeight="bold">G</text>
          </svg>
        </div>
      );

    case 'paper':
      return (
        <div className={`${iconSize} relative flex items-center justify-center`}>
          {/* Paper/cardboard stack with high detail */}
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
            {/* Back paper sheet */}
            <rect x="14" y="12" width="32" height="42" rx="2" 
                  fill="#1976D2" stroke="#0D47A1" strokeWidth="2" transform="rotate(2 30 33)"/>
            {/* Middle paper sheet */}
            <rect x="12" y="10" width="32" height="42" rx="2" 
                  fill="#2196F3" stroke="#1565C0" strokeWidth="2" transform="rotate(-1 28 31)"/>
            {/* Front paper sheet */}
            <rect x="16" y="8" width="32" height="42" rx="2" 
                  fill="#42A5F5" stroke="#1976D2" strokeWidth="2"/>
            {/* Paper lines */}
            <line x1="20" y1="16" x2="44" y2="16" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6"/>
            <line x1="20" y1="22" x2="44" y2="22" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6"/>
            <line x1="20" y1="28" x2="44" y2="28" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6"/>
            <line x1="20" y1="34" x2="44" y2="34" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6"/>
            <line x1="20" y1="40" x2="44" y2="40" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6"/>
            {/* Recycling symbol */}
            <circle cx="40" cy="44" r="4" fill="#FFFFFF" fillOpacity="0.9"/>
            <path d="M38 42 L40 40 L42 42 M38 46 L40 44 L42 46" 
                  stroke="#1976D2" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* Paper corner fold */}
            <path d="M40 8 L48 16 L40 16 Z" fill="#1565C0" stroke="#0D47A1" strokeWidth="1"/>
          </svg>
        </div>
      );

    case 'organic':
      return (
        <div className={`${iconSize} relative flex items-center justify-center`}>
          {/* Organic waste with high detail */}
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
            {/* Apple core */}
            <ellipse cx="28" cy="32" rx="8" ry="12" 
                     fill="#8D6E63" stroke="#5D4037" strokeWidth="2"/>
            {/* Apple stem */}
            <rect x="26" y="18" width="4" height="6" 
                  fill="#4E342E" stroke="#3E2723" strokeWidth="1"/>
            {/* Apple leaf */}
            <ellipse cx="32" cy="20" rx="3" ry="6" 
                     fill="#4CAF50" stroke="#2E7D32" strokeWidth="1" transform="rotate(25 32 20)"/>
            {/* Banana peel */}
            <path d="M40 28 Q36 24 38 20 Q42 22 46 28 Q48 32 44 36 Q40 32 40 28 Z" 
                  fill="#FDD835" stroke="#F57F17" strokeWidth="2"/>
            {/* Banana spots */}
            <circle cx="42" cy="26" r="1.5" fill="#F57F17"/>
            <circle cx="44" cy="30" r="1" fill="#F57F17"/>
            {/* Orange peel slice */}
            <path d="M18 40 Q14 36 16 32 Q20 34 24 40 Q26 44 22 48 Q18 44 18 40 Z" 
                  fill="#FF9800" stroke="#E65100" strokeWidth="2"/>
            {/* Coffee grounds */}
            <circle cx="45" cy="45" r="6" fill="#3E2723" stroke="#1B0000" strokeWidth="2"/>
            <circle cx="43" cy="43" r="1" fill="#5D4037"/>
            <circle cx="47" cy="44" r="0.8" fill="#5D4037"/>
            <circle cx="46" cy="47" r="1.2" fill="#5D4037"/>
            {/* Compost symbol */}
            <circle cx="32" cy="48" r="6" fill="#4CAF50" fillOpacity="0.8" stroke="#2E7D32" strokeWidth="2"/>
            <path d="M30 46 Q32 44 34 46 Q32 48 30 46" fill="#FFFFFF"/>
            <circle cx="32" cy="50" r="1" fill="#FFFFFF"/>
          </svg>
        </div>
      );

    default:
      return null;
  }
}

interface WastePreviewPanelProps {
  isVisible: boolean;
  nextWasteType: TrashType | null;
  distanceToContainers: number;
}

export default function WastePreviewPanel({ 
  isVisible, 
  nextWasteType, 
  distanceToContainers 
}: WastePreviewPanelProps) {
  const [shouldShow, setShouldShow] = useState(false);

  // Smooth transition logic
  useEffect(() => {
    if (isVisible && nextWasteType) {
      setShouldShow(true);
    } else {
      // Delay hide to allow smooth animation
      const timeout = setTimeout(() => setShouldShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, nextWasteType]);

  if (!shouldShow || !nextWasteType) {
    return null;
  }

  const wasteTypeNames = {
    plastic: 'Plástico',
    glass: 'Vidrio', 
    paper: 'Papel',
    organic: 'Orgánico'
  };

  const wasteColors = {
    plastic: 'border-yellow-400 bg-yellow-50',
    glass: 'border-green-400 bg-green-50',
    paper: 'border-blue-400 bg-blue-50', 
    organic: 'border-amber-600 bg-amber-50'
  };

  const containerInstructions = {
    plastic: 'Cubo Amarillo (Carril Derecho)',
    glass: 'Cubo Verde (Carril Izquierdo)',
    paper: 'Cubo Azul (Carril Central Derecho)',
    organic: 'Cubo Marrón (Carril Central Izquierdo)'
  };

  return (
    <div 
      className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-20 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      {/* Main panel */}
      <div className={`
        ${wasteColors[nextWasteType]}
        border-2 rounded-lg shadow-2xl p-6 max-w-sm
        backdrop-blur-sm bg-opacity-95
      `}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-lg font-bold text-gray-800 mb-1">
            🗂️ Próximo Residuo
          </div>
          <div className="text-sm text-gray-600">
            Contenedores en {Math.round(distanceToContainers)}m
          </div>
        </div>

        {/* Waste icon */}
        <div className="flex justify-center mb-4 p-4 bg-white bg-opacity-50 rounded-lg">
          <WasteItemIcon type={nextWasteType} size="large" />
        </div>

        {/* Waste type name */}
        <div className="text-center mb-3">
          <div className="text-xl font-bold text-gray-800 mb-1">
            {wasteTypeNames[nextWasteType]}
          </div>
          <div className="text-sm text-gray-600">
            {containerInstructions[nextWasteType]}
          </div>
        </div>

        {/* Action instruction */}
        <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
          <div className="text-sm font-semibold text-gray-800 mb-1">
            📍 ¡Prepárate!
          </div>
          <div className="text-xs text-gray-600">
            Usa ← → para posicionarte<br/>
            ESPACIO para saltar y clasificar
          </div>
        </div>

        {/* Distance indicator */}
        <div className="mt-3 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-400 to-green-400 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.max(0, 100 - (distanceToContainers / 40 * 100))}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Animated arrow pointing to containers */}
      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
        <div className="animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-600">
            <path 
              d="M4 12l1.41-1.41L11 16.17V4h2v12.17l5.59-5.58L20 12l-8 8-8-8z" 
              fill="currentColor"
              transform="rotate(-90 12 12)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}