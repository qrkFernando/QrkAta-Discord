# 🚀 Guía de Despliegue - QrkAta Chat

Esta guía te ayudará a desplegar tu aplicación QrkAta Chat usando servicios gratuitos de manera profesional y segura.

## 📋 Tabla de Contenidos

1. [Preparación del Proyecto](#preparación-del-proyecto)
2. [Base de Datos - MongoDB Atlas](#base-de-datos---mongodb-atlas)
3. [Backend - Railway (Gratis)](#backend---railway-gratis)
4. [Frontend - Vercel (Gratis)](#frontend---vercel-gratis)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Configuración de Dominio Personalizado](#configuración-de-dominio-personalizado)
7. [SSL y Seguridad](#ssl-y-seguridad)
8. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
9. [Solución de Problemas](#solución-de-problemas)
10. [Checklist Final](#checklist-final)

---

## 1. Preparación del Proyecto

### 1.1 Verificar que todo funciona localmente

```bash
# Ejecutar desde la carpeta raíz
npm run setup
npm run dev
```

### 1.2 Preparar archivos de configuración

Crear archivo `server/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'qrkata-server',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000
    }
  }]
};
```

Crear archivo `server/.nvmrc`:
```
18.20.0
```

### 1.3 Actualizar package.json del servidor

Agregar estos scripts en `server/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 2. Base de Datos - MongoDB Atlas

### 2.1 Crear cuenta MongoDB Atlas (GRATIS)

1. **Ir a MongoDB Atlas:**
   - Visita: https://cloud.mongodb.com/
   - Haz clic en "Try Free"
   - Regístrate con tu email

2. **Crear un Cluster:**
   - Selecciona "Build a Database"
   - Elige **M0 Sandbox (FREE)**
   - Selecciona región más cercana (ej: AWS - Virginia)
   - Dale un nombre: `qrkata-cluster`

### 2.2 Configurar seguridad

1. **Configurar Network Access:**
   ```
   Database → Network Access → Add IP Address
   - Seleccionar: "Allow access from anywhere"
   - IP Address: 0.0.0.0/0
   - Confirmar
   ```

2. **Crear usuario de base de datos:**
   ```
   Database → Database Access → Add New Database User
   - Authentication Method: Password
   - Username: qrkata-admin
   - Password: [generar contraseña segura]
   - Database User Privileges: Atlas admin
   - Add User
   ```

### 2.3 Obtener Connection String

1. **Conectar al cluster:**
   - En tu cluster, clic "Connect"
   - Selecciona "Connect your application"
   - Driver: Node.js, Version: 4.1 or later
   - Copia la connection string

2. **Formato de ejemplo:**
   ```
   mongodb+srv://qrkata-admin:<password>@qrkata-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 3. Backend - Railway (Gratis)

### 3.1 Crear cuenta en Railway

1. **Ir a Railway:**
   - Visita: https://railway.app/
   - Haz clic en "Login"
   - Conecta con GitHub

2. **Crear nuevo proyecto:**
   - Clic "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio

### 3.2 Configurar el despliegue

1. **Configurar el servicio:**
   ```
   - Root Directory: /server
   - Build Command: npm install
   - Start Command: npm start
   ```

2. **Variables de entorno en Railway:**
   ```
   Ir a: Project → Variables
   
   NODE_ENV=production
   PORT=$PORT
   MONGODB_URI=mongodb+srv://qrkata-admin:<tu-password>@qrkata-cluster.xxxxx.mongodb.net/qrkata?retryWrites=true&w=majority
   JWT_SECRET=tu-jwt-secret-super-seguro-para-produccion-2024
   JWT_EXPIRE=7d
   ```

### 3.3 Configurar dominio

1. **Obtener URL del backend:**
   - En Railway, ve a tu proyecto
   - Clic en "Deployments"
   - Copia la URL generada (ej: `https://tu-app.railway.app`)

2. **Configurar dominio personalizado (opcional):**
   ```
   Settings → Custom Domain
   - Agregar: backend.tu-dominio.com
   - Configurar DNS en tu proveedor
   ```

---

## 4. Frontend - Vercel (Gratis)

### 4.1 Preparar el frontend

1. **Crear archivo de configuración Vercel:**

Crear `client/vercel.json`:
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
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **Configurar variables de entorno en el código:**

Actualizar `client/src/config/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : 'https://tu-app.railway.app');

export default API_BASE_URL;
```

### 4.2 Desplegar en Vercel

1. **Crear cuenta Vercel:**
   - Visita: https://vercel.com/
   - Conecta con GitHub

2. **Importar proyecto:**
   - Clic "New Project"
   - Selecciona tu repositorio
   - Framework Preset: Vite
   - Root Directory: `client`

3. **Configurar variables de entorno:**
   ```
   Project Settings → Environment Variables
   
   VITE_API_URL=https://tu-app.railway.app
   ```

4. **Desplegar:**
   - Clic "Deploy"
   - Esperar a que termine el build

### 4.3 Configurar dominio personalizado (opcional)

1. **En Vercel:**
   ```
   Project → Settings → Domains
   - Agregar: tu-dominio.com
   - Seguir instrucciones DNS
   ```

---

## 5. Configuración de Variables de Entorno

### 5.1 Variables del Backend (Railway)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de ejecución |
| `PORT` | `$PORT` | Puerto dinámico de Railway |
| `MONGODB_URI` | `mongodb+srv://...` | Conexión a MongoDB Atlas |
| `JWT_SECRET` | `clave-super-segura-2024` | Secreto para JWT |
| `JWT_EXPIRE` | `7d` | Tiempo de expiración del token |

### 5.2 Variables del Frontend (Vercel)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://tu-app.railway.app` | URL del backend |

### 5.3 Generar JWT Secret seguro

```bash
# Usar Node.js para generar una clave
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 6. Configuración de Dominio Personalizado

### 6.1 Registrar dominio (gratis con opciones)

**Opciones gratuitas:**
- Freenom (.tk, .ml, .ga)
- GitHub Student Pack (incluye dominio .me gratis)

### 6.2 Configurar DNS

1. **Para el frontend (Vercel):**
   ```
   Tipo: A
   Nombre: @
   Valor: [IP proporcionada por Vercel]
   
   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com
   ```

2. **Para el backend (Railway):**
   ```
   Tipo: CNAME
   Nombre: api
   Valor: [dominio railway proporcionado]
   ```

### 6.3 Actualizar configuraciones

1. **En Vercel:**
   - Agregar dominio principal: `tu-dominio.com`
   - Agregar www: `www.tu-dominio.com`

2. **En Railway:**
   - Agregar dominio: `api.tu-dominio.com`

3. **Actualizar frontend:**
   ```
   VITE_API_URL=https://api.tu-dominio.com
   ```

---

## 7. SSL y Seguridad

### 7.1 SSL Automático

**Vercel y Railway proporcionan SSL gratuito automáticamente mediante Let's Encrypt.**

### 7.2 Configuraciones de seguridad adicionales

1. **Actualizar CORS en el backend:**

En `server/server.js`:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://tu-dominio.com',
    'https://www.tu-dominio.com',
    'https://tu-app.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

2. **Headers de seguridad:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  }
}));
```

---

## 8. Monitoreo y Mantenimiento

### 8.1 Monitoreo en Railway

1. **Métricas incluidas:**
   - CPU y memoria
   - Logs en tiempo real
   - Uptime monitoring

2. **Alertas básicas:**
   - Ir a Project → Settings → Notifications
   - Conectar email para alertas

### 8.2 Monitoreo en Vercel

1. **Analytics incluidos:**
   - Page views
   - Performance metrics
   - Error tracking

### 8.3 Herramientas gratuitas adicionales

1. **UptimeRobot (gratis):**
   - Monitoreo de disponibilidad
   - Alertas por email/SMS
   - URL: https://uptimerobot.com/

2. **Google Analytics:**
   - Seguimiento de usuarios
   - Métricas de uso

---

## 9. Solución de Problemas

### 9.1 Problemas comunes del Backend

| Problema | Solución |
|----------|----------|
| **Error 503** | Verificar variables de entorno |
| **Database connection failed** | Revisar MONGODB_URI y whitelist IP |
| **JWT errors** | Verificar JWT_SECRET configurado |
| **CORS errors** | Actualizar lista de dominios permitidos |

### 9.2 Problemas comunes del Frontend

| Problema | Solución |
|----------|----------|
| **API connection failed** | Verificar VITE_API_URL |
| **Build failed** | Revisar dependencias y sintaxis |
| **Socket.IO no conecta** | Verificar protocolo (https/wss) |

### 9.3 Comandos de debugging

```bash
# Ver logs en Railway
railway logs

# Rebuild en Vercel
vercel --prod

# Test local de producción
NODE_ENV=production npm start
```

---

## 10. Checklist Final

### ✅ Pre-despliegue
- [ ] Aplicación funciona localmente
- [ ] Variables de entorno configuradas
- [ ] MongoDB Atlas configurado
- [ ] CORS actualizado para dominios de producción
- [ ] JWT_SECRET seguro generado

### ✅ Backend (Railway)
- [ ] Proyecto conectado a GitHub
- [ ] Variables de entorno configuradas
- [ ] Deployment exitoso
- [ ] URL del backend funcionando
- [ ] Logs sin errores críticos

### ✅ Frontend (Vercel)
- [ ] Proyecto conectado a GitHub
- [ ] VITE_API_URL configurado
- [ ] Build exitoso
- [ ] Aplicación accesible
- [ ] Funcionalidades principales funcionando

### ✅ Configuración adicional
- [ ] SSL activo (candado verde)
- [ ] Dominios personalizados (opcional)
- [ ] Monitoreo configurado
- [ ] Backup de configuraciones

### ✅ Testing post-despliegue
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Crear servidor funciona
- [ ] Chat en tiempo real funciona
- [ ] Notificaciones funcionan

---

## 🎉 ¡Felicidades!

Tu aplicación QrkAta Chat ahora está desplegada profesionalmente usando servicios gratuitos:

- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-app.railway.app  
- **Base de datos**: MongoDB Atlas (gratis)

## 📞 Soporte

**¿Problemas durante el despliegue?**
1. Revisa los logs en Railway y Vercel
2. Verifica las variables de entorno
3. Consulta la documentación de cada servicio
4. Abre un issue en el repositorio

**URLs útiles:**
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

---

*Guía creada para el despliegue profesional de QrkAta Chat - Actualizada 2024*