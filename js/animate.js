var sounds;

var loadSounds = function () {
	sounds = {
		'new'  : [],
		'hit'  : [],
		'heal' : [],
		'lose' : []
	};

	var audio = new Audio();
	var formats = {
		'audio/ogg'  : '.ogg',
		'audio/mpeg' : '.mp3',
		'audio/mp3'  : '.mp3'
	};
	var optimism = ['probably', 'maybe'];
	var ext;
	for (var i in optimism) {
		for (var type in formats) {
			if (audio.canPlayType(type) === optimism[i]) {ext = formats[type]}
			if (ext) {break}
		}
		if (ext) {break}
	}

	if (ext) {
		audio = new Audio('sound/new' + ext);
		if (!audio.error) {
			audio.volume = config.volume;
			sounds.new.push(audio);
		}

		for (var i = 1; i <= 6; i++) {
			audio = new Audio('sound/hit' + i + ext);
			if (!audio.error) {
				audio.volume = config.volume;
				sounds.hit.push(audio);
			}
		}

		audio = new Audio('sound/heal' + ext);
		if (!audio.error) {
			audio.volume = config.volume;
			sounds.heal.push(audio);
		}

		audio = new Audio('sound/lose' + ext);
		if (!audio.error) {
			audio.volume = config.volume;
			sounds.lose.push(audio);
		}
	}
};

var animateChallenger = function (anim) {
	var c = anim.player;
	var d = (c ? 0 : 1);

	// default values
	if (anim.script === undefined) {anim.script = ['drawImage', 'playSound', 'expandImage', 'drawName', 'drawHP']}
	if (anim.imageScale === undefined) {anim.imageScale = 0}
	if (anim.startHP === undefined) {anim.startHP = 0}

	// advance script
	if (anim.script[0] === 'drawImage' && anim.imageDrawn) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'playSound' && anim.soundPlayed) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'expandImage' && anim.imageScale >= 1) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'drawName' && anim.namesDrawn) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'drawHP' && anim.startHP >= anim.hp) {
		anim.script.shift();
		anim.frameCount = undefined;
	}

	focusPlayer(c);

	switch (anim.script[0]) {
		case 'drawImage':
			// load player image invisibly
			$('div.playerImage.player' + (c ? 'Right' : 'Left') + ':visible').each(function () {
				$(this).css('visibility', 'hidden');
			});

			var state = getState();
			if (state.player[c].image === undefined || state.player[c].overrideImage) {
				image = config.defaultImage;
			} else {
				image = state.player[c].image;
			}
			drawImage(c, image);

			anim.imageDrawn = true;
			break;
		case 'playSound':
			// play new player sound
			if (sounds.new.length) {sounds.new[Math.floor(Math.random() * sounds.new.length)].play()}
			anim.soundPlayed = true;
			break;
		case 'expandImage':
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 10;
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.imageScale += (1 - anim.imageScale) / anim.frameCount;
			} else {
				anim.imageScale = 1;
			}

			// update image
			$('div.playerImage.player' + (c ? 'Right' : 'Left') + ':visible').each(function () {
				$(this).css('visibility', 'visible').css('transform', 'scale(' + anim.imageScale + ')');
			});
			break;
		case 'drawName':
			// redraw player names
			var state = getState();
			drawNames(state.player[0].name, state.player[1].name);
			anim.namesDrawn = true;
			break;
		case 'drawHP':
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 10 * Math.ceil(Math.log10(anim.hp - anim.startHP));
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.startHP += Math.round((anim.hp - anim.startHP) / anim.frameCount);
			} else {
				anim.startHP = anim.hp;
			}

			// update HP bar
			var state = getState();
			var hpScale = Math.max(anim.startHP, state.player[d].maxHP, 1);
			drawHPBar(c, hpScale, anim.startHP, anim.startHP);
			drawHPBar(d, hpScale, state.player[d].maxHP, state.player[d].currentHP);
			break;
		default:
			// finish animation
			updateDisplay();
			animation = undefined;
			return;
	}

	// schedule next frame
	if (isFinite(anim.frameCount) && anim.frameCount > 0) {anim.frameCount--}
	animation = window.setTimeout(animateChallenger.bind(null, anim), 33);
};

