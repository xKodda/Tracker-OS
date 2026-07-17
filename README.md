# Obra-OS 🏗️

Proyecto de sistema operativo y gestión simplificada para obras civiles, diseñado especialmente para el sector de **movimiento de tierra** y optimizado para ser operado en terreno bajo condiciones de alta luminosidad solar.

El objetivo principal de Obra-OS en esta etapa es simplificar el cierre diario de capataces, permitiéndoles registrar actividades ejecutadas, operarios, maquinarias, tiempos de standby justificados y fotografías de avance con el mínimo esfuerzo, exportando el reporte consolidado directamente a WhatsApp.

---

## Estructura de Directorios

- `src/`: Código fuente de la aplicación Next.js (componentes, páginas, hooks, utilidades y tipos).
- `public/`: Archivos estáticos e iconos del sistema.
- `docs/`: Documentación del proyecto (visión, roadmap, diario, problemas identificados, etc.).
- `design/`: Recursos y documentación de diseño de interfaz y arquitectura.

---

## Comenzando localmente

### 1. Requisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org) (versión 18 o superior).

### 2. Instalar dependencias
En la raíz del repositorio, ejecuta:
```bash
npm install
```

### 3. Levantar el servidor de desarrollo
Para iniciar la aplicación en modo desarrollo, corre:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con la aplicación.

---

## Despliegue en Vercel

Esta estructura ha sido optimizada para un despliegue inmediato en Vercel con cero configuración.

1. Conecta tu repositorio de GitHub a tu cuenta de Vercel.
2. Selecciona el proyecto `Tracker-OS`.
3. Vercel detectará automáticamente la configuración de Next.js en la raíz del repositorio.
4. Presiona **Deploy**. La aplicación se compilará y estará lista en un subdominio público (ej: `tracker-os.vercel.app`).
