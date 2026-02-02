import { useState, useCallback, ReactNode, DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  children: ReactNode;
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function FileDropZone({ children, onFilesDropped, disabled, className }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => {
      const next = prev - 1;
      if (next === 0) {
        setIsDragging(false);
      }
      return next;
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesDropped(files);
    }
  }, [disabled, onFilesDropped]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn("relative", className)}
    >
      {children}
      
      {/* Drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg pointer-events-none animate-fade-in">
          <div className="flex flex-col items-center gap-3 text-primary">
            <div className="p-4 rounded-full bg-primary/20">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Drop files here</p>
              <p className="text-sm text-muted-foreground">Images, audio, text, zip, rar supported</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
