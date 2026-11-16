# 📋 Checklist Maestro de Desarrollo: TuPartidaApp

**Proyecto:** `TuPartidaApp`  
**Ecosistema:** MasterApps Labs  
**Versión:** 1.0.0-MVP-PLAN  
**Arquitectura:** PWA Mobile-First (React + Vite + Tailwind CSS) + Firebase (Firestore + Auth + Hosting)  
**Filosofía:** 100% Non-Custodial (Cero retención de dinero, SaaS de Conciliación y Libro Contable Comunitario)  
**GCP & Firebase Target:** Proyecto en Organización `mariojoserodriguez-org` (`project-50b07764-c4ba-4320-b28` renombrado a `TuPartidaApp`)

---

## 🇻🇪 Glosario y Localización Cultural (Terminología Criolla)
- **El Bombo / La Cantadera:** En lugar de "Tómbola", usamos el término natural venezolano ("El bombo del bingo", "sacar la bola / bolita", "cantar bingo").
- **Marcadores de Mesa:** Caraota Negra, Grano de Maíz, Lenteja Marrón y Sello Arcade Neón.
- **El Pote / Recaudación:** Fondo pro-fondos recaudado directamente por el anfitrión vía Pago Móvil, Zelle o efectivo.

---

## 🎯 Plan de Fases de Desarrollo

### 🟢 Fase 0: Infraestructura, Git y Conexión Cloud
- [x] Inicializar repositorio local Git con rama `main` y `.gitignore`.
- [x] Crear repositorio remoto en GitHub: `https://github.com/mariojoserodriguez/TuPartidaApp` y hacer push inicial.
- [x] Extraer y estructurar el prototipo visual de Stitch (`prototype_stitch/`).
- [x] Crear `checklist.md` con la hoja de ruta y decisiones de arquitectura.
- [x] Crear `AGENTS.md` con el protocolo de estaciones de trabajo (PC Casa maestra vs satélites) y directrices.
- [x] Renombrar en Google Cloud Console el proyecto a `TuPartidaApp` (`project-50b07764-c4ba-4320-b28`).
- [x] Habilitar Firestore Database en modo Nativo (Región `nam5` - Free Tier).
- [x] Registrar Web App en Firebase y configurar variables en `.env`.
- [x] Diseñar e implementar `firestore.rules` con el subagente especialista y desplegar a Firebase Cloud.
- [x] Actualizar `firestore.rules`: aplanado de matrices de bingo a listas de 25 elementos (`isValidBingoMatrix`, `isValidBingoMarked`) debido a restricción de Firestore SDK (no soporta arrays anidados). Compilación validada con `--dry-run`.
- [x] Sanitizar objetos en Firestore (`ignoreUndefinedProperties: true` y valor por defecto en `paymentInfo`).
- [x] Actualizar `firestore.rules`: soporte para subcolección de chat en tiempo real (`/rooms/{roomId}/messages/{messageId}`), flags de moderación de chat en configuración de sala (`chatEnabled`, `voiceNotesEnabled`) y validador de mensajes (`isValidMessage`). Límite de tamaño de `mediaUrl` actualizado a 70.000 caracteres para permitir imágenes base64 inline (stickers y GIFs). Compilación verificada con `--dry-run`.
- [x] Actualizar `firestore.rules`: incremento del límite de tamaño en mensajes para `mediaUrl` a 250.000 caracteres (soporte de stickers GIF animados fluidos de alto frame rate) y `audioData` a 150.000 caracteres (notas de voz extendidas en Base64). Compilación y compatibilidad verificadas con `--dry-run`.
- [x] Configurar script de despliegue controlado `npm run deploy:clean` en `package.json`.

---

