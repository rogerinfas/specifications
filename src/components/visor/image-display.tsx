"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState, useRef } from "react";

interface Point {
  id: number;
  x: number;
  y: number;
}

export function ImageDisplay() {
  const [points, setPoints] = useState<Point[]>([]);
  const [scale, setScale] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPoints(prev => [
      ...prev, 
      { 
        id: Date.now(),
        x: Math.max(0, Math.min(100, x)), // Asegurar que esté dentro de los límites
        y: Math.max(0, Math.min(100, y))
      }
    ]);
  };

  const removePoint = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic en el punto active el clic en la imagen
    setPoints(prev => prev.filter(point => point.id !== id));
  };

  return (
    <div className="w-full h-full relative">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        wheel={{ step: 0.1 }}
        centerOnInit
        onZoom={(ref) => setScale(ref.state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <div className="relative w-full h-full">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <button
                onClick={() => zoomIn()}
                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Acercar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Alejar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button
                onClick={() => resetTransform()}
                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Reiniciar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
              <button
                onClick={() => setPoints([])}
                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-rose-500"
                title="Eliminar todos los puntos"
                disabled={points.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            <TransformComponent 
              wrapperClass="w-full h-full" 
              contentClass="w-full h-full"
              wrapperStyle={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--background)'
              }}
            >
              <div 
                ref={imageRef}
                className="relative w-full h-full flex items-center justify-center cursor-crosshair"
                onClick={handleImageClick}
              >
                <Image
                  src="/image.png"
                  alt="Imagen de ejemplo"
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-full object-contain select-none pointer-events-none"
                  priority
                />
                {points.map((point) => (
                  <div
                    key={point.id}
                    className="absolute w-3 h-3 rounded-full bg-primary/80 border-2 border-background shadow-sm transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-pointer"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                    }}
                    onClick={(e) => removePoint(point.id, e)}
                    title={`Punto ${point.id}\n(${point.x.toFixed(1)}%, ${point.y.toFixed(1)}%)`}
                  />
                ))}
              </div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}
