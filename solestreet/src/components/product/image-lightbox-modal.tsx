"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProductImage } from "@/types";

interface ImageLightboxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ProductImage[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
}

export function ImageLightboxModal({
  open,
  onOpenChange,
  images,
  currentIndex,
  onSelectIndex,
  productName,
}: ImageLightboxModalProps) {
  const handlePrev = useCallback(() => {
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    onSelectIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onSelectIndex]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrev, handleNext]);

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-zinc-950/95 border-zinc-800 text-white flex flex-col justify-between overflow-hidden sm:rounded-3xl">
        <DialogTitle className="sr-only">
          {productName} High-Resolution Gallery
        </DialogTitle>

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white line-clamp-1">
              {productName}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Image Stage */}
        <div className="relative flex-1 w-full flex items-center justify-center p-4 overflow-hidden select-none">
          <div className="relative w-full h-full max-h-[70vh] aspect-square sm:aspect-auto">
            <Image
              src={images[currentIndex]?.url || images[0].url}
              alt={images[currentIndex]?.alt || `${productName} view`}
              fill
              priority
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-white hover:text-zinc-950 text-white border border-zinc-700/80 flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-white hover:text-zinc-950 text-white border border-zinc-700/80 flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex justify-center items-center gap-3 overflow-x-auto z-20">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  currentIndex === idx
                    ? "border-white ring-2 ring-white/30 scale-105"
                    : "border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
