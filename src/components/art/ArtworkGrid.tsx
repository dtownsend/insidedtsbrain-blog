'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ArtworkEntry } from '@/lib/contentful';

interface ArtworkGridProps {
  artworks: ArtworkEntry[];
}

export default function ArtworkGrid({ artworks }: ArtworkGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? artworks.length - 1 : selectedIndex - 1);
  }, [selectedIndex, artworks.length]);

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === artworks.length - 1 ? 0 : selectedIndex + 1);
  }, [selectedIndex, artworks.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToPrevious, goToNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  const selectedArtwork = selectedIndex !== null ? artworks[selectedIndex] : null;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {artworks.map((artwork, index) => {
          const imageUrl = artwork.fields.image?.fields?.file?.url
            ? artwork.fields.image.fields.file.url.startsWith('//')
              ? `https:${artwork.fields.image.fields.file.url}`
              : artwork.fields.image.fields.file.url
            : null;

          if (!imageUrl) return null;

          return (
            <button
              key={artwork.sys.id}
              onClick={() => openLightbox(index)}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 group focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Image
                src={imageUrl}
                alt={artwork.fields.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                <div className="w-full p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="font-medium text-sm truncate">{artwork.fields.title}</h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>

          {/* Navigation - Previous */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Previous artwork"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Navigation - Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Next artwork"
          >
            <ChevronRight size={40} />
          </button>

          {/* Image container */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const imageUrl = selectedArtwork.fields.image?.fields?.file?.url
                ? selectedArtwork.fields.image.fields.file.url.startsWith('//')
                  ? `https:${selectedArtwork.fields.image.fields.file.url}`
                  : selectedArtwork.fields.image.fields.file.url
                : null;

              if (!imageUrl) return null;

              const imageDetails = selectedArtwork.fields.image?.fields?.file?.details?.image;

              return (
                <Image
                  src={imageUrl}
                  alt={selectedArtwork.fields.title}
                  width={imageDetails?.width || 1200}
                  height={imageDetails?.height || 800}
                  className="max-h-[70vh] w-auto mx-auto object-contain"
                />
              );
            })()}

            {/* Caption */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-medium">{selectedArtwork.fields.title}</h3>
              {selectedArtwork.fields.medium && (
                <p className="text-gray-400 mt-1">{selectedArtwork.fields.medium}</p>
              )}
              {selectedArtwork.fields.description && (
                <p className="text-gray-300 mt-2 max-w-xl mx-auto">
                  {selectedArtwork.fields.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
