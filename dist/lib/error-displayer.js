'use strict';

var _ = require('lodash');
var Howhap = require('howhap');
module.exports = function (err) {
	var errors = {};
	err = err || {};

	if (!_.isPlainObject(err)) {
		throw 'First argument to ErrorDisplayer constructor should be an object.';
	}

	for (var i in err) {
		errors[i] = new Howhap(err[i]);
	};

	this.display = function (key, defaultValue) {
		if (!errors.hasOwnProperty(key)) {
			return defaultValue || '';
		}
		return errors[key].toString();
	};
};