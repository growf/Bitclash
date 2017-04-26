var ColorDialog = function (dialog) {
	var drawWheel = function () {
		var wheel = $(this._dialog).find('.picker .wheel')[0];
		if (!wheel) {return}
		var size = Math.min($(wheel).width(), $(wheel).height());

		// draw wheel
		var wheelGL = $(wheel).find('canvas.webgl')[0];
		if (wheelGL) {
			var gl = wheelGL.getContext('webgl') || wheelGL.getContext('experimental-webgl');
			gl.canvas.width = size;
			gl.canvas.height = size;
			gl.viewport(0, 0, size, size);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			var vertex = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vertex, 'precision highp float; attribute vec4 V; varying vec4 p; void main() {p = V; gl_Position = V;}');
			gl.compileShader(vertex);

			var fragment = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fragment, 'precision highp float; uniform float v; varying vec4 p; void main() {vec3 rgb = clamp(2. - abs(2. - mod(atan(p.y, p.x) / 1.0472 + vec3(2., 0., -2.), 6.)), 0., 1.); gl_FragColor = vec4(((rgb - 1.) * length(p.xy) + 1.) * v, 1.);}');
			gl.compileShader(fragment);

			var shader = gl.createProgram();
			gl.attachShader(shader, vertex);
			gl.attachShader(shader, fragment);
			gl.linkProgram(shader);
			gl.useProgram(shader);

			gl.uniform1f(gl.getUniformLocation(shader, 'v'), this._v);

			var segments = 72;
			var vertices = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
			gl.bufferData(gl.ARRAY_BUFFER, (segments + 1) * 2 * Float32Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(2));
			var offset = 2 * Float32Array.BYTES_PER_ELEMENT;
			for (var i = 0; i < segments; i++) {
				var theta = 2 * Math.PI * i / segments;
				gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array([Math.cos(theta), Math.sin(theta)]));
				offset += 2 * Float32Array.BYTES_PER_ELEMENT;
			}
			var vertexPositionAttrib = gl.getAttribLocation(shader, 'V');
			gl.enableVertexAttribArray(vertexPositionAttrib);
			gl.vertexAttribPointer(vertexPositionAttrib, 2, gl.FLOAT, false, 0, 0);	

			var indices = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, segments * 3 * Uint16Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW);
			offset = 0;
			for (var i = 1; i <= segments; i++) {
				gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset, new Uint16Array([0, i, (i == segments ? 1 : i + 1)]));
				offset += 3 * Uint16Array.BYTES_PER_ELEMENT;
			}
			gl.drawElements(gl.TRIANGLES, segments * 3, gl.UNSIGNED_SHORT, 0);

			gl.disableVertexAttribArray(vertexPositionAttrib);
			gl.deleteProgram(shader);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
		}

		// draw indicator
		var wheel2D = $(wheel).find('canvas.2d')[0]
		if (wheel2D) {
			var ctx2d = wheel2D.getContext('2d');

			var x = Math.cos(this._h) * this._s * size / 2;
			var y = Math.sin(this._h) * this._s * size / 2;

			ctx2d.canvas.width = size + 20;
			ctx2d.canvas.height = size + 20;
			ctx2d.clearRect(0, 0, ctx2d.canvas.width, ctx2d.canvas.height);

			ctx2d.beginPath();
			ctx2d.arc(ctx2d.canvas.width / 2, ctx2d.canvas.height / 2, size / 2, 0, 2 * Math.PI);
			ctx2d.strokeStyle = 'rgb(80%, 80%, 80%)';
			ctx2d.lineWidth = 1;
			ctx2d.shadowColor = 'rgb(80%, 80%, 80%)';
			ctx2d.shadowBlur = 1;
			ctx2d.stroke();

			ctx2d.beginPath();
			ctx2d.arc((ctx2d.canvas.width / 2) + x, (ctx2d.canvas.height / 2) + y, 6, 0, 2 * Math.PI);
			ctx2d.strokeStyle = 'black';
			ctx2d.lineWidth = 4;
			ctx2d.stroke();
			ctx2d.strokeStyle = 'white';
			ctx2d.lineWidth = 2;
			ctx2d.shadowColor = 'white';
			ctx2d.shadowBlur = 1;
			ctx2d.stroke();
		}
	};
	var drawSlider = function () {
		var slider = $(this._dialog).find('.picker .slider')[0];
		if (!slider) {return}

		// draw slider
		var sliderGL = $(slider).find('canvas.webgl')[0]
		if (sliderGL) {
			var gl = sliderGL.getContext('webgl') || sliderGL.getContext('experimental-webgl');
			gl.canvas.width = $(slider).width();
			gl.canvas.height = $(slider).height();
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			var vertex = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vertex, 'precision highp float; attribute vec4 V; varying vec4 p; void main() {p = V; gl_Position = V;}');
			gl.compileShader(vertex);

			var fragment = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fragment, 'precision highp float; uniform float h; uniform float s; varying vec4 p; void main() {vec3 rgb = clamp(2. - abs(2. - mod(-h / 1.0472 + vec3(2., 0., -2.), 6.)), 0., 1.); gl_FragColor = vec4(((rgb - 1.) * s + 1.) * (1. - p.x) / 2., 1.);}');
			gl.compileShader(fragment);

			var shader = gl.createProgram();
			gl.attachShader(shader, vertex);
			gl.attachShader(shader, fragment);
			gl.linkProgram(shader);
			gl.useProgram(shader);

			gl.uniform1f(gl.getUniformLocation(shader, 'h'), this._h);
			gl.uniform1f(gl.getUniformLocation(shader, 's'), this._s);

			var vertices = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
			gl.bufferData(gl.ARRAY_BUFFER, 8 * Float32Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]));
			var vertexPositionAttrib = gl.getAttribLocation(shader, 'V');
			gl.enableVertexAttribArray(vertexPositionAttrib);
			gl.vertexAttribPointer(vertexPositionAttrib, 2, gl.FLOAT, false, 0, 0);	

			var indices = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 6 * Uint16Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array([0, 1, 2, 0, 2, 3]));
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

			gl.disableVertexAttribArray(vertexPositionAttrib);
			gl.deleteProgram(shader);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
		}

		// draw indicator
		var slider2D = $(slider).find('canvas.2d')[0];
		if (slider2D) {
			var ctx2d = slider2D.getContext('2d');

			var x = (1 - this._v) * $(slider).width();

			ctx2d.canvas.width = $(slider).width() + 20;
			ctx2d.canvas.height = $(slider).height() + 20;
			ctx2d.clearRect(0, 0, ctx2d.canvas.width, ctx2d.canvas.height);

			ctx2d.beginPath();
			ctx2d.rect(10, 10, $(slider).width(), $(slider).height());
			ctx2d.strokeStyle = 'rgb(80%, 80%, 80%)';
			ctx2d.lineWidth = 1;
			ctx2d.stroke();

			ctx2d.beginPath();
			ctx2d.rect(6 + x, 6, 8, ctx2d.canvas.height - 12);
			ctx2d.strokeStyle = 'black';
			ctx2d.lineWidth = 3;
			ctx2d.stroke();
			ctx2d.strokeStyle = 'white';
			ctx2d.lineWidth = 2;
			ctx2d.stroke();
		}
	};

	Object.defineProperties(this, {
		_dialog: {
			value: $(dialog).first().detach()[0]
		},
		_parent: {
			value: undefined,
			writable: true
		},
		_replaced: {
			value: undefined,
			writable: true
		},
		_h: {
			value: undefined,
			writable: true
		},
		_s: {
			value: undefined,
			writable: true
		},
		_v: {
			value: undefined,
			writable: true
		},
		_rgb: {
			set: function (rgb) {
				r = Math.min(Math.max(rgb[0], 0), 255);
				g = Math.min(Math.max(rgb[1], 0), 255);
				b = Math.min(Math.max(rgb[2], 0), 255);

				var max = Math.max(r, g, b);
				var min = Math.min(r, g, b);

				if (max - min == 0) {
					this._h = 0;
				} else if (max == r) {
					this._h = (((b - g) / (max - min)) + 0) * Math.PI / 3;
				} else if (max == g) {
					this._h = (((r - b) / (max - min)) - 2) * Math.PI / 3;
				} else {
					this._h = (((g - r) / (max - min)) + 2) * Math.PI / 3;
				}
				this._s = (max == 0 ? 0 : (max - min) / max);
				this._v = max / 255;
			},
			get: function () {
				if (this._h === undefined || this._s === undefined || this._v === undefined) {return [255, 255, 255]}

				var r = Math.round(((Math.min(Math.max(1 - Math.abs(2 - (((this._h * 3 / Math.PI) + 2) % 6)), -1), 0) * this._s) + 1) * this._v * 255);
				var g = Math.round(((Math.min(Math.max(1 - Math.abs(2 - (((this._h * 3 / Math.PI) + 4) % 6)), -1), 0) * this._s) + 1) * this._v * 255);
				var b = Math.round(((Math.min(Math.max(1 - Math.abs(2 - (((this._h * 3 / Math.PI) + 6) % 6)), -1), 0) * this._s) + 1) * this._v * 255);

				return [r, g, b];
			}
		},
		_hex: {
			set: function (hex) {
				var rgb;
				hex = hex.trim();
				if (hex.match(/^#?([0-9A-Fa-f]){6}$/)) {
					rgb = (/([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/).exec(hex).slice(-3).map(function (hh) {return parseInt(hh, 16)});
				} else if (hex.match(/^#?([0-9A-Fa-f]){3}$/)) {
					rgb = (/([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])/).exec(hex).slice(-3).map(function (h) {return parseInt(h + h, 16)});
				}
				if (rgb) {this._rgb = rgb};
			},
		},
		_wheel: {
			set: function (dxy) {
				var wheel = $(this._dialog).find('.picker .wheel .webgl')[0];
				if (!wheel) {return}
				if (Math.abs(dxy[0]) > $(wheel).width() / 2 || Math.abs(dxy[1]) > $(wheel).height() / 2) {return}

				var size = Math.min($(wheel).width(), $(wheel).height());
				var dist = Math.sqrt((dxy[0] * dxy[0]) + (dxy[1] * dxy[1]));

				this._h = Math.atan2(dxy[1], dxy[0]);
				this._s = Math.min(dist * 2 / size, 1);
			}
		},
		_slider: {
			set: function (dxy) {
				var slider = $(this._dialog).find('.picker .slider .webgl')[0];
				if (!slider) {return}
				if (Math.abs(dxy[0]) > $(slider).width() / 2 || Math.abs(dxy[1]) > $(slider).height() / 2) {return}

				var size = $(slider).width();
				var dist = Math.min(Math.max(dxy[0], -size / 2), size / 2);

				this._v = 0.5 - (dist / size);
			}
		},
		_update: {
			value: function () {
				var rgb = this._rgb;

				var sample = $(this._dialog).find('.sample')[0];
				if (sample) {
					$(sample).css('background-color', 'rgb(' + rgb.join(', ') + ')');
				}

				var controls = $(this._dialog).find('.controls')[0];
				if (controls) {
					$(controls).find('.red.range').val(rgb[0]);
					$(controls).find('.green.range').val(rgb[1]);
					$(controls).find('.blue.range').val(rgb[2]);

					$(controls).find('.red.label').text(rgb[0]);
					$(controls).find('.green.label').text(rgb[1]);
					$(controls).find('.blue.label').text(rgb[2]);

					$(controls).find('.hex').not(':focus').val('#' + rgb.map(function (n) {return ('0' + n.toString(16)).substr(-2)}).join(''));
				}

				drawWheel.call(this);
				drawSlider.call(this);

				$(this._parent).find('.colorValue').val(rgb.join(',')).trigger('input');
			}
		}
	});
};
ColorDialog.prototype = (function () {
	return {
		show: function (colorDiv) {
			var self = this;

			if (this._parent !== undefined || this._replaced !== undefined) {this.submit()}

			this._replaced = $(colorDiv).find('.colorSample').first().replaceWith(this._dialog)[0];
			if (this._replaced === undefined) {return}
			this._parent = colorDiv;

			var rgb = [];
			var valueElem = $(colorDiv).find('.colorValue')[0];
			if (valueElem && $(valueElem).val()) {rgb = $(valueElem).val().split(',').map(function (n) {return parseInt(n)})}
			if (isFinite(rgb[0]) && isFinite(rgb[1]) && isFinite(rgb[2])) {
				this._rgb = rgb;
			} else {
				this._rgb = [255, 255, 255];
			}
			this._update();

			var sample = $(this._dialog).find('.sample');
			var controls = $(this._dialog).find('.controls');
			var wheel = $(this._dialog).find('.picker .wheel');
			var slider = $(this._dialog).find('.picker .slider');

			$(this._dialog).click(function (event) {
				event.stopPropagation();
			});
			$(sample).click(function (event) {
				if (event.isDefaultPrevented()) {return}
				self.submit();
				event.preventDefault();
			});
			$(controls).find('.range').on('input change', function () {
				self._rgb = [$(controls).find('.red.range').val(), $(controls).find('.green.range').val(), $(controls).find('.blue.range').val()];
				self._update();
			});
			$(controls).find('.hex').on('input change', function () {
				self._hex = $(this).val();
				self._update();
			});
			$(wheel).on('mousedown mousemove mouseup', function (event) {
				var clicked = (event.buttons === undefined ? event.which == 1 : event.buttons & 1 == 1);
				if (clicked) {
					var dx = (event.offsetX === undefined ? event.originalEvent.layerX : event.offsetX) - (event.target.width / 2);
					var dy = (event.offsetY === undefined ? event.originalEvent.layerY : event.offsetY) - (event.target.height / 2);
					self._wheel = [dx, dy];
					self._update();
				}
			});
			$(slider).on('mousedown mousemove mouseup', function (event) {
				var clicked = (event.buttons === undefined ? event.which == 1 : event.buttons & 1 == 1);
				if (clicked) {
					var dx = (event.offsetX === undefined ? event.originalEvent.layerX : event.offsetX) - (event.target.width / 2);
					var dy = (event.offsetY === undefined ? event.originalEvent.layerY : event.offsetY) - (event.target.height / 2);
					self._slider = [dx, dy];
					self._update();
				}
			});
		},
		submit: function () {
			if (this._parent !== undefined) {
				$(this._parent).find('.colorValue').val(this._rgb.join(',')).trigger('change');
				this._parent = undefined;
			}

			if (this._replaced !== undefined) {
				$(this._replaced).css('background-color', 'rgb(' + this._rgb.join(', ') + ')');
				$(this._dialog).replaceWith(this._replaced);
				this._replaced = undefined;
			}
		}
	};
})();
