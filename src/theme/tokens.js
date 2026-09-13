/**
 * Tokens de design do Cognia.
 *
 * Paleta de baixíssima agressão sensorial: tons pastéis quentes, sem
 * vermelho-pureza (associado a erro), sem cores saturadas de alto contraste
 * exceto para texto (contraste alto onde é necessário: leitura).
 */
export const colors = {
  background: '#F6F3EC', // areia quente — não ofusca como branco puro
  surface: '#FFFFFF',
  surfaceMuted: '#EFE9DD',
  tileCover: '#DDD5C4', // verso das cartas: neutro e constante
  primary: '#44607F', // azul calmo (contraste 5.9:1 com branco)
  primaryPressed: '#364E68',
  success: '#7FA65A',
  successSoft: '#EAF0E0',
  star: '#E3BE5C',
  starOff: '#D8D2C4',
  text: '#33383D',
  textOnPrimary: '#FFFFFF',
  textMuted: '#6B7178',
  outline: '#D8D2C4',
  overlay: 'rgba(51, 56, 61, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
};

/** Tipografia: corpo mínimo de 18pt; escala do sistema é respeitada. */
export const font = {
  huge: 40,
  title: 30,
  heading: 22,
  button: 20,
  body: 18,
  label: 16,
};

export const sizes = {
  /** Alvo de toque mínimo — crianças e motricidade variada. */
  touch: 64,
  touchSecondary: 56,
  cardGap: 10,
  cardRadius: 16,
  starIcon: 26,
};

export const motion = {
  flip: 240,
  pop: 160,
  fade: 220,
  /** Pausa antes de virar as cartas não-combinadas (previsível, não abrupta). */
  revealDelay: 900,
};
