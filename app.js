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
	this.hideAll = false;
	this.lastTurned = 0;

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

		this.autoTasks();
	}

	this.turnAround = function() {
		this.setAcceleration(1);
		this.setDirection(Math.abs(this.currentDir - 123 - 10));
		this.setAcceleration(0);
	}

	this.snakeList = snakes;

	this.mySnake = snake;

	this.getNearestSnake = function(callback) {
		this.snakeList = snakes;
		this.mySnake = snake;

		snakeList = this.snakeList;
		mySnake = this.mySnake;

		var blocks = 0;
		var sId = 0;
		for(var i = 0; i < snakeList.length; i++) {
			if(snakeList[i].xx != mySnake.xx && snakeList[i].yy != mySnake.yy) {
				var tblocks = (Math.abs(mySnake.xx - snakeList[i].xx) + Math.abs(mySnake.yy - snakeList[i].yy)) / 2;
				if(tblocks < blocks || blocks == 0) {
					blocks = tblocks;
					sId = snakeList[i].id;
				}

				for(var j = 0; j < snakeList[i].pts.length; j++) {
					var tblocks = (Math.abs(mySnake.xx - snakeList[i].pts[j].xx) + Math.abs(mySnake.yy - snakeList[i].pts[j].yy)) / 2;
					if(tblocks < blocks) {
						blocks = tblocks;
						sId = snakeList[i].id;
					}
				}
			}
		}

		callback({ blocksAway: blocks, thickness: 0, snakeId: sId }); // todo
	}

	this.iWantAll = function() {
		localStorage.edttsg = 1;
		document.getElementById("fbh").style.display = "none";
		document.getElementById("twth").style.display = "none";
		document.getElementById("grqh").style.display = "none";
		document.getElementById("clq").style.display = "none";
		document.getElementById("tips").style.display = "none";
		document.getElementById("logo").style.display = "none";
		document.getElementsByTagName("iframe")[0].style.display = "none";
		setInterval(function() {
			document.getElementById("login").style.transform = "scale(1, 1)";
		}, 1000);
		window.oncontextmenu = function() {
			return true;
		};
	}

	this.getNextDirection = function() {

	}

	this.autoBot = function() {
		var parent = this;
		var latestSnakeTurnedOn = 0;
		this.log("Started autoBot!");
		function doBot() {
			parent.getNearestSnake(function(data) {
				document.getElementsByClassName("nsi")[19].innerHTML = 'Nearest snake: ' + Math.round(data.blocksAway / 50) + " blocks away";
				if(data.blocksAway < (data.thickness + 210) && data.blocksAway != 0 && ((((Date.now() / 1000) % 60) - parent.lastTurned) > 4 || data.snakeId != latestSnakeTurnedOn)) {
					parent.lastTurned = (Date.now() / 1000) % 60;
					parent.turnAround();
				}
				setTimeout(function(){doBot();}, 500);
			});
		}
		doBot();
	}

	this.log = function(txt) {
		console.info("[SlitherBot] [" + version + "] " + txt);
	}

	this.autoTasks = function() {
		var parent = this;
		setInterval(function() {
			if(parent.hideAll) parent.hideSnakes();
		}, 500);
	}

	this.hideSnakes = function() {
		this.snakes = snakes; // i want to keep 'em!
		snakes = [snake];
	}
}

var bot = new SlitherBot();

bot.iWantAll();

window.onmousemove = null;

document.onkeypress = function(e) {
	if(String.fromCharCode(e.which) == "t") {
		bot.turnAround();
	} else if(String.fromCharCode(e.which) == "b") {
		bot.bot();
	} else if(String.fromCharCode(e.which) == "s") {
		bot.autoBot();
	} else if(String.fromCharCode(e.which) == "h") {
		bot.hideAll = true;
	}
}
