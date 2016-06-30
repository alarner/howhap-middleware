let sinon = require('sinon');
let expect = require('chai').expect;
let HowhapMiddleware = require('../src/index.js');
describe('howhap-middleware', function() {
	describe('middleware', function() {
		let middlewareFunction = HowhapMiddleware();
		it('should return an error if no session is defined', function() {
			let req = {
				// session: {},
			};
			let res = {
				locals: {}
			};
			res.end = sinon.stub().returns(res);
			res.status = sinon.stub().returns(res);
			middlewareFunction(req, res, () => {});
			expect(res.status.calledWith(500)).to.be.true;
			expect(res.end.calledWith('howhap-middleware requires an express session.')).to.be.true;
		});
	});
	describe('res.send', function() {
		let middlewareFunction = null;
		let req = null;
		let res = null;
		beforeEach(function() {
			middlewareFunction = HowhapMiddleware();
			req = {
				session: {},
				accepts: sinon.stub().returns(false),
				body: {
					foo: 'bar'
				},
				query: {
					search: 'test'
				},
				params: {
					id: 7
				},
				get: sinon.stub().returns('http://foo-bar.baz')
			};
			res = {
				locals: {}
			};
			res.end = sinon.stub().returns(res);
			res.json = sinon.stub().returns(res);
			res.status = sinon.stub().returns(res);
			res.redirect = sinon.stub().returns(res);
			middlewareFunction(req, res, () => {});
		});
		it('should exist', function() {
			expect(res.error).to.not.be.undefined;
			expect(res.error.send).to.not.be.undefined;
		});
		it('should return false is no errors are added', function() {
			expect(res.error.send()).to.be.false;
		});
		it('should return true if at least one error is added', function() {
			res.error.add({
				message: 'foo',
				status: 404
			});
			expect(res.error.send(), 'send() returns true').to.be.true;
		});
		it('should not set the session when sending json', function() {
			res.error.add({
				message: 'foo',
				status: 404
			});
			expect(req.session._howhap.errors, 'session is cleared').to.deep.equal({});
		});
		it('should call res.json if no redirect is supplied', function() {
			res.error.add({
				message: 'foo',
				status: 404
			});
			res.error.send();
			expect(res.json.calledWith({
				default: {
					message: 'foo',
					status: 404,
					params: {}
				}
			}), 'called with correct message').to.be.true;

		});
		it('should not call res.redirect if the format is not html', function() {
			res.error.add({
				message: 'foo',
				status: 404
			});
			res.error.send('/login');
			expect(res.redirect.calledWith('/login'), 'called with correct message').to.be.false;
		});
		it('should call res.redirect if the format is html', function() {
			res.error.add({
				message: 'foo',
				status: 404
			});
			res.error.send('/login', 'html');
			expect(res.redirect.calledWith('/login'), 'called with correct message').to.be.true;
		});
		it('should properly set the session if a redirect is supplied', function() {
			res.error.add({
				message: 'foo',
				status: 404
			});
			res.error.send('/login', 'html');
			expect(req.session._howhap.errors, 'errors on session').to.deep.equal({
				default: {
					message: 'foo',
					status: 404,
					params: {}
				}
			});
			expect(req.session._howhap.data.body, 'body on session').to.deep.equal(req.body);
			expect(req.session._howhap.data.query, 'query on session').to.deep.equal(req.query);
			expect(req.session._howhap.data.params, 'params on session').to.deep.equal(req.params);
		});
		it('should respect the defaultFormat option', function() {
			middlewareFunction = HowhapMiddleware({ defaultFormat: 'html' });
			middlewareFunction(req, res, () => {});
			res.error.add({
				message: 'foo',
				status: 404
			});
			res.error.send('/login');
			expect(res.redirect.calledWith('/login'), 'called with correct message').to.be.true;
		});
		it('should use the referrer if no redirect url is specified', function() {
			middlewareFunction = HowhapMiddleware({ defaultFormat: 'html' });
			middlewareFunction(req, res, () => {});
			res.error.add({
				message: 'foo',
				status: 404
			});
			res.error.send();
			expect(res.redirect.calledWith('http://foo-bar.baz'), 'called with correct message').to.be.true;
		});
		it('should redirect to / if no redirect url or referrer is specified', function() {
			middlewareFunction = HowhapMiddleware({ defaultFormat: 'html' });
			middlewareFunction(req, res, () => {});
			req.get = sinon.stub().returns('');
			res.error.add({
				message: 'foo',
				status: 404
			});
			res.error.send();
			expect(res.redirect.calledWith('/'), 'called with correct message').to.be.true;
		});
	});
});