var animateAttack = function (anim) {
	// default values
	if (anim.script === undefined) {anim.script = ['focusPlayer', 'playSound', 'showDamage', 'drawHP']}
	if (anim.hpScale === undefined || anim.maxHP === undefined) {
		var state = getState();
		anim.hpScale = Math.max(state.player[0].maxHP, state.player[1].maxHP, 1);
		anim.maxHP = state.player[anim.player].maxHP;
	}
	if (anim.damage === undefined) {anim.damage = anim.startHP - anim.endHP}

	// advance script
	if (anim.script[0] === 'focusPlayer' && (anim.playerFocussed || config.view !== 'tiny')) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'playSound' && anim.soundPlayed) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'showDamage' && anim.damageShown) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'drawHP' && anim.startHP <= anim.endHP) {
		anim.script.shift();
		anim.frameCount = undefined;
	}

	focusPlayer(anim.player);

	switch (anim.script[0]) {
		case 'focusPlayer':
			// allow time after view has re-focussed
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 10;
			}

			if (anim.frameCount <= 0) {
				anim.playerFocussed = true;
			}
			break;
		case 'playSound':
			// play hit sound
			if (sounds.hit.length) {sounds.hit[Math.floor(Math.random() * sounds.hit.length)].play()}
			anim.soundPlayed = true;
			break;
		case 'showDamage':
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 15;
			}

			// update animation state
			$('div.imageArea.player' + (anim.player ? 'Right' : 'Left') + ':visible > div.damageText').remove();
			if (anim.frameCount > 0) {
				$('div.imageArea.player' + (anim.player ? 'Right' : 'Left') + ':visible').each(function () {
					var height = $(this).innerHeight() * (15 + Math.log10(Math.max(anim.damage, 1))) / 60;
					var color = (anim.crit ? 'hsl(' + Math.floor(Math.random() * 360) + ', 100%, 75%)' : 'red');
					var scaledText = scaleText([anim.damage.toLocaleString()], $(this).innerWidth(), height, color, 'black', '0 0 1px')[0];
					$(scaledText).addClass('damageText').css('top', (anim.frameCount - 10) * height / 15);
					$(this).append(scaledText);
				});
			} else {
				anim.damageShown = true;
			}

			// update HP bar
			drawHPBar(anim.player, anim.hpScale, anim.maxHP, anim.endHP, anim.startHP);
			break;
		case 'drawHP':
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 5 * Math.ceil(Math.log10(anim.startHP - anim.endHP));
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.startHP -= Math.round((anim.startHP - anim.endHP) / anim.frameCount);
			} else {
				anim.startHP = anim.endHP;
			}

			// update HP bar
			drawHPBar(anim.player, anim.hpScale, anim.maxHP, anim.endHP, anim.startHP);
			break;
		default:
			// finish animation
			updateDisplay();
			animation = undefined;
			return;
	}

	// schedule next frame
	if (isFinite(anim.frameCount) && anim.frameCount > 0) {anim.frameCount--}
	animation = window.setTimeout(animateAttack.bind(null, anim), 33);
};

