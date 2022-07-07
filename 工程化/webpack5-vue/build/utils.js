const path = require('path');

const resolve = (dir) => path.join(__dirname, '../', dir ? dir : '');

module.exports = {
	resolve,
};
