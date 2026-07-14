import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as StorageManager from '../src/js/StorageManager.js';

describe('StorageManager', () => {
    beforeEach(() => {
        // Mock localStorage
        const store = {};
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => store[key] || null),
            setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
            clear: vi.fn(() => { for (let key in store) delete store[key]; })
        });
    });

    it('should load default scores if none exist', () => {
        const scores = StorageManager.loadScores();
        expect(scores).toEqual({
            pvp: { x: 0, o: 0, ties: 0 },
            pve: { x: 0, o: 0, ties: 0 }
        });
    });

    it('should safely parse existing valid scores', () => {
        const savedScores = {
            pvp: { x: 5, o: 2, ties: 1 },
            pve: { x: 1, o: 3, ties: 0 }
        };
        localStorage.setItem('ttt_premium_scores', JSON.stringify(savedScores));

        const scores = StorageManager.loadScores();
        expect(scores).toEqual(savedScores);
    });

    it('should fallback to defaults gracefully if stored JSON is corrupted', () => {
        localStorage.setItem('ttt_premium_scores', '{ invalid json ]');
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const scores = StorageManager.loadScores();
        
        expect(scores).toEqual({
            pvp: { x: 0, o: 0, ties: 0 },
            pve: { x: 0, o: 0, ties: 0 }
        });
        
        consoleSpy.mockRestore();
    });

    it('should merge missing keys if schema changes', () => {
        // missing pve section entirely
        const partialScores = {
            pvp: { x: 5, o: 2, ties: 1 }
        };
        localStorage.setItem('ttt_premium_scores', JSON.stringify(partialScores));

        const scores = StorageManager.loadScores();
        expect(scores.pve).toBeDefined();
        expect(scores.pve.x).toBe(0);
        expect(scores.pvp.x).toBe(5);
    });
});
