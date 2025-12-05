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