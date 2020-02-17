const application = require('./dist');

module.exports = application;

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +process.env.PORT || 3000,
      host: process.env.HOST || 'localhost',
      openApiSpec: {
        // useful when used with OASGraph to locate your application
        // setServersFromRequest: true,
        info: {
          title: `${ process.env.APP_NAME || '' } API`,
          version: '0.1.0',
        },
        servers: [
          {
            url: `https://${process.env.SERVER_URL}`,
          },
        ],
      },
      expressSettings: {
        'x-powered-by': false,
        env: process.env.NODE_ENV || 'production',
      },
    },
  };
  application.main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
