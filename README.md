# Cognia 🧩

**Jogo digital de pareamento para estimulação cognitiva de crianças autistas.**

Atividade extensionista — UNINTER · CST em Análise e Desenvolvimento de Sistemas
· Atividade Extensionista II: *Tecnologia Aplicada à Inclusão Digital — Projeto*.

> Desenvolver um jogo digital interativo para auxiliar crianças autistas no
> desenvolvimento de habilidades cognitivas básicas (pareamento e
> categorização), com design inclusivo, interface livre de distrações e
> validação junto à comunidade.

**ODS 4** (Educação de qualidade) · **ODS 10** (Redução das desigualdades) · **ODS 1** (Erradicação da pobreza, no acesso equitativo à tecnologia educacional)

---

## ✨ O jogo

Três categorias progressivas, cada uma com **uma variável por vez** (princípio
fundamental para o público autista):

| Categoria | O que a criança explora | Cartas |
|---|---|---|
| 🎨 Cores | cores puras com o nome escrito | 4 / 6 / 8 |
| 🔷 Formas | formas geométricas desenhadas, sempre na mesma cor | 4 / 6 / 8 |
| 🐾 Animais | animais (emojis) com o nome escrito | 4 / 6 / 8 |

- **3 níveis por categoria** (2, 3 e 4 pares), desbloqueados ao concluir o anterior;
- **Estrelas (1–3)** por desempenho — **nunca zero**: terminar já é sucesso;
- **Três sons sintetizados à mão**, todos macios: acerto (arpejo claro),
  "tente de novo" (toque grave e suave — **não existe som de erro**), vitória;
- Progresso e configurações **salvos no aparelho** (100% offline).

## 🎯 Decisões de UX/acessibilidade (e o porquê de cada uma)

Cada linha abaixo nasceu da literatura de design para TEA e é verificável no código:

1. **Previsibilidade acima de tudo** — todas as telas usam a mesma casca
   (`ScreenShell`): título no mesmo lugar, botão "Voltar" sempre no mesmo canto,
   navegação linear (pilha). Nada desliza ou pula pela tela.
2. **Sem punição, sem pressão** — sem cronômetro, sem vidas, sem "game over",
   sem vermelho de erro. A carta não-combinada apenas volta, calmamente, após
   uma pausa de 900ms para a criança processar as duas figuras.
3. **Feedback sempre redundante em 3 canais** — visual (cor da carta), sonoro
   (opcional) e **textual/acessível** ("Par encontrado: Cachorro"). Nenhum
   estado existe só por cor ou só por animação.
4. **Uma variável por vez** — a categoria "Formas" desenha todas as formas na
   MESMA cor; "Cores" usa apenas quadrados de tamanhos idênticos. O cérebro não
   precisa filtrar estímulos irrelevantes.
5. **Alvos de toque grandes e constantes** — botões com 64pt de altura mínima,
   grade de cartas com células quadradas iguais.
6. **Sensibilidade sensorial é escolha, não sorte** — `Configurações` permite
   desligar **sons** (100%, sem sons residuais) e **animações** (modo "animações
   reduzidas") e ocultar rótulos se a leitura for distração.
7. **Sem assets externos de imagem** — visuais são desenhados com View/emojis do
   sistema: renderização idêntica em qualquer aparelho, app minúsculo, nada
   muda de aspecto entre dispositivos (previsível para a criança).
8. **Sons sintetizados, não comprados** — senoides com envelope suave a volume
   mestre baixo (0.45). O som de "erro" foi deliberadamente substituído por um
   som de "tente de novo" acolhedor.
9. **Respeito à escala de fonte do sistema** nos textos de leitura (cartas usam
   fonte fixa por serem elementos visuais do jogo).
10. **Falhar é proibido** — storage corrompido, JSON inválido, versão
    incompatível ou áudio quebrado NUNCA derrubam o app (ver `storage.test.js`
    e `sounds.test.js`).

## 🧱 Stack

- **Expo SDK 57** + React Native 0.86 + React 19 (JavaScript)
- **@react-navigation/native-stack** — navegação em pilha previsível
- **expo-audio** — efeitos sonoros (biblioteca oficial do SDK 57; o `expo-av`
  citado na proposta foi substituído por ele, pois foi removido do SDK)
- **@react-native-async-storage/async-storage** — persistência local
- **Jest + jest-expo + @testing-library/react-native** — 98 testes

Sem Redux, sem backend, sem analytics: superfície mínima, confiança máxima.

## 🚀 Como rodar

```bash
npm install
npm start          # abre o Expo; escaneie o QR com o app Expo Go no celular
npm run android    # ou direto no Android emulador/dispositivo
npm test           # suíte completa (98 testes)
```

Requer Node 20+. Opcional (regerar efeitos sonoros): `npm run sounds`.

## 📦 Gerar o APK

Com [EAS Build](https://docs.expo.dev/build/introduction/) (nuvem, sem Android Studio):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # gera Cognia.apk (ver eas.json)
```

Local (precisa de Android Studio/SDK):

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease   # app/build/outputs/apk/release/
```

## ✅ Status da validação com a comunidade (etapa acadêmica)

Implementação e testes automatizados estão prontos. Faltam as etapas que
exigem pessoas — mantenha como checklist do trabalho final:

- [ ] Instalar o APK em 2+ famílias com crianças autistas (Fortaleza/CE)
- [ ] Coletar feedback de pais e terapeutas (roteiro em `docs/` se precisar)
- [ ] Registrar consentimento informado para filmagens
- [ ] Gravar vídeo demonstrativo (~5 min) e capturar telas
- [ ] Publicar no GitHub (repositório já inicializado com git local) e subir o APK

## 📂 Estrutura

```
src/
  game/        # motor puro: baralho, reducer do jogo, níveis, pontuação
  state/       # progresso, configurações, persistência (tudo puro + storage)
  audio/       # fábrica de sons injetável (testável sem nativos)
  components/  # GameCard, BigButton, StarRow, Glyph, ScreenShell
  screens/     # Home, Categorias, Níveis, Jogo, Configurações
  navigation/  # pilha única + tema
  theme/       # tokens de design (paleta calma, tamanhos, tempos)
scripts/       # síntese dos efeitos sonoros (WAV PCM)
tests/         # setup global do Jest
```

A lógica de jogo é **100% pura e determinística** (PRNG semeado) — o que torna
os testes unitários densos e rápidos (~2s).

## 📄 Licença

MIT — ver [LICENSE](LICENSE).
