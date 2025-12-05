#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando proceso de despliegue de QrkAta...\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`📋 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completado`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error en: ${description}`, 'red');
    log(`Comando: ${command}`, 'yellow');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} existe`, 'green');
    return true;
  } else {
    log(`❌ ${description} no encontrado en: ${filePath}`, 'red');
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  log('🔍 VERIFICACIÓN PRE-DESPLIEGUE', 'yellow');
  console.log('='.repeat(50));

  // Verificar archivos necesarios
  const requiredFiles = [
    { path: './client/package.json', desc: 'Client package.json' },
    { path: './server/package.json', desc: 'Server package.json' },
    { path: './server/.env', desc: 'Server .env' },
    { path: './netlify.toml', desc: 'Netlify config' },
    { path: './render.yaml', desc: 'Render config' }
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (!checkFile(file.path, file.desc)) {
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    log('\n❌ Algunos archivos necesarios no existen. Por favor revisa la configuración.', 'red');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  log('📦 INSTALACIÓN DE DEPENDENCIAS', 'yellow');
  console.log('='.repeat(50));

  // Instalar dependencias
  if (!execCommand('npm run install-deps', 'Instalando dependencias del servidor y cliente')) {
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  log('🧪 PRUEBAS Y VALIDACIÓN', 'yellow');
  console.log('='.repeat(50));

  // Probar conexión a base de datos
  if (!execCommand('npm run test-db', 'Probando conexión a base de datos')) {
    log('⚠️  La conexión a la base de datos falló. Verifica tus credenciales.', 'yellow');
  }

  console.log('\n' + '='.repeat(50));
  log('🏗️  CONSTRUCCIÓN DE APLICACIÓN', 'yellow');
  console.log('='.repeat(50));

  // Construir cliente
  if (!execCommand('npm run build:client', 'Construyendo aplicación cliente')) {
    process.exit(1);
  }

  // Verificar que el build se creó correctamente
  if (!checkFile('./client/dist/index.html', 'Build del cliente')) {
    log('❌ El build del cliente no se generó correctamente', 'red');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  log('✅ PREPARACIÓN COMPLETADA', 'green');
  console.log('='.repeat(50));

  log('\n🎉 Tu aplicación está lista para desplegar!', 'green');
  log('\n📋 PRÓXIMOS PASOS:', 'blue');
  log('1. 🗄️  Configura tu base de datos MongoDB Atlas', 'yellow');
  log('2. 🎨 Sube tu frontend a Netlify:', 'yellow');
  log('   - Conecta tu repositorio GitHub', 'reset');
  log('   - Build command: npm run build', 'reset');
  log('   - Publish directory: client/dist', 'reset');
  log('3. ⚡ Despliega tu backend en Render:', 'yellow');
  log('   - Conecta tu repositorio GitHub', 'reset');
  log('   - Build command: cd server && npm install', 'reset');
  log('   - Start command: cd server && npm start', 'reset');
  log('4. 🔐 Configura las variables de entorno en ambas plataformas', 'yellow');
  log('5. 🔗 Actualiza las URLs en tu configuración', 'yellow');

  log('\n📚 Consulta GUIA_DESPLIEGUE_COMPLETA.md para instrucciones detalladas', 'blue');
}

main().catch(error => {
  log(`❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});