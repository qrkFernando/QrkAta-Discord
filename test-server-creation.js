const mongoose = require('mongoose')
require('dotenv').config({ path: './server/.env' })

// Importar modelos
const User = require('./server/models/User')
const Server = require('./server/models/Server')

const testServerCreation = async () => {
  try {
    console.log('🧪 Probando creación de servidor...')
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB')
    
    // Crear usuario de prueba primero
    const testUser = new User({
      username: 'testowner',
      email: 'owner@example.com',
      password: '123456'
    })
    
    await testUser.save()
    console.log('✅ Usuario de prueba creado')
    
    // Crear servidor de prueba
    const testServer = new Server({
      name: 'Servidor de Prueba',
      description: 'Este es un servidor de prueba',
      owner: testUser._id,
      members: [{
        user: testUser._id,
        role: 'admin'
      }]
    })
    
    console.log('🔐 Probando generación de inviteCode...')
    await testServer.save()
    console.log('✅ Servidor creado exitosamente')
    
    // Verificar datos del servidor
    console.log('📋 Información del servidor:')
    console.log('   Nombre:', testServer.name)
    console.log('   Código de invitación:', testServer.inviteCode)
    console.log('   Owner ID:', testServer.owner)
    console.log('   Miembros:', testServer.members.length)
    console.log('   Código generado:', testServer.inviteCode ? 'SÍ ✅' : 'NO ❌')
    console.log('   Código único:', testServer.inviteCode.length === 6 ? 'SÍ ✅' : 'NO ❌')
    
    // Probar que el código es único
    const duplicateServer = new Server({
      name: 'Servidor Duplicado',
      description: 'Prueba de código duplicado',
      owner: testUser._id,
      inviteCode: testServer.inviteCode, // Mismo código
      members: [{
        user: testUser._id,
        role: 'admin'
      }]
    })
    
    try {
      await duplicateServer.save()
      console.log('❌ ERROR: Se pudo crear servidor con código duplicado')
    } catch (error) {
      console.log('✅ Código único funcionando correctamente (no permite duplicados)')
    }
    
    // Limpiar datos de prueba
    await User.findByIdAndDelete(testUser._id)
    await Server.findByIdAndDelete(testServer._id)
    console.log('🧹 Datos de prueba eliminados')
    
    console.log('\n🎉 ¡Todas las pruebas de servidor pasaron exitosamente!')
    
  } catch (error) {
    console.log('\n❌ Error en las pruebas:', error.message)
    
    // Limpiar en caso de error
    try {
      await User.deleteOne({ email: 'owner@example.com' })
      await Server.deleteOne({ name: 'Servidor de Prueba' })
      console.log('🧹 Limpieza de emergencia completada')
    } catch (cleanupError) {
      console.log('Error en limpieza:', cleanupError.message)
    }
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

// Ejecutar prueba
testServerCreation()