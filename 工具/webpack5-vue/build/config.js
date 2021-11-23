const { resolve } = require('./utils');
const env = process.env.NODE_ENV;

const devMode = env === 'development';

const getDotEnv = () => {
	const dotEnv = require('dotenv').config({ path: resolve(`.env.${env}`) }).parsed || {};
	return Object.assign(dotEnv);
};

const dotEnvConfig = getDotEnv();

module.exports = {
	devMode,
	env,
	dotEnvConfig,
};
