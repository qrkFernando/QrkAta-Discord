const mongoose = require('mongoose')
require('dotenv').config({ path: './server/.env' })

const testConnection = async () => {
  try {
    console.log('🔄 Probando conexión a MongoDB Atlas...')
    console.log('📡 URI:', process.env.MONGODB_URI ? 'Configurada ✅' : 'No configurada ❌')
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ Error: MONGODB_URI no está configurada en el archivo .env')
      console.log('📝 Asegúrate de configurar la variable de entorno en server/.env')
      process.exit(1)
    }

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conexión exitosa a MongoDB Atlas!')
    
    // Obtener información básica de la conexión
    const db = mongoose.connection.db
    console.log(`\n📊 Conexión establecida con: ${db.databaseName}`)
    
    // Listar colecciones existentes (si tenemos permisos)
    try {
      const collections = await db.listCollections().toArray()
      console.log(`\n📂 Colecciones encontradas (${collections.length}):`)
      if (collections.length === 0) {
        console.log('   (No hay colecciones aún - se crearán automáticamente)')
      } else {
        collections.forEach(col => {
          console.log(`   - ${col.name}`)
        })
      }
    } catch (error) {
      console.log('\n📂 No se pueden listar colecciones (permisos limitados)')
      console.log('   Las colecciones se crearán automáticamente al insertar datos')
    }
    
    // Test de escritura simple
    console.log('\n📝 Probando escritura en la base de datos...')
    const TestSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    })
    const TestModel = mongoose.model('Test', TestSchema)
    
    const testDoc = new TestModel({
      message: 'Prueba de conexión QrkAta'
    })
    
    await testDoc.save()
    console.log('✅ Escritura exitosa!')
    
    // Leer el documento de prueba
    const foundDoc = await TestModel.findById(testDoc._id)
    console.log('✅ Lectura exitosa!')
    
    // Limpiar documento de prueba
    await TestModel.findByIdAndDelete(testDoc._id)
    console.log('🧹 Documento de prueba eliminado')
    
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!')
    console.log('🚀 Tu base de datos MongoDB Atlas está lista para QrkAta')
    
  } catch (error) {
    console.log('\n❌ Error en la conexión:')
    console.log(`   ${error.message}`)
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Soluciones sugeridas:')
      console.log('   1. Verifica que el usuario y contraseña sean correctos')
      console.log('   2. Asegúrate de que el usuario tenga permisos de lectura/escritura')
      console.log('   3. Revisa que la URI no tenga espacios extra')
    } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Soluciones sugeridas:')
      console.log('   1. Verifica tu conexión a internet')
      console.log('   2. Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas')
      console.log('   3. Prueba con "Allow Access from Anywhere" temporalmente')
    }
    
    console.log('\n📚 Guía de configuración: ./server/MONGODB_SETUP.md')
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

// Ejecutar prueba
testConnection()