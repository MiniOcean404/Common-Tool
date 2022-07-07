const devConfig = require('./webpack.service');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');

const compiler = webpack({ ...devConfig });
const server = new WebpackDevServer({ ...devConfig.devServer, open: false }, compiler);

const runServer = async () => {
	await server.start();
};

runServer().then();
