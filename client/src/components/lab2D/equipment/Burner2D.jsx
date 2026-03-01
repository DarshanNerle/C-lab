import React, { useRef, useEffect } from 'react';

/**
 * 2D Bunsen Burner Component
 */
export default function Burner2D({
    isOn = false,
    width = 80,
    height = 140,
    intensity = 1.0, // 0.1 to 1.5
    onClick
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const render = () => {
            time++;
            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const baseY = height - 20;

            // 1. Draw Base
            ctx.fillStyle = "#333333";
            ctx.beginPath();
            ctx.ellipse(centerX, height - 10, 30, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(centerX - 20, height - 15, 40, 5);

            // 2. Draw Main Tube
            const tubeGrad = ctx.createLinearGradient(centerX - 8, 0, centerX + 8, 0);
            tubeGrad.addColorStop(0, "#444");
            tubeGrad.addColorStop(0.5, "#888");
            tubeGrad.addColorStop(1, "#333");
            ctx.fillStyle = tubeGrad;
            ctx.fillRect(centerX - 6, height - 100, 12, 85);

            // Air hole
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(centerX, height - 30, 3, 0, Math.PI * 2);
            ctx.fill();

            // 3. Draw Flame (if on)
            if (isOn) {
                ctx.save();
                ctx.translate(centerX, height - 105);

                // Outer Flame Glow
                ctx.shadowBlur = 30;
                ctx.shadowColor = "rgba(0, 102, 255, 0.8)";

                const fTime = time * 0.1;
                const flicker = Math.sin(fTime) * 2;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-15 - flicker, -30, -10 + flicker, -60, 0, -80 * intensity + flicker);
                ctx.bezierCurveTo(10 - flicker, -60, 15 + flicker, -30, 0, 0);

                const outerGrad = ctx.createRadialGradient(0, -30, 0, 0, -30, 60);
                outerGrad.addColorStop(0, "rgba(0, 150, 255, 0.6)");
                outerGrad.addColorStop(1, "rgba(0, 50, 200, 0)");
                ctx.fillStyle = outerGrad;
                ctx.fill();

                // Inner Flame (Hot Blue/Cyan)
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#00ffff";

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-8, -15, -5, -30, 0, -45 * intensity);
                ctx.bezierCurveTo(5, -30, 8, -15, 0, 0);

                const innerGrad = ctx.createLinearGradient(0, 0, 0, -40);
                innerGrad.addColorStop(0, "#00ffff");
                innerGrad.addColorStop(1, "rgba(0, 255, 255, 0)");
                ctx.fillStyle = innerGrad;
                ctx.fill();

                // Heat Shimmer effect
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                for (let i = 0; i < 3; i++) {
                    const sx = Math.sin(fTime + i) * 10;
                    const sy = -20 - ((fTime * 20 + i * 20) % 60);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isOn, intensity, width, height]);

    return (
        <div
            className="relative flex flex-col items-center cursor-pointer group"
            onClick={onClick}
        >
            <canvas ref={canvasRef} width={width} height={height} className="drop-shadow-2xl" />
            <div className={`mt-2 text-[10px] font-mono font-bold tracking-widest ${isOn ? 'text-neon-cyan animate-pulse' : 'text-gray-500'}`}>
                {isOn ? 'ACTIVE' : 'OFF'}
            </div>

            {/* Intensity Dial tooltip on hover */}
            {isOn && (
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-[10px] text-white border border-neon-cyan">
                    TEMP: {Math.round(400 * intensity)}°C
                </div>
            )}
        </div>
    );
}
