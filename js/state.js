var stateCookieName = 'BitclashState';
var localState;

var getState = function () {
	if (localState) {return localState}

	var state;
	try {state = JSON.parse(getCookie(stateCookieName))} catch (e) {state = {}}

	//! migrate states created before last reset timestamp existed
	if (state.hasOwnProperty("updated") && !state.hasOwnProperty("reset")) {state.reset = state.updated}

	if (!state.updated) {state.updated = $.now()}
	if (!state.reset) {state.reset = 0}

	// make sure we have two players
	if (!Array.isArray(state.player)) {state.player = []}
	while (state.player.length < 2) {state.player.push({})}
	state.player = state.player.slice(0, 2);

	for (var p in state.player) {
		// validate player
		if ([undefined, null, ''].indexOf(state.player[p].image) != -1) {state.player[p].image = undefined}
		if (!state.player[p].overrideImage) {state.player[p].overrideImage = false}
		if (!state.player[p].defender) {state.player[p].defender = false}
		if (!isFinite(state.player[p].maxHP) || state.player[p].maxHP <= 0) {state.player[p].maxHP = 0}
		if (!isFinite(state.player[p].currentHP) || state.player[p].currentHP <= 0) {state.player[p].currentHP = 0}
		if (state.player[p].currentHP > state.player[p].maxHP) {state.player[p].currentHP = state.player[p].maxHP}
	}

	if (!Array.isArray(state.fight)) {state.fight = []}
	if (!Array.isArray(state.queue)) {state.queue = []}

	localState = state;
	return localState;
};

var resetState = function (timestamp, index, player) {
	var state = getState();
	if (state.reset < timestamp) {
		setPlayer(index, player);
		setPlayer((index ? 0 : 1));
		setFight();
		state.reset = timestamp;
		setCookie(stateCookieName, JSON.stringify(state), true);
	}
};

var setPlayer = function (index, player) {
	if (player === undefined) {
		player = {
			'id'            : undefined,
			'name'          : undefined,
			'image'         : undefined,
			'overrideImage' : false,
			'defender'      : false,
			'maxHP'         : 0,
			'currentHP'     : 0
		};
	}
	var state = getState();
	if (state.player[index] === undefined) {return}
	state.player[index] = player;
	state.updated = $.now();
	setCookie(stateCookieName, JSON.stringify(state), true);
};

var toggleImage = function (index) {
	if ([0, 1].indexOf(index) == -1) {return}
	var state = getState();
	state.player[index].overrideImage = !(state.player[index].overrideImage);
	state.updated = $.now();
	setCookie(stateCookieName, JSON.stringify(state), true);
};

var setFight = function (fight) {
	var state = getState();
	if (!Array.isArray(fight)) {fight = []}
	state.fight = fight;
	state.updated = $.now();
	setCookie(stateCookieName, JSON.stringify(state), true);
};

var dequeueHit = function () {
	var state = getState();
	var hit = state.fight.shift();
	if (hit) {
		state.updated = $.now();
		setCookie(stateCookieName, JSON.stringify(state), true);
	}
	return hit;
};

var queueChallenger = function (userID, username, bits) {
	bits = parseInt(bits);
	if (isFinite(bits)) {
		var state = getState();
		var index = state.queue.length - 1;
		if (index >= 0 && state.queue[index].id === userID && state.queue[index].bits + bits <= 100000) {
			// combine cheers to prevent spamming
			state.queue[index].bits += bits;
		} else {
			state.queue.push({
				'id'   : userID,
				'name' : username,
				'bits' : (bits)
			});
		}
		state.updated = $.now();
		setCookie(stateCookieName, JSON.stringify(state), true);
	}
};

var dequeueChallenger = function () {
	var state = getState();
	var challenger = state.queue.shift();
	if (challenger) {
		state.updated = $.now();
		setCookie(stateCookieName, JSON.stringify(state), true);
	}
	return challenger;
};
