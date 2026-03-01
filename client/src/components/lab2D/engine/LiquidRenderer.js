/**
 * Canvas 2D Liquid Renderer
 * Handles realistic liquid filling, meniscus sine-waves, and bubble physics.
 */

export const drawLiquid = (ctx, x, y, width, height, fillRatio, color, time, isBubbling) => {
    if (fillRatio <= 0) return;

    const liquidHeight = fillRatio * height;
    const currentY = y + height - liquidHeight;

    // Meniscus Wave Physics
    const waveAmp1 = 2;
    const waveFreq1 = 0.05;
    const waveSpeed1 = time * 0.003;

    const waveAmp2 = 1.5;
    const waveFreq2 = 0.08;
    const waveSpeed2 = time * 0.005;

    ctx.save();
    ctx.beginPath();

    // Start from bottom left
    ctx.moveTo(x, y + height);

    // Draw bottom
    ctx.lineTo(x + width, y + height);

    // Draw right side
    ctx.lineTo(x + width, currentY);

    // Draw top undulating meniscus
    for (let lx = x + width; lx >= x; lx -= 1) {
        // Superimpose two sine waves for a natural look
        const yOffset =
            Math.sin(lx * waveFreq1 + waveSpeed1) * waveAmp1 +
            Math.cos(lx * waveFreq2 - waveSpeed2) * waveAmp2;

        // Reduce wave amplitude at the edges of the container holding the liquid
        const edgeDamping = Math.sin(((lx - x) / width) * Math.PI);

        ctx.lineTo(lx, currentY + (yOffset * edgeDamping));
    }

    ctx.closePath();

    // Liquid Shading/Gradient
    // Darker at bottom, lighter at top for depth
    const gradient = ctx.createLinearGradient(x, currentY, x, y + height);
    // Parse the rgba string to inject a darker shade if needed, but since we use d3-interpolate 
    // earlier, we directly use the color and just add a slight gradient overlay via globalAlpha
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.8, color); // Solid color up to 80%

    // Slight shadow at the bottom
    ctx.fillStyle = gradient;
    ctx.fill();

    // Shine Highlights on liquid
    ctx.beginPath();
    ctx.moveTo(x + width - 10, currentY + 10);
    ctx.lineTo(x + width - 5, y + height - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isBubbling) {
        drawBubbles(ctx, x, y, width, height, currentY, time);
    }

    // Overflow / Spill Effect
    if (fillRatio >= 1.0) {
        ctx.fillStyle = color;
        const spillW = 4;
        const spillH = 40;
        // Draw spill on left side
        ctx.fillRect(x - spillW, y, spillW, (time * 2) % spillH + 10);
        // Draw spill on right side
        ctx.fillRect(x + width, y, spillW, (time * 1.5) % spillH + 8);
    }

    ctx.restore();
};

const drawBubbles = (ctx, x, y, width, height, currentY, time) => {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    // Simple pseudo-random static bubble positions animated upward
    for (let i = 0; i < 15; i++) {
        // Seed based on index
        const bx = x + ((i * 37) % width);
        // speed varies per bubble
        const speed = 0.5 + (i % 3) * 0.2;
        // Y rises upwards, wraps around back to bottom
        let by = (y + height) - ((time * speed + i * 15) % height);

        // Stop bubbling above meniscus
        if (by > currentY) {
            const rad = 1 + (i % 2.5); // size 1 to 3.5

            // Wiggle X
            const wiggle = Math.sin(time * 0.005 + i) * 2;

            ctx.beginPath();
            ctx.arc(bx + wiggle, by, rad, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

/**
 * Renders glass container reflections
 */
export const drawGlassReflections = (ctx, x, y, width, height) => {
    ctx.save();

    // Left rim glare
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 5);
    ctx.lineTo(x + 2, y + height - 5);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right thick glare
    ctx.beginPath();
    ctx.moveTo(x + width - 8, y + 10);
    ctx.lineTo(x + width - 5, y + height - 10);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
};
