// ==UserScript==
// @name         SlitherBot
// @namespace    SlitherBot
// @version      0.11
// @author       j0ll3, wolframteetz
// @match        http://slither.io/
// @grant        none
// ==/UserScript==

var version = "0.11";

// This is a very passive version of the bot with various fixes.
// It never accelerates, tries to stay away from snakes and eats.

// Improvement list
//
// Size of the Food bubbles
// TSP - Like "General direction"
// Escape hunting snakes function
// Hunt snakes functions
// a) Cut path function
// b) Circle snake function
// Go to border function (safe there to collect, you can't be circled easily...

function SlitherBot() {
	this.name = "SlitherBot v" + version;

	this.botOn = true;
	this.currentDir = 0;
	this.hideAll = false;
	this.lastTurned = 0;
//	this.currentFood;

	this.setDirection = function(deg) {
        while (deg<0) deg = deg + 240;
        while (deg>240) deg = deg - 240;
		var h = new Uint8Array(1);
		h[0] = deg;
		ws.send(h);
		this.currentDir = deg;
	};

	this.setAcceleration = function(type) {
		var h = new Uint8Array(1);
		h[0] = 1 == type ? 253 : 254;
		ws.send(h);
	};

	this.bot = function() {
		this.log("Started the bot!");
		this.setDirection(this.currentDir);
		this.autoTasks();
	};

    this.snakeList = snakes;
	this.mySnake = snake;

	this.getNearestSnake = function(callback) {
		this.snakeList = snakes;
		this.mySnake = snake;

		snakeList = this.snakeList;
		mySnake = this.mySnake;

		var blocks = 0;
		var sId = 0;
        var nsdXX = 0;
        var nsdYY = 0;
		for(var i = 0; i < snakeList.length; i++) {
			if(snakeList[i].xx != mySnake.xx && snakeList[i].yy != mySnake.yy) {
				var tblocks = (Math.abs(mySnake.xx - snakeList[i].xx) + Math.abs(mySnake.yy - snakeList[i].yy)) / 2;
				if(tblocks < blocks || blocks === 0) {
					blocks = tblocks;
                    nsdXX = mySnake.xx - snakeList[i].xx;
                    nsdYY = mySnake.yy - snakeList[i].yy;
					sId = snakeList[i].id;
				}

				for(var j = 0; j < snakeList[i].pts.length; j++) {
					tblocks = (Math.abs(mySnake.xx - snakeList[i].pts[j].xx) + Math.abs(mySnake.yy - snakeList[i].pts[j].yy)) / 2;
					if(tblocks < blocks) {
						blocks = tblocks;
                        nsdXX = mySnake.xx - snakeList[i].pts[j].xx;
                        nsdYY = mySnake.yy - snakeList[i].pts[j].yy;
						sId = snakeList[i].id;
					}
				}
			}
		}

		callback({ blocksAway: blocks, thickness: 0, snakeId: sId, nearestSnakeDXX : nsdXX, nearestSnakeDYY : nsdYY }); // todo
	};

	this.getNearestAndSafestFood = function(callback) {
		this.mySnake = snake;
		this.currentFood = foods;

		mySnake = this.mySnake;
		c_food = this.currentFood;

        console.log(c_food[0]);
        console.log(mySnake.xx + ":" + mySnake.yy);

		var data = { xx: 0, yy: 0 };
		var distance = 0;

		for(var i = 0; i < c_food.length; i++) {
			if(c_food[i]) {
				//if(this.isSafeThere(c_food[i].xx, c_food[i].yy)) {

					var c_dist = (Math.abs(mySnake.xx - c_food[i].rx) + Math.abs(mySnake.yy - c_food[i].ry)) / 2;
					if(distance === 0 || (c_dist > 42 && c_dist < distance) ) { // Minimum dist to prevent circling around food
						distance = c_dist;
						data = { xx: c_food[i].rx, yy: c_food[i].ry, id: c_food[i].id };
					}
				//}
			}
		}
		callback(data);
	};

	this.isSafeThere = function(xx, yy) {
		this.snakeList = snakes;
		snakeList = this.snakeList;

		for(var i = 0; i < snakeList.length; i++) {
			if(Math.abs(xx - snakeList[i].xx) > 30 || Math.abs(yy - snakeList[i].yy) > 30) return false;
		}

		return true;
	};

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
	};

	this.getNextDirection = function() {

	};

	this.foodExists = function(id) {
		foodList = foods;

		for(var i = 0; i < foodList.length; i++) {
			if(foodList[i]) {
				if(foodList[i].id == id) {
					return true;
				}
			}
		}

		return false;
	};
 
	this.autoBot = function() {
		var parent = this;
		var latestSnakeTurnedOn = 0;

		var targetedFood = 0;
		var targetedFoodX = 0;
		var targetedFoodY = 0;

		this.log("Started autoBot!");
		function doBot() {
			parent.getNearestSnake(function(data) {
                var distToNextSnake = (Math.abs(data.nearestSnakeDYY) + Math.abs(data.nearestSnakeDXX));
                if ( distToNextSnake < 500 && distToNextSnake > 0 ) { // too close, and there is a snake (none visible == 0)
                    document.getElementsByClassName("nsi")[19].innerHTML = 'Running from snake at ' + Math.round(data.nearestSnakeDXX) + "," + Math.round(data.nearestSnakeDYY);
                    document.getElementsByClassName("nsi")[21].innerHTML = 'No time for food';
                    latestSnakeTurnedOn = data.snakeId;
                    var rad = Math.atan2(data.nearestSnakeDYY, data.nearestSnakeDXX);
                    var deg = rad * (180 / Math.PI);
                    var slitherDeg = deg / 1.286; // degrees / 1.286 is the conversion to "SlitherDeg" 
                    parent.setDirection(slitherDeg);
//					latestSnakeTurnedOn = data.snakeId;
//					parent.lastTurned = (Date.now() / 1000);
				} else {
                    document.getElementsByClassName("nsi")[19].innerHTML = 'Collecting food';
					parent.getNearestAndSafestFood(function(data) {
						//if((((Date.now() / 1000) ) - parent.lastTurned) > 6) { // 6
							if(targetedFood !== 0 && foodExists(targetedFood)) {
								data.xx = targetedFoodX;
								data.yy = targetedFoodY;
							}

							if(data.xx !== 0 && data.yy !== 0) {
								var dX = data.xx - parent.mySnake.xx;
								var dY = data.yy - parent.mySnake.yy;

								targetedFoodX = data.xx;
								targetedFoodY = data.yy;

								var rad = Math.atan2(dY, dX);
								var deg = rad * (180 / Math.PI);
								var slitherDeg = deg / 1.286; // degrees / 1.286 is the conversion to "SlitherDeg"

								document.getElementsByClassName("nsi")[21].style.color = '#fff';
								document.getElementsByClassName("nsi")[21].style.font = 'Arial';
								document.getElementsByClassName("nsi")[21].width = "250px";
								document.getElementsByClassName("nsi")[21].innerHTML = "FoodDelta " + Math.round(dX) + "<br />" + Math.round(dY) + "<br />Deg : " + Math.round(slitherDeg);

								parent.setDirection(slitherDeg);
							}
						//}
					});
				}
				setTimeout(function(){doBot();}, 100);
			});
		}
		doBot();
	};

	this.log = function(txt) {
		console.info("[SlitherBot] [" + version + "] " + txt);
	};

	this.autoTasks = function() {
		var parent = this;
		setInterval(function() {
			if(parent.hideAll) parent.hideSnakes();
		}, 100);
	};

	this.hideSnakes = function() {
		this.snakes = snakes; // i want to keep 'em!
		snakes = [snake];
	};
}

var bot = new SlitherBot();

bot.iWantAll();

window.onmousemove = null;

document.onkeypress = function(e) {
	if(String.fromCharCode(e.which) == "b") {
		bot.bot();
	} else if(String.fromCharCode(e.which) == "s") {
		bot.autoBot();
	} else if(String.fromCharCode(e.which) == "h") {
		bot.hideAll = true;
	}
};