### 🎨 Fase 1: Arquitectura Frontend & Sistema de Diseño (Mobile-First PWA)
- [x] Inicializar proyecto base: `Vite + React 19 + TypeScript + Tailwind CSS v4`.
- [x] Configurar tipografías (`Outfit`, `Plus Jakarta Sans`, `Space Grotesk`) y paleta de colores del diseño Stitch (`#0b1326`, indigo `#4f46e5`, esmeralda, dorado).
- [x] Implementar Layout común (Header móvil con logo SocialPlay/TuPartida, selector de marcadores criollos y autenticación).
- [x] Desarrollar **Hub Principal**:
  - [x] Selector de modo (*Amistoso* vs *Pro-Fondos*).
  - [x] Tarjetas de acceso a **Bingo en Vivo** y **Micro-Rifas**.
  - [x] Tarjetas de juegos futuros (Dominó, Ludo y Ajedrez marcados como "Próximamente").
  - [x] Entrada rápida a sala por código PIN de 6 dígitos.
  - [x] Modal de creación de sala con configuración personalizada.

---

### 🎱 Fase 2: Módulo de Bingo en Vivo (El Bombo & Cartones)
- [x] **Motor Determinista de Bingo:**
  - [x] Generador de matrices 5x5 B-I-N-G-O estándar (1-75) con centro libre en `src/lib/bingoEngine.ts`.
  - [x] Algoritmo determinista de comprobación matemática de victoria: **Líneas (Horizontal o Vertical)**, **Diagonales (Diagonal X)**, **Cuatro Esquinas** y **Cartón Lleno**.
  - [x] Progresión recomendada por rondas (`getDefaultPatternForRound`): Ronda 1 = Líneas, Ronda 2 = Diagonales, Ronda 3 = Cuatro Esquinas, Ronda 4 = Cartón Lleno.
  - [x] Actualización y despliegue de reglas de seguridad (`firestore.rules`): compatibilidad estricta con `'DIAGONAL'` autorizada y desplegada a Firebase Cloud.
- [x] **Servicio en Tiempo Real con Firestore (`src/lib/roomService.ts`):**
  - [x] Creación de salas y búsqueda por código PIN de 6 dígitos.
  - [x] Listener en tiempo real `subscribeToRoom`.
  - [x] Extracción de balotas del bombo sincronizada.
  - [x] Generación y sincronización de cartones por jugador en subcolecciones.
  - [x] Configuración dinámica y cambio de patrón ganador por ronda (`startNextRound` con `winningPattern` opcional y `updateRoomWinningPattern`).
- [x] **Panel del Anfitrión (El Bombo):**
  - [x] Balota 3D esférica realista (`BingoBall3D.tsx`) con iluminación radial, sombra de contacto y animación de pop (`.animate-ball-pop`).
  - [x] Historial secuencial de salida de bolas (`RecentBallsHistory.tsx`) en tira horizontal desplazable con conteo de bolas.
  - [x] Selector y visor de patrón de juego en vivo con cambio directo en caliente.
  - [x] Botón de extracción manual y modo automático (cada 7s).
  - [x] Tablero maestro completo de 75 casillas con historial iluminado.
  - [x] Terminología criolla corregida: se eliminó el término "balota" y se adoptó estrictamente "bola" ("Última bola cantada", "Bolas de 75").
  - [x] Selector de voz de La Cantadera: `👩 Cantadora` (femenino juvenil, alegre) vs `👨 Cantador` (masculino grueso y ronco).
  - [x] Motor de audio optimizado para voces masculinas en Windows/Chrome: filtra y descarta voces femeninas de Google al solicitar cantador, emparejando con voces masculinas nativas barítonas (ej. `Microsoft Pablo`) pasadas por el normalizador fonético de seseo latino (`toLatinSeseo`) para máxima resonancia y tono criollo.
  - [x] Modal de Ceremonia de Ganador (`WinnerCeremonyModal`): podio, estadísticas de bolas, compartir multiplataforma o WhatsApp directo, selector de patrón para la siguiente ronda y botón de iniciar siguiente ronda.
  - [x] Compartir multiplataforma (`shareInvite`): Menú nativo en teléfonos (WhatsApp, Telegram, etc.) y copia al portapapeles en PC.
