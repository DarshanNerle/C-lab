import React, { useRef, useEffect } from 'react';
import { interpolateRgb } from 'd3-interpolate';
import { drawGlassReflections } from '../engine/LiquidRenderer';
import useLabStore from '../../../store/useLabStore';
import { CHEMISTRY_DATABASE } from '../../../constants/chemistryData';
import { getMixtureVisualProfile } from '../../../utils/chemicalColorSystem';

import { soundManager } from '../../../utils/soundManager';

/**
 * 2D Conical Flask (Erlenmeyer) Component
 */
export default function Flask2D({
    id = "flask1",
    width = 130,
    height = 170,
    label = "250mL",
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

        const maxVol = mixture?.maxCapacity || 250;
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

            // Draw Back Glass (Conical Shape)
            ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(width * 0.35, 0); // Neck top left
            ctx.lineTo(width * 0.65, 0); // Neck top right
            ctx.lineTo(width * 0.65, height * 0.4); // Neck bottom right
            ctx.lineTo(width, height - 10); // Base right
            ctx.arcTo(width, height, width - 10, height, 10);
            ctx.lineTo(10, height);
            ctx.arcTo(0, height, 0, height - 10, 10);
            ctx.lineTo(width * 0.35, height * 0.4); // Base left
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw Liquid
            if (fillRatio > 0) {
                const usableH = height * 0.8;
                const liquidH = fillRatio * usableH;
                const liqY = height - liquidH - 5;

                const bodyH = height * 0.6;
                const currentWidth = width - (liqY > height * 0.4
                    ? ((height - liqY) / bodyH) * (width * 0.35)
                    : width * 0.35);

                const startX = (width - currentWidth) / 2;

                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = visualProfile.glow;

                ctx.beginPath();
                ctx.moveTo(startX, liqY);

                for (let x = startX; x <= width - startX; x++) {
                    const wave = Math.sin((x * 0.05) + (time * 0.05)) * (1.2 + heat * 1.8);
                    ctx.lineTo(x, liqY + wave);
                }

                ctx.lineTo(width - 10, height - 5);
                ctx.lineTo(10, height - 5);
                ctx.closePath();

                const liquidGradient = ctx.createLinearGradient(0, liqY, 0, height);
                liquidGradient.addColorStop(0, visualProfile.top);
                liquidGradient.addColorStop(0.45, color);
                liquidGradient.addColorStop(1, visualProfile.bottom);
                ctx.fillStyle = liquidGradient;
                ctx.fill();

                // Depth shading
                ctx.globalCompositeOperation = 'source-atop';
                const grad = ctx.createLinearGradient(0, liqY, 0, height);
                grad.addColorStop(0, visualProfile.surfaceHighlight);
                grad.addColorStop(1, "rgba(0,0,0,0.3)");
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';

                ctx.globalAlpha = 0.24;
                ctx.fillStyle = visualProfile.surfaceHighlight;
                ctx.fillRect(startX + 8, liqY + 2, Math.max(20, currentWidth * 0.25), Math.max(3, liquidH * 0.14));
                ctx.globalAlpha = 1;

                if (isBubbling) {
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = visualProfile.bubble;
                    ctx.fillStyle = visualProfile.bubble;
                    const intensity = (vfxType.includes("vigorous") ? 10 : vfxType.includes("rapid") ? 15 : 6) + Math.round(heat * 6);
                    for (let i = 0; i < intensity; i++) {
                        const bx = startX + 10 + ((i * 20) % (currentWidth - 20));
                        const by = height - 5 - ((time * (0.4 + i * 0.1)) % liquidH);
                        if (by > liqY) {
                            ctx.beginPath();
                            ctx.arc(bx + Math.sin(time * 0.1 + i) * 3, by, 1 + (i % 2), 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }

                if (isPrecipitating) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = vfxType.includes("gold") ? "#ffd700" : "#ffffff";
                    ctx.fillStyle = vfxType.includes("gold") ? "rgba(255, 215, 0, 0.4)" : "rgba(255, 255, 255, 0.3)";
                    for (let i = 0; i < 20; i++) {
                        const px = startX + (Math.sin(i * 1.5) * 0.5 + 0.5) * (currentWidth);
                        const py = liqY + (liquidH * 0.3) + ((time * 0.2 + i * 5) % (liquidH * 0.7));
                        ctx.beginPath();
                        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    // Milky cloud top
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
                    const vaporCount = 3 + Math.floor(heat * 6);
                    for (let i = 0; i < vaporCount; i++) {
                        const vx = startX + 8 + ((i * 18 + time) % Math.max(10, currentWidth - 16));
                        const vy = liqY - (time * 0.5 + i * 6) % 26;
                        ctx.fillStyle = `rgba(220,240,255,${0.06 + heat * 0.1})`;
                        ctx.beginPath();
                        ctx.arc(vx, vy, 2 + (i % 3), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            }

            // Draw reflections
            drawGlassReflections(ctx, 0, 0, width, height);

            // Draw Flask Rim
            ctx.strokeStyle = selected ? "#39FF14" : "rgba(200,200,200,0.8)";
            ctx.lineWidth = selected ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(width * 0.35, 0);
            ctx.lineTo(width * 0.35, height * 0.4);
            ctx.lineTo(0, height - 10);
            ctx.arcTo(0, height, 10, height, 10);
            ctx.lineTo(width - 10, height);
            ctx.arcTo(width, height, width, height - 10, 10);
            ctx.lineTo(width * 0.65, height * 0.4);
            ctx.lineTo(width * 0.65, 0);
            ctx.lineTo(width * 0.35, 0);
            ctx.stroke();

            if (temp > 45) {
                ctx.strokeStyle = `rgba(255,140,60,${0.15 + heat * 0.25})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(2, 2, width - 4, height - 4);
            }

            const rippleMs = performance.now() - clickRippleRef.current;
            if (rippleMs < 550) {
                const p = rippleMs / 550;
                ctx.strokeStyle = `rgba(56,189,248,${0.35 * (1 - p)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, 8 + p * 32, 0, Math.PI * 2);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mixture, width, height, isBubbling, selected]);

    return (
        <div
            className={`relative flex flex-col items-center cursor-pointer hover:-translate-y-2 transition-transform duration-300 ${selected ? 'drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]' : 'drop-shadow-xl'}`}
            onClick={handleClick}
            draggable
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <canvas ref={canvasRef} width={width} height={height} className="pointer-events-none" />
            <div className="mt-2 text-xs font-mono text-gray-400 font-bold tracking-widest">{label}</div>
        </div>
    );
}
