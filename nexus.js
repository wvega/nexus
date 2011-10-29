function shuffle(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
}


Nexus = function() {};

Nexus.prototype = {
	init: function() {
		this.canvas = document.getElementById('nexus');
		this.body = document.getElementsByTagName('body')[0];
		this.riders = [];
	
		this.width = Math.floor(window.innerWidth);
		this.height = Math.floor(window.innerHeight * 0.994);

		this.prepare();
		this.start();
	},

	_createBackgroundPattern: function() {
		var width = 10, height = 10, context = this.canvas.getContext('2d');

		this.canvas.setAttribute('width', width);
		this.canvas.setAttribute('height', height);

		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(width, 0);
		context.lineTo(width/2, width/2);
		context.closePath();
		context.fillStyle = '#808080';
		context.strokeStyle = '#808080';
		context.stroke();
		context.fill();

		context.beginPath();
		context.moveTo(width, 0);
		context.lineTo(width, width);
		context.lineTo(width/2, width/2);
		context.closePath();
		context.fillStyle = '#232323';
		context.fill();

		context.beginPath();
		context.moveTo(width, width);
		context.lineTo(0, width);
		context.lineTo(width/2, width/2);
		context.closePath();
		context.fillStyle = '#151515';
		context.strokeStyle = '#151515';
		context.fill();
		context.stroke();

		context.beginPath();
		context.moveTo(0, width);
		context.lineTo(0, 0);
		context.lineTo(width/2, width/2);
		context.closePath();
		context.fillStyle = '#393939';
		context.fill();

		return context.createPattern(this.canvas, 'repeat');
	},

	prepare: function() {
		var self = this, indexes = [0,1,2,3],
			pattern = this._createBackgroundPattern(), 
			w = this.width, h = this.height;

		this.canvas.setAttribute('width', w);
		this.canvas.setAttribute('height', h);

		var container = this.container = new CanvasLayers.Container(this.canvas, true);
		container.onRender = function(layer, rect, context) {
			context.fillStyle = pattern;
			context.fillRect(0, 0, w, h);
		}

		var overlay = new CanvasLayers.Layer(0, 0, w, h);
		container.getChildren().add(overlay);
		overlay.onRender = function(layer, rect, context) {
			var r = w / 8, R = w;
			var gradient = context.createRadialGradient(r, 0, w / 4, r, 0, w);
			gradient.addColorStop(0, 'rgba(0,0,0,0)');
			gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
			context.fillStyle = gradient;
			context.fillRect(0, 0, w, h);
		};

		this.canvas.addEventListener('mousedown', function(event) {
			var x = event.clientX - self.canvas.offsetLeft + window.pageXOffset,
				y = event.clientY - self.canvas.offsetTop + window.pageYOffset;

			x = x - (x % 10);
			y = y - (y % 10);

			indexes = shuffle(indexes);
			self.riders.push(new Nexus.Rider(self.container, x, y, 'N', Nexus.Color.google(indexes[0])));
			self.riders.push(new Nexus.Rider(self.container, x, y, 'E', Nexus.Color.google(indexes[1])));
			self.riders.push(new Nexus.Rider(self.container, x, y, 'S', Nexus.Color.google(indexes[2])));
			self.riders.push(new Nexus.Rider(self.container, x, y, 'W', Nexus.Color.google(indexes[3])));
		}, false);

		container.setPermeable(true);
	},
	
	start: function() {
		var self = this, i, indexes = [0,1,2,3];
		setInterval(function() {
			if (self.riders.length < 1 && Math.random() > 0.95) {
				// TODO: place Riders at random position in the edges of the 
				// screen, made them move in different directions and use 
				// different colors
			}
			for (i = self.riders.length - 1; i >= 0; i--) {
				if (self.riders[i].destroy) {
					self.riders.slice(i,1);
				} else {
					self.riders[i].update();
				}
			}
			console.log(self.riders.length);
			self.container.redraw();
		}, 25);
	}
};



Nexus.Color = function(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a === undefined ? 1.0 : a;
}


Nexus.Color.prototype = {
	rgba: function(alpha) {
		alpha = alpha === undefined ? this.a : alpha;
		return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + alpha + ')';
	}
}

Nexus.Color.random = (function(){
	var pattern = /#(.{1,2})(.{1,2})(.{1,2})/;
	return function() {
		var hex = '#' + (~~(Math.random() * 16777215)).toString(16),
			matches = pattern.exec(hex), r, g, b;

		// TODO: testing
		if (!matches) {
			console.log(hex, matches);
		}

		r = parseInt(matches[1], 16);
		g = parseInt(matches[2], 16);
		b = parseInt(matches[3], 16);
		return new Nexus.Color(r, g, b, 1.0);
	};
})();

Nexus.Color.google = (function(){
	var colors = [
		new Nexus.Color(255, 243, 0), // yellow
		new Nexus.Color(255, 0, 36),  // red
		new Nexus.Color(0, 135, 255), // blue
		new Nexus.Color(37, 219, 15), // green
	];

	return function(index) {
		index = index === undefined ? Math.max(Math.round(Math.random() * colors.length - 1), 0) : index;
		return colors[index];
	}
})();



