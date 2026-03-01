import React, { useRef, useEffect } from 'react';
import { interpolateRgb } from 'd3-interpolate';
import { drawGlassReflections } from '../engine/LiquidRenderer';
import useLabStore from '../../../store/useLabStore';
import { soundManager } from '../../../utils/soundManager';

/**
 * 2D Beaker Component
 */
export default function Beaker2D({
    id = 'beaker1',
    width = 140,
    height = 170,
    label = '500mL',
    onClick,
    onDragStart,
    onDrop,
    onDragOver,
    selected = false
}) {
    const canvasRef = useRef(null);
    const currentColorRef = useRef(null);
    const clickRippleRef = useRef(0);
    const mixture = useLabStore((state) => state.containers?.[id]);
    const activeReaction = useLabStore((state) => state.activeReaction);

    const handleClick = (e) => {
        soundManager.play('clink');
        clickRippleRef.current = performance.now();
        if (onClick) onClick(e);
    };

    const vfxType = activeReaction?.vfx?.vfx2D?.animation || '';
    const isBubbling = vfxType.includes('bubbles') && mixture?.volume > 0;
    const isPrecipitating = vfxType.includes('precipitate') && mixture?.volume > 0;
    const isShimmering = vfxType === 'heat_shimmer' && mixture?.volume > 0;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let time = 0;

        const maxVol = mixture?.maxCapacity || 500;
        const currentVol = Math.min(mixture?.volume || 0, maxVol);
        const fillRatio = currentVol / maxVol;
        const targetColor = mixture?.color || 'rgba(255,255,255,0)';
        const temp = mixture?.temp || 25;
        const heat = Math.max(0, Math.min(1, (temp - 25) / 60));

        if (!currentColorRef.current) {
            currentColorRef.current = targetColor;
        }

        const render = () => {
            if (!canvasRef.current) return;
            time += 1;

            if (currentColorRef.current !== targetColor) {
                currentColorRef.current = interpolateRgb(currentColorRef.current, targetColor)(0.03);
            }
            const color = currentColorRef.current;

            const rim = 10;
            const wall = 4;
            const bottomPadding = 6;

            ctx.clearRect(0, 0, width, height);

            // Back glass
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rim, rim);
            ctx.lineTo(width - rim, rim);
            ctx.lineTo(width - wall, height - bottomPadding);
            ctx.lineTo(wall, height - bottomPadding);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            if (fillRatio > 0) {
                const usableHeight = height - rim - bottomPadding;
                const liquidHeight = fillRatio * usableHeight;
                const liquidY = height - bottomPadding - liquidHeight;

                ctx.save();
                ctx.shadowBlur = 14;
                ctx.shadowColor = color;

                ctx.beginPath();
                ctx.moveTo(wall + 2, liquidY);
                for (let x = wall + 2; x <= width - wall - 2; x++) {
                    const wave = Math.sin((x * 0.06) + (time * 0.06)) * (1.4 + heat * 2);
                    ctx.lineTo(x, liquidY + wave);
                }
                ctx.lineTo(width - wall - 2, height - bottomPadding - 1);
                ctx.lineTo(wall + 2, height - bottomPadding - 1);
                ctx.closePath();

                ctx.fillStyle = color;
                ctx.fill();

                // Depth shading
                ctx.globalCompositeOperation = 'source-atop';
                const depthGrad = ctx.createLinearGradient(0, liquidY, 0, height);
                depthGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
                depthGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
                ctx.fillStyle = depthGrad;
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';

                if (isBubbling) {
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = '#ffffff';
                    ctx.fillStyle = 'rgba(255,255,255,0.45)';
                    const intensity = (vfxType.includes('vigorous') ? 12 : 8) + Math.round(heat * 6);
                    for (let i = 0; i < intensity; i++) {
                        const bx = wall + 10 + ((i * 18) % (width - wall * 2 - 20));
                        const by = height - bottomPadding - ((time * (0.35 + i * 0.05)) % liquidHeight);
                        if (by > liquidY) {
                            ctx.beginPath();
                            ctx.arc(bx + Math.sin(time * 0.08 + i) * 2, by, 1 + (i % 2), 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }

                if (isPrecipitating) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = vfxType.includes('gold') ? '#ffd700' : '#ffffff';
                    ctx.fillStyle = vfxType.includes('gold') ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.3)';
                    for (let i = 0; i < 24; i++) {
                        const px = wall + 8 + (Math.sin(i * 1.2) * 0.5 + 0.5) * (width - wall * 2 - 16);
                        const py = liquidY + (liquidHeight * 0.4) + ((time * 0.18 + i * 4) % (liquidHeight * 0.6));
                        ctx.beginPath();
                        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                if (isShimmering) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.sin(time * 0.1) * 0.04})`;
                    ctx.fill();
                    ctx.restore();
                }

                if (temp > 50) {
                    const vaporCount = 4 + Math.floor(heat * 8);
                    for (let i = 0; i < vaporCount; i++) {
                        const vx = wall + 10 + ((i * 17 + time) % (width - 20));
                        const vy = liquidY - (time * 0.6 + i * 7) % 28;
                        ctx.fillStyle = `rgba(220,240,255,${0.08 + heat * 0.08})`;
                        ctx.beginPath();
                        ctx.arc(vx, vy, 3 + (i % 3), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.restore();
            }

            drawGlassReflections(ctx, 0, 0, width, height);

            // Front outline + top rim
            ctx.strokeStyle = selected ? '#39FF14' : 'rgba(210,210,210,0.9)';
            ctx.lineWidth = selected ? 2.5 : 2;
            ctx.beginPath();
            ctx.moveTo(rim, rim);
            ctx.lineTo(width - rim, rim);
            ctx.lineTo(width - wall, height - bottomPadding);
            ctx.lineTo(wall, height - bottomPadding);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(rim - 2, rim);
            ctx.lineTo(width - rim + 2, rim);
            ctx.stroke();

            if (temp > 45) {
                ctx.strokeStyle = `rgba(255,120,40,${0.15 + heat * 0.25})`;
                ctx.lineWidth = 3;
                ctx.strokeRect(2, 2, width - 4, height - 4);
            }

            const rippleMs = performance.now() - clickRippleRef.current;
            if (rippleMs < 550) {
                const p = rippleMs / 550;
                ctx.strokeStyle = `rgba(56,189,248,${0.35 * (1 - p)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, 8 + p * 36, 0, Math.PI * 2);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mixture, width, height, isBubbling, selected, isPrecipitating, isShimmering, vfxType]);

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
