let HowhapList = require('howhap-list');
let _ = require('lodash');
let winston = require('winston');
module.exports = function(options) {
	let defaults = {
		availableErrors: {},
		defaultFormat: 'json',
		logging: {
			level: 'info',
			transports: [
				new winston.transports.Console({
					handleExceptions: true,
					humanReadableUnhandledException: true
				})
			]
		}
	};
	options = options || {};
	options = _.extend(defaults, options);

	let logger = new winston.Logger(options.logging);
	return function(req, res, next) {
		let defaults = {
			errors: {},
			data: {
				body: {},
				query: {},
				params: {}
			}
		};
		if(req.session) {
			let prevHowhap = req.session._howhap || _.cloneDeep(defaults);
			req.session._howhap = _.cloneDeep(defaults);

			res.locals.error = new HowhapList(prevHowhap.errors);
			res.locals.prev = {
				display: function(type, key, defaultValue) {
					defaultValue = defaultValue || '';
					return prevHowhap.data[type.toLowerCase()][key] || defaultValue;
				}
			};
		}
		
		res.error = new HowhapList(null, {
			availableErrors: options.availableErrors,
			logger: logger
		});
		res.error.send = function(redirect, format) {
			let errors = res.error.toObject();
			let status = null;
			if(!format && req.query) {
				format = req.query.responseFormat;
			}
			format = format || options.defaultFormat;
			format = format.toString().toLowerCase();
			redirect = redirect || req.get('Referer') || '/';

			// Get the status of the "first" error in the object
			for(let prop in errors) {
				status = errors[prop].status;
				break;
			}
			if(status === null) {
				return false;
			}

			if(format === 'html') {
				if(!req.session) {
					return res.status(500).end('howhap-middleware requires an express session.');
				}
				req.session._howhap.errors = errors;
				req.session._howhap.data.body = req.body;
				req.session._howhap.data.query = req.query;
				req.session._howhap.data.params = req.params;
				res.redirect(redirect);
			}
			else if(format === 'json') {
				res.status(status).json(errors);
			}
			return true;
		};
		next();
	};
};