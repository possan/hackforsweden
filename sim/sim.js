

	

	

	var Particle = function() {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.fx = 0;
		this.fy = 0;
		this.life = 0;
		this.age = 0;
		this.alive = false;
	}

	Particle.prototype.step = function(deltaTime, drag) {
		var dragdelta = drag * deltaTime;
		this.vx += this.fx * dragdelta;
		this.vy += this.fy * dragdelta;
		this.vx *= 1.0 - dragdelta;
		this.vy *= 1.0 - dragdelta;
		this.x += this.vx * dragdelta;
		this.y += this.vy * dragdelta;
		this.age += deltaTime;
		this.life -= deltaTime;
		if (this.life < 0) {
			this.life = 0;
		}
		// if (this.age > 100.0 || this.life < 0.0) {
		// this.alive = false;
		// }
	}

	Particle.prototype.resetForce = function() {
		this.fx = 0;
		this.fy = 0;
	}

	Particle.prototype.addForce = function(wx, wy) {
		this.fx += wx;
		this.fy += wy;
	}

	Particle.prototype.init = function(x, y, vx, vy) {
		this.x = x;
		this.y = y;
		this.fx = 0;
		this.fy = 0;
		this.vx = vx;
		this.vy = vy;
		this.age = 0;
		this.life = 60;
		this.raintot = 0;
		this.alive = true;
	}

	function randrange(a, b) {
		return a + Math.random() * (b - a);
	}

	var Simulation = function() {
		this.particles = [];
		this.nextparticle = 0;
		//this.frameCount = 0;
		this.frameTimespan = 3600000/2;
		this.testpoint = { x: 0, y: 0 };
		this.showVectors = false;
		this.showDepth = false;
		this.showFlow = false;
		this.showDensity = false;
		this.showOverlay = false;
		this.running = false;
		this.rainFlow = 0;
		this.frame = 0;
		this.startTime = new Date();
	}

	var loadPixelData = function(url) {
		var ret = {
			image: null,
			pixels: null
		}
		var img = new Image();
		img.onload = function() {
			// _this.heightmapvalues
			var can = document.createElement('canvas');
			can.width = img.width;
			can.height = img.height;
			var ctx = can.getContext('2d');
			ctx.width = img.width;
			ctx.height = img.height;
			ctx.globalAlpha = 1.0;
			ctx.drawImage(img, 0, 0, img.width, img.height);
			var imagedata = ctx.getImageData(0, 0, img.width, img.height);
			ret.red = new Array(img.width * img.height);
			ret.green = new Array(img.width * img.height);
			ret.blue = new Array(img.width * img.height);
			ret.alpha = new Array(img.width * img.height);
			for(var k=0; k<img.width*img.height; k++) {
				ret.red[k] = imagedata.data[(k * 4) + 0];
				ret.green[k] = imagedata.data[(k * 4) + 1];
				ret.blue[k] = imagedata.data[(k * 4) + 2];
				ret.alpha[k] = imagedata.data[(k * 4) + 3];
			}
			ret.image = img;
		};
		img.src = url;
		return ret;
	}

	Simulation.prototype.clearHistory = function() {
		this.ctx2.globalAlpha = 1.0;
		this.ctx2.clearRect(0, 0, this.width, this.height);
		// this.ctx2.fillStyle = '#f0f';
		// this.ctx2.fillRect(0, 0, this.width, this.height);
		for(var i=0; i<this.particles.length; i++) {
			this.particles[i].alive = false;
		}
		this.frame = 0;
		this.raintot = 0;
		this.zoneCache = [];
		this.zoneCounter = {};
	}

	Simulation.prototype.init = function(opts) {
		var _this = this;
		this.particles = new Array(opts.particles);
		for(var i=0; i<opts.particles; i++) {
			this.particles[i] = new Particle();
		}
		this.nextparticle = 0;
		this.setParentElement = function(prt) {
			this.parentElement = prt;
		};
		this.canvas = opts.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.webkitImageSmoothingEnabled = false;
		this.canvas2 = document.createElement('canvas');
		this.canvas2.width = opts.width;
		this.canvas2.height = opts.height;
		this.ctx2 = this.canvas2.getContext('2d');
		console.log('canvas2', this.canvas2);
		this.ctx2.imageSmoothingEnabled = false;
		this.ctx2.webkitImageSmoothingEnabled = false;
		console.log('ctx2', this.ctx2);
		//	setTimeout(function() {
		//		document.body.appendChild(_this.canvas2);
		//	}, 10000);
		this.width = opts.width;
		this.height = opts.height;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.wind = { x: 0, y: 0 };
		this.dragging = false;
		this.updateMousePosition = function(x,y) {
			_this.testpoint.x = x;
			_this.testpoint.y = y;
			_this.showCloud = (_this.rainFlow>0);
			

		};
		this.emitAtPoint = function(x,y,dist) {
			_this.dragging = true;
			_this.testpoint.x = x;
			_this.testpoint.y = y;
			_this.emit(_this.testpoint.x, _this.testpoint.y, 100, dist||5.0, dist||5.0);
		};

		/*
		this.canvas.addEventListener('mousedown', function(e) {
			console.log(e);
			_this.dragging = true;
			//_this.testpoint.x = e.offsetX * this.width / window.innerWidth;
			//_this.testpoint.y = e.offsetY * this.height / window.innerHeight;
			_this.testpoint.x = e.layerX;
			_this.testpoint.y = e.layerY;
			_this.emit(_this.testpoint.x, _this.testpoint.y, 100, 5.0, 5.0);
		});
		this.canvas.addEventListener('mousemove', function(e) {
			//_this.testpoint.x = e.offsetX * this.width / window.innerWidth;
			//_this.testpoint.y = e.offsetY * this.height / window.innerHeight;
			_this.testpoint.x = e.layerX;
			_this.testpoint.y = e.layerY;
		});
		this.canvas.addEventListener('mouseup', function(e) {
			_this.dragging = false;
		});*/
		this.heightmap = loadPixelData(opts.heightmap);
		this.flowmap = loadPixelData(opts.flowmap);
		this.densitymap = loadPixelData(opts.densitymap);
		this.overlaymap = loadPixelData(opts.overlaymap);
		this.glowmap = loadPixelData(opts.glowmap);
		this.rainmap = loadPixelData(opts.rainmap);
		this.zonemap = loadPixelData(opts.zonemap);
		this.cloudmap = loadPixelData(opts.cloudmap);
		this.time = 0;
		this.running = true;
		this.clearHistory();
		this.zoneCache = [];
		this.zoneCounter = {};
		this.onZone = opts.onZone;
		this.onZoneStats = opts.onZoneStats;
		opts.onLoad(this);
	}

	Simulation.prototype.emit = function(x, y, n, radius, speed, israin) {
		//console.log('emit particles at', x, y, n, radius, israin?'regn':'gift');
		for(var i=0; i<n; i++) {
			var x2 = x + radius * randrange(-1.0, 1.0);
			var y2 = y + radius * randrange(-1.0, 1.0);
			this.particles[this.nextparticle].init(
				x2,
				y2,
				speed * randrange(-1, 1),
				speed * randrange(-1, 1));
			this.particles[this.nextparticle].isRain = israin;
			this.nextparticle ++;
			if (israin)
			{
				this.raintot++;
			}
			this.nextparticle %= this.particles.length;
		}
	}

	Simulation.prototype.getPixelValue = function(arr, x, y) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height)
			return 0;

		if (arr == null)
			return 0;

		var o = Math.round(y) * this.width + Math.round(x);
		var val = arr[o];
		return val;
	}

	function sign(v) {
		return v < 0 ? -1 : 1;
	}

	Simulation.prototype.getSlope = function(x, y) {
		var radii = 3;

		var v0 = this.getPixelValue(this.heightmap.red, x - radii, y);
		var v1 = this.getPixelValue(this.heightmap.red, x + radii, y);
		var v2 = this.getPixelValue(this.heightmap.red, x, y - radii);
		var v3 = this.getPixelValue(this.heightmap.red, x, y + radii);

		var s = {
			x: -(v1-v0),
			y: -(v3-v2)
		};

		var l = s.x*s.x + s.y*s.y;
		if (l > 0) {
			l = Math.sqrt(l);
			s.x /= l;
			s.y /= l;
		}

		return s;
	}

	Simulation.prototype.getFlow = function(x, y) {
		var radii = 5;

		var v0 = this.getPixelValue(this.flowmap.red, x, y);
		var v1 = this.getPixelValue(this.flowmap.green, x, y);

		var s = {
			x: (v0 / 128.0) - 1.0,
			y: (v1 / 128.0) - 1.0
		};

		var l = s.x*s.x + s.y*s.y;
		if (l > 0) {
			l = Math.sqrt(l);
			s.x /= l;
			s.y /= l;
		}

		return s;
	}

	Simulation.prototype.getZone = function(x, y) {
		var v0 = this.getPixelValue(this.zonemap.red, x, y);
		var v1 = this.getPixelValue(this.zonemap.green, x, y);
		var v2 = this.getPixelValue(this.zonemap.blue, x, y);
		var v3 = this.getPixelValue(this.zonemap.alpha, x, y);
		if (v3 < 255)
			return 0;
		return v0 + (v1 * 256) + (v2 * 65536);
	}

	Simulation.prototype.getDensity = function(x, y) {
		var v0 = this.getPixelValue(this.densitymap.red, x, y);
		return v0 / 255.0;
	}

	Simulation.prototype.getHeight = function(x, y) {
		var v0 = this.getPixelValue(this.heightmap.red, x, y);
		return v0 / 255.0;
	}

	Simulation.prototype.highlightZone = function(rgb) {
		//console.log('highlightZone', rgb);
		// var dummy = this.ctx2.getImageData(0, 0, this.width, this.height);
		var dummy = this.ctx2.getImageData(0, 0, this.width, this.height);
		var dummydata = dummy.data;
		// console.log(dummydata);
		var k = 0;
		for(var j=0; j<this.height; j++) {
			for(var i=0; i<this.width; i++) {
				var a = this.zonemap.alpha[k];
				if (a == 255) {
					var r = this.zonemap.red[k];
					var g = this.zonemap.green[k];
					var b = this.zonemap.blue[k];
					var _rgb = r + (g * 256) + (b * 65536);
					// console.log(_rgb);
					if (rgb == _rgb) {

						// mask

						var masked = (i + j) % 6 < 3;
						if (masked ) {
							dummydata[k * 4 + 0] = 255;
							dummydata[k * 4 + 1] = 0;
							dummydata[k * 4 + 2] = 0;
							dummydata[k * 4 + 3] = 255;
						}
					}
				}
				k ++;
			}
		}
		this.ctx2.putImageData(dummy, 0, 0);
	}

	Simulation.prototype.step = function(deltaTime) {
		var _this = this;
		// console.log('sim::step', this.wind);
		//this.frameCount++;
		this.time += deltaTime;
		this.zoneCounter = {};
		this.simulatedTime = new Date(this.startTime.getTime()+(this.frame*this.frameTimespan));
		var nalive = 0;
		var nzone = 0;
		this.particles.forEach(function(p) {
			if (!p.alive)
				return;

			nalive ++;

			var d = _this.getDensity(p.x, p.y);
			var s = _this.getSlope(p.x, p.y);
			var f = _this.getFlow(p.x, p.y);
			if (!p.isRain) {
				var z = _this.getZone(p.x, p.y);
				p.zone = z;
				if (z != 0) {
					nzone ++;
					if (typeof(_this.zoneCounter[z]) == 'undefined') {
						_this.zoneCounter[z] = 0;
					}
					_this.zoneCounter[z] ++;
				}
				if (z != 0 && _this.zoneCache.indexOf(z) == -1) {
					_this.zoneCache.push(z);
					_this.highlightZone(z);
					_this.onZone(z, _this.zoneCounter);
				}
			}
			p.resetForce();
			p.addForce(s.x * 10.0, s.y * 10.0);
			p.addForce(f.x, f.y);
			p.step(deltaTime, 1.0 - d);

		});
		// if (_this.zoneCounter.length > 0) {
			if (_this.onZoneStats)
				_this.onZoneStats(_this.zoneCounter, nalive, nzone);
		// }
		for(var i=0; i<this.rainFlow; i++) {
			var rx = (Math.random() * 100)-50;
			var ry = (Math.random() * 100)-50;

			this.emit(this.testpoint.x+rx, this.testpoint.y+ry, 1, 2.0, 2.0,true);
		}
		if (_this.dragging) {
			// _this.emit(this.testpoint.x, this.testpoint.y, 1, 1.0, 0.0);
		}
	}

	Simulation.prototype.draw = function() {
		var _this = this;

		this.frame ++;

		this.ctx.fillStyle = '#111';
		this.ctx.clearRect(0, 0, this.width, this.height);

		var leavetrace = (this.frame % 100) == 0;

		if (this.overlaymap.image && this.showOverlay) {
			this.ctx.globalAlpha = 1.0;
			this.ctx.drawImage(this.overlaymap.image, 0, 0, this.width, this.height);
		}

		if (this.flowmap.image && this.showFlow) {
			this.ctx.globalAlpha = 0.5;
			this.ctx.drawImage(this.flowmap.image, 0, 0, this.width, this.height);
		}

		if (this.heightmap.image && this.showDepth) {
			this.ctx.globalAlpha = 0.5;
			this.ctx.drawImage(this.heightmap.image, 0, 0, this.width, this.height);
		}

		if (this.densitymap.image && this.showDensity) {
			this.ctx.globalAlpha = 0.5;
			this.ctx.drawImage(this.densitymap.image, 0, 0, this.width, this.height);
		}

		

		this.ctx.globalAlpha = 1.0;
		this.ctx.drawImage(this.canvas2, 0, 0);

		this.ctx.globalAlpha = 1.0;
		this.ctx2.globalAlpha = 1.0;

		// draw backgrounds
		// draw particles
		this.particles.forEach(function(p) {
			if (!p.alive)
				return;

			if (_this.showVectors) {
				_this.ctx.beginPath();
				_this.ctx.moveTo(p.x, p.y);
				_this.ctx.lineTo(p.x + p.vx * 1.0, p.y + p.vy * 1.0);
	     		_this.ctx.lineWidth = 0.33;
	     		_this.ctx.strokeStyle = 'cyan';
	     		_this.ctx.stroke();
     		}

			_this.ctx.beginPath();
			_this.ctx.arc(p.x, p.y, p.life/20.0, 0, 2*Math.PI);
     		_this.ctx.lineWidth = 1.0;
     		_this.ctx.strokeStyle = p.isRain?'blue':'white';
     		_this.ctx.fillStyle = p.isRain?'blue':'white';
     		_this.ctx.fill();

    		_this.ctx2.globalAlpha = 0.1;
    		var imgdata = p.isRain?_this.rainmap:_this.glowmap;
			_this.ctx2.drawImage(imgdata.image, p.x-10, p.y-10, 20, 20);
		});

		if (this.cloudmap.image && this.showCloud)
		{
			this.ctx.globalAlpha = 1;
			this.ctx.drawImage(this.cloudmap.image, this.testpoint.x-140, this.testpoint.y-140);	
		}

		if (this.showVectors) {
			this.ctx.beginPath();
			this.ctx.arc(this.testpoint.x, this.testpoint.y, 50, 0, 2*Math.PI);
	 		this.ctx.lineWidth = 1;
	 		this.ctx.strokeStyle = 'white';
	 		this.ctx.stroke();

			this.ctx.beginPath();
			var s = this.getSlope(this.testpoint.x, this.testpoint.y);
			this.ctx.moveTo(this.testpoint.x, this.testpoint.y);
	 		this.ctx.lineTo(this.testpoint.x + s.x * 50, this.testpoint.y + s.y * 50);
	 		this.ctx.lineWidth = 1;
	 		this.ctx.strokeStyle = 'yellow';
	 		this.ctx.stroke();

			this.ctx.beginPath();
			var f = this.getFlow(this.testpoint.x, this.testpoint.y);
			this.ctx.moveTo(this.testpoint.x, this.testpoint.y);
	 		this.ctx.lineTo(this.testpoint.x + f.x * 50, this.testpoint.y + f.y * 50);
	 		this.ctx.lineWidth = 1;
	 		this.ctx.strokeStyle = 'red';
	 		this.ctx.stroke();
	 	}


	}

	

	
		
	

