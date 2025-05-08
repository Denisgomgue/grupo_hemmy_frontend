module.exports = {
  apps : [{
    name   : "grupo-hemmy-frontend", // Nombre de la aplicación en PM2
    script : "./node_modules/.bin/next", // Ejecutar 'next' directamente
    args   : ["start", "--port", "3001"], // Argumentos para 'next'
    cwd    : ".",                   // Directorio de trabajo actual
    exec_mode: "fork",              // Forzar el modo fork
    instances: 1,                   // Número de instancias (puedes aumentarlo para clustering)
    autorestart: true,              // Reiniciar automáticamente si falla
    watch  : false,                 // No reiniciar en cambios de archivo (deshabilitado para producción)
    max_memory_restart: '1G',       // Reiniciar si excede 1GB de memoria
    env_production: {               // Variables de entorno para producción
      NODE_ENV: "production",       // Establece el entorno de Node.js a producción
      // NEXT_PUBLIC_API_URL: "http://localhost:3000", 
      // NEXT_PUBLIC_APP_URL: "http://localhost:3001"
    }
  }]
}; 