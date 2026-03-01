import React, { useRef, useEffect } from 'react';

/**
 * 2D Dropper Component
 */
export default function Dropper2D({
    color = "rgba(255,255,255,0.2)",
    fillLevel = 0, // 0 to 1
    isActive = false,
    onClick
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = 40;
        const height = 120;

        ctx.clearRect(0, 0, width, height);

        // 1. Rubber Bulb
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.ellipse(20, 15, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(20, 15, 12, 15, 0, Math.PI * 1.5, Math.PI * 0.5);
        ctx.fill();

        // 2. Glass Tube
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(17, 30, 6, 70);

        // Tip
        ctx.beginPath();
        ctx.moveTo(17, 100);
        ctx.lineTo(23, 100);
        ctx.lineTo(21, 115);
        ctx.lineTo(19, 115);
        ctx.closePath();
        ctx.fill();

        // 3. Liquid inside
        if (fillLevel > 0) {
            ctx.fillStyle = color;
            const liqH = fillLevel * 60;
            ctx.fillRect(18, 100 - liqH, 4, liqH);

            // Tip liquid
            ctx.beginPath();
            ctx.moveTo(18, 100);
            ctx.lineTo(22, 100);
            ctx.lineTo(21, 114);
            ctx.lineTo(19, 114);
            ctx.closePath();
            ctx.fill();
        }

        // Outlines
        ctx.strokeStyle = "rgba(200,200,200,0.6)";
        ctx.lineWidth = 1;
        ctx.strokeRect(17, 30, 6, 70);
        ctx.beginPath();
        ctx.moveTo(17, 100);
        ctx.lineTo(19, 115);
        ctx.lineTo(21, 115);
        ctx.lineTo(23, 100);
        ctx.stroke();

    }, [color, fillLevel]);

    return (
        <div
            className={`cursor-pointer transition-transform ${isActive ? 'scale-110 -rotate-12' : 'hover:-translate-y-1'}`}
            onClick={onClick}
        >
            <canvas ref={canvasRef} width="40" height="120" />
        </div>
    );
}
