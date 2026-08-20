import { describe, expect, it } from 'vitest';
import { computeBadges } from './badges';
import type { BadgesInput } from './badges';

function baseInput(overrides: Partial<BadgesInput> = {}): BadgesInput {
  return {
    perTableStats: {},
    maxCombo: 0,
    gameMode: 'classic',
    elapsedRealMs: 0,
    errors: 0,
    questionsTotal: 0,
    questionsCorrect: 0,
    responseTimes: [],
    selectedTables: [],
    ...overrides,
  };
}

describe('computeBadges', () => {
  it("aucun badge pour une partie vide", () => {
    expect(computeBadges(baseInput())).toEqual([]);
  });

  it('badge "Maître" pour une table réussie à 100% sur au moins 5 questions', () => {
    const badges = computeBadges(
      baseInput({ perTableStats: { 7: { correct: 5, total: 5 } } })
    );
    expect(badges).toContainEqual(
      expect.objectContaining({ name: 'Maître de la table de 7' })
    );
  });

  it('pas de badge "Maître" si moins de 5 questions posées', () => {
    const badges = computeBadges(
      baseInput({ perTableStats: { 7: { correct: 4, total: 4 } } })
    );
    expect(badges.find((b) => b.name.startsWith('Maître'))).toBeUndefined();
  });

  it('badge "Inarrêtable" à partir de 15 de combo max', () => {
    expect(computeBadges(baseInput({ maxCombo: 14 }))).toEqual([]);
    expect(computeBadges(baseInput({ maxCombo: 15 }))).toContainEqual(
      expect.objectContaining({ name: 'Inarrêtable' })
    );
  });

  it('badge "Survivant" seulement en time attack après 2 minutes', () => {
    const classic = computeBadges(baseInput({ gameMode: 'classic', elapsedRealMs: 130000 }));
    expect(classic.find((b) => b.name === 'Survivant')).toBeUndefined();

    const timeattack = computeBadges(baseInput({ gameMode: 'timeattack', elapsedRealMs: 120000 }));
    expect(timeattack).toContainEqual(expect.objectContaining({ name: 'Survivant' }));
  });

  it('badge "Sans Faute" sans erreur et au moins 10 questions', () => {
    expect(computeBadges(baseInput({ errors: 0, questionsTotal: 9 })).find((b) => b.name === 'Sans Faute')).toBeUndefined();
    expect(computeBadges(baseInput({ errors: 0, questionsTotal: 10 }))).toContainEqual(
      expect.objectContaining({ name: 'Sans Faute' })
    );
  });

  it('badge "Éclair" pour un temps de réponse moyen < 1500ms sur au moins 8 questions', () => {
    const responseTimes = Array(8).fill(1000);
    expect(
      computeBadges(baseInput({ responseTimes, questionsTotal: 8 }))
    ).toContainEqual(expect.objectContaining({ name: 'Éclair' }));
  });

  it('badge "Explorateur" à partir de 8 tables sélectionnées', () => {
    const selectedTables = [2, 3, 4, 5, 6, 7, 8, 9];
    expect(computeBadges(baseInput({ selectedTables }))).toContainEqual(
      expect.objectContaining({ name: 'Explorateur' })
    );
  });

  it('badge "Chasseur de Défi" avec 3 tables difficiles réussies à 70%+', () => {
    const badges = computeBadges(
      baseInput({
        selectedTables: [7, 8, 9],
        questionsTotal: 10,
        questionsCorrect: 7,
      })
    );
    expect(badges).toContainEqual(expect.objectContaining({ name: 'Chasseur de Défi' }));
  });
});
