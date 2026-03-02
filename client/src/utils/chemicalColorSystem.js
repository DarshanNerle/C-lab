const FAMILY_RGB = {
    acid: [34, 211, 238],
    base: [139, 92, 246],
    neutral: [219, 234, 254],
    metal_salt: [16, 185, 129],
    oxidizer: [251, 146, 60],
    precipitate: [244, 214, 233],
    gas: [196, 181, 253],
    mixed: [125, 211, 252]
};

const OXIDIZER_TERMS = ['peroxide', 'permanganate', 'dichromate', 'nitrate', 'chlorate'];
const METAL_TERMS = ['copper', 'iron', 'silver', 'zinc', 'nickel', 'cobalt', 'chromium', 'manganese', 'lead', 'barium', 'magnesium'];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toRgba = (rgb, alpha = 1) => `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${clamp(alpha, 0, 1)})`;

function classifyChemical(chemical = {}) {
    const name = String(chemical.name || '').toLowerCase();
    const formula = String(chemical.formula || '').toLowerCase();
    const ph = Number(chemical.ph);
    const state = String(chemical.state || '').toLowerCase();

    if (state === 'gas') return 'gas';
    if (state === 'solid') return 'precipitate';
    if (OXIDIZER_TERMS.some((term) => name.includes(term) || formula.includes(term))) return 'oxidizer';
    if (METAL_TERMS.some((term) => name.includes(term)) && (name.includes('chloride') || name.includes('sulfate') || name.includes('nitrate'))) return 'metal_salt';
    if (Number.isFinite(ph) && ph <= 4.5) return 'acid';
    if (Number.isFinite(ph) && ph >= 9.2) return 'base';
    if (Number.isFinite(ph) && ph >= 6.2 && ph <= 8.4) return 'neutral';
    return 'mixed';
}

export function getMixtureVisualProfile(components = [], reactionType = '') {
    if (!Array.isArray(components) || components.length === 0) {
        return {
            family: 'neutral',
            top: toRgba(FAMILY_RGB.neutral, 0.32),
            mid: toRgba(FAMILY_RGB.neutral, 0.22),
            bottom: toRgba([165, 180, 252], 0.42),
            glow: toRgba(FAMILY_RGB.neutral, 0.35),
            bubble: toRgba([255, 255, 255], 0.62),
            surfaceHighlight: 'rgba(255,255,255,0.45)'
        };
    }

    const weighted = {};
    let totalWeight = 0;
    components.forEach((item) => {
        const family = classifyChemical(item?.data || item);
        const weight = Number(item?.volume || 1);
        weighted[family] = (weighted[family] || 0) + weight;
        totalWeight += weight;
    });

    let dominant = Object.entries(weighted).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';

    const normalizedReaction = String(reactionType || '').toLowerCase();
    if (normalizedReaction.includes('gas')) dominant = 'gas';
    if (normalizedReaction.includes('precip')) dominant = 'precipitate';

    const rgb = FAMILY_RGB[dominant] || FAMILY_RGB.mixed;
    const top = [rgb[0] + 26, rgb[1] + 24, rgb[2] + 24].map((v) => clamp(v, 0, 255));
    const bottom = [rgb[0] - 25, rgb[1] - 24, rgb[2] - 28].map((v) => clamp(v, 0, 255));

    return {
        family: dominant,
        top: toRgba(top, dominant === 'neutral' ? 0.26 : 0.62),
        mid: toRgba(rgb, dominant === 'neutral' ? 0.2 : 0.56),
        bottom: toRgba(bottom, dominant === 'neutral' ? 0.34 : 0.66),
        glow: toRgba(rgb, dominant === 'neutral' ? 0.22 : 0.5),
        bubble: toRgba(top, dominant === 'neutral' ? 0.58 : 0.72),
        surfaceHighlight: dominant === 'neutral' ? 'rgba(255,255,255,0.52)' : toRgba(top, 0.56)
    };
}

export function profileToColor(profile, alpha = 0.65) {
    const match = String(profile?.mid || '').match(/rgba?\(([^)]+)\)/);
    if (!match) return `rgba(125, 211, 252, ${alpha})`;
    const parts = match[1].split(',').map((part) => Number(String(part).trim())).filter((num) => Number.isFinite(num));
    const rgb = [parts[0] || 125, parts[1] || 211, parts[2] || 252];
    return toRgba(rgb, alpha);
}
