const STORAGE_KEY = 'ttt_premium_scores';

const defaultScores = {
    pvp: { x: 0, o: 0, ties: 0 },
    pve: { x: 0, o: 0, ties: 0 }
};

export function loadScores() {
    try {
        const savedScores = localStorage.getItem(STORAGE_KEY);
        if (!savedScores) return { pvp: { ...defaultScores.pvp }, pve: { ...defaultScores.pve } };
        
        const parsed = JSON.parse(savedScores);
        if (!parsed || typeof parsed !== 'object') {
            return { pvp: { ...defaultScores.pvp }, pve: { ...defaultScores.pve } };
        }
        
        const sanitizeScoreGroup = (group) => {
            const sanitized = {};
            const source = group || {};
            sanitized.x = Number.isInteger(source.x) && source.x >= 0 ? source.x : 0;
            sanitized.o = Number.isInteger(source.o) && source.o >= 0 ? source.o : 0;
            sanitized.ties = Number.isInteger(source.ties) && source.ties >= 0 ? source.ties : 0;
            return sanitized;
        };

        return {
            pvp: sanitizeScoreGroup(parsed.pvp),
            pve: sanitizeScoreGroup(parsed.pve)
        };
    } catch (e) {
        console.error('Failed to load or parse saved scores:', e);
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
    try {
        const theme = localStorage.getItem('ttt_premium_theme');
        return (theme === 'light' || theme === 'dark') ? theme : 'dark';
    } catch (e) {
        return 'dark';
    }
}

export function saveTheme(theme) {
    try {
        localStorage.setItem('ttt_premium_theme', theme);
    } catch (e) {
        console.error('Failed to save theme:', e);
    }
}

export function loadSoundEnabled() {
    try {
        return localStorage.getItem('ttt_premium_sound') !== 'false';
    } catch (e) {
        return true;
    }
}

export function saveSoundEnabled(enabled) {
    try {
        localStorage.setItem('ttt_premium_sound', enabled);
    } catch (e) {
        console.error('Failed to save sound setting:', e);
    }
}

export function loadGameMode() {
    try {
        const mode = localStorage.getItem('ttt_premium_mode');
        return (mode === 'pvp' || mode === 'pve') ? mode : 'pvp';
    } catch (e) {
        return 'pvp';
    }
}

export function saveGameMode(mode) {
    try {
        localStorage.setItem('ttt_premium_mode', mode);
    } catch (e) {
        console.error('Failed to save game mode:', e);
    }
}

export function loadDifficulty() {
    try {
        const diff = localStorage.getItem('ttt_premium_difficulty');
        return (diff === 'easy' || diff === 'medium' || diff === 'impossible') ? diff : 'impossible';
    } catch (e) {
        return 'impossible';
    }
}

export function saveDifficulty(difficulty) {
    try {
        localStorage.setItem('ttt_premium_difficulty', difficulty);
    } catch (e) {
        console.error('Failed to save difficulty:', e);
    }
}
