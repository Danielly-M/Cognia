/**
 * Motor do jogo de pareamento — 100% puro (sem timers, sem efeitos).
 *
 * O reducer recebe ações e devolve o próximo estado. Quem decide QUANDO
 * virar as cartas de volta é a UI (um setTimeout discreto chama a ação
 * 'resolve'), o que mantém a lógica determinística e testável.
 *
 * Estados possíveis (`status`):
 * - 'idle'      → aguardando a próxima jogada
 * - 'resolving' → duas cartas viradas, aguardando avaliação da UI
 * - 'won'       → todos os pares encontrados
 */

/** Cria o estado inicial a partir de um baralho pronto. */
export function createGameState(deck) {
  return {
    cards: deck.map((card) => ({ ...card })),
    selected: [], // índices das cartas currently viradas (0, 1 ou 2)
    matchedCount: 0,
    moves: 0,
    status: 'idle',
  };
}

function flipCard(state, index) {
  const card = state.cards[index];
  if (!card || card.matched || card.faceUp) return null;
  // UX: nunca mais de duas cartas viradas; durante 'resolving' nada é clicável.
  if (state.status !== 'idle' || state.selected.length >= 2) return null;

  const cards = state.cards.map((c, i) => (i === index ? { ...c, faceUp: true } : c));
  const selected = [...state.selected, index];
  const resolving = selected.length === 2;
  return {
    ...state,
    cards,
    selected,
    moves: resolving ? state.moves + 1 : state.moves,
    status: resolving ? 'resolving' : 'idle',
  };
}

function resolve(state) {
  if (state.status !== 'resolving' || state.selected.length !== 2) return state;
  const [a, b] = state.selected;
  const [ca, cb] = [state.cards[a], state.cards[b]];
  const isMatch = ca.pairId === cb.pairId;

  const cards = state.cards.map((c, i) => {
    if (i !== a && i !== b) return c;
    return isMatch ? { ...c, matched: true, faceUp: true } : { ...c, faceUp: false };
  });
  const matchedCount = isMatch ? state.matchedCount + 1 : state.matchedCount;
  const totalPairs = state.cards.length / 2;

  return {
    ...state,
    cards,
    selected: [],
    matchedCount,
    status: matchedCount === totalPairs ? 'won' : 'idle',
  };
}

/** Reducer puro do jogo. Ações desconhecidas não alteram o estado. */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'flip':
      return flipCard(state, action.index) || state;
    case 'resolve':
      return resolve(state);
    case 'restart':
      return createGameState(action.deck);
    default:
      return state;
  }
}

/** As duas cartas atualmente selecionadas formam um par? */
export function selectedIsMatch(state) {
  if (state.selected.length !== 2) return false;
  const [a, b] = state.selected;
  return state.cards[a].pairId === state.cards[b].pairId;
}

/** Índice do par de cartas selecionadas (ou null). */
export function getSelectedIndices(state) {
  return state.selected.length === 2 ? [...state.selected] : null;
}

/** Quantas cartas ainda faltam. */
export function remainingCards(state) {
  return state.cards.filter((c) => !c.matched).length;
}
