var C=Cookies = {
	values:{},
	path:"\/",
	create:function (name,value,days,path) {
		var date= new Date();
        date.setTime(date.getTime()+(days||365)*24*60*60*1000);
		document.cookie = name+"="+escape (value )+"; expires="+date.toGMTString()+";path="+this.path;
	},
	init:function (path) {
		this.path = path || location.pathname.substr(0,location.pathname.lastIndexOf("\/")+1);
		var allCookies = document.cookie.split ('; ');
		for (var i=0;i<allCookies.length;i++) {
			var cookiesPair = allCookies[i].split('=');
			this.values[cookiesPair[0]] = unescape(cookiesPair[1]);
		}
	},
	read:function (name) {
		return this.values[name]||"";
	},
	erase:function (name) {
		this.create(name,"",-1);
		this.values[name]=null;
	}
}
C.init();

var setScore = function(){
    var hs = parseInt(C.read("highscore"))||0, f = function (p){
        document.getElementById("score").innerHTML = document.getElementById("the_score").innerHTML = p;
        if (p > hs){
            document.getElementById("highscore").innerHTML = hs = p;
            C.create("highscore",hs);
        }
    }
	f.reset = function(){
		hs = -1;
		C.erase('highscore');
		f(0);
	}
    f(0);
    document.getElementById("highscore").innerHTML = document.getElementById('the_highscore').innerHTML = hs;
    return f;
}();
function getIndex (arr,o){
    for (var i = arr.length; i--;){
        if (arr[i] == o)
            return i;
    }
    return -1;
}
function now(){
    return +new Date;
}
function collision(a,b){
    if (!a || !b) return false;
	return (Math.abs(a.y-b.y)-a.r-b.r<=0 && Math.abs(a.x-b.x)-a.r-b.r<=0);
}
function Map(){
    this.list = [];
    this.map = {};
}
Map.prototype.clear = function(){
    this.list = [];
    for (var i=this.list.length; i--;){
		delete this.list[i];
    }
    this.map = {};
}
Map.prototype.blockSize = 10;
Map.prototype.insert = function(o){
    var mx = Math.floor(o.x/this.blockSize), my = Math.floor(o.y/this.blockSize), part = this.map[mx+":"+my], l = this.list, i=l.length;
    for (;i--;){//check if it's in the list
        var item = l[i];
        if (item.o == o){
            if (item.mx+":"+item.my == mx+":"+my){
                return;
            }
            var p = this.map[item.mx+":"+item.my], index = getIndex(p,o);
            if (index > -1)
                p.splice(index,1); // remove if exists
            delete item;
            break;
        }
    }
    if (i < 0) //not in the list, put it in
        l.push({"o":o,"mx":mx,"my":my});
    if (!part){
        part = this.map[mx+":"+my] = [];
    }
    part.push(o);
};
Map.prototype.remove = function(o){
    if (!o)return;
    var mx = Math.floor(o.x/this.blockSize), my = Math.floor(o.y/this.blockSize), part, l = this.list, i;
    for (i=l.length; i--;){
        if (l[i].o == o){
            var item = l.splice(i,1)[0];
            mx = item.mx;
            my = item.my;
            break;
        }
    }
    part = this.map[mx+":"+my];
    if (!part){
        return;
    }
    for (i=part.length; i--;){
        if (part[i] == o){
            var x = part.splice(i,1);
            delete x[0];
            delete x;
            break;
        }
    }
};
Map.prototype.checkCollisions = function(o){
    if (!o){
        return [];
    }
    var parts = this.checkNearby(o,1), collisions = [];
    for (var i=parts.length; i--;){
        var p = parts[i];
        if (p != o && collision(o,p)){
            collisions.push(p);
        }
    }
    return collisions;
};
Map.prototype.checkNearby = function(o,r){
    if (this.list.length < 1 || !o){
        return [];
    }
    var mx = Math.floor(o.x/this.blockSize), my = Math.floor(o.y/this.blockSize), parts = [], l = this.list;
    for (var i=r+1;i-->-r;){
        for (var j=r+1;j-->-r;){
            var mp = this.map[(mx+i)+":"+(my+j)];
            if (mp){
                parts = parts.concat(mp);
            }
        }
    }
    return parts;
};
Map.prototype._getBorder = function(mx,my,r){
    var parts = [], abs = Math.abs, x=0;
    for (var i=r+1;i-->-r;){
        var air = abs(i)==r;
        for (var j=r+1;j-->-r;){
            if (air || abs(j)==r){
                x++;
                var mp = this.map[(mx+i)+":"+(my+j)];
                if (mp){
                    parts = parts.concat(mp);
                }
            }
        }
    }
    return parts;
}
Map.prototype.getNearest = function (o, m){ //not exact, but not bad for the purpose
    var l = this.list;
    if (l.length < 1){
        return null;
    }
    if (l.length == 1){
        return l[0].o;
    }
    var self = this, mx = Math.floor(o.x/this.blockSize), my = Math.floor(o.y/this.blockSize), collisions = [], dist = 1000, nearest = null, r=0, mr = Math.ceil((m||200)/this.blockSize), parts=[];
    while (r++<mr && parts.length == 0){
        parts = this._getBorder(mx,my,r);
    }
    for (var i=parts.length; i--;){
        var p = parts[i],d;
        if (p === o)
            continue;//ignore self
        d=distance(o,p);
        if (d < dist){
            nearest = p;
            dist = d;
        }
    }
    //if (dist <= max)
    return nearest;
};

