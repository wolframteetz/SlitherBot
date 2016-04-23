// ==UserScript==
// @name         SlitherBot
// @namespace    SlitherBot
// @version      0.1-ALPHA1
// @author       j0ll3
// @match        http://slither.io/
// @grant        none
// ==/UserScript==

var version = "0.1-ALPHA1";

function SlitherBot() {
	this.name = "SlitherBot v" + version;

	this.botOn = true;
	this.currentDir = 0;

	this.setDirection = function(deg) {
		if(deg > 240) deg = deg - 240;
		if(deg > 480) return; // too big!
		var h = new Uint8Array(1);
		h[0] = 1 == 1 ? deg : 254;
		ws.send(h);
		this.currentDir = deg;
	}

	this.setAcceleration = function(type) {
		var h = new Uint8Array(1);
		h[0] = 1 == type ? 253 : 254;
		ws.send(h);
	}

	this.bot = function() {
		this.log("Started the bot!");
		
		this.setDirection(this.currentDir);
	}

	this.turnAround = function() {
		this.setAcceleration(1);
		this.setDirection(Math.abs(this.currentDir - 123 - 10));
		this.setAcceleration(0);
	}

	this.snakeList = snakes;

	this.mySnake = snake;

	this.getNearestSnake = function() {
		this.snakeList = snakes;
		this.mySnake = snake;
		var blocks = 0;
		for(var i = 0; i < this.snakeList.length; i++) {
			if(this.mySnake.xx == this.snakeList[i].xx && this.mySnake.yy == this.snakeList[i].yy) /**/;
			else {
				var tblocks = (Math.abs(this.mySnake.xx - this.snakeList[i].xx) + Math.abs(this.mySnake.yy - this.snakeList[i].yy)) / 2;
				if(tblocks < blocks || blocks == 0) blocks = tblocks;
			}
		}
		return blocks;
	}

	this.getNextDirection = function() {

	}

	this.autoBot = function() {
		var parent = this;
		setInterval(function() {
			if(parent.getNearestSnake() < 80) {
				parent.turnAround();
			}
			console.log(parent.getNearestSnake());
		}, 1000);
	}

	this.log = function(txt) {
		console.info("[SlitherBot] [" + version + "] " + txt);
	}
}

var bot = new SlitherBot();

window.onmousemove = null;

document.onkeypress = function(e) {
	if(String.fromCharCode(e.which) == "t") {
		bot.turnAround();
	} else if(String.fromCharCode(e.which) == "b") {
		bot.bot();
	} else if(String.fromCharCode(e.which) == "s") {
		bot.autoBot();
	}
}
