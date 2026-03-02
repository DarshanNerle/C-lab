import React, { useRef, useEffect } from 'react';
import { interpolateRgb } from 'd3-interpolate';
import { drawGlassReflections } from '../engine/LiquidRenderer';
import useLabStore from '../../../store/useLabStore';
import { CHEMISTRY_DATABASE } from '../../../constants/chemistryData';
import { getMixtureVisualProfile } from '../../../utils/chemicalColorSystem';

import { soundManager } from '../../../utils/soundManager';

/**
 * 2D Test Tube Component
 */
export default function TestTube2D({
    id = "testTube1",
    width = 40,
    height = 150,
    onClick,
    onDragStart,
    onDrop,
    onDragOver,
    selected = false
}) {
    const canvasRef = useRef(null);
    const currentColorRef = useRef(null);
    const clickRippleRef = useRef(0);
    const mixture = useLabStore(state => state.containers?.[id]);
    const activeReaction = useLabStore(state => state.activeReaction);

    const handleClick = (e) => {
        soundManager.play('clink');
        clickRippleRef.current = performance.now();
        if (onClick) onClick(e);
    };

    const vfxType = activeReaction?.vfx?.vfx2D?.animation || "";
    const isBubbling = vfxType?.includes("bubbles") && mixture?.volume > 0;
    const isPrecipitating = vfxType?.includes("precipitate") && mixture?.volume > 0;
    const isShimmering = vfxType === "heat_shimmer" && mixture?.volume > 0;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        let animationFrameId;
        let time = 0;

        const maxVol = mixture?.maxCapacity || 50;
        const currentVol = Math.min(mixture?.volume || 0, maxVol);
        const fillRatio = currentVol / maxVol;
        const targetColor = mixture?.color || "rgba(255,255,255,0)";
        const temp = mixture?.temp || 25;
        const heat = Math.max(0, Math.min(1, (temp - 25) / 60));
        const visualProfile = getMixtureVisualProfile((mixture?.components || []).map((component) => ({
            volume: component.volume,
            data: CHEMISTRY_DATABASE[component.id]
        })), activeReaction?.type);

        // Setup initial color state to avoid jump on first load
        if (!currentColorRef.current) {
            currentColorRef.current = targetColor;
        }

        const render = () => {
            if (!canvasRef.current) return;
            time++;

            // Smoothly lerp towards targetColor
            if (currentColorRef.current !== targetColor) {
                currentColorRef.current = interpolateRgb(currentColorRef.current, targetColor)(0.03); // Approx 500-1000ms transition
            }
            const color = currentColorRef.current;

            ctx.clearRect(0, 0, width, height);

            // Draw Back Glass
            ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            const radius = width / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width, height - radius);
            ctx.arc(radius, height - radius, radius, 0, Math.PI);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw Liquid
            if (fillRatio > 0) {
                const liquidH = fillRatio * (height - 15);
                const liqY = height - liquidH - 2;

                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = visualProfile.glow;

                ctx.beginPath();
                ctx.moveTo(3, liqY);
                for (let x = 3; x <= width - 3; x++) {
                    const wave = Math.sin((x * 0.1) + (time * 0.08)) * (1 + heat * 1.5);
                    ctx.lineTo(x, liqY + wave);
                }
                ctx.lineTo(width - 3, height - radius);
                ctx.arc(radius, height - radius, radius - 3, 0, Math.PI);
                ctx.lineTo(3, liqY);
                ctx.closePath();
                const liquidGradient = ctx.createLinearGradient(0, liqY, 0, height);
                liquidGradient.addColorStop(0, visualProfile.top);
                liquidGradient.addColorStop(0.48, color);
                liquidGradient.addColorStop(1, visualProfile.bottom);
                ctx.fillStyle = liquidGradient;
                ctx.fill();

                // Depth
                ctx.globalCompositeOperation = 'source-atop';
                const grad = ctx.createLinearGradient(0, liqY, 0, height);
                grad.addColorStop(0, visualProfile.surfaceHighlight);
                grad.addColorStop(1, "rgba(0,0,0,0.3)");
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';

                ctx.globalAlpha = 0.22;
                ctx.fillStyle = visualProfile.surfaceHighlight;
                ctx.fillRect(6, liqY + 1, Math.max(8, width * 0.26), Math.max(2, liquidH * 0.2));
                ctx.globalAlpha = 1;

                if (isBubbling) {
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = visualProfile.bubble;
                    ctx.fillStyle = visualProfile.bubble;
                    const intensity = (vfxType.includes("vigorous") ? 6 : 4) + Math.round(heat * 4);
                    for (let i = 0; i < intensity; i++) {
                        const bx = 5 + ((i * 10) % (width - 10));
                        const by = height - 5 - ((time * (0.5 + i * 0.1)) % liquidH);
                        if (by > liqY) {
                            ctx.beginPath();
                            ctx.arc(bx + Math.sin(time * 0.1 + i) * 2, by, 0.5 + (i % 2), 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }

                if (isPrecipitating) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = vfxType.includes("gold") ? "#ffd700" : "#ffffff";
                    ctx.fillStyle = vfxType.includes("gold") ? "rgba(255, 215, 0, 0.4)" : "rgba(255, 255, 255, 0.3)";
                    for (let i = 0; i < 15; i++) {
                        const px = 5 + (Math.sin(i * 1.5) * 0.5 + 0.5) * (width - 10);
                        const py = liqY + (liquidH * 0.3) + ((time * 0.15 + i * 4) % (liquidH * 0.7));
                        ctx.beginPath();
                        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    const cloudGrad = ctx.createLinearGradient(0, liqY, 0, liqY + liquidH);
                    cloudGrad.addColorStop(0, vfxType.includes("gold") ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 255, 255, 0.2)");
                    cloudGrad.addColorStop(1, "transparent");
                    ctx.fillStyle = cloudGrad;
                    ctx.fill();
                }

                if (isShimmering) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(time * 0.1) * 0.05})`;
                    ctx.fill();
                    ctx.restore();
                }

                if (temp > 50) {
                    const vaporCount = 2 + Math.floor(heat * 4);
                    for (let i = 0; i < vaporCount; i++) {
                        const vx = 4 + ((i * 9 + time) % Math.max(8, width - 8));
                        const vy = liqY - (time * 0.45 + i * 7) % 22;
                        ctx.fillStyle = `rgba(220,240,255,${0.06 + heat * 0.1})`;
                        ctx.beginPath();
                        ctx.arc(vx, vy, 1.6 + (i % 2), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.restore();
            }

            drawGlassReflections(ctx, 0, 0, width, height);

            // Rim
            ctx.strokeStyle = selected ? "#39FF14" : "rgba(200,200,200,0.8)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width, height - radius);
            ctx.arc(radius, height - radius, radius, 0, Math.PI);
            ctx.lineTo(0, 0);
            ctx.stroke();

            // Lip flare
            ctx.beginPath();
            ctx.moveTo(-2, 0);
            ctx.lineTo(width + 2, 0);
            ctx.stroke();

            if (temp > 45) {
                ctx.strokeStyle = `rgba(255,140,60,${0.15 + heat * 0.25})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, width - 2, height - 2);
            }

            const rippleMs = performance.now() - clickRippleRef.current;
            if (rippleMs < 550) {
                const p = rippleMs / 550;
                ctx.strokeStyle = `rgba(56,189,248,${0.35 * (1 - p)})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, 6 + p * 22, 0, Math.PI * 2);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mixture, width, height, isBubbling, selected]);

    return (
        <div
            className={`relative flex flex-col items-center cursor-pointer hover:-translate-y-2 transition-transform duration-300 ${selected ? 'drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'drop-shadow-lg'}`}
            onClick={handleClick}
            draggable
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <canvas ref={canvasRef} width={width} height={height} className="pointer-events-none" />
            <div className="mt-2 text-[10px] font-mono text-gray-500 font-bold uppercase">{id || 'T-Tube'}</div>
        </div>
    );
}