Nexus.Rider = function(container, x, y, orientation, color) {
	var self = this, shadow = 10 // thickness of the shadow;

	this.container = container;
	this.orientation = orientation;
	this.color = color;

	// set Layer's size an initial position based on the direction of movement
	if (orientation == Nexus.Rider.Orientation.NORTH) {
		this.width = this.thickness; 
		this.height = this.length;
		this.x = x - shadow;
		this.y = y - shadow;
	} else if (orientation == Nexus.Rider.Orientation.SOUTH) {
		this.width = this.thickness; 
		this.height = this.length;
		this.x = x - shadow;
		this.y = y - this.height + (shadow * 2);
	} else if (orientation == Nexus.Rider.Orientation.EAST) {
		this.width = this.length; 
		this.height = this.thickness;
		this.x = x - this.width + (shadow * 2);
		this.y = y - shadow;
	} else if (orientation == Nexus.Rider.Orientation.WEST){
		this.width = this.length; 
		this.height = this.thickness;
		this.x = x - shadow;
		this.y = y - shadow;
	}
	
	this.layer = new CanvasLayers.Layer(this.x, this.y, this.width, this.height);
	container.getChildren().add(this.layer);

	this.layer.onRender = function(layer, rect, context) {
		self.onRender(layer, rect, context);
	};
	
	//console.log('Raider created', this.orientation, this.x, this.y, this.width, this.height);
};

Nexus.Rider.prototype = {
	length: 600,
	thickness: 30,

	onRender: function(layer, rect, context) {
		var color = this.color, gradient;

		if (this.orientation == Nexus.Rider.Orientation.NORTH) {			
			gradient = context.createLinearGradient(10, 0, 20, 590);
			gradient.addColorStop(0, color.rgba(0.6));
			gradient.addColorStop(1, color.rgba(0.0));

			context.fillStyle = gradient;
			context.fillRect(10, 10, 10, 590);
			context.fillStyle = color.rgba(0.6);
			context.fillRect(10, 10, 10, 10);
		
			gradient = context.createRadialGradient(15, 15, 0, 15, 15, 18);
			gradient.addColorStop(0, color.rgba(1));
			gradient.addColorStop(1, color.rgba(0));
			context.fillStyle = gradient;
			context.fillRect(0, 0, 30, 30);
		} else if (this.orientation == Nexus.Rider.Orientation.WEST) {
			gradient = context.createLinearGradient(0, 10, 590, 20);
			gradient.addColorStop(0, color.rgba(0.6));
			gradient.addColorStop(1, color.rgba(0.0));

			context.fillStyle = gradient;
			context.fillRect(20, 10, 590, 10);
			context.fillStyle = color.rgba(0.6);
			context.fillRect(10, 10, 10, 10);
		
			gradient = context.createRadialGradient(15, 15, 0, 15, 15, 18);
			gradient.addColorStop(0, color.rgba(1));
			gradient.addColorStop(1, color.rgba(0));
			context.fillStyle = gradient;
			context.fillRect(0, 0, 30, 30);
		} else if (this.orientation == Nexus.Rider.Orientation.SOUTH) {
			gradient = context.createLinearGradient(10, 0, 20, 590);
			gradient.addColorStop(0, color.rgba(0.0));
			gradient.addColorStop(1, color.rgba(0.6));

			context.fillStyle = gradient;
			context.fillRect(10, 0, 10, 590);
			context.fillStyle = color.rgba(0.6);
			context.fillRect(10, 580, 10, 10);
		
			gradient = context.createRadialGradient(15, 585, 0, 15, 585, 18);
			gradient.addColorStop(0, color.rgba(1));
			gradient.addColorStop(1, color.rgba(0));
			context.fillStyle = gradient;
			context.fillRect(0, 570, 30, 30);
		} else {
			gradient = context.createLinearGradient(0, 10, 590, 20);
			gradient.addColorStop(0, color.rgba(0.0));
			gradient.addColorStop(1, color.rgba(0.6));

			context.fillStyle = gradient;
			context.fillRect(0, 10, 590, 10);
			context.fillStyle = color.rgba(0.6);
			context.fillRect(580, 10, 10, 10);
		
			gradient = context.createRadialGradient(585, 15, 0, 585, 15, 18);
			gradient.addColorStop(0, color.rgba(1));
			gradient.addColorStop(1, color.rgba(0));
			context.fillStyle = gradient;
			context.fillRect(570, 0, 30, 30);
		}
	},

	update: function() {
		var velocity = 5, x, y;
		if (this.orientation == Nexus.Rider.Orientation.NORTH) {
			x = this.layer.getRelativeX();
			y = this.layer.getRelativeY() - velocity;
		} else if (this.orientation == Nexus.Rider.Orientation.SOUTH) {
			x = this.layer.getRelativeX();
			y = this.layer.getRelativeY() + velocity;
		} else if (this.orientation == Nexus.Rider.Orientation.EAST) {
			x = this.layer.getRelativeX() + velocity;
			y = this.layer.getRelativeY();
		} else if (this.orientation == Nexus.Rider.Orientation.WEST){
			x = this.layer.getRelativeX() - velocity;
			y = this.layer.getRelativeY();
		}

		this.layer.moveTo(x, y);

		/*if (this.layer.getRelativeX() > this.container.width() || 
			this.layer.getRelativeX() + this.width < 0 ||
			this.layer.getRelativeY() > this.container.height() ||
			this.layer.getRelativeY() + this.height < 0) {
			this.destroy = true;
		}*/
	}
};

Nexus.Rider.Orientation = {
	NORTH: 'N',
	EAST: 'E',
	SOUTH: 'S',
	WEST: 'W'
};

(new Nexus()).init();
