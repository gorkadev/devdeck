# 0001: Arquitectura Basada en Features

**Estado:** Aceptado
**Fecha:** 2026-07-29

## Contexto
El proyecto DevDeck agrupa múltiples herramientas independientes (como formateadores de JSON o conversores de color) bajo una misma aplicación. Es necesario establecer una estructura de carpetas que evite el acoplamiento entre las herramientas, permitiendo que el proyecto escale a medida que se añadan más.

## Decisión
Adoptamos una arquitectura basada en funcionalidades (feature-based architecture) utilizando el directorio estándar de la industria `src/features/`. Cada herramienta vivirá aislada dentro de su propio directorio en `src/features/<nombre-herramienta>/`.

## Consecuencias
* **Positivas:** Alto nivel de aislamiento, facilidad para añadir y eliminar herramientas sin romper el resto, y código altamente escalable y mantenible.
* **Negativas:** Podría existir cierta redundancia de código en los primeros pasos si no se identifica correctamente qué lógica debe elevarse a utilidades compartidas globales.
