var _ = require('underscore')
  , http = require('http')
  , socketIo = require('socket.io')
  , fs = require('fs')
  , config = {endpoint: 'pets.stg.kafeshka.mobi'}
  , api = require('./api')(config.endpoint);

module.exports = function(customHandler) {
  var handler = customHandler || defaultHandler
    , app = http.createServer(handler)
    , ioApp = socketIo.listen(app);

  ioApp.sockets.on('connection', function(socket) {
    socket.set('sid', '760084f223987ddf893baa2b484ec453', function () {
      socket.send(message('authenticated'));
    });

    socket.on('message', function(data) {
      socket.get('sid', function(err, sid) {
        if (err) {
          return socket.send(message('error', err));
        }

        try {
          data = JSON.parse(data);
        } catch(err) {
          return socket.send(message('error', 'invalid request: ' + data + '; err: ' + err));
        }

        var url = data[0];
        var requestData = data[1];

        var request = api.request(url, responseCallback);
        request.addCookie('oc1', sid);

        if (requestData) {
          request.setData(requestData);
        }

        request.perform();
      });
    });

    socket.on('disconnect', function () { });

    function responseCallback(err, response) {
      if (err) {
        return socket.send(message('error', err));
      }

      try {
        var parsedResponse = JSON.parse(response);
      } catch(err) {
        return socket.send(message('error', 'invalid response: ' + response + '; err: ' + err));
      }

      socket.send(message('response', parsedResponse));
    }
  });

  return {
    listen: function(port) {
      app.listen(port);
    }
  };

  function message(type, data) {
    var message = {};

    switch(type) {
      case 'error': message = {c: 0, d: data}; break;
      case 'authenticated': message = {c: 1}; break;
      case 'response': message = {c: 2, d: data}; break;
    }

    return JSON.stringify(message);
  }
};

function defaultHandler(request, response) {
  response.writeHead(500);
  response.end('Nothing here');
}
