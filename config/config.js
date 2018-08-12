import convict from 'convict';

const config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  mongo: {
    main: {
      doc: 'Main database',
      default: 'mongodb://diana:my1database@ds263571.mlab.com:63571/starlab',
      secret: 'secret',
      env: 'MONGO_MAIN',
    },
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8000,
    env: 'PORT',
  },
});

config.validate();

export default config;
