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
- [x] Sanitizar objetos en Firestore (`ignoreUndefinedProperties: true` y valor por defecto en `paymentInfo`).
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
  - [x] Algoritmo determinista de comprobación matemática de victoria (Línea, Cuatro Esquinas, Cartón Lleno).
- [x] **Servicio en Tiempo Real con Firestore (`src/lib/roomService.ts`):**
  - [x] Creación de salas y búsqueda por código PIN de 6 dígitos.
  - [x] Listener en tiempo real `subscribeToRoom`.
  - [x] Extracción de balotas del bombo sincronizada.
  - [x] Generación y sincronización de cartones por jugador en subcolecciones.
- [x] **Panel del Anfitrión (El Bombo):**
  - [x] Esfera interactiva de última bola cantada (`B-12`, `N-34`).
  - [x] Botón de extracción manual y modo automático (cada 7s).
  - [x] Tablero maestro completo de 75 casillas con historial iluminado.
  - [x] Locución por voz automática (Web Speech API) y efectos de sonido nativos (Web Audio API).
  - [x] Botón directo de compartir enlace por WhatsApp con código PIN.
- [x] **Panel del Jugador:**
  - [x] Cartón interactivo 5x5 con selección de marcadores criollos (Caraota Negra 🫘, Grano de Maíz 🌽, Lenteja Marrón 🟤, Sello Neón ✨).
  - [x] Detección de balotas cantadas en tiempo real.
  - [x] Botón ¡CANTAR BINGO! con validación instantánea y celebración con confeti.

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
