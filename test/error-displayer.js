let expect = require('chai').expect;
let ErrorDisplayer = require('../src/error-displayer.js');
describe('ErrorDisplayer', function() {
	describe('constructor', function() {
		it('should work when nothing is passed in', function() {
			new ErrorDisplayer();
		});
		it('should not allow non-objects to be passed in', function() {
			expect(() => { new ErrorDisplayer([]); }).to.throw('First argument to ErrorDisplayer constructor should be an object.');
		});
		it('should work when a valid object is passed in', function() {
			new ErrorDisplayer({
				email: {
					message: '{{ email }} is not a valid email.',
					status: 400,
					params: { email: 'fake'}
				}
			});
		});
	});
	describe('display', function() {
		it('should return the appropriately rendered error', function() {
			let d = new ErrorDisplayer({
				email: {
					message: '{{ email }} is not a valid email.',
					status: 400,
					params: { email: 'fake'}
				}
			});
			expect(d.display('email')).to.equal('fake is not a valid email.');
		});
		it('should return the default value when the error is not found', function() {
			let d = new ErrorDisplayer({
				email: {
					message: '{{ email }} is not a valid email.',
					status: 400,
					params: { email: 'fake'}
				}
			});
			expect(d.display('foo')).to.equal('');
			expect(d.display('foo', 'bar')).to.equal('bar');
		});
	});
});