import React, { useMemo } from "react";

const RADIUS = 100;
const ICON_SIZE = 28;

// Fibonacci spiral — evenly distributes N points on a sphere surface
function fibonacciSphere(n: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const phi = Math.acos(1 - 2 * (i + 0.5) / n); // polar angle  0–PI
    const theta = goldenAngle * i;                  // azimuthal    0–2PI
    return { phi, theta };
  });
}

const toDeg = (r: number) => (r * 180) / Math.PI;

export interface IconCloudProps {
  images: string[];
}

export function IconCloud({ images }: IconCloudProps) {
  const positions = useMemo(() => fibonacciSphere(images.length), [images.length]);

  return (
    <div style={{ position: "relative", width: RADIUS * 2, height: RADIUS * 2 }}>
      {/* Keyframe injected once — safe in React 18/19 */}
      <style>{`
        @keyframes ks-spin {
          from { transform: perspective(900px) rotateY(0deg)   rotateX(12deg); }
          to   { transform: perspective(900px) rotateY(360deg) rotateX(12deg); }
        }
        .ks-sphere {
          animation: ks-spin 28s linear infinite;
          transform-style: preserve-3d;
          width: 100%;
          height: 100%;
          position: relative;
        }
      `}</style>

      <div className="ks-sphere">
        {images.map((src, i) => {
          const { phi, theta } = positions[i];
          // Spherical → CSS-3D: rotateY(θ) rotateX(φ-90°) translateZ(r)
          const transform = [
            `rotateY(${toDeg(theta).toFixed(2)}deg)`,
            `rotateX(${(toDeg(phi) - 90).toFixed(2)}deg)`,
            `translateZ(${RADIUS}px)`,
          ].join(" ");

          return (
            <img
              key={i}
              src={src}
              width={ICON_SIZE}
              height={ICON_SIZE}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -(ICON_SIZE / 2),
                marginLeft: -(ICON_SIZE / 2),
                transform,
                borderRadius: 6,
                background: "rgba(255,255,255,0.12)",
                padding: 3,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
