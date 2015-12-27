'use strict';

const _ = require('lodash');
const async = require('async');
const debug = require('debug');
const onlyOnce = require('only-once');

function AsyncGenRunner(iter, cb) {
	this._debug = this._createDebug();
	this._iter = iter;
	this._cb = cb;
}

AsyncGenRunner.run = function(iter, cb) {
	const runner = new AsyncGenRunner(iter, cb);
	runner._runNext();
};

const p = AsyncGenRunner.prototype;

p._createDebug = _.partial(debug, 'AsyncGenRunner');

p._onlyOnce = onlyOnce;

p._parallel = _.bind(async.parallel, async);

p._runNext = function(returnValue) {
	this._debug('_runNext');
	let result;
	try {
		result = this._iter.next(returnValue);
	} catch (e) {
		this._runCb(e);
		return;
	}
	this._processResult(result);
};

p._asyncCb = function(err, value) {
	this._debug('_asyncCb');
	if (err) {
		let result;
		try {
			result = this._iter.throw(err);
		} catch (e) {
			this._runCb(e);
			return;
		}
		this._processResult(result);
		return;
	}
	this._runNext(value);
};

p._processResult = function(result) {
	this._debug('_processResult');
	const value = result.value;
	if (result.done) {
		this._runCb(null, value);
		return;
	}
	const cb = this._onlyOnce(this._asyncCb, this);
	if (_.isArray(value)) {
		this._parallel(value, cb);
		return;
	}
	try {
		value(cb);
	} catch (e) {
		this._asyncCb(e);
	}
};

p._runCb = function(err, result) {
	this._debug('_runCb');
	const cb = this._cb;
	if (cb) {
		cb(err, result);
		return;
	}
	if (err) {
		const e = new Error('Unhandled error while running of async gen');
		e.cause = err;
		throw e;
	}
};

module.exports = AsyncGenRunner;
