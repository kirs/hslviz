var markers = [];
var infoWindows = [];

var clearMarkers = function() {
  markers.forEach(function(marker, i) {
    markers[i].setMap(null);
  })

  markers = [];
}

var circle = {
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: 'red',
  fillOpacity: .8,
  scale: 4.5,
  strokeColor: 'white',
  strokeWeight: 1
};

var closeAllInfoWindows = function() {
  for (var i=0;i<infoWindows.length;i++) {
     infoWindows[i].close();
  }
}

var updateStatus = function() {
  var currentdate = new Date();
  var datetime = currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/"
                  + currentdate.getFullYear() + " @ "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
  var timebox = $(".js-last-update");
  timebox.text(datetime)
  timebox.css('color', 'green')
}

var formatCurrent = function(current) {
  if(current.stops) {
    var stops = current.stops.map(function(map) {
      var sections = map.match(/(\d+)_(\d+)_(.+)/);

      if(sections) {
        var normalized = sections[3].replace("_normal", "");
        if(normalized.match(/_last/)) {
          return "Last: " + sections[3].replace("_last", "")
        }

        if(normalized.match(/_current/)) {
          return "Current: " + sections[3].replace("_current", "")
        }

        return normalized;
      } else {
        return map;
      }
    }).join("<br/>")
  } else {
    var stops = "";
  }

  return "<h3>" + current.name + "</h3><pre>" + stops + "</pre>";
}

var refreshMap = function(map, bounds, callback) {
  clearMarkers()
  $.get('/locations', { bounds: bounds }, function(locations) {
    updateStatus()
    locations.forEach(function(current) {
      if((state.metro && current.type == "metro") || (state.tram && current.type == "tram")) {
        var position = new google.maps.LatLng(current.lat, current.lng);
        var marker = new google.maps.Marker({
          position: position,
          map: map,
          title: current.route,
        });

        var infowindow = new google.maps.InfoWindow({
          content: formatCurrent(current)
        });

        infoWindows.push(infowindow);

        google.maps.event.addListener(marker, 'click', function() {
          closeAllInfoWindows()
          infowindow.open(map, marker);
        });

        markers.push(marker)
      }
    })

    if(callback) {
      callback()
    }
  })
}

window.state = {
  metro: true,
  tram: true
}
var initApp = function() {
  var center = new google.maps.LatLng(60.187212, 24.953745);
  var mapOptions = {
    zoom: 13,
    center: center
  }

  window.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addListenerOnce(map, 'bounds_changed', function(){
    var ne = map.getBounds().getNorthEast();
    var sw = map.getBounds().getSouthWest();

    var params = [
      ne.lat(), ne.lng(), sw.lat(), sw.lng()
    ];

    // setInterval(function() {
      refreshMap(map, params);
    // }, 5000)
  });

  $(".js-checkbox-filter").change(function() {
    var context = $(this).data('context')
    state[context] = $(this).prop('checked')
  })
  $(".js-checkbox-filter").each(function(i, el) {
    el = $(el)
    console.log(el)
    el.prop('checked', state[el.data('context')])
    el.prop('disabled', false)
  })

  $(".js-refresh").click(function(e) {
    e.preventDefault();
    var mapEl = $(".js-map")
    var button = $(this)
    mapEl.css('opacity', '0.5')
    button.css('opacity', '0.4')
    refreshMap(map, [], function() {
      mapEl.css('opacity', '1')
      button.css('opacity', '1')
    })
  })
}

google.maps.event.addDomListener(window, 'load', initApp);
