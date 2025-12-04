# Configuración de MongoDB Atlas para QrkAta

## 📋 Pasos detallados para configurar MongoDB Atlas

### 1. **Crear cuenta en MongoDB Atlas**

1. Ve a [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
2. Haz clic en "Try Free"
3. Registrate con tu email o cuenta de Google/GitHub
4. Completa la información requerida

### 2. **Crear un nuevo proyecto**

1. Una vez logueado, haz clic en "New Project"
2. Nombra tu proyecto (ej: "QrkAta-Chat")
3. Haz clic en "Next"
4. Puedes agregar miembros al equipo (opcional)
5. Haz clic en "Create Project"

### 3. **Crear un cluster (base de datos)**

1. Haz clic en "Build a Database"
2. Selecciona "M0 Sandbox" (FREE)
3. Elige un proveedor de nube:
   - **AWS** (recomendado para mejor rendimiento)
   - Google Cloud Platform
   - Microsoft Azure
4. Selecciona una región cercana a tu ubicación
5. Nombra tu cluster (ej: "qrkata-cluster")
6. Haz clic en "Create Cluster"

### 4. **Configurar seguridad**

#### **4.1 Crear usuario de base de datos:**
1. Ve a "Database Access" en el menú lateral
2. Haz clic en "Add New Database User"
3. Selecciona "Password" como método de autenticación
4. Crea un usuario:
   - **Usuario:** `qrkata-admin` (o el que prefieras)
   - **Contraseña:** Genera una segura (¡guárdala!)
5. En "Database User Privileges", selecciona "Read and write to any database"
6. Haz clic en "Add User"

#### **4.2 Configurar acceso de red:**
1. Ve a "Network Access" en el menú lateral
2. Haz clic en "Add IP Address"
3. Opciones:
   - **Para desarrollo:** Haz clic en "Allow Access from Anywhere" (0.0.0.0/0)
   - **Para producción:** Agrega solo las IPs específicas que necesites
4. Haz clic en "Confirm"

### 5. **Obtener la cadena de conexión**

1. Ve a "Database" en el menú lateral
2. En tu cluster, haz clic en "Connect"
3. Selecciona "Connect your application"
4. Asegúrate de que esté seleccionado:
   - **Driver:** Node.js
   - **Version:** 4.1 or later
5. Copia la cadena de conexión que aparece

### 6. **Configurar en tu aplicación**

#### **Ejemplo de cadena de conexión:**
```
mongodb+srv://qrkata-admin:<password>@qrkata-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
```

#### **Actualizar el archivo .env:**
```env
MONGODB_URI=mongodb+srv://qrkata-admin:TU_CONTRASEÑA_AQUÍ@qrkata-cluster.abc123.mongodb.net/qrkata?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE:** 
- Reemplaza `<password>` con la contraseña real del usuario
- Reemplaza `qrkata-cluster.abc123.mongodb.net` con tu URL real
- Agregué `/qrkata` después del dominio para especificar el nombre de la base de datos

### 7. **Verificar la conexión**

1. Guarda el archivo `.env` con la nueva URI
2. Ejecuta tu servidor:
   ```bash
   cd server
   npm run dev
   ```
3. Si todo está bien, deberías ver:
   ```
   MongoDB conectado: qrkata-cluster.abc123.mongodb.net
   Servidor corriendo en puerto 5000
   ```

### 8. **Ver datos en MongoDB Atlas**

1. Ve a "Database" → "Browse Collections"
2. Aquí podrás ver todas las colecciones que se crean automáticamente:
   - `users` - Usuarios registrados
   - `servers` - Servidores creados
   - `channels` - Canales de los servidores
   - `messages` - Mensajes enviados
   - `directmessages` - Conversaciones privadas

### 9. **Consejos de seguridad**

#### **Para desarrollo:**
- Puedes usar "Allow Access from Anywhere" para facilidad
- La contraseña puede ser simple pero úsala solo para desarrollo

#### **Para producción:**
- **NUNCA** uses "Allow Access from Anywhere"
- Agrega solo las IPs específicas de tus servidores
- Usa contraseñas complejas y únicas
- Considera usar variables de entorno para la URI completa
- Habilita auditoría y monitoreo

### 10. **Troubleshooting común**

#### **Error: "Authentication failed"**
- Verifica que el usuario y contraseña sean correctos
- Asegúrate de que el usuario tenga permisos de lectura/escritura

#### **Error: "Connection timeout"**
- Verifica que tu IP esté en la whitelist
- Revisa tu conexión a internet
- Prueba con "Allow Access from Anywhere" temporalmente

#### **Error: "Database connection refused"**
- Verifica que la URI esté correcta
- Revisa que no haya espacios extra en la cadena de conexión
- Asegúrate de que el cluster esté activo (no pausado)

### 11. **Monitoreo y límites gratuitos**

#### **Límites del plan gratuito (M0):**
- **Storage:** 512 MB
- **RAM:** Compartida
- **Conexiones:** 100 simultáneas
- **Clusters:** 1 por proyecto

#### **Cómo monitorear uso:**
1. Ve a "Metrics" en tu cluster
2. Revisa el uso de storage y conexiones
3. MongoDB Atlas te avisará si te acercas a los límites

### 12. **Backup automático**

El plan gratuito no incluye backups automáticos, pero puedes:
- Usar `mongodump` para backups manuales
- Exportar datos desde la interfaz web
- Considerar actualizar a un plan pagado para backups automáticos

---

## 🔗 Enlaces útiles

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Connection String Guide](https://docs.mongodb.com/manual/reference/connection-string/)
- [Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)

## 📞 Soporte

Si tienes problemas:
1. Revisa la documentación oficial de MongoDB Atlas
2. Verifica los logs de tu aplicación
3. Usa el chat de soporte de MongoDB Atlas (disponible en el plan gratuito)

---

**¡Listo!** Tu base de datos MongoDB Atlas está configurada y lista para QrkAta. 🚀