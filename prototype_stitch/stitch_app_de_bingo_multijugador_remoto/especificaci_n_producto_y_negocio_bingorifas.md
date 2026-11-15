# Documento de Especificación de Producto y Modelo de Negocio: BingoRifas

## 1. Visión General del Producto

**BingoRifas** es una plataforma móvil orientada a digitalizar, organizar y transmitir dinámicas sociales y benéficas comunitarias tradicionales en América Latina (con fuerte arraigo cultural en mercados como Venezuela). 

La plataforma une dos módulos independientes pero complementarios:
1. **Módulo de Bingo en Vivo Multijugador** (tómbola sincrónica, locución, cartones digitales y verificación criptográfica).
2. **Módulo de Micro-Rifas** (gestión y venta de talonarios de 100 o 1000 números con sorteos certificados o asociados a loterías oficiales).

> **Principio de Arquitectura Financiera Clave (Non-Custodial / Sin Retención de Fondos):**  
> La aplicación **NO custodia, NO procesa directamente pagos de apuestas y NO retiene fondos ni premios**. Funciona estrictamente como un software de gestión y control contable (SaaS) donde el anfitrión registra, contrasta comprobantes externos (Pago Móvil, transferencias, efectivo en mano, Zelle, USDT) y rinde cuentas públicas en tiempo real a sus participantes.

---

## 2. Reglas de Negocio y Mecánicas de Juego

### 2.1. Dinámica de Partidas de Bingo
* **Estructura de Rondas Múltiples:**
  * Una partida no termina necesariamente con una sola victoria. El anfitrión puede programar **una o más rondas** dentro de una misma sesión (ej. Ronda 1: Línea Horizontal; Ronda 2: Cuatro Esquinas; Ronda 3: Cartón Lleno / Pozo Acumulado).
* **Ciclo de Vida de los Cartones (Desechables vs. Reutilizables):**
  * Al configurar la sala, el anfitrión define la política de los cartones:
    * **Cartones Reutilizables:** Los jugadores conservan sus mismos cartones y series numéricas a lo largo de todas las rondas de la partida (se limpian los granos/marcadores al reiniciar cada ronda).
    * **Cartones Desechables:** Los cartones ganadores o jugados se invalidan al concluir la ronda, obligando o permitiendo a los jugadores activar/adquirir nuevas series numéricas para la siguiente ronda.
* **Tómbola y Sincronización P2P / WebSocket:**
  * Extracción manual o temporizada de balotas/bolas (1 al 75).
  * Tablero maestro del anfitrión sincronizado en tiempo real (<200ms) con los cartones de todos los participantes conectados.
  * Localización cultural: Soporte para terminología (*"Bola"* vs. *"Balota"*) y personalización visual del marcador (caraota negra, grano de maíz, lenteja o dauber neón).

### 2.2. Módulo de Micro-Rifas
* Funciona de manera autónoma al Bingo o integrada al mismo evento comunitario (ej. una vendimia benéfica con bingo y rifa simultánea).
* **Formatos de Talonario:**
  * **100 Números (00 al 99):** Clásico formato de micro-rifa rápida (ej. 100 números x $1.00 = $100 recaudados; $30 premio único, $70 fondo benéfico neto).
  * **1000 Números (000 al 999):** Para premios de mayor envergadura (electrodomésticos, motocicletas, combos tecnológicos).
* **Control de Boletos en Tiempo Real:**
  * Estados del número: `Disponible`, `En Espera / Reservado` (tiempo límite de confirmación de pago) y `Pagado / Asignado`.
  * Asignación manual rápida para pagos presenciales en efectivo o registro de referencia bancaria/Pago Móvil.

---

## 3. Modelo Operativo Financiero: Gestión sin Custodia (Non-Custodial)

Dado el marco legal y regulatorio sobre juegos de azar y eventos benéficos:
1. **Flujo de Dinero Directo (Peer-to-Peer):**
   * El dinero fluye directamente de los jugadores a las cuentas bancarias o billeteras personales del anfitrión (vía Pago Móvil, transferencia bancaria, Zelle o efectivo).
2. **Rol de la Aplicación:**
   * **Bandeja de Conciliación:** El anfitrión visualiza qué participante reservó qué número/cartón y contrasta el número de referencia del Pago Móvil o recibo antes de marcarlo como "Confirmado".
   * **Libro Contable Abierto:** Cálculo automatizado de ingresos brutos, meta de recaudación, valor de premios a entregar y excedente neto para la causa benéfica.
   * **Rendición de Cuentas:** Generación de un reporte público verificable (imagen/PDF compartible en WhatsApp/Telegram) con la lista de números vendidos y transparencia del sorteo.

---

## 4. Modelo de Monetización de la Plataforma (B2B / SaaS)

Al no retener fondos de las apuestas ni cobrar comisiones directas sobre los pozos de juego (evitando clasificarse como casa de apuestas o casino), el modelo de ingresos se basa en:

1. **Pase por Evento / Fee de Activación de Sala (Pay-per-Event):**
   * Tarifa plana fija en micro-pagos para que el anfitrión cree una sala con capacidad para más de *N* participantes (ej. Sala básica hasta 20 jugadores gratis; salas de 50 a 500 jugadores pagan $2 a $5 por evento).
2. **Suscripción para Organizadores Recurrentes (SaaS Anfitrión PRO):**
   * Membresía mensual o anual para parroquias, clubes deportivos, fundaciones médicas o comercios que organizan sorteos y bingos semanales (incluye exportación contable avanzada, marca personalizada del patrocinador en pantalla y soporte multi-anfitrión).
3. **Microtransacciones Cosméticas para Jugadores:**
   * Desbloqueo de skins y sonidos premium para los marcadores (granos dorados animados, locuciones especiales de canto de números, insignias de patrocinador en el perfil).
4. **Espacios Publicitarios de Comercios Locales (Patrocinios en Vivo):**
   * Banners dentro de la sala de espera y cintillo durante la partida para que marcas o tiendas patrocinen los premios a cambio de visibilidad directa.

---

## 5. Arquitectura Técnica Recomendada para Antigravity IDE

* **Frontend:** Mobile-First Responsive Web App / PWA o React Native / Flutter (optimizado para bajo consumo de datos móviles).
* **Backend & Realtime:**
  * **Motor en tiempo real:** WebSockets / Supabase Realtime / Socket.io para la sincronización de la tómbola y el tablero maestro a baja latencia.
  * **Base de Datos:** PostgreSQL con esquemas aislados para `Rooms`, `Rounds`, `Cards`, `Raffles` y `Transactions_Log`.
* **Seguridad y Validación:**
  * Algoritmo determinista auditable para la asignación de números y validación criptográfica de cartones al momento de cantar ¡BINGO! (prevención de reclamos falsos).
