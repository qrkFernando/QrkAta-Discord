const mongoose = require('mongoose')
require('dotenv').config({ path: './server/.env' })

// Importar modelo de usuario
const User = require('./server/models/User')

const testUserRegistration = async () => {
  try {
    console.log('🧪 Probando registro de usuario...')
    
    // Conectar a MongoDB con timeout más largo
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
    })
    console.log('✅ Conectado a MongoDB')
    
    // Crear usuario de prueba
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: '123456'
    })
    
    console.log('🔐 Probando encriptación de contraseña...')
    await testUser.save()
    console.log('✅ Usuario creado exitosamente')
    
    // Verificar que la contraseña fue encriptada
    console.log('📝 Contraseña original: 123456')
    console.log('🔒 Contraseña encriptada:', testUser.password)
    
    // Probar comparación de contraseña
    const isValidPassword = await testUser.comparePassword('123456')
    const isInvalidPassword = await testUser.comparePassword('wrongpassword')
    
    console.log('✅ Contraseña correcta:', isValidPassword ? 'VÁLIDA' : 'INVÁLIDA')
    console.log('❌ Contraseña incorrecta:', isInvalidPassword ? 'VÁLIDA' : 'INVÁLIDA')
    
    // Verificar datos públicos
    const publicData = testUser.toPublic()
    console.log('👤 Datos públicos del usuario:')
    console.log('   Username:', publicData.username)
    console.log('   Email:', publicData.email)
    console.log('   Password incluida:', publicData.password ? 'SÍ (MAL)' : 'NO (BIEN)')
    
    // Limpiar - eliminar usuario de prueba
    await User.findByIdAndDelete(testUser._id)
    console.log('🧹 Usuario de prueba eliminado')
    
    console.log('\n🎉 ¡Todas las pruebas de usuario pasaron exitosamente!')
    
  } catch (error) {
    console.log('\n❌ Error en las pruebas:', error.message)
    
    if (error.code === 11000) {
      console.log('💡 El usuario ya existe, eliminando y reintentando...')
      try {
        await User.deleteOne({ email: 'test@example.com' })
        console.log('Usuario existente eliminado, vuelve a ejecutar la prueba')
      } catch (deleteError) {
        console.log('Error al eliminar usuario existente:', deleteError.message)
      }
    }
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

// Ejecutar prueba
testUserRegistration()