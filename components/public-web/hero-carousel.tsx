'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/carousel1.png",
  "/carousel2.png",
  "/carousel3.png",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(next, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full  h-64 sm:h-80 md:h-96 lg:h-[28rem] group">
      {/* Main Image */}
      <div className="relative w-full mt-6 h-full overflow-hidden rounded-lg shadow-sm border border-gray-200">
        <Image
          src={images[index]}
          alt={`Slide ${index + 1}`}
          width={1200}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          priority
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-sm border border-gray-200 rounded-full p-2 transition-all duration-200 hover:shadow-md opacity-0 group-hover:opacity-100 hover:scale-110"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-sm border border-gray-200 rounded-full p-2 transition-all duration-200 hover:shadow-md opacity-0 group-hover:opacity-100 hover:scale-110"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              i === index
                ? 'bg-white shadow-sm'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-white/90 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm border border-gray-200">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}