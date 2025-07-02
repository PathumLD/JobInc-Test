'use client';

import { useState } from "react";
import Image from "next/image";

const images = [
  "/carousel1.png",
  "/carousel2.png",
  "/carousel3.png",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-64">
      <Image
        src={images[index]}
        alt={`carousel-${index}`}
        width={800}
        height={256}
        className="w-full h-64 object-cover rounded-lg shadow"
        priority
      />
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full px-2 py-1"
        onClick={prev}
      >
        {"<"}
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full px-2 py-1"
        onClick={next}
      >
        {">"}
      </button>
    </div>
  );
}