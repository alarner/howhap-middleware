'use strict';

var HowhapList = require('howhap-list');
var _ = require('lodash');
var bunyan = require('bunyan');
module.exports = function (options) {
	var defaults = {
		availableErrors: {},
		logging: {
			name: 'howhap-middleware',
			stream: process.stdout,
			level: 'warn'
		}
	};
	options = options || {};
	options = _.extend(defaults, options);
	var logger = bunyan.createLogger(options.logging);
	return function (req, res, next) {
		var defaults = {
			errors: {},
			data: {
				body: {},
				query: {},
				params: {}
			}
		};
		if (!req.session) {
			return res.status(500).end('howhap-middleware requires an express session.');
		}
		var prevHowhap = req.session._howhap || _.cloneDeep(defaults);
		req.session._howhap = _.cloneDeep(defaults);

		res.locals.error = new HowhapList(prevHowhap.errors);
		res.locals.prev = {
			display: function display(type, key, defaultValue) {
				defaultValue = defaultValue || '';
				return prevHowhap.data[type.toLowerCase()][key] || defaultValue;
			}
		};

		res.error = new HowhapList(null, {
			availableErrors: options.availableErrors,
			logger: logger
		});
		res.error.send = function (redirect, forceJSON) {
			var errors = res.error.toJSON();
			var status = null;
			// Get the status of the "first" error in the object
			for (var prop in errors) {
				status = errors[prop].status;
				break;
			}
			if (status === null) {
				return false;
			}

			if (!forceJSON && req.accepts('html')) {
				redirect = redirect || req.get('Referer');
				req.session._howhap.errors = errors;
				req.session._howhap.data.body = req.body;
				req.session._howhap.data.query = req.query;
				req.session._howhap.data.params = req.params;
				res.redirect(redirect);
			} else {
				res.status(status).json(errors);
			}
			return true;
		};
		next();
	};
};