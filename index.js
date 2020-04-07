const application = require('./dist');

module.exports = application;

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +process.env.PORT || 3000,
      host: process.env.HOST || 'localhost',
      openApiSpec: {
        // setServersFromRequest: true || !process.env.SERVER_URL,
        servers: [
          {
            url: `https://${process.env.SERVER_URL}`,
          },
          {
            url: `http://localhost:8000`,
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
