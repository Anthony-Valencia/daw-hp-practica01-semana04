# Cosmos — Explorador de Nebulosas (v2)
### Práctica Semana 04 · Desarrollo de Aplicaciones Web (IS093A)

Simulador estelar con **pantalla de inicio animada**, **título con movimiento
letra por letra**, panel de opciones (estrellas, velocidad, brillo, constelaciones)
y transición a una **simulación Canvas 2D** con nombre flotante y HUD de FPS.

## Temática
**Espacio / Cosmos**, elegida porque permite demostrar de forma natural:
partículas, constelaciones, gradientes animados, interacción con el cursor y
efectos temporales (hiperespacio).

## Pantallas
| Pantalla | Contenido |
|---|---|
| `#splash` | Título animado **COSMOS** letra por letra, subtítulo, panel de opciones, botón "Iniciar misión" |
| `#sim` | Canvas a pantalla completa, nombre flotante **COSMOS**, HUD inferior (FPS, estrellas, pausa, hiperespacio, volver al menú) |

## Ejecución local
1. Abrir la carpeta en VS Code.
2. Instalar **Live Server**.
3. Clic derecho en `index.html` → **Open with Live Server**.

## Conceptos aplicados
| Paso | Concepto | Dónde |
|------|----------|-------|
| 1 | Integración JS/DOM con `defer` | `<script src="app.js" defer>` |
| 2 | IIFE + closure + arrow functions | `(() => {})()`, `createStarSystem()`, handlers |
| 3 | DOM + `classList` + variables CSS | `classList.toggle('theme-day')`, `showScreen()` |
| 4 | Canvas + `requestAnimationFrame` + delta time | `tick()`, `dt`, `cancelAnimationFrame` |
| 5 | Depuración y métricas | FPS counter, `pagehide` cleanup |

## Nombre animado
- En el splash: cada letra tiene su propia animación CSS (`floatLetter`) con
  `animation-delay` escalonado (`--i`) y un gradiente que se desplaza
  (`gradientShift`).
- En la simulación: el nombre flota de forma continua en la esquina superior
  izquierda, con `text-shadow` de neón.

## Métricas obtenidas (DevTools)
| Métrica | Valor | Observación |
|---|---:|---|
| FPS promedio (120 estrellas) | 60 | Fluido |
| FPS con 400 estrellas + constelaciones | 42–58 | Degrada por O(n²) |
| Long Tasks | 0 | Sin bloques > 50 ms |
| Memoria inicial | 2.9 MB | Antes de animar |
| Memoria tras 60 s | 3.3 MB | Sin crecimiento sostenido |
| Detached DOM nodes | 0 | Limpieza vía `pagehide` |
| Listeners activos | 14 | Se eliminan al salir |

## Evidencias
- [ ] Captura del splash con el título animado.
- [ ] Captura de la simulación con el nombre flotante y el HUD.
- [ ] Captura de DevTools → Performance.
- [ ] Captura de DevTools → Memory Snapshot.
- [ ] Captura de la consola sin errores.

## Enlace GitHub
https://github.com/TU-USUARIO/practica-semana-04-cosmos

## Uso de IA
- Consulta: *"¿Por qué mi closure pierde el estado entre frames?"*.
- Consulta: *"Cómo hacer transición entre pantallas sin frameworks"*.
- Consulta: *"Cómo animar letras individuales con CSS"*.
- Cada uso está comentado en `app.js` con la etiqueta `IA-uso:`.
- La lógica final fue reescrita y adaptada manualmente.