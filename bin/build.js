let babel = require('babel-core');
let fs = require('fs');
let async = require('async');
let path = require('path');
let files = [
	'index.js',
	'lib/error-displayer.js',
	'lib/error-list.js'
];

async.each(
	files,
	convertFile,
	function(err) {
		console.log('finished', err);
	}
);


function convertFile(filepath, cb) {
	babel.transformFile(path.join(__dirname, '../', filepath), function(err, result) {
		if(err) return cb(err);
		fs.writeFile(path.join(__dirname, '../dist', filepath), result.code, cb);
	});
}