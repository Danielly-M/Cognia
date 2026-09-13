/**
 * Definição de categorias e níveis do Cognia.
 *
 * Princípios de UX (público autista):
 * - Poucas variáveis por categoria: uma mudança por vez (cor OU forma OU animal).
 * - Rótulos textuais sempre presentes (apoio à leitura e leitores de tela).
 * - Nenhum par depende apenas de cor (segurança para daltonismo): cada item
 *   tem formato/emoji distinto dentro da sua categoria quando aplicável e o
 *   par é sempre visualmente idêntico a si mesmo.
 */

/** Níveis progressivos: mais pares e grade maior. */
export const LEVELS = [
  { id: 'nivel-1', label: 'Nível 1', pairs: 2, cols: 2, help: 'Poucas cartas' },
  { id: 'nivel-2', label: 'Nível 2', pairs: 3, cols: 3, help: 'Algumas cartas a mais' },
  { id: 'nivel-3', label: 'Nível 3', pairs: 4, cols: 4, help: 'Todas as cartas' },
];

/** Categorias jogáveis, na ordem exibida. */
export const CATEGORIES = [
  {
    id: 'cores',
    label: 'Cores',
    kind: 'color',
    preview: '#5B87B5',
    pairs: [
      { id: 'vermelho', label: 'Vermelho', color: '#C96A5E' },
      { id: 'azul', label: 'Azul', color: '#5B87B5' },
      { id: 'verde', label: 'Verde', color: '#7FA65A' },
      { id: 'amarelo', label: 'Amarelo', color: '#E3BE5C' },
      { id: 'roxo', label: 'Roxo', color: '#9B7BB8' },
      { id: 'laranja', label: 'Laranja', color: '#DE9157' },
    ],
  },
  {
    id: 'formas',
    label: 'Formas',
    kind: 'shape',
    preview: '#7FA65A',
    pairs: [
      { id: 'circulo', label: 'Círculo', shape: 'circle' },
      { id: 'quadrado', label: 'Quadrado', shape: 'square' },
      { id: 'retangulo', label: 'Retângulo', shape: 'rectangle' },
      { id: 'triangulo', label: 'Triângulo', shape: 'triangle' },
      { id: 'losango', label: 'Losango', shape: 'diamond' },
      { id: 'cruz', label: 'Cruz', shape: 'plus' },
    ],
  },
  {
    id: 'animais',
    label: 'Animais',
    kind: 'emoji',
    preview: '#E3BE5C',
    pairs: [
      { id: 'cachorro', label: 'Cachorro', emoji: '🐶' },
      { id: 'gato', label: 'Gato', emoji: '🐱' },
      { id: 'coelho', label: 'Coelho', emoji: '🐰' },
      { id: 'sapo', label: 'Sapo', emoji: '🐸' },
      { id: 'macaco', label: 'Macaco', emoji: '🐵' },
      { id: 'passaro', label: 'Pássaro', emoji: '🐤' },
    ],
  },
];

/** Busca categoria por id. */
export function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) || null;
}

/** Busca nível por id. */
export function getLevel(levelId) {
  return LEVELS.find((l) => l.id === levelId) || null;
}

/** Índice do próximo nível (ou null se era o último). */
export function getNextLevel(levelId) {
  const idx = LEVELS.findIndex((l) => l.id === levelId);
  if (idx === -1 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}