var enemymap = new Map(),
    enemyshots = new Map(),
    playermap = new Map(),
    playershots = new Map(),
    effects = new Map(),
    game = null,
    gfx = null,
    gfx2 = null,
    rendering = false,
    keys = [],
    mouse = {left:false,right:false,x:0,y:0, focus:false, dobomb :false},
	crosshair = false;

function getX(el) {
    return (el.offsetParent ? getX(el.offsetParent) : 0) + parseInt(el.offsetLeft);
}
function getY(el) {
    return (el.offsetParent ? getY(el.offsetParent) : 0) + parseInt(el.offsetTop);
}
function keydown (e){
    e = e || window.event;
    var unicode=e.keyCode? e.keyCode : e.charCode;
    keys[unicode+""] = true;
	var keyz = '';
	for (var k in keys){
		if (keys[k])
			keyz+=k+',';
	}
	document.getElementById('keys').innerHTML = keyz;

    if (!game)
        return;
    return true;
}
function keyup (e){
    e = e || window.event;
    var unicode=e.keyCode? e.keyCode : e.charCode;
    keys[unicode+""] = false;
	var keyz = '';
	for (var k in keys){
		if (keys[k])
			keyz+=k+',';
	}
	document.getElementById('keys').innerHTML = keyz;
    if (!game)
        return;
    return true;
}
function mousedown (e){
    e = e || window.event;
    switch (e.which||e.button){
        case 1:
            mouse.left = true;
            break;
        case 2:
            mouse.right = true;
            mouse.dobomb = true;
            break;
        default:
    }
	var data = mouse.left?'left,':'';
	data += mouse.right?'right,':'';
	data += 'x:'+mouse.x+',y:'+mouse.y;
	document.getElementById('mouse').innerHTML = data;

    try {
    document.body.focus();
    }catch(err){}
    if (!game)
        return;
    return false;
}
function blur(e){
    if (!game)
        return;
    togglePause(true);
}
function mouseup (e){
    e = e || window.event;
    switch (e.which||e.button){
        case 1:
            mouse.left = false;
            break;
        case 2:
            mouse.right = false;
            mouse.dobomb = false;
            break;
        default:
    }
	var data = mouse.left?'left,':'';
	data += mouse.right?'right,':'';
	data += 'x:'+mouse.x+',y:'+mouse.y;
	document.getElementById('mouse').innerHTML = data;
    if (!game)
        return;
    return true;
}
function mousemove (e){
    e = e || window.event;
    mouse.x = (e.pageX||(e.clientX+document.body.scrollLeft))-getX(document.getElementsByTagName("canvas")[0]);
    mouse.y = (e.pageY||(e.clientY+document.body.scrollTop))-getY(document.getElementsByTagName("canvas")[0]);
	
	var data = mouse.left?'left,':'';
	data += mouse.right?'right,':'';
	data += 'x:'+mouse.x+',y:'+mouse.y;
	document.getElementById('mouse').innerHTML = data;
	//document.getElementById('hori').style.top = mouse.y+"px";
	//document.getElementById('vert').style.left = mouse.x+"px";
    if (!game)
        return;
    return false;
}
document.onkeydown = keydown;
document.onkeyup = keyup;
document.onmousedown = mousedown;
document.onblur = blur;
document.oncontextmenu = function(e){
    if (!game)
        return;
    e=e||window.event;
    try {
        e.cancelBubble = true;
        e.preventDefault();
        e.stopPropagation();
    }catch(err){}
    mouse.dobomb = true;
    return false;
};
//document.onfocus = focus;
document.onmouseup = mouseup;
document.onmousemove = mousemove;

