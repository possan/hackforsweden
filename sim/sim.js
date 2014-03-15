(function() {

	var Particle = function() {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.life = 0;
		this.age = 0;
		this.alive = false;
	}

	Particle.prototype.step = function(deltaTime) {
		this.x += this.vx * deltaTime;
		this.y += this.vy * deltaTime;
		this.vx *= (1.0 - 0.25 * deltaTime);
		this.vy *= (1.0 - 0.25 * deltaTime);
		this.age += deltaTime;
		if (this.age > 100.0) {
			this.alive = false;
		}
	}

	Particle.prototype.addForce = function(wx, wy, deltaTime) {
		this.vx += wx * deltaTime;
		this.vy += wy * deltaTime;
	}

	Particle.prototype.init = function(x, y, vx, vy) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.age = 0;
		this.alive = true;
	}

	function randrange(a, b) {
		return a + Math.random() * (b - a);
	}

	var Simulation = function() {
		this.particles = [];
		this.nextparticle = 0;
		this.testpoint = { x: 0, y: 0 };
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
			document.body.appendChild(can);
			var ctx = can.getContext('2d');
			ctx.width = img.width;
			ctx.height = img.height;
			ctx.globalAlpha = 1.0;
			ctx.drawImage(img, 0, 0, img.width, img.height);
			console.log('context', ctx);
			var imagedata = ctx.getImageData(0, 0, img.width, img.height);
			ret.pixels = new Array(img.width * img.height);
			for(var k=0; k<img.width*img.height; k++) {
				ret.pixels[k] = imagedata.data[(k * 4)];
				// if (k % 1000 == 0) {
				//	console.log(k, ret.pixels[k]);
				// }
			}
			ret.image = img;
			// console.log('ret', ret);
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
		this.width = opts.width;
		this.height = opts.height;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.wind = { x: 0, y: 0 };
		this.canvas.addEventListener('mousedown', function(e) {
			_this.emit(e.x, e.y, 50, 10.0, 30.0);
		});
		this.canvas.addEventListener('mousemove', function(e) {
			// _this.emit(e.x, e.y, 50, 10.0, 30.0);
			_this.testpoint.x = e.x;
			_this.testpoint.y = e.y;
		});
		this.heightmap = loadPixelData(opts.heightmap);
		this.time = 0;

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

	Simulation.prototype.getPixelValue = function(map, x, y) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height)
			return 0;

		if (map.pixels == null)
			return 0;

		var o = Math.round(y) * this.width + Math.round(x);
		var val = map.pixels[o];
		return val;
	}

	Simulation.prototype.getSlope = function(x, y) {
		var radii = 25;
		var v0 = this.getPixelValue(this.heightmap, x - radii, y);
		var v1 = this.getPixelValue(this.heightmap, x + radii, y);
		var v2 = this.getPixelValue(this.heightmap, x, y - radii);
		var v3 = this.getPixelValue(this.heightmap, x, y + radii);
		// var v0 = this.getPixelValue(this.heightmap, x - 3, y);

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

	Simulation.prototype.step = function(deltaTime) {
		var _this = this;
		// console.log('sim::step', this.wind);
		this.time += deltaTime;
		this.particles.forEach(function(p) {
			var s = _this.getSlope(p.x, p.y);
			p.addForce(s.x * 10.0, s.y * 10.0, deltaTime);
			p.addForce(_this.wind.x, _this.wind.y, deltaTime);
			p.step(deltaTime);
		});

		var t = this.getPixelValue(this.heightmap, this.testpoint.x, this.testpoint.y);
		// console.log('t='+t);
	}

	Simulation.prototype.draw = function() {
		var _this = this;

		this.ctx.fillStyle = '#111';
		this.ctx.fillRect(0, 0, this.width, this.height);

		if (this.heightmap.image) {
			this.ctx.globalAlpha = 0.5;
			this.ctx.drawImage(this.heightmap.image, 0, 0);
		}

		this.ctx.globalAlpha = 1.0;

		// draw backgrounds
		// draw particles
		this.particles.forEach(function(p) {
			if (!p.alive)
				return;

			_this.ctx.beginPath();
			_this.ctx.moveTo(p.x, p.y);
			_this.ctx.lineTo(p.x + p.vx * 2.0, p.y + p.vy * 2.0);
     		_this.ctx.lineWidth = 1;
     		_this.ctx.strokeStyle = 'green';
     		_this.ctx.stroke();

			_this.ctx.beginPath();
			_this.ctx.moveTo(p.x-3, p.y);
     		_this.ctx.lineTo(p.x+3, p.y);
			_this.ctx.moveTo(p.x, p.y-3);
     		_this.ctx.lineTo(p.x, p.y+3);
     		_this.ctx.lineWidth = 1;
     		_this.ctx.strokeStyle = 'white';
     		_this.ctx.stroke();
		});

		this.ctx.beginPath();
		this.ctx.moveTo(this.testpoint.x - 50, this.testpoint.y);
 		this.ctx.lineTo(this.testpoint.x + 50, this.testpoint.y);
		this.ctx.moveTo(this.testpoint.x, this.testpoint.y - 50);
 		this.ctx.lineTo(this.testpoint.x, this.testpoint.y + 50);
		this.ctx.moveTo(this.testpoint.x, this.testpoint.y);
		var s = this.getSlope(this.testpoint.x, this.testpoint.y);
//		console.log(s);
 		this.ctx.lineTo(this.testpoint.x + s.x * 50, this.testpoint.y + s.y * 50);
 		this.ctx.lineWidth = 1;
 		this.ctx.strokeStyle = 'yellow';
 		this.ctx.stroke();


	}

	var sim = new Simulation();

	var ui_raining = true;
	var ui_running = true;

	var renderFrame = function() {
		// console.log('render frame');
		if (ui_raining) {
			var rx = Math.random() * sim.width;
			var ry = Math.random() * sim.height;
			sim.emit(rx, ry, 1, 1.0, 10.0);
		}
		sim.draw();
		if (ui_running) {
			sim.step(1.0 / 60.0);
		}
		requestAnimationFrame(renderFrame);
	};

	window.addEventListener('load', function() {
		sim.init({
			particles: 100000,
			width: 1024,
			height: 768,
			canvas: document.getElementById('c'),
			heightmap: 'height.png',
			friction: 'friction.png',
			flow: 'flow.png',
			onLoad: function() {
				renderFrame();
			}
		});
		document.getElementById('togglerain').addEventListener('click', function(e) {
			ui_raining = !ui_raining;
		})
		document.getElementById('toggleplay').addEventListener('click', function(e) {
			ui_running = !ui_running;
		})
		document.getElementById('wind_x').addEventListener('change', function(e) {
			sim.wind.x = document.getElementById('wind_x').value / 10.0;
		});
		document.getElementById('wind_y').addEventListener('change', function(e) {
			sim.wind.y = document.getElementById('wind_y').value / 10.0;
		});
	});

})();