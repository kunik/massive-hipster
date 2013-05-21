var fs = require('fs')
  , server = require('./lib/server')(function(req, res) {
      fs.readFile(__dirname + '/public/index.html',
        function (err, data) {
          if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
          }

          res.writeHead(200);
          res.end(data);
        });
    });

server.listen(5203);