function buttonToggle (e){
	var classes = e.className.split(' ');
	var isDisabled = false;
	for (var i = classes.length; i--;){
		if (!classes[i]){
			classes.splice(i,1);
			continue;
		}
		if (classes[i] === 'disabled'){
			isDisabled = true;
			classes.splice(i,1);
			break;
		}
	}
	if (!isDisabled)
		classes.push('disabled');
	e.className = classes.join(' ');
}

function startGame (numPlayers){
    //clearInterval(game);
    resetSequences();
    //game = null;
    endEffects();
    enemymap.clear();
    enemyshots.clear();
    playermap.clear();
    playershots.clear();
    effects.clear();
	
	document.getElementById('the_highscore').innerHTML = document.getElementById("highscore").innerHTML;
    
    numPlayers = numPlayers || 1;
    for (var i = numPlayers; i--;){
        var p = new Player;
        p.x = w/2;
        p.y = h/2;
        Fireworks(p,100,500);
        playermap.insert(p);
    }
	setScore(0);
    game = setInterval(runGame,40);//25 fps
	gameAudio.play('Game_start');
}

function drawPlayerLives(c,p,sx,sy){
    sx = sx || w/2-10;
    sy = sy || 15;
	c.save();
	c.strokeStyle=p.color;
	for (var i=p.lives;i--;){
        c.save();
		c.translate(sx-20*i,sy);
        c.rotate(pi);
		Player.draw(c);
        c.restore();
	}
	c.restore();
}
function drawPlayerBombs(c,p,sx,sy){
    sx = sx || w/2+10;
    sy = sy || 15;
    var pi = Math.PI,
        pi2 = pi*2;
	c.save();
	c.strokeStyle=p.color;
	for (i=p.bombs;i--;){
		c.save()
		c.translate(sx+20*i,sy);
		c.fillStyle="#fff";
		c.beginPath()
		c.arc(0,0,2,0,pi2,true);
		c.fill();
		c.closePath();
		c.beginPath();
		c.arc(0,0,6,0,pi2,true);
		c.moveTo(0,6);
		c.lineTo(0,8);
		c.moveTo(0,-6);
		c.lineTo(0,-8);
		c.moveTo(6,0);
		c.lineTo(8,0);
		c.moveTo(-6,0);
		c.lineTo(-8,0);
		c.rotate(pi/4);
		c.moveTo(0,6);
		c.lineTo(0,8);
		c.moveTo(0,-6);
		c.lineTo(0,-8);
		c.moveTo(6,0);
		c.lineTo(8,0);
		c.moveTo(-6,0);
		c.lineTo(-8,0);
		c.stroke();
		c.closePath();
		c.restore();
	}
	c.restore();
}
function drawLivesAndBombs(c){
    var l = playermap.list, len = l.length;
    //if (len > 2){
    //    
    //}else if (len == 2){
    //    //drawPlayerLives(c,l[0].o.lives);
    //    
    //}else if (len == 1){
    if (len < 1)
        return;
    drawPlayerLives(c,l[0].o);
    drawPlayerBombs(c,l[0].o);
    
    //}else {
    //    return;
    //}
}
function doMoves(m){
    var l = m.list;
    for (var i = l.length; i--;){
        var o = l[i].o;
        if (o.invuln > 0)
            o.invuln--;
        m.remove(o);
        if (o.move()){
            m.insert(o);
        }
    }
}
function doDraws(l,c){
    for (var i = l.length; i--;)
        l[i].o.draw(c);
}
function avoid (o,c){
    var ang = fixAngle(angleTo(o,c)),
        a = o.angle,
        pi = Math.PI;
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi*2)<pi)){
        o.angle-=0.15;
    }else {
        o.angle+=0.15;
    }
    insideBoundaries(o);
}
function enemyshoot (e,p){
    var s = new Shot(e,p);
    s.color = e.color;
    s.speed = (e.maxSpeed||e.speed)+2;
    enemyshots.insert(s);
}
function runGame (){ // later: to be optimized to use web workers
    var em = enemymap, es = enemyshots, pm = playermap, ps = playershots, ef = effects, l, t = +new Date, r = rendering;
    if (r){
        return;
    }
    rendering = true;
    
    l = em.list; //don't overlap
    for (var i = l.length; i--;){
        var p = l[i].o, col;
        if (p.eaten || p.isnew || p.cantkill > 0){ //if I don't do this then it's liable to screw up the iterations and double up.
            continue;
        }
        col = em.checkCollisions(p)
        if (p.eat){
            for (var j = col.length; j--;){
                var c = col[j];
                if (c.eaten || c.isnew || c.invuln > 0 || c.eat){
                    continue;
                }
                if (p.eat(c)){
                    c.eaten = true; // can't just delete them outright or that would screw up the loop
                }
            }
        }else {
            for (var j = col.length; j--;){
                var c = col[j];
                if (c.eaten || c.isnew || c.invuln > 0){
                    continue;
                }
                avoid(p,c);
            }
        }
    }
    for (var i = l.length; i--;){
        var p = l[i].o;
        if (p.eaten){
            em.remove(p);
        }
        if (p.isnew){
            p.isnew = false;
        }
    }
    doMoves(em);
    doMoves(es);
    doMoves(pm);
    doMoves(ps);
    doMoves(ef);
    l = pm.list;
    for (var i = l.length; i--;){
        var p = l[i].o;
        if (p.invuln)
            continue;
        if (em.checkCollisions(p).length > 0 || es.checkCollisions(p).length > 0){
            if (p.die()){
                rendering = false;
				return endGame();
			}
            em.clear();
            es.clear();
            ps.clear();
        }
    }
    l = em.list;
    for (var i = l.length; i--;){
        var p = l[i].o,
            collisions;
        if (p.invuln > 0)
            continue;
        collisions = ps.checkCollisions(p)
        if (collisions.length > 0){
            var dead = false;
            for (var j = collisions.length; j--;){
                if (!dead){
                    p.hp-=collisions[j].hp;
                    if (p.hp < 1){
                        dead = true;
                        collisions[j].source.addPoints(p.points);
                        if (!p.cantkill){
                            p.kill();
                            em.remove(p);
                            Fireworks(p,p.points/5);
                        }
                    }else {
						gameAudio.play('Enemy_red_hit');
					}
                }
                collisions[j].kill();
                ps.remove(collisions[j]);
            }
        }
    }
    for (var i = l.length; i--;){
        var p = l[i].o;
        if (p.deleteme){
            em.remove(p);
        }
    }
    //if mousedown, shoot
    if (mouse.dobomb){
        mouse.dobomb = false;
        pm.list[0].o.bomb();
    }else if (mouse.left){
        l = pm.list;
        for (var i = l.length; i--;){
            var p = l[i].o, shots = p.shoot(mouse);
            for (var j = shots.length; j--;){
                ps.insert(shots[j]);
            }
        }
    }
    //run sequence
	try {
		var seq = getNextSet();
	}catch(err){
		console.log(err);
		endGame();
	}
    for (var i = seq.length; i--;)
        enemymap.insert(seq[i]);
    //if not overlapping with other "run", draw
    var c = document.getElementsByTagName('canvas')[0].getContext('2d');
    c.clearRect(0,0,w,h);
	
	//draw crosshairs
	if (crosshair){
		c.beginPath();
		c.strokeStyle='#44b';
		if (mouse.y > 0 && mouse.y < h){
			c.moveTo(0,mouse.y);
			c.lineTo(w,mouse.y);
		}
		if (mouse.x > 0 && mouse.x < w){
			c.moveTo(mouse.x,0);
			c.lineTo(mouse.x,h);
		}
		c.stroke();
		c.closePath();
	}
	//draw effects
    doDraws(ef.list,c);
	
	//draw sprites
    doDraws(em.list,c);
    doDraws(es.list,c);
    doDraws(pm.list,c);
    doDraws(ps.list,c);
	
	var sprites = 	em.list.length +
					es.list.length +
					pm.list.length +
					ps.list.length +
					ef.list.length;
	document.getElementById('players').innerHTML = pm.list.length;
	document.getElementById('player_shots').innerHTML = ps.list.length;
	document.getElementById('enemies').innerHTML = em.list.length;
	document.getElementById('enemy_shots').innerHTML = es.list.length;
    document.getElementById('effects').innerHTML = ef.list.length;
    document.getElementById('sprites').innerHTML = sprites;
    drawLivesAndBombs(c);
    rendering = false;
}
function togglePause(pause){
    if (game!== null || pause){
        clearInterval(game);
        game = null;
        pauseSequence();
    }else {
        game = setInterval (runGame,40);
        unpauseSequence();
    }
}
function endGame (){
    clearInterval(game);
    resetSequences();
    game = null;
    startEffects();
    try {
    Fireworks(playermap.list[0].o,100,500);
    }catch(err){}
    GoTo("highscores");
	gameAudio.play('Game_over');
	gameAudio.play('Ship_explode');
}
function startEffects(){
    endEffects();
    gfx = setInterval(runEffects,40);
	document.getElementById('players').innerHTML =
		document.getElementById('player_shots').innerHTML =
			document.getElementById('enemies').innerHTML =
				document.getElementById('enemy_shots').innerHTML = 0;
}
function runEffects (){
    var ef = effects, l, r = rendering, re=runEffects;
    if (r || ! fireworks){
        return;
    }
    if (!(++re.step%re.maxStep)){
        Fireworks({x:w*Math.random(),y:h*Math.random()},Math.round(30+20*Math.random()),Math.round(150+100*Math.random()))
        Fireworks({x:w*Math.random(),y:h*Math.random()},Math.round(30+20*Math.random()),Math.round(150+100*Math.random()))
        re.step=0;
    }
	var sprites = ef.list.length;
    document.getElementById('sprites').innerHTML = document.getElementById('effects').innerHTML = sprites;
    rendering = true;
    doMoves(ef);
    var c = document.getElementsByTagName('canvas')[0].getContext('2d');
    c.clearRect(0,0,w,h);
    doDraws(ef.list,c);
    rendering = false;
}
runEffects.step=0;
runEffects.maxStep=10;
function endEffects(){
    clearInterval(gfx);
}

function GoTo (place){
    switch(place){
        case "game":
			gameAudio.stop();
			gameAudio.play('GW2_ingame');
			break;
        case "pause":
        case "settings":
        case "controls":
        case "highscores":
        case "pause":
        case "menu":
			if (document.body.childNodes[0].className == 'game'){
				gameAudio.stop();
				gameAudio.play('GW2_ui');
			}
            break;
        default:
    }
    document.body.childNodes[0].className = place;
}
function init(){
	setScore(0);
	//gameAudio.init();
    startEffects();
}