var animateHeal = function (anim) {
	// default values
	if (anim.script === undefined) {anim.script = ['playSound', 'showHealth', 'drawHP']}
	if (anim.health === undefined) {anim.health = anim.endHP - anim.startHP}

	// advance script
	if (anim.script[0] === 'playSound' && (anim.soundPlayed || anim.health == 0)) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'showHealth' && anim.healthShown) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'drawHP' && anim.startHP >= anim.endHP) {
		anim.script.shift();
		anim.frameCount = undefined;
	}

	focusPlayer(anim.player);

	switch (anim.script[0]) {
		case 'playSound':
			// play heal sound
			if (sounds.heal.length) {sounds.heal[Math.floor(Math.random() * sounds.heal.length)].play()}
			anim.soundPlayed = true;
			break;
		case 'showHealth':
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 15;
			}

			// update animation state
			$('div.imageArea.player' + (anim.player ? 'Right' : 'Left') + ':visible > div.healthText').remove();
			if (anim.frameCount > 0) {
				$('div.imageArea.player' + (anim.player ? 'Right' : 'Left') + ':visible').each(function () {
					var height = $(this).innerHeight() * (15 + Math.log10(Math.max(anim.health, 1))) / 60;
					var scaledText = scaleText([anim.health.toLocaleString()], $(this).innerWidth(), height, 'green', 'black', '0 0 1px')[0];
					$(scaledText).addClass('healthText').css('top', (anim.frameCount - 10) * height / 15);
					$(this).append(scaledText);
				});
			} else {
				anim.healthShown = true;
			}
			break;
		case 'drawHP':
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 5 * Math.ceil(Math.log10(anim.endHP - anim.startHP));
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.startHP += Math.round((anim.endHP - anim.startHP) / anim.frameCount);
			} else {
				anim.startHP = anim.endHP;
			}

			// update HP bar
			var state = getState();
			var hpScale = Math.max(state.player[0].maxHP, state.player[1].maxHP, 1);
			drawHPBar(anim.player, hpScale, state.player[anim.player].maxHP, anim.startHP);
			break;
		default:
			// finish animation
			updateDisplay();
			animation = undefined;
			return;
	}

	// schedule next frame
	if (isFinite(anim.frameCount) && anim.frameCount > 0) {anim.frameCount--}
	animation = window.setTimeout(animateHeal.bind(null, anim), 33);
};

