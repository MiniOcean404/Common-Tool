const { resolve } = require('./utils');
const env = process.env.NODE_ENV;

const devMode = env === 'development';
const dotEnv = require('dotenv').config({ path: resolve(`.env.${env}`) });

module.exports = {
	devMode,
	env,
	dotEnv,
};
