let ErrorList = require('./lib/error-list');
let ErrorDisplayer = require('./lib/error-displayer');
let _ = require('lodash');
module.exports = function(options) {
	options = options || {};
	return function(req, res, next) {
		let defaults = {
			errors: {},
			data: {
				body: {},
				query: {},
				params: {}
			}
		};
		let prevHowhap = req.session._howhap || _.cloneDeep(defaults);
		req.session._howhap = _.cloneDeep(defaults);

		res.locals.error = new ErrorDisplayer(prevHowhap.errors);
		res.locals.prev = function(type, key, defaultValue) {
			defaultValue = defaultValue || '';
			return prevHowhap.data[type.toLowerCase()][key] || defaultValue;
		};
			
		res.error = new ErrorList(req, res, options.availableErrors);
	};
};