var animateVictory = function (anim) {
	var v = anim.player
	var l = (anim.player ? 0 : 1);

	// default values
	if (anim.script === undefined) {anim.script = [
		'focusLoser', 'playHit', 'showDamage', 'loserHP',
		'playLose', 'loserMaxHP', 'loserName', 'loserImage',
		'focusVictor', 'playHeal', 'victorHP'
	]}
	if (anim.startHPScale === undefined) {anim.startHPScale = Math.max(anim.loserStartMaxHP, anim.victorStartMaxHP, 1)}
	if (anim.loserImageScale === undefined) {anim.loserImageScale = 1}
	if (anim.loserImageRotate === undefined) {anim.loserImageRotate = 0}

	// advance script
	if (anim.script[0] === 'focusLoser' && (anim.loserFocussed || config.view !== 'tiny')) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'playHit' && anim.hitPlayed) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'showDamage' && anim.damageShown) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'loserHP' && anim.loserStartHP <= 0) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'playLose' && anim.losePlayed) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'loserMaxHP' && anim.loserStartMaxHP <= 0) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'loserName' && anim.namesDrawn) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'loserImage' && anim.loserImageScale <= 0) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'focusVictor' && (anim.victorFocussed || config.view !== 'tiny')) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'playHeal' && (anim.healPlayed || anim.victorStartHP >= anim.victorEndHP)) {
		anim.script.shift();
		anim.frameCount = undefined;
	}
	if (anim.script[0] === 'victorHP' && anim.victorStartHP >= anim.victorEndHP) {
		anim.script.shift();
		anim.frameCount = undefined;
	}

	switch (anim.script[0]) {
		case 'focusLoser':
			focusPlayer(l);

			// allow time after view has re-focussed
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 10;
			}

			if (anim.frameCount <= 0) {
				anim.loserFocussed = true;
			}
			break;
		case 'playHit':
			focusPlayer(l);

			// play hit sound
			if (sounds.hit.length) {sounds.hit[Math.floor(Math.random() * sounds.hit.length)].play()}
			anim.hitPlayed = true;
			break;
		case 'showDamage':
			focusPlayer(l);

			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 15;
			}

			// update animation state
			$('div.imageArea.player' + (l ? 'Right' : 'Left') + ':visible > div.damageText').remove();
			if (anim.frameCount > 0) {
				$('div.imageArea.player' + (l ? 'Right' : 'Left') + ':visible').each(function () {
					var height = $(this).innerHeight() * (15 + Math.log10(Math.max(anim.damage, 1))) / 60;
					var color = (anim.crit ? 'hsl(' + Math.floor(Math.random() * 360) + ', 100%, 75%)' : 'red');
					var scaledText = scaleText([anim.damage.toLocaleString()], $(this).innerWidth(), height, color, 'black', '0 0 1px')[0];
					$(scaledText).addClass('damageText').css('top', (anim.frameCount - 10) * height / 15);
					$(this).append(scaledText);
				});
			} else {
				anim.damageShown = true;
			}

			// update HP bar
			drawHPBar(l, anim.startHPScale, anim.loserStartMaxHP, 0, anim.loserStartHP);
			break;
		case 'loserHP':
			focusPlayer(l);

			// remove loser's HP
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 5 * Math.ceil(Math.log10(anim.loserStartHP));
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.loserStartHP -= Math.round(anim.loserStartHP / anim.frameCount);
			} else {
				anim.loserStartHP = 0;
			}

			// update HP bar
			drawHPBar(l, anim.startHPScale, anim.loserStartMaxHP, 0, anim.loserStartHP);
			break;
		case 'playLose':
			focusPlayer(l);

			// play lose sound
			if (sounds.lose.length) {sounds.lose[Math.floor(Math.random() * sounds.lose.length)].play()}
			anim.losePlayed = true;
			break;
		case 'loserMaxHP':
			focusPlayer(l);

			// remove loser's max HP
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 5 * Math.ceil(Math.log10(anim.loserStartMaxHP));
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.loserStartMaxHP -= Math.round(anim.loserStartMaxHP / anim.frameCount);
			} else {
				anim.loserStartMaxHP = 0;
			}

			// update HP bar
			drawHPBar(l, anim.startHPScale, anim.loserStartMaxHP, 0);
			break;
		case 'loserName':
			focusPlayer(l);

			// remove loser's name
			var state = getState();
			drawNames(state.player[0].name, state.player[1].name);
			anim.namesDrawn = true;
			break;
		case 'loserImage':
			focusPlayer(l);

			// remove loser's image
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 10;
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.loserImageScale -= anim.loserImageScale / anim.frameCount;
				anim.loserImageRotate += 1;
			} else {
				anim.loserImageScale = 0;
			}

			// update image
			$('div.playerImage.player' + (l ? 'Right' : 'Left') + ':visible').each(function () {
				$(this).css('transform', 'scale(' + anim.loserImageScale + ') rotate(' + anim.loserImageRotate + 'rad)');
			});
			break;
		case 'focusVictor':
			focusPlayer(v);

			// allow time after view has re-focussed
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 10;
			}

			if (anim.frameCount <= 0) {
				anim.victorFocussed = true;
			}
			break;
		case 'playHeal':
			focusPlayer(v);

			// play heal sound
			if (sounds.heal.length) {sounds.heal[Math.floor(Math.random() * sounds.heal.length)].play()}
			anim.healPlayed = true;
			break;
		case 'victorHP':
			focusPlayer(v);

			// boost victor's HP
			if (!isFinite(anim.frameCount)) {
				anim.frameCount = 2 * Math.ceil(Math.log10(anim.victorEndHP - anim.victorStartHP));
			}

			// update animation state
			if (anim.frameCount > 0) {
				anim.startHPScale += Math.round((anim.victorEndMaxHP - anim.startHPScale) / anim.frameCount);
				anim.victorStartMaxHP += Math.round((anim.victorEndMaxHP - anim.victorStartMaxHP) / anim.frameCount);
				anim.victorStartHP += Math.round((anim.victorEndHP - anim.victorStartHP) / anim.frameCount);
			} else {
				anim.startHPScale = anim.victorEndMaxHP;
				anim.victorStartMaxHP = anim.victorEndMaxHP;
				anim.victorStartHP = anim.victorEndHP;
			}

			// update HP bars
			drawHPBar(l, anim.startHPScale, 0, 0);
			drawHPBar(v, anim.startHPScale, anim.victorStartMaxHP, anim.victorStartHP);
			break;
		default:
			focusPlayer(v);

			// finish animation
			updateDisplay();
			animation = undefined;
			return;
	}

	// schedule next frame
	if (isFinite(anim.frameCount) && anim.frameCount > 0) {anim.frameCount--}
	animation = window.setTimeout(animateVictory.bind(null, anim), 33);
};
