"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState, useRef } from "react";
import { MessageSquare, X } from "lucide-react";

interface Point {
  id: number;
  x: number;
  y: number;
  specification?: string;
}

interface ImageDisplayProps {
  showSpecificationsPanel?: boolean;
}

export function ImageDisplay({ showSpecificationsPanel = true }: ImageDisplayProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [scale, setScale] = useState(1);
  const [activePointId, setActivePointId] = useState<number | null>(null);
  const [tempSpecification, setTempSpecification] = useState("");
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Verificar si ya existe un punto cerca de esta posición
    const minDistance = 1; // Distancia mínima en porcentaje
    const existingPoint = points.find(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
      );
      return distance < minDistance;
    });
    
    // Si ya existe un punto cerca, no crear uno nuevo
    if (existingPoint) {
      return;
    }
    
    const newPoint: Point = {
      id: Date.now(),
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
    
    setPoints(prev => [...prev, newPoint]);
    setActivePointId(newPoint.id);
    setTempSpecification("");
  };

  const removePoint = (id: number, e: React.MouseEvent) => {
    if (!e.ctrlKey) return; // Solo permitir eliminar con Ctrl+Click
    e.stopPropagation();
    setPoints(prev => prev.filter(point => point.id !== id));
    if (activePointId === id) {
      setActivePointId(null);
      setTempSpecification("");
    }
  };

  const saveSpecification = () => {
    if (!activePointId) return;
    
    setPoints(prev => prev.map(point => 
      point.id === activePointId 
        ? { ...point, specification: tempSpecification.trim() || "Sin especificación" }
        : point
    ));
    
    setActivePointId(null);
    setTempSpecification("");
  };

  const cancelSpecification = () => {
    if (!activePointId) return;
    
    setPoints(prev => prev.filter(point => point.id !== activePointId));
    setActivePointId(null);
    setTempSpecification("");
  };

  return (
    <div className="w-full h-full flex">
      <div className="flex-1 relative">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: false }}
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
                onDoubleClick={handleImageDoubleClick}
              >
                <Image
                  src="/image.png"
                  alt="Imagen de ejemplo"
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-full object-contain select-none pointer-events-none"
                  priority
                />
                {points.map((point) => {
                  const isActive = point.id === activePointId;
                  return (
                    <div key={point.id}>
                      <div
                        className={`absolute w-4 h-4 rounded-full border-2 shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-primary border-primary scale-125 z-20' 
                            : 'bg-primary/80 border-background hover:scale-110'
                        }`}
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                        }}
                        onClick={(e) => removePoint(point.id, e)}
                        title={`Punto ${point.id}\n(${point.x.toFixed(1)}%, ${point.y.toFixed(1)}%)\nCtrl+Click para eliminar`}
                      />
                      
                      {isActive && (
                        <div 
                          className="absolute bg-background border border-border rounded-lg shadow-lg p-2 min-w-64 z-30"
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y + 3}%`,
                            transform: 'translateX(-50%)'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2 mb-2"
                               onClick={(e) => e.stopPropagation()}>
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Punto #{points.findIndex(p => p.id === point.id) + 1}</span>
                          </div>
                          
                          <div className="flex items-start gap-2"
                               onClick={(e) => e.stopPropagation()}>
                            <div className="flex-1 relative">
                              <textarea
                                placeholder="Agregar un comentario..."
                                value={tempSpecification}
                                onChange={(e) => setTempSpecification(e.target.value)}
                                className="w-full px-2 py-1 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground/60 resize-none overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                rows={1}
                                style={{
                                  minHeight: '24px',
                                  maxHeight: '120px',
                                  resize: 'none'
                                }}
                                onInput={(e) => {
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = 'auto';
                                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    saveSpecification();
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelSpecification();
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveSpecification();
                                }}
                                className="h-6 w-6 p-0 rounded hover:bg-primary/10 flex-shrink-0"
                                title="Guardar (Enter)"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelSpecification();
                                }}
                                className="h-6 w-6 p-0 rounded hover:bg-destructive/10 flex-shrink-0"
                                title="Cancelar (Esc)"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
      </div>
      
      {/* Panel lateral derecho */}
      {showSpecificationsPanel && (
        <div className="w-80 bg-background border-l border-border">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Especificaciones ({points.filter(p => p.specification).length})
            </h3>
          </div>
          
          <div className="h-full overflow-y-auto">
            {points.filter(p => p.specification).length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay especificaciones aún</p>
                <p className="text-xs mt-1">Haz clic en la imagen para añadir</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {points
                  .filter(point => point.specification)
                  .map((point, index) => (
                    <div key={point.id} className="p-3 rounded-lg bg-muted/30 relative">
                      <div className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="font-medium text-primary">Usuario</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {point.specification}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
