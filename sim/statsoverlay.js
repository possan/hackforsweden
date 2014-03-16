StatsOverlay.prototype = new google.maps.OverlayView();

// Initialize the map and the custom overlay.



/** @constructor */
function StatsOverlay(bn, marker,data, map,sim) {

  var elm = document.createElement('div');
  elm.className ='statsoverlay';
  var closeElm = document.createElement('div');
  closeElm.className = 'close';
  closeElm.addEventListener('click',function() {
    elm.style.display = 'none';
  },false);
  elm.appendChild(closeElm);

  var dataelm = document.createElement('div');
  dataelm.className ='statsdata'
  dataelm.innerHTML = '<p>'+data.t+'</p><p class="depth">'+data.d+'m</p>';
  elm.appendChild(dataelm);

  this.data_ = data;
  // Initialize all properties.
  this.marker_ = marker;
  this.bounds_ = bn;
  this.myb = bn;
  this._elm = elm;
  this.map_ = map;
 
  this._sim = sim;
  elm.style.display = 'none';
  // Define a property to hold the image's div. We'll
  // actually create this div upon receipt of the onAdd()
  // method so we'll leave it null for now.
  this.div_ = null;

  // Explicitly call setMap on this overlay.
  this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
StatsOverlay.prototype.onAdd = function() {

	
	  
  //this._sim.setParentElement(this._elm);
	 

  // Add the element to the "overlayLayer" pane.
  var panes = this.getPanes();

  //var overlayProjection = this.getProjection();
  var t = this;

  google.maps.event.addListener(this.marker_, 'click', function(e) {
        t._elm.style.display = 'block';
    });
  //console.log(this._elm);
  panes.overlayLayer.appendChild(this._elm);
};

StatsOverlay.prototype.draw = function() {

  // We use the south-west and north-east
  // coordinates of the overlay to peg it to the correct position and size.
  // To do this, we need to retrieve the projection from the overlay.
  var overlayProjection = this.getProjection();

 



 var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
 //var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  // Resize the image's div to fit the indicated dimensions.
  var div = this._elm;
  div.style.left = sw.x + 'px';
  div.style.bottom = sw.y + 'px';
  //div.style.width = (ne.x - sw.x) + 'px';
  //div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
StatsOverlay.prototype.onRemove = function() {
  this._elm.parentNode.removeChild(this._elm);
  this._elm = null;
};