### koa-restclient

#### example
```javascript
  const koaRest = require('koa-restclient');
  const app = koa();
  app.use(koaRest());
  app.use(route.get('/foo', function*() {
    const res = yield this.restClient.get(this.request.get('host') + '/foo/one').type('application/json');
    this.body = res.body;
    return this.body;
  }));
```