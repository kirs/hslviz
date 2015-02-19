// http://83.145.232.209:10001/?type=vehicle&id=EFENG1061000266

// http://83.145.232.209:10001/?type=vehicles&lng1=23&lat1=60&lng2=26&lat2=61

// http://83.145.232.209:10001/?type=linename &ip=213.214.187.223

// http://83.145.232.209:10001/?type=vehicle&id=RHKL00204
// http://83.145.232.209:10001/?type=nextstops&id=RHKL00204

var express = require('express')
var app = express()
var request = require('request');

var getRoutes = function(callback) {
  request('http://83.145.232.209:10001/?type=vehicles&lng1=23&lat1=60&lng2=26&lat2=61', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var output = [];
      var lines = body.split('\n');
      for(var i = 0;i < lines.length;i++){
        if(lines[i] != '') {
          var elements = lines[i].split(';');
          output.push({
            route: elements[0],
            lng: parseFloat(elements[2]),
            lat: parseFloat(elements[3])
          })
        }
      }

      callback(output)
    }
  })
}

app.get('/locations', function (req, res) {
  getRoutes(function(result) {
    res.json(result)
  })
})

app.use(express.static(__dirname + '/static'));

app.get('/', function (req, res) {
  res.sendfile('public/index.html');
})

var server = app.listen(3001, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
