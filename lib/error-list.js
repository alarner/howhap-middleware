let Howhap = require('howhap');
let _ = require('lodash');
module.exports = function(availableErrors, logger) {
	let errors = {};
	availableErrors = availableErrors || {};

	if(!_.isPlainObject(availableErrors)) {
		throw 'ErrorList availableErrors should be an object.';
	}

	this.add = function(messageStatus, params, key) {
		if(_.isString(params) && !key) {
			key = params;
			params = {};
		}

		if(_.isString(messageStatus)) {
			messageStatus = getError(messageStatus);
		}

		key = key || 'default';

		errors[key] = new Howhap(messageStatus, params);

		logger[messageStatus.level || 'debug'](
			messageStatus.message,
			messageStatus.status,
			params
		);
	};

	this.remove = function(key) {
		delete errors[key];
	};

	this.list = function() {
		let returnErrors = {};
		for(let i in errors) {
			returnErrors[i] = errors[i].toJSON();
		};
		return returnErrors;
	};

	function getError(descriptor) {
		// First check to see if the descriptor exists in the list of available errors.
		if(availableErrors.hasOwnProperty(descriptor)) {
			return availableErrors[descriptor];
		}

		// If it doesn't then assume it's a chain of property names, for example:
		// AUTH.BAD_PASSWORD and we should traverse the availableErrors object to find
		// the appropriate nested property.
		let props = descriptor.split('.');
		let target = availableErrors;
		for(let i=0; i<props.length; i++) {
			let prop = props[i];
			if(target.hasOwnProperty(prop)) {
				target = target[prop];
			}
			else {
				throw 'Could not find an error with descriptor '+descriptor;
			}
		}

		return target;
	}
};