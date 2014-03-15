(function() {

	var Particle = function() {
		this.x = 0;
		this.y = 0;
		// this.fx = 0;
		// this.fy = 0;
		this.vx = 0;
		this.vy = 0;
		this.life = 0;
		this.age = 0;
		this.alive = false;
	}

	Particle.prototype.step = function(deltaTime) {
		this.x += this.vx * deltaTime;
		this.y += this.vy * deltaTime;
		this.age += deltaTime;
	}

	Particle.prototype.init = function(x, y, vx, vy) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		// this.fx = 0;
		// this.fy = 0;
		this.age = 0;
	}

	function randrange(a, b) {
		return a + Math.random() * (b - a);
	}

	var Simulation = function() {
		this.particles = [];
		this.nextparticle = 0;
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
		this.canvas.addEventListener('mousedown', function(e) {
			_this.emit(e.x, e.y, 50, 10.0, 10.0);
		});
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

	Simulation.prototype.step = function(deltaTime) {
		this.time += deltaTime;
		this.particles.forEach(function(p) {
			p.step(deltaTime);
		});
	}

	Simulation.prototype.draw = function() {
		var _this = this;

		this.ctx.fillStyle = '#111';
		this.ctx.fillRect(0, 0, this.width, this.height);

		// draw backgrounds
		// draw particles
		this.particles.forEach(function(p) {
			_this.ctx.beginPath();
			_this.ctx.moveTo(p.x, p.y);
			_this.ctx.lineTo(p.x + p.vx * 2.0, p.y + p.vy * 2.0);
     		_this.ctx.lineWidth = 1;
     		_this.ctx.strokeStyle = 'green';
     		_this.ctx.stroke();

			_this.ctx.beginPath();
			_this.ctx.moveTo(p.x, p.y);
     		_this.ctx.lineTo(p.x+1, p.y);
     		_this.ctx.lineWidth = 2;
     		_this.ctx.strokeStyle = 'white';
     		_this.ctx.stroke();
			// p.draw(_this.ctx);
		});
	}

	var sim = new Simulation();

	var ui_raining = true;
	var ui_running = false;

	var renderFrame = function() {
		// console.log('render frame');
		if (ui_raining) {
			var rx = Math.random() * sim.width;
			var ry = Math.random() * sim.height;
			sim.emit(rx, ry, 1, 2.0, 10.0);
		}
		sim.draw();
		sim.step(1.0 / 60.0);
		requestAnimationFrame(renderFrame);
	};

	window.addEventListener('load', function() {
		sim.init({
			particles: 10000,
			width: 1024,
			height: 768,
			canvas: document.getElementById('c'),
			depth: 'depth.png',
			friction: 'friction.png',
			flow: 'flow.png',
			onLoad: function() {
				renderFrame();
			}
		});
	});

})();