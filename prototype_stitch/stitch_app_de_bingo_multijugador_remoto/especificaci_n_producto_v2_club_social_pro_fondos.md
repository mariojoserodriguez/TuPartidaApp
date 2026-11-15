# Especificación de Producto y Arquitectura de Negocio: Club Social & Pro-Fondos (Bingo, Rifas, Dominó, Ludo, Ajedrez)

## 1. Visión General del Producto

**Club Social & Pro-Fondos** (marca de la app: *BingoRifas / SocialPlay Criollo*) es una plataforma móvil PWA / nativa orientada a la recreación social y la recaudación comunitaria transparente y sin custodia (Non-Custodial) en América Latina y mercados hispanos.

La plataforma se organiza formalmente a través de un **Menú Principal / Hub Central** con módulos completamente independientes y desacoplados:
1. **Módulo de Bingo en Vivo:** Tómbola sincronizada P2P/WebSocket, partidas multirronda, política de cartones desechables o reutilizables, y marcadores con sabor criollo (caraota negra, maíz, lenteja o dauber).
2. **Módulo de Rifas (Micro-Rifas):** Gestión autónoma de talonarios de 100 números (00-99) y 1000 números (000-999) con estados en tiempo real (Disponible, En Espera, Pagado) y asignación manual o contraste de Pago Móvil.
3. **Módulo de Dominó Tradicional:** Modalidades mano a mano o parejas (100 puntos), cochinada, tranca y efectos criollos.
4. **Módulo de Ludo:** Modo clásico de 4 jugadores con captura de fichas y carreras veloces.
5. **Módulo de Ajedrez:** Partidas Blitz, Rápido y Clásico con reloj internacional FIDE y análisis de tablero.

---

## 2. Modos de Juego y Filosofía Operativa

Cada modalidad o juego puede ser ejecutado en dos modos mutuamente excluyentes:

### A. Modo Amistoso (Gratuito / Casual)
- Sin intercambio monetario ni premios.
- Enfoque 100% social: jugar con familiares o amigos lejanos.
- Emparejamiento por código de sala privada o sala pública comunitaria.

### B. Modo Pro-Fondos / Torneo Comunitario (Non-Custodial)
- **Casos de Uso:** Vendimias escolares, promociones de bachillerato/universidad, gastos médicos y causas comunitarias.
- **Principio Non-Custodial (Cero Custodia de Fondos):** La app **NO retiene, NO procesa apuestas y NO custodia premios**.
- **Herramienta SaaS de Conciliación:** El anfitrión recibe el dinero directo en sus cuentas (Pago Móvil, Zelle, efectivo, USDT) y utiliza la aplicación como su libro contable público, verificando comprobantes y asignando asientos/boletos.
- **Rendición de Cuentas:** Generación de actas públicas y balances en PDF/imagen compartibles por WhatsApp con firma determinista de cada ronda o sorteo.

---

## 3. Modelo de Monetización B2B / SaaS

Al evitar clasificaciones legales de casa de apuestas o casino regulado:
1. **Pase por Evento / Activación de Sala Pro-Fondos:** Cobro fijo micropago ($1 a $3) al organizador cuando crea eventos masivos con llaves de torneo o salas de bingo/rifas superiores al límite gratuito.
2. **Membresía Anfitrión PRO:** Suscripción mensual para organizadores recurrentes (promociones, clubes, iglesias) con branding personalizado, soporte para proyector y exportación contable ilimitada.
3. **Microtransacciones Cosméticas:** Skins de marcadores (caraota dorada, daubers neón), personalización de mesas de dominó y fichas de ludo, y locuciones especiales de canto.
4. **Patrocinios en Vivo:** Espacios publicitarios en salas de espera y cintillos de juego para marcas locales.

---

## 4. Arquitectura de Navegación y Pantallas Clave

- **Hub Principal (Menú de Juegos):**
  - Acceso directo desacoplado a: **Bingo en Vivo**, **Rifas**, **Dominó**, **Ludo** y **Ajedrez**.
  - Selector rápido entre *Modo Amistoso* y *Modo Pro-Fondos*.
  - Carrusel de Eventos Comunitarios Destacados en vivo.
- **Salas y Creación:** Panel para unirse por código PIN, explorar salas activas o crear nueva sala con reglas a medida.
- **Perfil de Jugador:** Estadísticas, reputación, selector de marcador tradicional (caraota, maíz, etc.), historial contable y métodos de pago registrados.
- **Vistas Específicas de Juego:** Cartones de bingo, tableros de números de rifas, y mesas de juego de mesa.
