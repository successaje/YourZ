'use client';

import { useEffect, useRef } from 'react';

export function HeroIllustration() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle
          cx="200"
          cy="200"
          r="180"
          className="fill-primary/5 dark:fill-primary/10"
        />

        {/* Typewriter Base */}
        <g className="animate-float">
          <rect
            x="100"
            y="220"
            width="200"
            height="40"
            rx="5"
            className="fill-gray-800 dark:fill-gray-200"
          />
          <rect
            x="120"
            y="180"
            width="160"
            height="40"
            rx="5"
            className="fill-gray-700 dark:fill-gray-300"
          />
          {/* Keys */}
          <g className="animate-keys">
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x={130 + i * 20}
                y="190"
                width="15"
                height="20"
                rx="2"
                className="fill-primary"
              />
            ))}
          </g>
        </g>

        {/* NFT Token */}
        <g className="animate-float-delayed">
          <rect
            x="250"
            y="150"
            width="100"
            height="140"
            rx="10"
            className="fill-white dark:fill-gray-800 stroke-primary stroke-2"
          />
          <path
            d="M260 170 L340 170 M260 190 L340 190 M260 210 L340 210"
            className="stroke-primary stroke-2"
          />
          <circle
            cx="300"
            cy="240"
            r="15"
            className="fill-primary"
          />
        </g>

        {/* Connection Line */}
        <path
          d="M260 200 C 280 200, 280 180, 300 180"
          className="stroke-primary stroke-2 fill-none animate-draw"
        />

        {/* Decorative Elements */}
        <g className="animate-pulse">
          <circle
            cx="100"
            cy="100"
            r="5"
            className="fill-primary"
          />
          <circle
            cx="300"
            cy="100"
            r="5"
            className="fill-primary"
          />
          <circle
            cx="100"
            cy="300"
            r="5"
            className="fill-primary"
          />
          <circle
            cx="300"
            cy="300"
            r="5"
            className="fill-primary"
          />
        </g>
      </svg>
    </div>
  );
} 