# 0002: Gestión de Componentes Compartidos (shadcn/ui)

**Estado:** Aceptado
**Fecha:** 2026-07-29

## Contexto
El uso de la librería `shadcn/ui` introduce componentes base en el proyecto. Necesitamos decidir cómo organizar estos componentes en el contexto de nuestra arquitectura basada en features para no mezclar lógica de negocio con diseño puro.

## Decisión
Se mantendrá un directorio global `src/components/ui/` exclusivo para componentes base, puramente visuales, reutilizables y agnósticos (es decir, el Design System provisto por shadcn/ui y componentes estructurales generales). 

Los componentes específicos que incluyan composición compleja o lógica de negocio propia de una herramienta concreta, se mantendrán aislados dentro de `src/features/<nombre-herramienta>/components/`.

## Consecuencias
* **Positivas:** Límite claro entre el sistema de diseño y la lógica de negocio de la aplicación. Facilita la reutilización de componentes visuales en toda la aplicación.
* **Negativas:** Requiere disciplina y rigor por parte del equipo de desarrollo para no introducir lógica de negocio, de contexto o estado complejo dentro de `src/components/ui/`.