- [x] **Panel del Jugador:**
  - [x] Cartón interactivo 5x5 con selección de **marcadores criollos hiperrealistas de Stitch (`GrainMarker.tsx`)**:
    - Caraota Negra 🇻🇪 realista con textura pulida, brillo especular y el "ombligo" blanco (*hilum*).
    - Grano de Maíz dorado tostado con punta de inserción oscura.
    - Lenteja Marrón tradicional biconvexa con borde rim.
    - Sello Neón Arcade con aura luminosa.
    - **Posicionamiento y rotación orgánica:** Los granos no caen alineados rígidamente; cada casilla tiene su propio ángulo de rotación, ligera dispersión y variación de escala natural como en una mesa real.
  - [x] Espacio de notificaciones reservado con altura fija (`h-11` / 44px): previene saltos bruscos (layout shifts) del cartón cuando aparecen o expiran las alertas. En reposo muestra el patrón activo de la ronda (`Ronda X: [Nombre de Patrón] • Atento al bombo`) y al activarse un evento muestra con máxima prioridad: Reclamo de victoria > Patrón completado > A tiro de BINGO > Número cantado en cartón con botón de cierre manual.
  - [x] Corrección de glifo en Windows: reemplazo del emoji de caraota en el mensaje de número cantado por destellos (`✨`) para erradicar el carácter no soportado en navegadores de escritorio.
  - [x] Flechas de navegación a los lados del cartón (`<` y `>`) separadas y con padding adecuado para evitar solapamientos con las casillas del cartón.
  - [x] Persistencia de granos marcados: se sincronizan en tiempo real en `localStorage` (`tupartida_marks_${room.id}_r${round}`) y Firestore (`updateCardMarked`), asegurando que al recargar la página o volver del Hub no se pierdan las caraotas/maíz marcados. Se limpian automáticamente al comenzar una nueva ronda.
  - [x] Detección de número no cantado (marca inválida): si el jugador coloca por error un grano en una casilla cuyo número aún no ha salido en el bombo, se resalta con borde naranja neón (`border-orange-500`), badge animado `¡Ojo!` y doble vibración de alerta (`triggerInvalidMarkVibrate()`) para que el usuario se dé cuenta de inmediato y pueda removerlo.
  - [x] Leyenda dinámica de estado debajo del cartón: `(Llevas X/25 • Faltan Y para cartón lleno)`.
  - [x] Paginador secuencial de cartones (#1, #2, #3, #4) indexado de forma determinista para erradicar cualquier duplicado histórico.
  - [x] Detección de **Patrón Ganador Completado (Línea, Diagonal, 4 Esquinas, Cartón Lleno)**: Animación zoom (`scale-105`), resplandor dorado pulsante en las casillas ganadoras y botón inferior de BINGO en estado de alerta máxima para cantar la victoria.
  - [x] Resaltado dinámico en las pestañas de los cartones: alerta únicamente mientras la casilla del número cantado no haya sido marcada. En cuanto el jugador coloca el grano, el aviso y el banner se apagan inmediatamente hasta la próxima bola.
  - [x] Detección de **"A tiro de BINGO"** (1 número para ganar): Alerta visual dorada con los números faltantes, latido háptico en el móvil y sonido de tensión/suspenso (`playNearBingoSound()`).
  - [x] Alerta auditiva (`sounds.playMatchAlert()`), háptica (vibración en móviles) y visual (`.animate-match-glow` + banner "¡Salió tu número!") cuando una bola coincide con el cartón del jugador.
  - [x] Balota 3D esférica y carrusel secuencial de salida de bolas en el panel del jugador.
  - [x] Corneta/Voz de la Cantadera en el dispositivo del jugador (con botón de activar/silenciar en la barra superior).
  - [x] Modal de edición de nombre de usuario en el Header (`Header.tsx`): El jugador puede personalizar su nombre en la mesa ("Mario", "Tía Carmen", etc.) con guardado automático en Firebase Auth y almacenamiento local.
  - [x] Unificación del panel de bolas cantadas en el jugador: la última bola cantada y la secuencia horizontal de bolas previas se integraron en una sola tarjeta compacta, optimizando más de 120px de espacio vertical en pantallas móviles.
    - Se excluye la bola actual de la secuencia horizontal de la derecha para evitar que aparezca duplicada al lado de la esfera principal.
    - Barra de desplazamiento horizontal nativa del navegador completamente oculta (`.no-scrollbar`), permitiendo deslizamiento táctil y con rueda sin barras grises antiestéticas.
  - [x] Reubicación de notificaciones ("¡Salió tu número!", "A tiro de BINGO" y "Patrón Ganador"): ahora se muestran estratégicamente justo encima de las pestañas de los cartones (`Cartón #1`, `Cartón #2`), evitando solapamientos con la bola cantada.
  - [x] Erradicación de término "balotas": sustituido por completo por el término criollo "Bolas Cantadas" en toda la interfaz y en el modal de ceremonia de ganador.
  - [x] Sincronización del nombre del jugador/anfitrión en tiempo real:
    - El nombre editado en el Header se propaga a la sala (`updateRoomHostName`) y a todos los cartones del jugador (`updatePlayerCardsUserName`).
    - Al cantar victoria (`claimBingo`), se registra el nombre real actualizado (`claimerName`) en `winnerUserName`, asegurando que el podio muestre "Campeón: Jugador 1" en lugar del genérico "Jugador Criollo".
  - [x] Ajuste de padding inferior (`pb-36`): la fila 5 del cartón 5x5 y la leyenda de progreso `(Llevas X/25 • Faltan Y para cartón lleno)` quedan siempre 100% visibles y libres de obstrucción por el botón flotante inferior.
  - [x] Modal de Ceremonia de Ganador en tiempo real con estadísticas y compartir multiplataforma.
  - [x] Botón ¡CANTAR BINGO! con validación instantánea y celebración con confeti.
- [x] **Gran Celebración de Victoria en Tiempo Real (`src/lib/celebration.ts`):**
  - [x] Sonido sintetizado de aplausos y vítores de multitud (`playApplauseAndCheer()`).
  - [x] Efecto de sonido de estruendos de fuegos artificiales (`playFireworkSound()`).
  - [x] Ráfagas de fuegos artificiales y confeti continuo por 4 segundos con cañones en ambos lados (`triggerFireworksAndConfetti()`).
  - [x] Vibración simultánea en todos los teléfonos de los participantes al cantar Bingo (`triggerBingoWinVibrate()`).
  - [x] Vibración exclusiva en el teléfono del jugador que completa el patrón para avisarle que ya puede cantar victoria (`triggerCanClaimBingoVibrate()`).
  - [x] Vibración exclusiva de suspenso en el teléfono del jugador que está "a tiro de Bingo" (`triggerNearBingoVibrate()`).
- [x] **Módulo de Chat Grupal en Vivo Estilo WhatsApp (`src/components/chat/`):**
  - [x] Arquitectura encapsulada y reutilizable (`GameChat.tsx`) compatible con Bingo y futuros juegos comunitarios (Dominó, Ludo, Ajedrez, Rifas).
  - [x] Botón flotante circular con diseño WhatsApp y contador de mensajes no leídos.
  - [x] Mensajería en tiempo real con Firestore subcolección `rooms/{roomId}/messages` (reglas desplegadas).
  - [x] Grabación y reproducción de micro notas de voz de máximo 5 segundos (`VoiceNoteRecorder.tsx` y `VoiceNotePlayer.tsx`) con compresión ultra ligera y temporizador.
  - [x] Galería de stickers criollos vectoriales SVG (`src/lib/stickers.ts`) que erradican fallos de fuentes en Windows y se envían como stickers gráficos de tamaño completo.
  - [x] Pestaña **"Mis Stickers"** guardada en `localStorage` (`tupartida_my_stickers`): cualquier imagen o GIF subido o creado queda almacenado permanentemente en la galería personal del usuario para reutilizarlo en cualquier momento.
  - [x] Botón **"Subir desde tu dispositivo"** con soporte para imágenes y GIFs animados:
    - Compresión automática en el navegador (`src/lib/gifCompressor.ts` vía `omggif` + `gifenc`):
      - **Eliminación inteligente de fondo blanco exterior** (`removeEdgeConnectedWhiteBackground` por inundación BFS): detecta y recorta el fondo blanco cuadrado alrededor del personaje preservando detalles blancos internos (ojos, barriga, patas).
      - **Velocidad rítmica real y alta fluidez:** normalización de cadencia (corrige retrasos artificiales para GIFs de alta velocidad a 20-30ms) y soporte de hasta 55 fotogramas por ciclo.
      - **100% transparencia alfa y peso pluma:** formato `rgba4444` con descarte a fondo limpio (`dispose: 2`).
    - Reglas de Firestore desplegadas con límite de `mediaUrl` a 250.000 caracteres para admitir GIFs fluidos de alta tasa de refresco.
    - Importación dinámica y code-splitting de `omggif` y `gifenc`: se cargan bajo demanda únicamente al comprimir, eliminando dependencias estáticas que provocaban pantallas blancas al recargar.
    - Implementación de `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`): captura cualquier excepción en tiempo de ejecución mostrando una tarjeta de recuperación estilizada con opción de recarga en lugar de una pantalla en blanco.
    - Erradicación total de alertas del navegador (`window.alert`): reemplazado por el nuevo componente modal `AppAlertModal.tsx` con estética oscura, ambient glow y spinner de carga en vivo.
  - [x] **Creador de Stickers integrado con Imagen o Video** (`StickerPicker.tsx`): permite capturar fotos o fotogramas de video, añadir frases en mayúsculas personalizadas (ej. *"¡TRAMPA!"*) y generar stickers con contorno blanco estilo WhatsApp.
  - [x] Panel de moderación para el Anfitrión: activar/silenciar chat general, bloquear/permitir notas de voz y eliminación de mensajes inapropiados.

