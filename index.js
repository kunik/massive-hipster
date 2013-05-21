var app = require('http').createServer(function(req, res) { res.writeHead(500); res.end('Nothing here'); })
  , io = require('socket.io').listen(app);

app.listen(5203);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
