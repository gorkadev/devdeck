# 0003: Enrutamiento con TanStack Router

**Estado:** Aceptado
**Fecha:** 2026-07-29

## Contexto
El proyecto DevDeck es una SPA construida con Vite y React. Se requiere una solución de enrutamiento robusta, escalable y mantenible para navegar entre las distintas herramientas. El equipo tenía experiencia previa con React Router, pero se evaluaron alternativas más modernas que encajaran mejor con la filosofía de seguridad de tipos (type-safety) estricta del proyecto.

## Decisión
Se ha decidido adoptar `@tanstack/react-router` como la librería de enrutamiento por defecto. Se utilizará de forma independiente (solo cliente) junto con su plugin oficial de Vite (`@tanstack/router-plugin/vite`) para aprovechar la generación automática de rutas basada en archivos (file-based routing). 

## Consecuencias
* **Positivas:** 
  * Type-safety del 100% en parámetros de ruta, navegación y Search Params.
  * Agiliza la creación de nuevas herramientas (features) al añadir simplemente un archivo a la carpeta de rutas.
  * Gestión nativa y fuertemente tipada del estado en la URL, esencial para poder compartir configuraciones de herramientas mediante enlaces.
* **Negativas:** 
  * Ligera curva de aprendizaje inicial respecto a las APIs a las que el equipo está acostumbrado en React Router.
  * Requiere generación de código por detrás, gestionada automáticamente por el plugin de Vite.
