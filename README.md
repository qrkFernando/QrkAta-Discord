# QrkAta - Chat Moderno Estilo Discord

Una aplicación de chat moderna y completa inspirada en Discord, construida con React, Node.js, Express, MongoDB y Socket.IO.

## 🌟 Características

### ✅ **Ya implementado:**
- 🔐 **Autenticación completa** (Login, Register, Logout)
- 🏠 **Sistema de servidores y canales**
- 💬 **Chat en tiempo real** con Socket.IO
- 👥 **Lista de miembros online/offline**
- 📱 **Sidebar con servidores y canales**
- 🌓 **Modo oscuro y claro**
- ⌨️ **Indicadores de escritura**
- 💬 **Sistema de respuestas** (hilos visuales)
- 🔔 **Notificaciones en vivo**
- ✏️ **Editar y eliminar mensajes**
- 😀 **Reacciones con emojis**
- 🎯 **Drag & Drop para reordenar canales**
- 📨 **Mensajes directos (DM)**
- 🔍 **Búsqueda de usuarios**

## 🛠️ Tecnologías

### **Frontend:**
- ⚛️ **React** + Vite
- 🎨 **Material-UI** (MUI)
- 🔗 **React Router** para navegación
- 🌐 **Socket.IO Client** para tiempo real
- 🎭 **Context API** para estado global
- 📡 **Axios** para HTTP requests
- 🍞 **React Hot Toast** para notificaciones
- 🎯 **@dnd-kit** para drag & drop

### **Backend:**
- 🟢 **Node.js** + Express
- 🍃 **MongoDB** con Mongoose
- 🔐 **JWT** para autenticación
- 🌐 **Socket.IO** para tiempo real
- 🛡️ **Helmet** para seguridad
- ⚡ **Rate limiting**
- ✅ **Express Validator**

## 📋 Prerrequisitos

- Node.js v16 o superior
- MongoDB Atlas cuenta (gratis)
- Git

## 🚀 Configuración

### 1. **Clonar el repositorio**
```bash
git clone [tu-repositorio]
cd QrkAta
```

### 2. **Configurar MongoDB Atlas**

#### Crear cuenta en MongoDB Atlas:
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (elige la opción gratuita M0)
4. Configura el acceso a la red:
   - Ve a "Network Access"
   - Añade tu IP o usa `0.0.0.0/0` para acceso desde cualquier lugar
5. Crea un usuario de base de datos:
   - Ve a "Database Access"
   - Crea un usuario con permisos de lectura/escritura
   - Anota el usuario y contraseña

#### Obtener la cadena de conexión:
1. En tu cluster, haz clic en "Connect"
2. Selecciona "Connect your application"
3. Copia la cadena de conexión
4. Reemplaza `<password>` con tu contraseña real

### 3. **Configurar variables de entorno**

Edita el archivo `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://tu-usuario:tu-contraseña@cluster0.xxxxx.mongodb.net/qrkata?retryWrites=true&w=majority
JWT_SECRET=cambia_esta_clave_por_algo_muy_seguro_y_aleatorio_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

**⚠️ IMPORTANTE:** Cambia `JWT_SECRET` por una clave segura y única.

### 4. **Instalar dependencias**

```bash
# Backend
cd server
npm install

# Frontend (en otra terminal)
cd client
npm install
```

### 5. **Ejecutar la aplicación**

```bash
# Backend (Puerto 5000)
cd server
npm run dev

# Frontend (Puerto 3000) - en otra terminal
cd client
npm run dev
```

### 6. **Acceder a la aplicación**

Abre tu navegador en: `http://localhost:3000`

## 📁 Estructura del proyecto

