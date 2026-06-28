const STORAGE_KEY = 'ttt_premium_scores';

const defaultScores = {
    pvp: { x: 0, o: 0, ties: 0 },
    pve: { x: 0, o: 0, ties: 0 }
};

export function loadScores() {
    const savedScores = localStorage.getItem(STORAGE_KEY);
    if (!savedScores) return { pvp: { ...defaultScores.pvp }, pve: { ...defaultScores.pve } };
    
    try {
        const parsed = JSON.parse(savedScores);
        return {
            pvp: { ...defaultScores.pvp, ...(parsed.pvp || {}) },
            pve: { ...defaultScores.pve, ...(parsed.pve || {}) }
        };
    } catch (e) {
        console.error('Failed to parse saved scores:', e);
        return { pvp: { ...defaultScores.pvp }, pve: { ...defaultScores.pve } };
    }
}

export function saveScores(scores) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
        console.error('Failed to save scores:', e);
    }
}

export function loadTheme() {
    return localStorage.getItem('ttt_premium_theme') || 'dark';
}

export function saveTheme(theme) {
    localStorage.setItem('ttt_premium_theme', theme);
}

export function loadSoundEnabled() {
    return localStorage.getItem('ttt_premium_sound') !== 'false';
}

export function saveSoundEnabled(enabled) {
    localStorage.setItem('ttt_premium_sound', enabled);
}
