// http://83.145.232.209:10001/?type=vehicle&id=RHKL00401

// http://83.145.232.209:10001/?type=vehicles&lng1=23&lat1=60&lng2=26&lat2=61

// http://83.145.232.209:10001/?type=linename &ip=213.214.187.223

// http://83.145.232.209:10001/?type=vehicle&id=RHKL00204
// http://83.145.232.209:10001/?type=nextstops&id=RHKL00204

var express = require('express')
var app = express()
var request = require('request');
var async = require('async');

// var vehicles = {}

var getMoreInfo = function(item, callback) {
  request("http://83.145.232.209:10001/?type=nextstops&id=" + item.id, function(error, response, body) {
    var lines = body.split('\r\n');

    if(lines[0] == '') {
      // console.log("metro found!", item.id)
      item.name = item.id;
      item.type = "metro";
    } else {
      var stops = lines.slice(1, lines.length);
      item.name = lines[0];
      item.type = "tram";
      item.stops = stops;
    }

    callback(null, item);
  })
}

var getRoutes = function(bounds, callback) {
  var url = 'http://83.145.232.209:10001/?type=vehicles&lng1=23&lat1=60&lng2=26&lat2=61';
  // var url = 'http://83.145.232.209:10001/?type=vehicles&lng1=' + bounds[3] + '&lat1=' + bounds[0] + '&lng2=' + bounds[1] + '&lat2=' + bounds[2];
  console.log(bounds, url)
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = [];
      var lines = body.split('\n');
      for(var i = 0;i < lines.length;i++) {
        // if(i > 5) {
        //   break;
        // }
        if(lines[i] != '') {
          var elements = lines[i].split(';');

          // ["RHKL00225", "1006", "24.956635", "60.182339", "223", "2", "1113433", "1111430", "1818"]
          result.push({
            id: elements[0],
            route_id: elements[1],
            lng: parseFloat(elements[2]),
            lat: parseFloat(elements[3]),
            next_stop: elements[7]
            // type: elements[9],
            // name: elements[11],
            // speed: elements[12],
            // raw: lines[i]
          })
        }
      }

      async.map(result, getMoreInfo, function(err, done){

        // console.log("err", err)
        // console.log("done", done)
        callback(result)
      });
    }
  })
}

app.set('port', (process.env.PORT || 3001));
app.use(express.static(__dirname + '/static'));

app.get('/locations', function (req, res) {
  getRoutes(req.query.bounds, function(result) {
    res.json(result)
  })
})

app.get('/', function (req, res) {
  res.sendfile('public/index.html');
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
