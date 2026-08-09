module.exports = {
  apps: [{
    name: 'miau-surveillance',
    script: 'server.cjs',
    cwd: __dirname,
    env: { PORT: 5199, NODE_ENV: 'production' },
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
  }]
};
