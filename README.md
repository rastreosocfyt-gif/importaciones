# Reporte de Importaciones — Ópticas Exclusivas

Aplicación web (HTML + CSS + JavaScript, sin compilación) con datos en Supabase. Se publica tal cual en GitHub Pages.

## Estructura

```
index.html          Estructura de la página y ventanas (modales)
css/
  styles.css        Layout, tabla, formularios y modal de póliza
  reportes.css      Ventanas de Resumen y Tiempos, gráfica circular
js/                 (se cargan en este orden desde index.html)
  config.js         Conexión a Supabase, período y estado global
  utils.js          Formatos (Q, $, kgs, fechas), toast, escapado de HTML
  categorias.js     Colores por categoría
  datos.js          Carga/guardado: Supabase <-> formato de la interfaz
  tabla.js          Tabla principal, columnas, orden y filtros
  modal.js          Nueva/editar póliza
  periodo.js        Selector de mes y año
  exportar.js       Exportar CSV
  graficas.js       Gráfica circular reutilizable (Resumen y Tiempos)
  resumen.js        Reporte "Resumen"
  tiempos.js        Reporte "Tiempos de importaciones mensuales"
  importar.js       Importar pólizas desde Excel
  main.js           Arranque
```

Los scripts comparten el ámbito global, por eso el orden en `index.html` importa.
Para publicar: subir la carpeta completa (con `css/` y `js/`) a la raíz del repositorio.
