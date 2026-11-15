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
- [x] Extraer y estructurar el prototipo visual de Stitch (`prototype_stitch/`).
- [x] Crear `checklist.md` con la hoja de ruta y decisiones de arquitectura.
- [ ] Renombrar en Google Cloud Console `My First Project` a `TuPartidaApp`.
- [ ] Vincular el proyecto en Firebase Console (activar Firestore Database y Firebase Authentication).
- [ ] Registrar Web App en Firebase y extraer variables de entorno (`firebaseConfig`).

---

### 🎨 Fase 1: Arquitectura Frontend & Sistema de Diseño (Mobile-First PWA)
- [ ] Inicializar proyecto base: `Vite + React 19 + TypeScript + Tailwind CSS`.
- [ ] Configurar tipografías (`Outfit`, `Plus Jakarta Sans`, `Space Grotesk`) y paleta de colores del diseño Stitch (`#0b1326`, indigo `#4f46e5`, esmeralda, dorado).
- [ ] Configurar manifiesto PWA (`vite-plugin-pwa`) para instalación en pantalla de inicio y bajo consumo de datos.
- [ ] Implementar Layout común (Navbar móvil con avatar, estado de conexión y chips de estado).
- [ ] Desarrollar **Hub Principal**:
  - Selector de modo (*Amistoso* vs *Pro-Fondos*).
  - Tarjetas de acceso a **Bingo en Vivo** y **Micro-Rifas**.
  - Estado de juegos futuros (Dominó, Ludo y Ajedrez marcados como "Próximamente").
  - Entrada rápida a sala por código PIN de 6 dígitos.

---

### 🎱 Fase 2: Módulo de Bingo en Vivo (El Bombo & Cartones)
- [ ] **Modelo de Datos en Firestore:**
  - Colección `rooms`: configuración de sala, anfitrión, modo, estado (`LOBBY`, `JUGANDO`, `FINALIZADO`).
  - Subcolección `bingo_rounds`: tipo de victoria (Línea, Cuatro Esquinas, Cartón Lleno), balotas cantadas (`drawn_numbers`).
  - Subcolección `bingo_cards`: matriz 5x5, usuario asignado, política de cartón (desechable vs reutilizable).
- [ ] **Generador Determinista de Cartones B-I-N-G-O:**
  - Columnas estándar (B: 1-15, I: 16-30, N: 31-45 con centro libre, G: 46-60, O: 61-75).
- [ ] **Panel del Jugador:**
  - Vista interactiva de cartones con marcadores visuales (Caraota, Maíz, Lenteja, Neón).
  - Sonido de mesa criollo al marcar casillas.
  - Botón ¡CANTAR BINGO! con bloqueo anti-spam.
- [ ] **Panel del Anfitrión (El Bombo):**
  - Sacar bola manual o en modo automático (temporizador ajustable: 5s, 10s, 15s).
  - Tablero maestro de 75 casillas sincronizado en tiempo real vía Firestore `onSnapshot`.
  - Locución/Voz que canta el número (Web Speech API o clips de audio).
- [ ] **Validador Criptográfico / Determinista:**
  - Comprobación matemática instantánea en backend/cliente: valida si el cartón que cantó BINGO efectivamente tiene los números cantados en el patrón requerido (evita reclamos falsos sin detener el juego).

---

### 🎟️ Fase 3: Módulo de Micro-Rifas (Talonarios Digitales)
- [ ] **Estructura de Talonario:**
  - Modo 100 números (`00` al `99`) para causas rápidas.
  - Modo 1000 números (`000` al `999`) para premios mayores.
- [ ] **Manejo de Estados en Tiempo Real:**
  - Estados: `DISPONIBLE`, `RESERVADO` (con TTL de 15 minutos), `CONFIRMADO_PAGADO`.
  - Implementación con `runTransaction()` en Firestore para evitar que dos personas reserven el mismo número simultáneamente.
- [ ] **Bandeja de Conciliación de Pagos:**
  - Formulario del participante para reportar número de referencia de Pago Móvil / Zelle / Efectivo.
  - Panel del organizador para contrastar la referencia y confirmar con 1 clic.

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
