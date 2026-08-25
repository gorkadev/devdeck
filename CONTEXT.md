# DevDeck - Contexto del proyecto

**DevDeck** (nombre provisional) es una colección de herramientas para desarrolladores con una experiencia de usuario excepcional.

## Filosofía

No es una página con decenas de utilidades sin relación. Cada herramienta se siente como un pequeño producto, con una interfaz cuidada, rápida y agradable de utilizar.

La prioridad del proyecto es:
1. Experiencia de usuario.
2. Diseño limpio y consistente.
3. Código mantenible y escalable.
4. Buenas prácticas de React y TypeScript.

No hay prisa por añadir herramientas rápidamente. Es preferible tener pocas, pero que sean excelentes.

## Stack

* React
* TypeScript
* Vite
* Tailwind CSS v4
* shadcn/ui

En el futuro se podrán incorporar librerías adicionales cuando realmente aporten valor, pero se deben evitar dependencias innecesarias.

## Estilo visual

La aplicación se inspira en productos como:
* Linear
* Raycast
* Vercel
* Clerk
* shadcn/ui

Se busca una interfaz **minimalista**, con mucho espacio en blanco, tipografía cuidada, animaciones sutiles y una sensación de producto moderno. **No a los diseños recargados.**

## Arquitectura

El proyecto está preparado para crecer siguiendo una **arquitectura basada en funcionalidades (feature-based architecture)**.

Cada herramienta vive dentro de su propia feature, evitando mezclar lógica entre ellas, y separando claramente:
* Componentes compartidos
* Utilidades
* Lógica específica de cada herramienta

Añadir una nueva herramienta debe ser un proceso sencillo que apenas requiera modificar código existente.

## Objetivo del proyecto

Cada herramienta resuelve un problema concreto. 
Ejemplos de futuras herramientas (aún no implementadas):
* JSON Formatter
* UUID Generator
* JWT Decoder
* Regex Tester
* Base64 Encoder/Decoder
* Color Converter
* Timestamp Converter
* URL Parser
* Markdown Preview
* Hash Generator

## Flujo de Trabajo y Colaboración

Reglas para el desarrollo guiado por el asistente:
* Actuar como un desarrollador senior que ayuda a diseñar el proyecto.
* **Proponer alternativas**: Antes de implementar funcionalidades importantes, proponer varias opciones cuando existan y explicar sus pros y contras.
* **Simplicidad**: Evitar introducir complejidad innecesaria. Priorizar soluciones sencillas, elegantes y fáciles de mantener.
* **Justificación de decisiones**: No tomar decisiones arquitectónicas importantes sin justificarlas.
* **Visión a largo plazo**: Avisar cuando una solución pueda complicar el proyecto a largo plazo.
* **Evolución incremental**: Construir una base sólida paso a paso antes de añadir funcionalidades más avanzadas.
