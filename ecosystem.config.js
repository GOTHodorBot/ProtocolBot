module.exports = {
    apps : [{
      name: 'ProtocolBot',
      script: './index.js',
  
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      args: 'one two',
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }],
  
    deploy : {
      production : {
        user : 'GOTHodorBot',
        host : ['144.172.70.227'],
        ref  : 'origin/master',
        repo : 'git@github.com:GOTHodorBot/ProtocolBot.git',
        path : '/home/protocolbot',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
      }
    }
  };
  