---

### 🎟️ Fase 3: Módulo de Micro-Rifas (Talonarios Digitales)
- [x] Talonario interactivo de 100 números (00 al 99).
- [x] Control visual de estados (`DISPONIBLE`, `RESERVADO`, `CONFIRMADO_PAGADO`).
- [x] Formulario modal de reserva con nombre, teléfono WhatsApp y referencia de pago.
- [x] Tarjeta de Libro Contable Comunitario con cálculo automático de meta y recaudación.
- [x] Botón de generación y envío de balance público a grupos de WhatsApp.

---

### 📊 Fase 4: Libro Contable Comunitario & Reportes para WhatsApp (Non-Custodial)
- [ ] Cálculo automático del balance:
  - Total de cartones / números vendidos.
  - Fondos brutos recaudados vs. valor del premio comprometido.
  - Fondo neto benéfico resultante para la causa.
- [ ] Generador de Acta / Comprobante Gráfico (HTML a Canvas / PNG):
  - Imagen optimizada con resumen del evento, lista de números pagados, ganador comprobado y hash de auditoría.
  - Botón de 1 clic: "Compartir balance en grupo de WhatsApp".

---

### 💰 Fase 5: Estrategia de Monetización & Anuncios
- [ ] **Modelo Híbrido Amigable:**
  - Modo Amistoso: 100% gratuito siempre.
  - Modo Pro-Fondos:
    - *Opción A:* Fee fijo simbólico ($1 o $2) para activar salas de más de 20 participantes.
    - *Opción B:* Micro-pase por volumen de cartones/tickets emitidos.
  - Espacio publicitario en salas de espera y cintillos de juego (preparado para Google AdSense o patrocinadores locales del barrio/comunidad).

---

### 🚀 Fase 6: Pruebas, PWA & Despliegue
- [ ] Pruebas de concurrencia y estrés de red (baja latencia y reconexión en redes 3G/4G inestables).
- [ ] Configuración de Firebase Hosting (`firebase deploy`).
- [ ] Optimización de peso de bundle (<300 KB inicial para carga ultra rápida).

---

### ⏳ Fase Futura (Fase 7): Juegos de Mesa Tradicionales
- [ ] Dominó Criollo (Mano a Mano y Parejas a 100 puntos, detección de tranca y cochinada).
- [ ] Ludo Comunitario (4 jugadores).
- [ ] Ajedrez con reloj FIDE.
