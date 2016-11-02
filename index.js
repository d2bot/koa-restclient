'use strict';

const superagent = require('superagent');
const uuid = require('node-uuid');

const supportMethods = ['get', 'head', 'post', 'put', 'patch', 'delete'];

function wrapReqId(reqId) {
  const wrapped = Object.assign({}, superagent);
  
  supportMethods.forEach(method => {
    wrapped[method] = function() {
      var request = superagent[method].apply(wrapped, arguments)
      request.set({'X-Request-Id': reqId});
      return request;
    }
  });
  return wrapped;
}

module.exports = function(opts) {
  const options = opts || {};
  const header = options.header || 'X-Request-Id';
  const ctxProp = options.prop || 'reqId';
  return function *requestIdContext(next) {
    let reqId = this.request.get(header);
    if(!reqId) {
      reqId = (opts.prefix || '') + uuid.v4();
    }
    this[ctxProp] = reqId;
    this.restClient = wrapReqId(reqId);
    yield *next;
  };
}
