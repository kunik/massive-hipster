module.exports = api;

var http = require('http');

function api(host, port) {
  var client = http.createClient(port || 80, host);

  function ApiRequest(path, callback) {
    this.path = path;
    this.callback = callback;
    this.method = 'GET';
    this.headers = {};
    this.data = null;
  }

  ApiRequest.prototype.addCookie = function(name, value) {
    var cookies = (this.headers.Cookie && this.headers.Cookie.split('; ')) || [];
    cookies.push(name + '=' + value);
    this.addHeader('Cookie', cookies.join('; '));
  };

  ApiRequest.prototype.addHeader = function(header, data) {
    this.headers[header] = data;
  };

  ApiRequest.prototype.setData = function(data) {
    this.data = data;
  };

  ApiRequest.prototype.perform = function() {
    var self = this;

    var request = client.request(self.method, self.path, self.headers);
    request.on('response', function(response) {
      var buffer = '';
      response.on('data', function(chunk) {
        buffer += chunk;
      });

      response.on('end', function() {
        self.callback.call(this, null, buffer, response);
      });
    });

    if (self.data) {
      request.write(self.data);
    }

    request.end();
  };

  return {
    request: function(path, callback) {
      return new ApiRequest(path, callback);
    }
  };
}


