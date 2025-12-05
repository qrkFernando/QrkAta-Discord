# 🚀 Guía Completa de Despliegue - QrkAta Chat

## 📋 Tabla de Contenido
1. [Preparación del Proyecto](#preparación-del-proyecto)
2. [Configuración de Base de Datos](#configuración-de-base-de-datos)
3. [Despliegue Frontend (Netlify/Vercel)](#despliegue-frontend)
4. [Despliegue Backend (Render/Railway)](#despliegue-backend)
5. [Configuración de Variables de Entorno](#variables-de-entorno)
6. [Scripts de Despliegue](#scripts-de-despliegue)
7. [Verificación Post-Despliegue](#verificación-post-despliegue)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Preparación del Proyecto

### 1. Estructura Final del Proyecto
```
QrkAta/
├── client/                 # Frontend React
├── server/                # Backend Node.js
├── package.json           # Scripts principales
├── .gitignore            # Archivos a ignorar
├── netlify.toml          # Config Netlify
├── render.yaml           # Config Render
└── railway.toml          # Config Railway
```

### 2. Verificación de Dependencias
Ejecutar antes del despliegue:
```bash
npm run install-deps
npm run test-db
```

---

## 🗄️ Configuración de Base de Datos

### Opción 1: MongoDB Atlas (Recomendado - Gratuito)

#### Paso 1: Crear cuenta en MongoDB Atlas
1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita
3. Crear nuevo proyecto "QrkAta"

#### Paso 2: Configurar cluster
1. Crear cluster M0 (gratuito)
2. Seleccionar región más cercana
3. Nombre: `qrkata-cluster`

#### Paso 3: Configurar acceso
1. Database Access → Add New Database User
   - Username: `qrkata-admin`
   - Password: (generar segura)
   - Role: `Atlas admin`

2. Network Access → Add IP Address
   - `0.0.0.0/0` (permitir desde cualquier lugar)

#### Paso 4: Obtener Connection String
1. Connect → Connect your application
2. Driver: Node.js
3. Copiar connection string
4. Reemplazar `<password>` con tu password

### Opción 2: MongoDB gratuito en Railway
1. Crear cuenta en https://railway.app
2. New Project → Deploy MongoDB
3. Obtener variables de conexión

---

## 🎨 Despliegue Frontend

### Opción 1: Netlify (Recomendado)

#### Configuración automática:
1. Fork/clonar repositorio en GitHub
2. Ir a https://netlify.com
3. New site from Git → GitHub
4. Seleccionar repositorio QrkAta
5. Configurar build:
   - **Build command**: `npm run build:client`
   - **Publish directory**: `client/dist`
   - **Base directory**: `client`

#### Configuración manual con archivo `netlify.toml`:
```toml
[build]
  base = "client"
  command = "npm install && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    cache-control = "max-age=31536000"
```

### Opción 2: Vercel

#### Deploy con Vercel CLI:
```bash
npm install -g vercel
cd client
vercel --prod
```

#### Configuración `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## ⚡ Despliegue Backend

### Opción 1: Render (Recomendado - Gratuito)

#### Configuración automática:
1. Ir a https://render.com
2. New → Web Service
3. Connect GitHub → Seleccionar repo
4. Configurar:
   - **Name**: `qrkata-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Auto-Deploy**: Yes

#### Configuración con `render.yaml`:
```yaml
services:
  - type: web
    name: qrkata-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        fromService:
          type: web
          name: qrkata-backend
          property: port
```

### Opción 2: Railway

#### Deploy directo:
```bash
npm install -g @railway/cli
railway login
railway new qrkata-backend
railway up
```

#### Configuración `railway.toml`:
```toml
[build]
  builder = "nixpacks"
  buildCommand = "cd server && npm install"

[deploy]
  startCommand = "cd server && npm start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10
```

### Opción 3: Heroku

#### Preparación:
```bash
npm install -g heroku
heroku create qrkata-backend
heroku config:set NODE_ENV=production
git subtree push --prefix server heroku main
```

---

## 🔐 Variables de Entorno

### Para Backend (Producción)
Configurar en tu plataforma de hosting:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/qrkata
JWT_SECRET=tu_clave_super_secreta_de_produccion_2024
JWT_EXPIRE=7d
CORS_ORIGIN=https://tu-frontend-url.netlify.app
```

### Para Frontend
Crear archivo `.env` en `/client`:

```env
VITE_API_URL=https://tu-backend-url.render.com
VITE_SOCKET_URL=https://tu-backend-url.render.com
```

---

## 📦 Scripts de Despliegue

### Script para preparar producción:
```bash
# En package.json raíz, agregar:
"scripts": {
  "build:client": "cd client && npm install && npm run build",
  "build:server": "cd server && npm install",
  "deploy:full": "npm run build:client && npm run build:server",
  "start:prod": "cd server && npm start"
}
```

### GitHub Actions para CI/CD:
Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy QrkAta

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install and Build
      run: |
        cd client
        npm install
        npm run build
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=client/dist
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Render
      run: |
        curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## ✅ Verificación Post-Despliegue

### 1. Checklist de Verificación
- [ ] Frontend carga correctamente
- [ ] Backend responde en `/api/health`
- [ ] Base de datos conecta
- [ ] Socket.io funciona
- [ ] Registro de usuarios
- [ ] Login funcional
- [ ] Chat en tiempo real
- [ ] Responsive design

### 2. URLs de Prueba
```bash
# Backend health check
curl https://tu-backend.render.com/api/health

# Frontend
https://tu-frontend.netlify.app

# WebSocket connection
wscat -c wss://tu-backend.render.com
```

### 3. Logs y Debugging
```bash
# Render logs
https://dashboard.render.com → Tu servicio → Logs

# Netlify logs  
https://app.netlify.com → Tu sitio → Deploys → Ver logs
```

---

## 🔧 Configuración Adicional de Producción

### 1. Seguridad
Actualizar `server/middleware/security.js`:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting más estricto en producción
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000
});

module.exports = { helmet, limiter };
```

### 2. CORS para producción
En `server/server.js`:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
};
```

### 3. Compresión y optimización
```bash
cd server
npm install compression
```

En `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

---

## 🚨 Solución de Problemas Comunes

### Error: CORS Policy
**Problema**: Frontend no puede conectar con backend
**Solución**: 
1. Verificar CORS_ORIGIN en variables de entorno
2. Actualizar VITE_API_URL en frontend

### Error: Database Connection
**Problema**: No conecta a MongoDB
**Solución**:
1. Verificar MONGODB_URI
2. Whitelist IP en MongoDB Atlas
3. Verificar credenciales

### Error: Build Failed
**Problema**: Falla al construir
**Solución**:
1. Verificar Node.js version (18+)
2. Limpiar node_modules: `rm -rf node_modules && npm install`
3. Verificar package.json scripts

### Error: WebSocket Connection
**Problema**: Chat tiempo real no funciona
**Solución**:
1. Verificar VITE_SOCKET_URL
2. Habilitar WebSocket en hosting
3. Verificar firewall/proxy

### Error: 404 en rutas
**Problema**: Rutas SPA no funcionan
**Solución**: Verificar configuración de redirects en `netlify.toml` o `vercel.json`

---

## 📱 Configuración Mobile-Friendly

### 1. PWA Configuration
Agregar en `client/public/manifest.json`:
```json
{
  "name": "QrkAta Chat",
  "short_name": "QrkAta",
  "description": "Chat moderno estilo Discord",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#7c3aed",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker básico
En `client/public/sw.js`:
```javascript
const CACHE_NAME = 'qrkata-v1';
const urlsToCache = ['/', '/static/js/bundle.js', '/static/css/main.css'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

---

## 🎯 Comandos Rápidos de Despliegue

```bash
# Preparar todo para producción
npm run deploy:full

# Solo frontend
npm run build:client

# Solo backend  
npm run build:server

# Test completo local
npm run dev

# Verificar conexiones
npm run test-db
```

---

## 📞 Soporte y Recursos

### Documentación Oficial:
- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Railway Docs](https://docs.railway.app)

### Comunidad:
- [Stack Overflow - netlify](https://stackoverflow.com/questions/tagged/netlify)
- [Discord Render](https://discord.gg/render)
- [Reddit WebDev](https://reddit.com/r/webdev)

---

## ✨ Próximos Pasos

Una vez desplegado exitosamente:
1. **Configurar dominio personalizado**
2. **Implementar SSL automático**  
3. **Configurar analytics** (Google Analytics)
4. **Implementar monitoring** (UptimeRobot)
5. **Backup automático de DB**
6. **CI/CD completo**

---

*¡Tu aplicación QrkAta está lista para el mundo! 🚀*