```
QrkAta/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MainContent.jsx
│   │   │   ├── MembersList.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── CreateServerDialog.jsx
│   │   │   ├── CreateChannelDialog.jsx
│   │   │   ├── JoinServerDialog.jsx
│   │   │   └── DraggableChannelList.jsx
│   │   ├── pages/         # Páginas principales
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Chat.jsx
│   │   ├── context/       # Context API
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   └── utils/         # Utilidades
│   └── package.json
└── server/                # Backend Node.js
    ├── models/           # Modelos MongoDB
    │   ├── User.js
    │   ├── Server.js
    │   ├── Channel.js
    │   ├── Message.js
    │   └── DirectMessage.js
    ├── routes/           # Rutas API
    │   ├── auth.js
    │   ├── servers.js
    │   ├── channels.js
    │   ├── messages.js
    │   └── users.js
    ├── controllers/      # Controladores Socket.IO
    │   └── socketController.js
    ├── middleware/       # Middleware
    │   ├── auth.js
    │   └── socketAuth.js
    ├── config/          # Configuración
    │   └── database.js
    └── server.js        # Archivo principal
```

## 🎯 Cómo usar la aplicación

### **Primeros pasos:**
1. **Registrarse:** Crea una cuenta nueva
2. **Crear servidor:** Haz clic en el botón "+" para crear tu primer servidor
3. **Crear canales:** Usa el botón "+" junto al nombre del servidor
4. **Invitar amigos:** Comparte el código de invitación de 6 caracteres

### **Funcionalidades:**

#### **Chat:**
- Envía mensajes en tiempo real
- Responde a mensajes específicos
- Edita tus mensajes (botón derecho)
- Elimina tus mensajes
- Reacciona con emojis

#### **Servidores:**
- Crea servidores ilimitados
- Une a servidores con códigos de invitación
- Administra canales (si eres admin)
- Ve miembros online/offline

#### **Personalización:**
- Cambia entre modo oscuro/claro
- Reordena canales arrastrando (solo admins)
- Personaliza tu estado (online, ausente, ocupado)

## 🔧 Desarrollo

### **Scripts disponibles:**

```bash
# Backend
npm run dev      # Desarrollo con nodemon
npm start        # Producción

# Frontend  
npm run dev      # Desarrollo con Vite
npm run build    # Build de producción
npm run preview  # Vista previa del build
```

### **Variables de entorno para producción:**

```env
NODE_ENV=production
MONGODB_URI=tu-uri-de-produccion
JWT_SECRET=clave-super-segura-para-produccion
```

## 🐛 Solución de problemas

### **Error de conexión a MongoDB:**
- Verifica que la IP esté en la whitelist de MongoDB Atlas
- Asegúrate de que el usuario y contraseña sean correctos
- Revisa que la URI no tenga espacios extra

### **Error de CORS:**
- Verifica que el puerto 3000 esté configurado en el backend
- Revisa la configuración de CORS en `server.js`

### **Socket.IO no funciona:**
- Asegúrate de que ambos puertos estén corriendo
- Revisa la consola del navegador para errores
- Verifica que el token JWT sea válido

## 🚀 Despliegue

### **Recomendaciones para producción:**

1. **Frontend:** Vercel, Netlify, o GitHub Pages
2. **Backend:** Railway, Heroku, o DigitalOcean
3. **Base de datos:** MongoDB Atlas (ya configurado)

### **Variables de entorno en producción:**
- Cambia `JWT_SECRET` por algo único y seguro
- Actualiza la `MONGODB_URI` si es necesario
- Configura `NODE_ENV=production`

## 📝 TODO / Próximas características

- [ ] Carga de archivos e imágenes
- [ ] Llamadas de voz
- [ ] Videollamadas
- [ ] Bots y webhooks
- [ ] Roles y permisos avanzados
- [ ] Sistema de moderación
- [ ] Mensajes programados
- [ ] Encriptación de mensajes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Creado con ❤️ para aprender y compartir conocimiento.

---

**¿Problemas o preguntas?** Abre un issue en el repositorio.

**¿Te gusta el proyecto?** ¡Dale una estrella ⭐!