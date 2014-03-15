(function() {

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
		if (this.age > 100.0 || this.life < 0.0) {
			this.alive = false;
		}
	}

	Particle.prototype.resetForce = function() {
		this.fx = 0;
		this.fy = 0;
	}

	// Particle.prototype.addDrag = function(drag) {
	// var drag = 0.6 - 0.3 * density;
	// this.vx *= (1.0 - drag * deltaTime);
	// this.vy *= (1.0 - drag * deltaTime);
	// }

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
		this.alive = true;
	}

	function randrange(a, b) {
		return a + Math.random() * (b - a);
	}

	var Simulation = function() {
		this.particles = [];
		this.nextparticle = 0;
		this.testpoint = { x: 0, y: 0 };
		this.showVectors = false;
		this.showDepth = false;
		this.showFlow = false;
		this.showDensity = false;
		this.showOverlay = true;
		this.running = false;
		this.rainFlow = 0;
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
			console.log('context', ctx);
			var imagedata = ctx.getImageData(0, 0, img.width, img.height);
			ret.red = new Array(img.width * img.height);
			ret.green = new Array(img.width * img.height);
			for(var k=0; k<img.width*img.height; k++) {
				ret.red[k] = imagedata.data[(k * 4)];
				ret.green[k] = imagedata.data[(k * 4) + 1];
			}
			ret.image = img;
		};
		img.src = url;
		return ret;
	}

	Simulation.prototype.init = function(opts) {
		var _this = this;
		this.particles = new Array(opts.particles);
		for(var i=0; i<opts.particles; i++) {
			this.particles[i] = new Particle();
		}
		this.nextparticle = 0;
		this.canvas = opts.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.webkitImageSmoothingEnabled = false;
		this.width = opts.width;
		this.height = opts.height;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.wind = { x: 0, y: 0 };
		this.dragging = false;
		this.canvas.addEventListener('mousedown', function(e) {
			_this.dragging = true;
			_this.testpoint.x = e.offsetX * this.width / window.innerWidth;
			_this.testpoint.y = e.offsetY * this.height / window.innerHeight;
		});
		this.canvas.addEventListener('mousemove', function(e) {
			_this.testpoint.x = e.offsetX * this.width / window.innerWidth;
			_this.testpoint.y = e.offsetY * this.height / window.innerHeight;
		});
		this.canvas.addEventListener('mouseup', function(e) {
			_this.dragging = false;
		});
		this.heightmap = loadPixelData(opts.heightmap);
		this.flowmap = loadPixelData(opts.flowmap);
		this.densitymap = loadPixelData(opts.densitymap);
		this.overlaymap = loadPixelData(opts.overlaymap);
		this.time = 0;
		this.running = true;
		opts.onLoad(this);
	}

	Simulation.prototype.emit = function(x, y, n, radius, speed) {
		// console.log('emit particles at', x, y, n, radius);
		for(var i=0; i<n; i++) {
			var x2 = x;
			var y2 = y;
			this.particles[this.nextparticle].init(
				x2,
				y2,
				randrange(-1.0, 1.0) * (speed || 1.0),
				randrange(-1.0, 1.0) * (speed || 1.0));
			this.nextparticle ++;
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

	Simulation.prototype.getSlope = function(x, y) {
		var radii = 5;

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

	Simulation.prototype.getDensity = function(x, y) {
		var v0 = this.getPixelValue(this.densitymap.red, x, y);
		return v0 / 255.0;
	}

	Simulation.prototype.step = function(deltaTime) {
		var _this = this;
		// console.log('sim::step', this.wind);
		this.time += deltaTime;
		this.particles.forEach(function(p) {
			if (!p.alive)
				return;
			var d = _this.getDensity(p.x, p.y);
			var s = _this.getSlope(p.x, p.y);
			// p.addForce(s.x * 10.0, s.y * 10.0, deltaTime);
			var f = _this.getFlow(p.x, p.y);
			// p.addForce(f.x * 10.0, f.y * 10.0, deltaTime);
			p.resetForce();
			p.addForce(p.vx, p.vy);
			p.addForce(s.x, s.y);
			p.addForce(f.x, f.y);
			p.addForce(_this.wind.x, _this.wind.y);
			// console.log('d', d);
			// p.addDrag(0.1);
			p.step(deltaTime, 1.0 - d);
		});
		for(var i=0; i<this.rainFlow; i++) {
			var rx = Math.random() * sim.width;
			var ry = Math.random() * sim.height;
			sim.emit(rx, ry, 1, 1.0, 1.0);
		}
		if (_this.dragging) {
			_this.emit(this.testpoint.x, this.testpoint.y, 15, 30.0, 15.0);
		}
	}

	Simulation.prototype.draw = function() {
		var _this = this;

		this.ctx.fillStyle = '#111';
		this.ctx.fillRect(0, 0, this.width, this.height);

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
     		_this.ctx.strokeStyle = 'white';
     		_this.ctx.stroke();
		});

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

	var sim = new Simulation();

	var ui_running = true;

	var renderFrame = function() {
		// console.log('render frame');
		sim.draw();
		requestAnimationFrame(renderFrame);
	};

	var simulation_speed = 20;

	var tick = function() {
		if (ui_running) {
			sim.step(1.0 / simulation_speed);
		}
	}

	setInterval(tick, simulation_speed);

	window.addEventListener('load', function() {
		sim.init({
			particles: 100000,
			width: 1024,
			height: 768,
			canvas: document.getElementById('c'),
			heightmap: 'height.png',
			flowmap: 'flow.png',
			densitymap: 'density.png',
			overlaymap: 'overlay.png',
			onLoad: function() {
				renderFrame();
			}
		});
		document.getElementById('toggleplay').addEventListener('click', function(e) {
			ui_running = !ui_running;
		});
		document.getElementById('togglevectors').addEventListener('click', function(e) {
			sim.showVectors = !sim.showVectors;
		});
		document.getElementById('toggledepth').addEventListener('click', function(e) {
			sim.showDepth = !sim.showDepth;
		});
		document.getElementById('toggledensity').addEventListener('click', function(e) {
			sim.showDensity = !sim.showDensity;
		});
		document.getElementById('toggleflow').addEventListener('click', function(e) {
			sim.showFlow = !sim.showFlow;
		});
		document.getElementById('toggleoverlay').addEventListener('click', function(e) {
			sim.showOverlay = !sim.showOverlay;
		});
		document.getElementById('wind_x').addEventListener('change', function(e) {
			sim.wind.x = document.getElementById('wind_x').value / 10.0;
		});
		document.getElementById('wind_y').addEventListener('change', function(e) {
			sim.wind.y = document.getElementById('wind_y').value / 10.0;
		});
		document.getElementById('rain').addEventListener('change', function(e) {
			sim.rainFlow = document.getElementById('rain').value;
		});
		document.addEventListener('keydown', function(e) {
			if (e.keyCode == 32) {
				document.getElementById('controls').style.display = 'block';
			}
			if (e.keyCode == 27) {
				if (document.getElementById('controls').style.display == 'none') {
					document.getElementById('controls').style.display = 'block';
				} else {
					document.getElementById('controls').style.display = 'none';
				}
			}
		});
	});

})();