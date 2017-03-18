var config;
var user;
var animation;
var challenger;
var lastUpdated;

var readConfiguration = function () {
	config = {};

	// read configuration from URL
	var args = $(location).prop('search').replace(/^\?/, '').split('&');
	for (var i in args) {
		var n = urlDecode(args[i].split('=')[0]), v = urlDecode(args[i].split('=').slice(1).join('='));
		switch (n) {
			case 'oauth':
				config.token = v;
				break;
			case 'test':
				config.testMode = true;
				break;
			case 'force':
				v = v.split(',');
				if (v.length == 4) {
					config.forcePlayer = {
						'timestamp' : (isFinite(parseInt(v[0])) ? parseInt(v[0]) : undefined),
						'name'      : v[1],
						'currentHP' : (isFinite(parseInt(v[2])) ? Math.min(Math.max(v[2], 1), 1000000) : undefined),
						'maxHP'     : (isFinite(parseInt(v[3])) ? Math.min(Math.max(v[3], 1), 1000000) : undefined)
					};
					if (config.forcePlayer.currentHP && config.forcePlayer.maxHP && config.forcePlayer.maxHP < config.forcePlayer.currentHP) {config.forcePlayer.maxHP = config.forcePlayer.currentHP}
				}
				break;
			case 'view':
				if (['normal', 'compact', 'tiny'].indexOf(v) !== -1) {config.view = v}
				break;
			case 'bg':
				v = v.split(',').map(function (x) {return (isFinite(parseFloat(x)) ? Math.min(Math.max(Math.round(x), 0), 255) : 0)});
				if (v.length == 4) {
					config.bgcolor = 'rgba(' + [v[0], v[1], v[2], v[3] / 255].join(', ') + ')'; 
				}
				break;
			case 'fg':
				v = v.split(',').map(function (x) {return (isFinite(parseFloat(x)) ? Math.min(Math.max(Math.round(x), 0), 255) : 0)});
				if (v.length == 4) {
					config.fgcolor = 'rgba(' + [v[0], v[1], v[2], v[3] / 255].join(', ') + ')'; 
				}
				break;
			case 'sh':
				v = v.split(',').map(function (x) {return (isFinite(parseFloat(x)) ? Math.min(Math.max(Math.round(x), 0), 255) : 0)});
				if (v.length == 4) {
					config.fgshadow = 'rgba(' + [v[0], v[1], v[2], v[3] / 255].join(', ') + ')'; 
				}
				break;
			case 'img':
				if (v.length) {config.defaultImage = v};
				break;
			case 'vol':
				v = (isFinite(v) ? Math.min(Math.max(v, 0), 100) : 0);
				config.volume = v / 100;
				break;
			case 'crit':
				v = v.split(',');
				if (v.length == 3) {
					config.critMin = (isFinite(parseFloat(v[0])) ? Math.max(v[0], 1) : 1);
					config.critMax = (isFinite(parseFloat(v[1])) ? Math.max(v[1], 1) : 1);
					config.critPercent = (isFinite(parseFloat(v[2])) ? Math.min(Math.max(v[2], 0), 100) : 0);
					if (config.critMax < config.critMin) {config.critMax = config.critMin}
				}
				break;
			case 'win':
				v = v.split(',');
				if (v.length == 3) {
					config.hpScale = (isFinite(parseFloat(v[0])) ? Math.max(v[0], 1) : 1);
					config.hpMin = (isFinite(parseFloat(v[1])) ? Math.min(Math.max(Math.ceil(v[1]), 1), 1000000) : 1);
					config.hpMax = (isFinite(parseFloat(v[2])) ? Math.min(Math.max(Math.floor(v[2]), 1), 1000000) : 1000000);
					if (config.hpMax < config.hpMin) {config.hpMax = config.hpMin}
				}
				break;
		}
	}

	// set defaults if missing
	if (config.testMode === undefined) {config.testMode = false}
	if (config.view === undefined) {config.view = 'normal'}
	if (config.bgcolor === undefined) {config.bgcolor = 'rgba(255, 255, 255, 0.0)'}
	if (config.fgcolor === undefined) {config.fgcolor = 'rgba(255, 255, 255, 1.0)'}
	if (config.fgshadow === undefined) {
		var bg = config.bgcolor.match(/\d+(\.\d+)?/g).map(function (x) {return parseFloat(x)});
		var fg = config.fgcolor.match(/\d+(\.\d+)?/g).map(function (x) {return parseFloat(x)});

		var bgluma = (bg[0] * 0.299) + (bg[1] * 0.587) + (bg[2] * 0.114);
		var fgluma = (fg[0] * 0.299) + (fg[1] * 0.587) + (fg[2] * 0.114);

		// calculate contrasting drop shadow color
		if (bgluma < 128 && fgluma < 64) {
			// low-luminance; use white shadow
			config.fgshadow = 'rgba(255, 255, 255, ' + fg[3] * 0.8 + ')';
		} else {
			// use black shadow
			config.fgshadow = 'rgba(0, 0, 0, ' + fg[3] * 0.8 + ')';
		}
	}
	if (config.defaultImage === undefined) {config.defaultImage = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZpZXdCb3g9IjAgMCAzMDAgMzAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBzdHlsZT0iZmlsbDpyZ2IoMjIsIDMzLCA0NCk7Ii8+PHBhdGggZD0iTTIxMCA0NSBMNzAgMTcwIEgxMzUgTDkwIDI1NSBMMjMwIDEzMCBIMTY1IFoiIHN0eWxlPSJmaWxsOndoaXRlOyIvPjwvc3ZnPg=='};
	if (config.volume === undefined) {config.volume = 0.2}
	if (config.critMin === undefined) {config.critMin = 1}
	if (config.critMax === undefined) {config.critMax = config.critMin}
	if (config.critPercent === undefined) {config.critPercent = 0}
	if (config.hpScale === undefined) {config.hpScale = 1}
	if (config.hpMin === undefined) {config.hpMin = 1}
	if (config.hpMax === undefined) {config.hpMax = 1000000}
}

var vw = function (units) {
	// get view-width equivalent in pixels
	units = (isFinite(parseInt(units)) ? parseInt(units) : 1);
	return Math.round(units * $(window).innerWidth() / 100);
};

var scaleText = function (strings, maxWidth, maxHeight, color, shadowColor, shadowStyle) {
	strings = strings.map(function (x) {try {return x.toString()} catch (e) {return ''}});

	if (color === undefined) {color = config.fgcolor}
	if (shadowColor === undefined) {shadowColor = config.fgshadow}
	if (shadowStyle === undefined) {shadowStyle = '0 1px 4px'}

	var fontSize = Math.floor(maxHeight);
	var minFontSize = vw(3);

	// create div to experiment with
	var scaledText = $('<div>').addClass('scaledText');
	$('body').append(scaledText);

	// shrink font size to fit
	$(scaledText).css('font-size', fontSize + 'px').text(strings.join('X'));;
	while (fontSize > minFontSize && ($(scaledText).outerWidth() > maxWidth || $(scaledText).outerHeight() > maxHeight)) {
		fontSize--;
		$(scaledText).css('font-size', fontSize + 'px');
	}

	// shorten text strings to fit
	while ($(scaledText).outerWidth() > maxWidth) {
		var longest = 0;
		for (var i in strings) {longest = Math.max(longest, strings[i].length)}
		if (longest <= 2) {break}
		for (var i in strings) {
			if (strings[i].length == longest) {
				strings[i] = strings[i].replace(/.\u2026?$/, '\u2026');
				break
			}
		}
		$(scaledText).text(strings.join('X'));
	};

	$(scaledText).remove();

	// build separate div for each string
	scaledText = [];
	for (var i in strings) {scaledText.push($('<div>').addClass('scaledText').css('color', color).css('text-shadow', shadowColor + ' ' + shadowStyle).css('font-size', fontSize + 'px').text(strings[i]))}
	return scaledText;
};

var drawImage = function (index, url) {
	$('div.playerImage.player' + (index ? 'Right' : 'Left') + ':visible').each(function () {
		$(this).css('background-image', (url === undefined ? '' : 'url(\'' + url + '\')'));
	});
};

var drawHPBar = function (index, scale, maxHP, currentHP, interimHP) {
	maxHP = Math.max(maxHP, currentHP);
	scale = Math.max(scale, maxHP, 1);
	interimHP = Math.min(Math.max((isFinite(interimHP) ? interimHP : currentHP), currentHP), maxHP); 

	switch (index) {
		case 0:
			$('div.playerHP.playerLeft:visible').each(function () {
				$(this).empty();

				var r = Math.round(1000 * maxHP / scale);
				var o = Math.round(1000 * interimHP / scale);
				var g = Math.round(1000 * currentHP / scale);

				var hpBar = $(
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200" preserveAspectRatio="none">' +
						'<path d="M 0 0 H ' + r + ' V 200 H 0 Z" fill="red"/>' + 
						'<path d="M 0 0 H ' + o + ' V 200 H 0 Z" fill="orange"/>' + 
						'<path d="M 0 0 H ' + g + ' V 200 H 0 Z" fill="green"/>' + 
						(r > 0 && r < 1000 ? '<path d="M ' + (r + 1) + ' 0 V 200" stroke="black"/>' : '') +
					'</svg>'
				);
				$(this).append(hpBar);

				if (interimHP > 0) {
					var hpText = scaleText([interimHP.toLocaleString()], $(hpBar).innerWidth() - vw(2), $(hpBar).innerHeight())[0];
					$(this).append($(hpText).addClass('playerLeft'));
				}
			});
			break;
		case 1:
			$('div.playerHP.playerRight:visible').each(function () {
				$(this).empty();

				var r = 1000 - Math.round(1000 * maxHP / scale);
				var o = 1000 - Math.round(1000 * interimHP / scale);
				var g = 1000 - Math.round(1000 * currentHP / scale);

				var hpBar = $(
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200" preserveAspectRatio="none">' +
						'<path d="M 1000 0 H ' + r + ' V 200 H 1000 Z" fill="red"/>' + 
						'<path d="M 1000 0 H ' + o + ' V 200 H 1000 Z" fill="orange"/>' + 
						'<path d="M 1000 0 H ' + g + ' V 200 H 1000 Z" fill="green"/>' + 
						(r > 0 && r < 1000 ? '<path d="M ' + (r - 1) + ' 0 V 200" stroke="black"/>' : '') +
					'</svg>'
				);
				$(this).append(hpBar);

				if (interimHP > 0) {
					var hpText = scaleText([interimHP.toLocaleString()], hpBar.innerWidth() - vw(2), hpBar.innerHeight())[0];
					$(this).append($(hpText).addClass('playerRight'));
				}
			});
			break;
	}
};

var drawNames = function (player1, player2) {
	// fit player names
	$('div.normalView div.playerName:visible').each(function () {
		$(this).empty();
		var nameText = scaleText([player1, player2], $(this).innerWidth(), $(this).innerHeight());
		$(this).append($(nameText[0]).addClass('playerLeft'));
		$(this).append($(nameText[1]).addClass('playerRight'));
	});

	$('div.compactView div.playerName.playerLeft:visible').each(function () {
		$(this).empty();
		var nameText = scaleText([player1], $(this).innerWidth(), $(this).innerHeight())[0];
		$(this).append($(nameText).addClass('playerLeft'));
	});
	$('div.compactView div.playerName.playerRight:visible').each(function () {
		$(this).empty();
		var nameText = scaleText([player2], $(this).innerWidth(), $(this).innerHeight())[0];
		$(this).append($(nameText).addClass('playerRight'));
	});
};

var initDisplay = function () {
	$('body').css('background-color', config.bgcolor);

	// pre-load default player image
	var defaultImg = $('<img>').css('visibility', 'hidden').attr('src', config.defaultImage);
	$(defaultImg).appendTo('body').remove();

	switch (config.view) {
		case 'compact':
			$('.compactView').show();
			break;
		case 'tiny':
			focusPlayer();
			break;
		default:
			$('.normalView').show();
			break;
	}
};

var focusPlayer = function (index) {
	if (config.view === 'tiny') {
		$('.compactView').hide();
		switch (index) {
			case 0:
				$('.compactView.playerLeft').show();
				break;
			case 1:
				$('.compactView.playerRight').show();
				break;
			default:
				// focus on the defender
				var state = getState();
				$('.compactView.player' + (state.player[1].defender ? 'Right' : 'Left')).show();
		}
	}
};

var updateDisplay = function () {
	var state = getState();

	// update images if specified
	var image = '';
	if (state.player[0].maxHP) {
		if (state.player[0].image === undefined || state.player[0].overrideImage) {
			image = config.defaultImage;
		} else {
			image = state.player[0].image;
		}
	}
	drawImage(0, image);

	image = '';
	if (state.player[1].maxHP) {
		if (state.player[1].image === undefined || state.player[1].overrideImage) {
			image = config.defaultImage;
		} else {
			image = state.player[1].image;
		}
	}
	drawImage(1, image);

	// show names
	drawNames(state.player[0].name, state.player[1].name);

	// draw HP bars
	var hpScale = Math.max(state.player[0].maxHP, state.player[1].maxHP, 1);
	drawHPBar(0, hpScale, state.player[0].maxHP, state.player[0].currentHP);
	drawHPBar(1, hpScale, state.player[1].maxHP, state.player[1].currentHP);
};

var splitUneven = function (value, parts) {
	if (!isFinite(parts) || parts < 1) {
		return [];
	} else if (parts == 1) {
		return [value];
	} else {
		var part = Math.floor(value * (1 / (parts + 1)) * (1 + Math.random()));
		return [part].concat(splitUneven(value - part, parts - 1));
	}
};

var createFight = function () {
	var state = getState();

	var c = (state.player[0].defender ? 1 : 0);
	var d = (c ? 0 : 1);
	var hp = state.player[c].currentHP;
	if (hp <= 0) {return}

	var rounds = Math.log10(hp);
	rounds = Math.max(1, (Math.random() < rounds - Math.trunc(rounds) ? Math.ceil(rounds) : Math.floor(rounds)));

	var player = [
		splitUneven(hp, rounds).map(function (x) {
			return {
				'player' : 0,
				'damage' : Math.floor(x * (1 + (Math.random() * 0.1))),
				'crit'   : false
			}
		}),
		splitUneven(hp, rounds).map(function (x) {
			return {
				'player' : 1,
				'damage' : Math.floor(x * (1 + (Math.random() * 0.1))),
				'crit'   : false
			}
		})
	];

	if (Math.random() * 100 < config.critPercent) {
		// defender critical hit
		var mult = config.critMin + (Math.random() * (config.critMax - config.critMin));
		var hit = (player[d].length == 1 ? 0 : player[d].length - Math.round(1 + Math.random()));
		player[d][hit].damage = Math.min(Math.floor(player[d][hit].damage * mult), 1000000);
		player[d][hit].crit = true;
	}

	// remove overkill hits
	var total = 0;
	for (var i in player[d]) {
		total += player[d][i].damage;
		if (total >= hp) {
			player[d].splice(i + 1);
			break;
		}
	}

	// remove weakest wasted hits from challenger
	while (player[d].length > player[c].length) {
		var min, hit;
		for (var i in player[c]) {
			if (min === undefined || player[c][i].damage < min) {
				min = player[c][i].damage;
				hit = i;
			}
		}
		player[c].splice(hit, 1);
	}

	if (Math.random() * 100 < config.critPercent) {
		// challenger critical hit
		var mult = config.critMin + (Math.random() * (config.critMax - config.critMin));
		var hit = Math.floor(Math.random() * player[c].length);
		player[c][hit].damage = Math.min(Math.floor(player[c][hit].damage * mult), 1000000);
		player[c][hit].crit = true;
	}

	// assemble fight
	var fight = [];
	for (var i in player[c]) {
		fight.push(player[c][i], player[d][i]);
	}
	return fight;
};

var heal = function (index, amount) {
	var state = getState();

	// can't heal past max HP
	amount = Math.min(amount, state.player[index].maxHP - state.player[index].currentHP);

	// heal player
	var startHP = state.player[index].currentHP;
	var endHP = startHP + amount;

	state.player[index].currentHP = endHP;
	setPlayer(index, state.player[index]);

	// show heal animation
	animation = window.setTimeout(animateHeal.bind(null, {
		'player'  : index,
		'startHP' : startHP,
		'endHP'   : endHP
	}), 0);
};

var attack = function (hit) {
	var state = getState();
	var p = (hit.player ? 0 : 1);

	// hit player
	var startHP = state.player[p].currentHP;
	var endHP = Math.max(startHP - hit.damage, 0);

	if (endHP > 0) {
		// update player's health
		state.player[p].currentHP = endHP;
		setPlayer(p, state.player[p]);

		// show attack animation
		animation = window.setTimeout(animateAttack.bind(null, {
			'player'  : p,
			'startHP' : startHP,
			'endHP'   : endHP,
			'crit'    : hit.crit
		}), 0);
	} else {
		// kill player and end fight
		var startMaxHP = state.player[p].maxHP;
		var victorStartHP = state.player[hit.player].currentHP;
		var victorEndHP = victorStartHP;
		var victorStartMaxHP = state.player[hit.player].maxHP;
		var victorEndMaxHP = victorStartMaxHP;

		setPlayer(p);
		setFight();

		if (!state.player[hit.player].defender) {
			// award victory bonus HP to challenger
			victorEndHP = Math.max(config.hpScale * victorStartHP, config.hpMin);
			victorEndHP = Math.min(victorEndHP, Math.max(victorStartHP, config.hpMax));
			victorEndMaxHP = Math.max(victorEndHP, state.player[hit.player].maxHP);

			state.player[hit.player].maxHP = victorEndMaxHP;
			state.player[hit.player].currentHP = victorEndHP;

			// promote player to defender
			state.player[hit.player].defender = true;

			setPlayer(hit.player, state.player[hit.player]);
		}

		// show battle victory animation
		animation = window.setTimeout(animateVictory.bind(null, {
			'player'           : hit.player,
			'damage'           : hit.damage,
			'crit'             : hit.crit,
			'loserStartHP'     : startHP,
			'loserStartMaxHP'  : startMaxHP,
			'victorStartHP'    : victorStartHP,
			'victorEndHP'      : victorEndHP,
			'victorStartMaxHP' : victorStartMaxHP,
			'victorEndMaxHP'   : victorEndMaxHP,
		}), 0);
	}
};

var update = function () {
	// let any animations complete before continuing
	if (animation) {return}

	var state = getState();
	if (state.updated === lastUpdated) {return}
	lastUpdated = state.updated;

	updateDisplay();

	if (state.player[0].currentHP == 0 && state.player[1].currentHP == 0) {
		// add the user as the current defender
		if (user === undefined) {return}
		setPlayer(0, {
			'id'            : parseInt(user._id),
			'name'          : (user.display_name !== undefined && user.display_name.length ? user.display_name : user.name),
			'image'         : ([undefined, null, ''].indexOf(user.logo) == -1 ? user.logo : undefined),
			'overrideImage' : false,
			'defender'      : true,
			'maxHP'         : config.hpMin,
			'currentHP'     : config.hpMin
		});

		// show defender animation
		animation = window.setTimeout(animateChallenger.bind(null, {
			'player' : 0,
			'hp'     : config.hpMin
		}), 0);

		return;
	}

	if (state.player[0].currentHP == 0 || state.player[1].currentHP == 0) {
		// need a challenger
		var c = (state.player[0].currentHP == 0 ? 0 : 1);
		var d = (c ? 0 : 1);

		// if we've selected a new challenger; wait for them to be loaded
		if (challenger) {return}

		challenger = dequeueChallenger();

		if (challenger) {
			if (state.player[d].id == challenger.id) {
				// heal defender
				heal(d, challenger.bits);

				challenger = undefined;
				return;
			}

			if (!state.player[d].defender) {
				// remaining player should be defender
				state.player[d].defender = true;
				setPlayer(d, state.player[d]);
			}

			getUser(challenger.id, function (success, obj) {
				if (success) {
					setPlayer(c, {
						'id'            : challenger.id,
						'name'          : (obj.display_name !== undefined && obj.display_name.length ? obj.display_name : obj.name),
						'image'         : ([undefined, null, ''].indexOf(obj.logo) == -1 ? obj.logo : undefined),
						'overrideImage' : false,
						'defender'      : false,
						'maxHP'         : challenger.bits,
						'currentHP'     : challenger.bits
					});
				} else {
					// do the best we can without the user details
					setPlayer(c, {
						'id'            : challenger.id,
						'name'          : challenger.name,
						'image'         : undefined,
						'overrideImage' : false,
						'defender'      : false,
						'maxHP'         : challenger.bits,
						'currentHP'     : challenger.bits
					});
				}

				// show challenger animation
				animation = window.setTimeout(animateChallenger.bind(null, {
					'player' : c,
					'hp'     : challenger.bits
				}), 0);
			});
		}

		return;
	}

	if (challenger) {
		// challenger is now loaded; reset current fight
		challenger = undefined;
		setFight();

		return;
	}

	// check for current fight
	var hit = dequeueHit();

	if (!hit) {
		// create new fight
		setFight(createFight());
		hit = dequeueHit();
	}

	// fight
	attack(hit);
}

var showError = function (message) {
	if (message) {
		$('#errorMessage').text('\u26a0 ' + message).show();
	} else {
		$('#errorMessage').text('').hide();
	}
};

var login = function (success, obj) {
	if (!success) {
		showError(obj.error);
		return;
	}

	user = obj;

	// set up Twitch listener
	connectPubSub();
};

var start = function () {
	window.setInterval(update, 1000);
};

var init = function () {
	var deferredResize;

	readConfiguration();
	initDisplay();

	$(window).on('resize', function () {
		if (deferredResize) {window.clearTimeout(deferredResize)}
		deferredResize = window.setTimeout(updateDisplay, 100);
	});
	$('div.imageArea.playerLeft').on('mousedown', toggleImage.bind(null, 0));
	$('div.imageArea.playerRight').on('mousedown', toggleImage.bind(null, 1));

	loadSounds();
	getAuthorizedUser(config.token, login);

	if (!config.forcePlayer || !config.forcePlayer.timestamp) {
		updateDisplay();
		start();
		return;
	}

	var state = getState();
	if (config.forcePlayer.name === '') {
		if (state.player[0].defender || state.player[1].defender) {
			// update current defender's HP
			var d = (state.player[0].defender ? 0 : 1);

			state.player[d].maxHP = (config.forcePlayer.maxHP ? config.forcePlayer.maxHP : state.player[d].maxHP);
			state.player[d].currentHP = (config.forcePlayer.currentHP ? config.forcePlayer.currentHP : state.player[d].currentHP);
			if (state.player[d].maxHP < state.player[d].currentHP) {state.player[d].maxHP = state.player[d].currentHP}

			resetState(config.forcePlayer.timestamp, d, state.player[d]);
		}

		updateDisplay();
		start();
		return;
	}

	getUserByLogin(config.forcePlayer.name, function (success, obj) {
		if (success) {
			if (obj.users && obj.users.length) {
				// overwrite current state
				resetState(config.forcePlayer.timestamp, 0, {
					'id'            : parseInt(obj.users[0]._id),
					'name'          : (obj.users[0].display_name !== undefined && obj.users[0].display_name.length ? obj.users[0].display_name : obj.users[0].name),
					'image'         : ([undefined, null, ''].indexOf(obj.users[0].logo) == -1 ? obj.users[0].logo : undefined),
					'overrideImage' : false,
					'defender'      : true,
					'maxHP'         : (config.forcePlayer.maxHP ? config.forcePlayer.maxHP : (config.forcePlayer.currentHP ? config.forcePlayer.currentHP : config.hpMin)),
					'currentHP'     : (config.forcePlayer.currentHP ? config.forcePlayer.currentHP : (config.forcePlayer.maxHP ? config.forcePlayer.maxHP : config.hpMin))
				});

				updateDisplay();
				start();
			} else {
				showError('Couldn\'t reset defender: Unknown user');
			}
		} else {
			showError('Couldn\'t reset defender: ' + obj.error);
		}
	});
};

// need to wait until everything is loaded
$(window).on('load', init);
