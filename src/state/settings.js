/**
 * Configurações do aplicativo — defaults + saneamento defensivo.
 *
 * Tudo aqui existe por um motivo de acessibilidade:
 * - sound: sons podem ser aversivos; ficam 100% desligáveis.
 * - reduceMotion: transições podem ser desconfortáveis; desligáveis.
 * - showLabels: rótulos de texto em todas as cartas (padrão: ligados).
 */
export const SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS = {
  version: SETTINGS_VERSION,
  sound: true,
  reduceMotion: false,
  showLabels: true,
};

/** Garante um objeto de configurações válido a partir de qualquer dado. */
export function sanitizeSettings(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };
  if (raw.version !== SETTINGS_VERSION) return { ...DEFAULT_SETTINGS };
  return {
    version: SETTINGS_VERSION,
    sound: typeof raw.sound === 'boolean' ? raw.sound : DEFAULT_SETTINGS.sound,
    reduceMotion:
      typeof raw.reduceMotion === 'boolean' ? raw.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
    showLabels:
      typeof raw.showLabels === 'boolean' ? raw.showLabels : DEFAULT_SETTINGS.showLabels,
  };
}

/** Atualização imutável de uma chave. */
export function updateSetting(settings, key, value) {
  const next = { ...settings, [key]: value };
  return sanitizeSettings(next);
}
