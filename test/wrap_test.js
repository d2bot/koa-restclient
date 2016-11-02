'use strict';
const koa = require('koa');
const route = require('koa-route');
const koaRest = require('../index.js')
const request = require('supertest');
const uuid = require('node-uuid');

function createServer(reqIdPrefix) {
  var app = koa();
  if(!reqIdPrefix) {
    app.use(koaRest());
  } else {
    app.use(koaRest({prefix: reqIdPrefix}))
  }

  app.use(route.get('/foo', function*() {
    const res = yield this.restClient.get(this.request.get('host') + '/foo/one').type('application/json');
    this.body = res.body;
    return this.body;
  }));

  app.use(route.get('/foo/one', function*() {
    const res = yield this.restClient.get(this.request.get('host') + '/foo/two').type('application/json');
    this.body = res.body;
    return this.body;
  }));

  app.use(route.get('/foo/two', function*(){
    const res = yield this.restClient.get(this.request.get('host') + '/foo/three').type('application/json');
    this.body = res.body;
    return this.body;
  }));

  app.use(route.get('/foo/three', function*() {
    this.body = {reqId: this.request.get('X-Request-Id')};
    return this.body;
  }));

  app.use(route.get('/bar', function*() {
    this.body = {reqId: this.request.get('X-Request-Id')};
    return this.body;
  }));

  app.use(route.get('/', function*() {
    const res = yield this.restClient.get(this.request.get('host') + '/bar').type('application/json');
    this.body = res.body
    return this.body;
  }));
  return app;
}

describe('koa-restclient', () => {
  const app = request(createServer().listen());
  it('should have the same `X-Request-Id` in the request header in one call', function (done) {
    const reqId = uuid.v4();
    app.get('/')
      .set('X-Request-Id', reqId)
      .expect({reqId: reqId})
      .expect(200, done);
  });

  it('should have the same `X-Request-Id` in the request header in multiple call', function (done) {
    const reqId = uuid.v4();
    app.get('/foo')
      .set('X-Request-Id', reqId)
      .expect({reqId: reqId})
      .expect(200, done);
  });
});

describe('koa-restclient prefix', () => {
  const prefix = 'http-api-';
  const app = request(createServer(prefix).listen());
  it('should have prefix in reqId', function(done) {
    app.get('/foo')
        .expect((res) => {
          if(!res.body.reqId.startsWith(prefix)) {
            throw new Error('No Prefix!');
          }
        })
        .expect(200, done);
  });
});
