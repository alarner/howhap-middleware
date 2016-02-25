let expect = require('chai').expect;
let ErrorList = require('../src/error-list.js');
let bunyan = require('bunyan');
describe('ErrorList', function() {
	describe('constructor', function() {
		it('should not allow non-object availableErrors', function() {
			expect(() => { new ErrorList('foo'); }).to.throw('ErrorList availableErrors should be an object.');
			expect(() => { new ErrorList(7); }).to.throw('ErrorList availableErrors should be an object.');
		});

		it('should work with valid params', function() {
			expect(() => { new ErrorList({}); }).to.not.throw();
		});
	});

	describe('add', function() {
		let logger = bunyan.createLogger({
		    name: 'howhap-middleware',
		    stream: process.stdout,
		    level: 'warn'
		});
		let l = new ErrorList(
			{
				default: {
					message: 'Something went wrong',
					status: 500
				},
				email: {
					message: '"{{ email }}""  is not a valid email.',
					status: 400
				},
				form: {
					default:  {
						message: 'Default form error',
						status: 500
					}
				}
			},
			logger
		);

		it('should not allow errors that strings with no matching property', function() {
			expect(() => { l.add('test'); }).to.throw('Could not find an error with descriptor test');
		});

		it('should allow valid objects', function() {
			expect(() => { l.add({ message: 'foo', status: 400 }); }).to.not.throw();
		});

		it('should not allow invalid objects', function() {
			expect(() => { l.add({ message: 'foo' }); }).to.throw('First argument to Howhap constructor must contain a status property.');
		});

		it('should allow valid strings', function() {
			expect(() => { l.add('default'); }).to.not.throw();
			expect(() => { l.add('form.default'); }).to.not.throw();
		});
	});
});