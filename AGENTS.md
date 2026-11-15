# 🤖 Protocolo y Reglas de Agentes: TuPartidaApp

**Proyecto:** `TuPartidaApp`  
**Ecosistema:** MasterApps Labs  
**Versión de Reglas:** 1.0.0  

---

## 🖥️ 1. Política de Dispositivos y Despliegues

1. **PC de Casa (Estación Maestra de Despliegue):**
   - Esta computadora es la estación principal de desarrollo continuo y la **ÚNICA autorizada para compilar y desplegar a producción** (`npm run deploy:clean` o `firebase deploy`).
   - Mantiene la configuración y credenciales activas de Google Cloud y Firebase.
2. **PC de Oficina y Laptop (Estaciones Satélite):**
   - Se utilizan exclusivamente para avanzar código, maquetación, pruebas locales, corrección de bugs y commits en ramas de Git.
   - **Regla estricta:** No desplegar a producción desde oficina o laptop; sincronizar todo vía `git push` a `origin main` y realizar los despliegues finales desde la PC de Casa.
3. **⛔ Reglas Absolutas de Control para Agentes (PROHIBICIONES ESTRICTAS):**
   - **NUNCA desplegar hosting:** Los agentes tienen **terminantemente prohibido** ejecutar comandos de despliegue a hosting (`firebase deploy --only hosting`). Esa acción la ejecuta única y exclusivamente el USUARIO.
   - **NUNCA hacer `git push`:** Los agentes tienen **terminantemente prohibido** hacer `git push`. La subida al repositorio remoto en GitHub la realiza única y exclusivamente el USUARIO.
   - **NUNCA dejar servidores de desarrollo en segundo plano:** El agente no debe iniciar el dev server (`npm run dev`) como proceso demonio en segundo plano sin orden expresa; el USUARIO lo enciende y lo apaga a su conveniencia.

---

## 📜 2. Registro Obligatorio de Avances y Reglas

- **`checklist.md` (siempre en minúsculas):**
  - Cualquier agente que trabaje en este repositorio tiene la obligación de registrar y "tallar en piedra" cada avance, fase completada y tarea pendiente en el archivo `checklist.md`.
- **`AGENTS.md` (este archivo):**
  - Contiene las reglas arquitectónicas, límites de seguridad, convenciones de nombres y directrices que todos los agentes deben respetar sin excepción.

---

## 🏗️ 3. Reglas de Arquitectura y Stack Tecnológico

1. **Filosofía 100% Non-Custodial:**
   - La aplicación **NO custodia dinero, NO procesa apuestas y NO es un casino**.
   - Opera como un **SaaS de Libro Contable Comunitario y Tómbola/Rifas Digitales**.
   - Los participantes pagan directamente al anfitrión (Pago Móvil, Zelle, efectivo, USDT).
   - La app solo concilia comprobantes, asigna puestos/cartones y genera balances transparentes para compartir por WhatsApp.
2. **Stack Oficial:**
   - **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 (PWA Mobile-First).
   - **Backend / Realtime:** Firebase Firestore (modo nativo, listeners `onSnapshot`).
   - **Autenticación:** Firebase Authentication (Modo Anónimo con limpieza de 30 días para invitados + Google/Email para anfitriones).
   - **Infraestructura Cloud:** Google Cloud Project `project-50b07764-c4ba-4320-b28` (`TuPartidaApp`) en Spark Tier (100% gratuito).
3. **Regla de Seguridad de Firestore:**
   - Toda creación o modificación de reglas de seguridad (`firestore.rules`) debe ser delegada al subagente especialista `firestore-rules-author`.

---

## 🇻🇪 4. Localización y Terminología Cultural

- **Bingo:**
  - Usar siempre términos naturales venezolanos: **"El Bombo"**, **"La Cantadera"**, **"Sacar la bolita / balota"**, **"Cantar Bingo"**. Evitar términos no usados localmente como "Tómbola".
  - **Marcadores de cartón:** Caraota Negra 🫘, Grano de Maíz 🌽, Lenteja Marrón 🟤, Sello Arcade Neón ✨.
- **Rifas:**
  - Talonarios de 100 números (`00` al `99`) y 1000 números (`000` al `999`).
  - Conciliación de referencias de Pago Móvil y efectivo en mano.
