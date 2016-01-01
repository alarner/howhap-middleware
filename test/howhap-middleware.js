let sinon = require('sinon');
let expect = require('chai').expect;
let HowhapMiddleware = require('../index.js');
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
			expect(res.end.calledWith('howhap-middleare requires an express session.')).to.be.true;
		});
	});
	describe('res.send', function() {
		let middlewareFunction = HowhapMiddleware();
		let req = {
			session: {},
			accepts: sinon.stub().returns(false)
		};
		let res = {
			locals: {}
		};
		res.end = sinon.stub().returns(res);
		res.json = sinon.stub().returns(res);
		res.status = sinon.stub().returns(res);
		middlewareFunction(req, res, () => {});
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
			expect(res.error.send()).to.be.true;
			expect(req.session._howhap.errors).to.deep.equal({});
			expect(res.json.calledWith({
				default: {
					message: 'foo',
					status: 404,
					params: {}
				}
			})).to.be.true;
		});
	});
});