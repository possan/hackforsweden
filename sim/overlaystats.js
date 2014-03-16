StatsOverlay.prototype = new google.maps.OverlayView();

/** @constructor */
function StatsOverlay(bn, marker,data,key, map,sim) {
  var elm = document.createElement('div');
  this.key_ = key;
  this.data_ = data;
  // Initialize all properties.
  this.marker_ = marker;
  this.bounds_ = bn;
  this.myb = bn;
  this._elm = elm;
  this.map_ = map;
  this._sim = sim;
  elm.style.display = 'none';
  this.div_ = null;
  this.setMap(map);
}

/**
* onAdd is called when the map's panes are ready and the overlay has been
* added to the map.
*/
StatsOverlay.prototype.onAdd = function() {
  // Add the element to the "overlayLayer" pane.
  var panes = this.getPanes();

  //var overlayProjection = this.getProjection();
  var t = this;
  var elm = this._elm;
  var data = this.data_;

  elm.className ='statsoverlay';
  var lastData = {};

  var dataelm = document.createElement('div');
  dataelm.className ='statsdata';
  dataelm.innerHTML = '<p>'+data.t+'</p><p class="depth">'+data.d+'m</p>';
  elm.appendChild(dataelm);

  var dataelm2 = document.createElement('div');
  dataelm2.className ='statsdata';
  dataelm2.innerHTML = '';
  elm.appendChild(dataelm2);

  panes.overlayLayer.style['zIndex'] = 1001;
  google.maps.event.addListener(this.marker_, 'mouseover', function(e) {
    //console.log('klick på marker');
    elm.style.display ='block';
  });
  google.maps.event.addListener(this.marker_, 'mouseout', function(e) {
    //console.log('leave på marker');
    elm.style.display = 'none';
  });
  var hitcount = 1;
  ZoneListeners.push(function(d,alive,inzone) {
    //console.log(data,arguments);
    var mydata = d[t.key_];
    if (hitcount<mydata)
    hitcount= mydata;
    if (mydata) {
      var bdata = brunnLookup['i'+t.key_];
      var risk = 1;
      if (bdata)
      risk=bdata.risk;
      dataelm2.innerHTML = '<p>hits:'+(hitcount)+'/'+alive+', risk:'+(mydata*risk)+'/'+(hitcount*risk)+'</p>';
      //console.log(t.key_,mydata,alive,inzone);
    }
  });
  //console.log(this._elm);
  panes.overlayLayer.appendChild(elm);
};

StatsOverlay.prototype.draw = function() {
  // We use the south-west and north-east
  // coordinates of the overlay to peg it to the correct position and size.
  // To do this, we need to retrieve the projection from the overlay.
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_);
  //var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  // Resize the image's div to fit the indicated dimensions.
  var div = this._elm;
  div.style.left = sw.x + 'px';
  div.style.top = sw.y + 'px';
  //div.style.width = (ne.x - sw.x) + 'px';
  //div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
StatsOverlay.prototype.onRemove = function() {
  this._elm.parentNode.removeChild(this._elm);
  this._elm = null;
};