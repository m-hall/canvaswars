var w = 640,
    h = 480,
    w2 = w/2
    h2 = h/2;
function now(){
    return (new Date).getTime();
}
function fixAngle(a){
	var pi2 = Math.PI*2;
	while(a < 0) a +=pi2;
	while(a > pi2)a-=pi2;
	return a;
}
function angleTo(a,b){
    var pi = Math.PI;
	return fixAngle((a.y>b.y?pi:0)+((a.y==b.y)?(b.x>a.x?pi/2:pi*3/2):Math.atan((a.x-b.x)/(a.y-b.y))));
}
function distance(a,b){
    if (!a || !b){
        return 0;
    }
	return (Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2)));
}
function wallBounce(o){
    var a = fixAngle(o.angle),
        x = o.x,
        y = o.y,
        r = o.r,
        pi = Math.PI,
        pi2 = pi*2;
    if ((x < r && a > pi) || (x > w-r && a < pi)){
        a=pi2-a;
    }
    if ((y < r) || (y > h-r)){
        a=pi-a;
    }
    a = o.angle=fixAngle(a);
    return a;
}
function insideBoundaries(o){
    var r = o.r,
        x = o.x,
        y = o.y;
    if (x<r){
        o.x=r;
    }else if (x>w-r){
        o.x=w-r;
    }
    if (y<r){
        o.y=r;
    }else if (y>h-r){
        o.y=h-r;
    }
}
function move(){
    var a = this.angle,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        moveX=-Math.sin(a)*s,
        moveY=Math.cos(a)*s;
    if (!((x <= r*2 && moveX < 0) || (x >= 800-r*2 && moveX > 0))){
        this.x+=moveX;
    }
    if (!((y <= r*2 && moveY < 0) || (y >= 600-r*2 && moveY > 0))){
        this.y+=moveY;
    }
    insideBoundaries(this);
    return true;
}
function kill(){}
function defaultPrototypes (o){
    o.prototype = {
        x : 0,
        y : 0,
        r : 2,
        color : "#fff",
        speed : 1,
        angle : Math.PI,
        hp : 1,
        maxhp : 1,
        move : move,
    //    draw : draw,
        kill : kill,
        invuln : 15
    }
}
function Shot (s,e){//start and end (have x and y components)
    this.source = s || null;
    if (s && e){
        this.x = s.x;
        this.y = s.y;
        this.angle = angleTo(e,s);
    }
}
defaultPrototypes(Shot);
Shot.prototype.speed = 12;
Shot.prototype.invuln = 0;
Shot.prototype.draw = function(c){
    c.save();
    c.translate(this.x,this.y);
    c.beginPath();
    c.fillStyle=this.color;
    c.arc(0, 0, this.r,0,Math.PI*2,true);
    c.fill();
    c.closePath();
    c.restore();
}
Shot.prototype.kill = function(){
	gameAudio.play('bullet_hitwall');
//    var s = this.source;
//    if (s && s.addPoints)
//        s.addPoints(200);
}
Shot.prototype.move = function(){
    var a = this.angle,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        moveX=-Math.sin(a)*s,
        moveY=-Math.cos(a)*s;
    if (x > r*2 && x < w-r*2){
        this.x+=moveX;
    }else {
        this.kill();
        return false;
    }
    if (y > r*2 && y < h-r*2){
        this.y+=moveY;
    }else {
        this.kill();
        return false;
    }
    return true;
}

function Player (){}
defaultPrototypes(Player);
Player.prototype.keymove = "87";
Player.prototype.keyleft = "65";
Player.prototype.keyright = "68";
Player.prototype.speed = 10;
Player.prototype.r = 8;
Player.prototype.points = 0;
Player.prototype.multiplier = 1;
Player.prototype.kills = 0;
Player.prototype.invuln = 100;
Player.prototype.lives = 3;
Player.prototype.bombs = 3;
Player.prototype.bomb = function(){
    if (this.bombs<1){
        return false;
    }
	gameAudio.play('Fire_smartbomb');
	gameAudio.play('Fire_smartbomb_low');
    this.bombs--;
    enemymap.clear();
    enemyshots.clear();
    playershots.clear();
    effects.clear();
    
    Fireworks(this,100,500);
    return true;
}
Player.prototype.addPoints = function(p){
    var k = ++this.kills, m = this.multiplier;
    if (k==10 || k == 40 || k == 100 || k%1001 == 1000){
        m = ++this.multiplier;
		gameAudio.play('Multiplier');
    }
    var pts = this.points,
        pn = pts + p*m,
        floor = Math.floor;
    if (floor(pn/10000) > floor(pts/10000)){
        this.shotType = Math.round(2+Math.random());
		gameAudio.play('pickup_weapon');
    }
	if (floor(pn/75000)>floor(pts/75000)){
		this.lives++;
		gameAudio.play('pickup_extralife');
	}
	if (floor(pn/100000)>floor(pts/100000)){
		this.bombs++;
		gameAudio.play('pickup_smartbomb');
	}
    this.points = pn;
    setScore(pn);
};
Player.prototype.die = function(){
    this.multiplier = 1;
    this.invuln = 150;
    Fireworks(this,100,500);
	gameAudio.play('Ship_explode');
    return !(--this.lives);
}
Player.prototype.shotType = 1;
Player.prototype.shotDelay = 5;
Player.prototype.shoot= function(m){
    var shots = [];
    if (this.shotDelay || this.invuln > 100){
        return shots;
    }
			gameAudio.play('Fire_Hispeed');
    switch (this.shotType){
        case 3:
            for (var i = 3; i-->-2;){
                var s = new Shot(this,m);
                s.angle+=(Math.PI/35)*i;
                s.move();
                shots.push(s);
            }
            this.shotDelay = 8;
			//Fire_homing
			//gameAudio.play('Fire_homing');

            break;
        case 2:
            for (var i = 2; i-->-1;){
                var s = new Shot(this,m);
                s.angle+=(Math.PI/30)*i;
                s.move();
                shots.push(s);
            }
            this.shotDelay = 4;
			//Fire_Hispeed

            break;
        case 1:
        default:
            var s = new Shot(this,m),
                a = s.angle+Math.PI/2,
                r = s.r+1;
            s.x+=Math.sin(a)*r;
            s.y+=Math.cos(a)*r;
            s.move();
            shots.push(s);
            s = new Shot(this,m);
            a = s.angle+Math.PI/2;
            r = s.r+1;
            s.x-=Math.sin(a)*r;
            s.y-=Math.cos(a)*r;
            s.move();
            shots.push(s);
            this.shotDelay = 5;
			//Fire_normal
			//gameAudio.play('Fire_normal');
            break;
    }
    return shots;
};
Player.draw = function (c,n){
    c.beginPath();
    c.moveTo(0,-6);
    c.lineTo(8,-2);
    c.lineTo(4,8);
    c.lineTo(6,3);
    c.lineTo(0,0);
    c.lineTo(-6,3);
    c.lineTo(-4,8);
    c.lineTo(-8,-2);
    c.lineTo(0,-6);
    c.stroke();
    c.closePath();
}
Player.prototype.draw = function(c){
    if (this.invuln > 100)
        return;
    c.save();
	c.translate(this.x,this.y);
	c.rotate(this.angle);
    c.strokeStyle = this.color;
    if (this.invuln > 40 || this.invuln%10 < 5 && this.invuln > 0){
        c.beginPath();
        c.arc(0,0, this.r*1.5, 0, Math.PI*2, true);
        c.stroke();
        c.closePath();
    }
    Player.draw(c);
    c.restore();
}
Player.prototype.move = function(){
    if (this.shotDelay)
        this.shotDelay--;
    if (this.invuln > 100)
        return true;
	if (this.invuln == 100)
		gameAudio.play('Player_Spawn');
    var a,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y
        pi = Math.PI;
    if (keys[this.keyleft] && !keys[this.keyright]){
        this.angle-=pi/15
    }
    if (keys[this.keyright] && !keys[this.keyleft]){
        this.angle+=pi/15
    }
    a = this.angle;
    if (keys[this.keymove]){
        var moveX=-Math.sin(a)*s,
            moveY=Math.cos(a)*s;
        if (!((x <= r*2 && moveX < 0) || (x >= w-r*2 && moveX > 0))){
            this.x+=moveX;
        }
        if (!((y <= r*2 && moveY < 0) || (y >= h-r*2 && moveY > 0))){
            this.y+=moveY;
        }
        insideBoundaries(this);
    }
    return true;
}

function invulnScale (c,o){
    if (o.invuln){
        if (o.invuln%4 > 1){
            c.scale(1.3,1.3);
        }else {
            c.scale(0.8,0.8);
        }
    }
}
///ENEMIES
function Star (){
    var pi2 = Math.PI*2,
        random = Math.random;
    this.rotation=random()*pi2;
	this.angle = random()*pi2;
	this.toPoint={x:w*random(),y:h*random(),r:this.r};
	gameAudio.play('Wanderer_spawn');
}
defaultPrototypes(Star);
Star.prototype.points = 25;
Star.prototype.lastChange = 0;
Star.prototype.speed = 5;
Star.prototype.r = 8;
Star.prototype.color = "#71a";
Star.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
Star.prototype.move = function(){
    if (this.invuln > 0)
        return true;
    var a = this.angle,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        pi = Math.PI,
        pi2 = pi*2
        random = Math.random;
    this.rotation+=pi/10;
    this.x+=Math.sin(a)*s;
    this.y+=Math.cos(a)*s;
    x = this.x;
    y = this.y;
    a = wallBounce(this);
    
    //randomly start turning
    this.lastChange++;
    if (collision(this,this.toPoint) || this.lastChange>300){
        this.toPoint={x:w*random(),y:h*random(),r:r};
        this.lastChange=0;
    }
    var ang=fixAngle(angleTo(this,this.toPoint));
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        this.angle+=0.03+random()/100;
    }else {
        this.angle-=0.03+random()/100;
    }
    this.angle=fixAngle(this.angle);
    insideBoundaries(this);
    return true;
}
Star.prototype.draw = function(c){
    var r = this.r, r2 = r/2;
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.rotate(this.rotation);
    invulnScale(c,this);
    c.beginPath();
    c.moveTo(0,0);
    c.lineTo(r,0);
    c.lineTo(r2,r2);
    c.lineTo(0,0);
    c.lineTo(0,r);
    c.lineTo(-r2,r2);
    c.lineTo(0,0);
    c.lineTo(-r,-0);
    c.lineTo(-r2,-r2);
    c.lineTo(0,0);
    c.lineTo(0,-r);
    c.lineTo(r2,-r2);
    c.lineTo(0,0);
    c.stroke();
    c.closePath();
    c.restore();
}

function BlueBox (){
    this.lifespan = +new Date;
	this.angle = Math.random()*Math.PI*2;
	gameAudio.play('Enemy_spawn_blue');
}
defaultPrototypes(BlueBox);
BlueBox.prototype.points = 50;
BlueBox.prototype.speed=8;
BlueBox.prototype.r=8;
BlueBox.prototype.rd = 8/(Math.SQRT2||Math.sqrt(2));
BlueBox.prototype.color="#00f";
BlueBox.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
BlueBox.prototype.draw = function(c){
    var r = this.rd;
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.rotate(this.angle);
    invulnScale(c,this);
    c.beginPath();
    c.moveTo(-r,-r);
    c.lineTo(-r,r);
    c.lineTo(r,r);
    c.lineTo(r,-r);
    c.lineTo(-r,-r);
    c.stroke();
    c.closePath();
    c.restore();
}
BlueBox.prototype.move = function(){
    if (this.invuln > 0)
        return true;
    this.speed+=0.002;
    var p = playermap.getNearest(this),
        a = this.angle,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        pi = Math.PI,
        pi2 = pi*2
        random = Math.random;
    this.x+=Math.sin(a)*s;
    x = this.x;
    this.y+=Math.cos(a)*s;
    y = this.y;
    a = wallBounce(this);
    
    var ang=fixAngle(angleTo(this,p));
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        this.angle+=0.16;
    }else {
        this.angle-=0.16;
    }
    this.angle=fixAngle(this.angle);
    insideBoundaries(this);
    return true;
}

function GreenBox (){
	this.angle = Math.random()*Math.PI*2;
	gameAudio.play('Enemy_spawn_green');
}
defaultPrototypes(GreenBox);
GreenBox.prototype.points = 100;
GreenBox.prototype.r = 8;
GreenBox.prototype.rd = GreenBox.prototype.r/(Math.SQRT2||Math.sqrt(2));
GreenBox.prototype.rdd = GreenBox.prototype.rd/(Math.SQRT2||Math.sqrt(2));
GreenBox.prototype.speed = 9;
GreenBox.prototype.color="#0f0";
GreenBox.prototype.scared = false;
GreenBox.prototype.safeArea = 200;
GreenBox.prototype.scaredArea=100;
GreenBox.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
GreenBox.prototype.draw = function(c){
    var r = this.rd, r2 = this.rdd;
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.rotate(this.angle);
    invulnScale(c,this);
    c.beginPath();
    c.moveTo(-r,-r);
    c.lineTo(-r,r);
    c.lineTo(r,r);
    c.lineTo(r,-r);
    c.lineTo(-r,-r);
    c.moveTo(0,r2);
    c.lineTo(r2,0);
    c.lineTo(0,-r2);
    c.lineTo(-r2,0);
    c.lineTo(0,r2);
    c.stroke();
    c.closePath();
    c.restore();
}
function collisionCourse(a,b, e){
    //if a is going to collide with b given a's path
    if (!a || !b)
        return false;
    var a1 = angleTo(b,a),
        a2 = a.angle,
        pi = Math.PI,
        pi2= pi*2
        pi3= e||pi/3,
        ma = Math.abs(a1-a2);
    if (ma < pi3) // if near angle
        //|| ma+pi2 < pi3 //correct for very low a2 and very high a1
        //|| ma-pi2 < pi3) //correct for very low a1 and very high a2
        return true;
    return false;
}
GreenBox.prototype.move = function (){
    if (this.invuln > 0)
        return true;
    var p = playermap.getNearest(this),
        sa = this.scared?this.safeArea:this.scaredArea,
        q = playershots.getNearest(this,sa),
        a = fixAngle(this.angle),
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        pi = Math.PI,
        pi2 = pi*2
        random = Math.random;
    if (collisionCourse(q,this)){// is within x distance, avoid instead)
        this.scared = true;
        var ang=fixAngle(angleTo(this,q));
        if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
            ang-=pi/2;
        }else {
            ang+=pi/2;
        }
        ang = fixAngle(ang);
        this.x+=Math.sin(ang)*s;
        x = this.x;
        this.y+=Math.cos(ang)*s;
        y = this.y;
    }else {
        this.scared = false;
        this.x+=Math.sin(a)*s;
        x = this.x;
        this.y+=Math.cos(a)*s;
        y = this.y;
    }
    var ang=fixAngle(angleTo(this,p)); // turn toward player anyway
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        a+=0.16;
    }else {
        a-=0.16;
    }
    this.angle=fixAngle(a);
    insideBoundaries(this);
    
    return true;
}

function PurpleBox (){
	this.angle = Math.random()*Math.PI*2;
	gameAudio.play('Enemy_spawn_green');
}
defaultPrototypes(PurpleBox);
PurpleBox.prototype.points = 100;
PurpleBox.prototype.r = 8;
PurpleBox.prototype.rd = 8/(Math.SQRT2||Math.sqrt(2));
PurpleBox.prototype.speed = 9;
PurpleBox.prototype.color="#d6f";
PurpleBox.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
PurpleBox.prototype.draw = function(c){
    var r = this.rd;
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.rotate(this.angle);
    invulnScale(c,this);
    c.beginPath();
    c.moveTo(-r,-r);
    c.lineTo(-r,r);
    c.lineTo(r,r);
    c.lineTo(r,-r);
    c.lineTo(-r,-r);
    c.lineTo(r,r);
    c.moveTo(r,-r);
    c.lineTo(-r,r);
    c.stroke();
    c.closePath();
    c.restore();
    c.save();
}
PurpleBox.prototype.move = function(){
    if (this.invuln > 0)
        return true;
    var p = playermap.getNearest(this),
        a = this.angle,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        pi = Math.PI,
        pi2 = pi*2
        random = Math.random;
    this.x+=Math.sin(a)*s;
    x = this.x;
    this.y+=Math.cos(a)*s;
    y = this.y;
    var ang=fixAngle(angleTo(this,p));
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        a+=0.16;
    }else {
        a-=0.16;
    }
    this.angle=fixAngle(a);
    insideBoundaries(this);
    return true;
}
PurpleBox.prototype.kill = function(){
    for (var i=2;i--;){
        var p = new PurpleMini();
        p.x = this.x;
        p.y = this.y;
        enemymap.insert(p);
    }
}

function PurpleMini (){
    this.angle = Math.random()*Math.PI*2;
}
defaultPrototypes(PurpleMini);
PurpleMini.prototype.points = 100;
PurpleMini.prototype.speed = 7;
PurpleMini.prototype.r = 4;
PurpleMini.prototype.invuln = 0;
PurpleMini.prototype.color="#93c";

PurpleMini.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
PurpleMini.prototype.draw = function(c){
    var r = this.r;
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.rotate(this.angle);
    c.beginPath();
    c.moveTo(-r,0);
    c.lineTo(0,r);
    c.lineTo(r,0);
    c.lineTo(0,-r);
    c.lineTo(-r,0);
    c.stroke();
    c.closePath();
    c.restore();
}
PurpleMini.prototype.move = function (){
    var p = playermap.getNearest(this),
        a = this.angle,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        pi = Math.PI,
        pi2 = pi*2
        random = Math.random,
        ang = angleTo(this,p);
    this.x+=Math.sin(ang)*2+Math.sin(a)*s;
    this.y+=Math.cos(ang)*2+Math.cos(a)*s;
    this.angle=fixAngle(a+0.4);
    insideBoundaries(this);
    return true;
}

function BlackHole (){
	gameAudio.play('Enemy_red_warning');
}
defaultPrototypes(BlackHole);
BlackHole.prototype.points = 100;
BlackHole.prototype.r = 10;
BlackHole.prototype.hp = 20;
BlackHole.prototype.mp = 0;
BlackHole.prototype.speed = 0.3;
BlackHole.prototype.color = "#f00";
BlackHole.prototype.invuln = 0;
BlackHole.prototype.kill = function(){
	gameAudio.play('Gravity_well_die');
}
BlackHole.prototype.eat = function(o){
    if (this.hp >= 20){
        return false;
    }
	gameAudio.play('Enemy_red_suck');
    this.mp += o.hp;
    this.points += o.points * (1+this.mp*0.1);
    if (this.mp >= 20){
        for (var q=10;q--;){
            enemymap.insert(new MicroBlackHole(this));
        }
		gameAudio.play('Gravity_well_explode');
        this.eaten = true;
    }
    return true;
}
BlackHole.prototype.rotation = 0;
BlackHole.prototype.draw = function(c){
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.beginPath();
    c.arc(0,0, this.r+(this.hp<20?Math.sin(this.rotation)*2:0), 0, Math.PI*2, true);
    c.stroke();
    c.closePath();
    c.restore();
}
BlackHole.prototype.pull = function(o){
    if (o.cantkill || o.eat || o.invuln){
        return;
    }
    var a = angleTo(o,this),d = distance(this,o),r = this.r, n = 100/(r-d), tail = o.tail;
    if (tail){
        for(var i = tail.length; i--;){
            var bit = tail[i], d2 = distance(this,bit), n2 = n;
            if (d2<n2){
                n2=d2;
            }
            bit.x-=Math.sin(a)*n;
            bit.y-=Math.cos(a)*n;
        }
    }
    if (n>d){
        n = d;
    }
    o.x-=Math.sin(a)*n;
    o.y-=Math.cos(a)*n;
}
BlackHole.prototype.push = function(o){
    var a = angleTo(o,this),d = distance(this,o),r = this.r, n = 20/(r-d),ang = this.angle, pi = Math.PI;
    o.x+=Math.sin(a)*n;
    o.y+=Math.cos(a)*n;
    if ((ang<a && a-ang<pi) || (ang>a && a-(ang-pi*2)<pi)){
        o.angle+=0.01;
    }else {
        o.angle-=0.01;
    }
}
BlackHole.prototype.move = function(){
    var p = playermap.getNearest(this),
        a = angleTo(this,p),
        s = this.speed;
	this.rotation=fixAngle(Math.PI/10+this.rotation);
    this.angle=a;
    this.x+=Math.sin(a)*s;
    this.y+=Math.cos(a)*s;
    insideBoundaries(this);
    if (this.hp == 20){
        return true;
    }
    var pull = playermap.list.concat(enemymap.list),
        push = playershots.list.concat(enemyshots.list);
    for (var i = pull.length; i--;){
        this.pull(pull[i].o);
    }
    for (var i = push.length; i--;){
        this.push(push[i].o);
    }
    return true;
}

function MicroBlackHole (o){
    this.x = o.x;
    this.y = o.y;
    this.angle = Math.random()*Math.PI*2;
    this.isnew = true;
}
defaultPrototypes(MicroBlackHole);
MicroBlackHole.prototype.points = 50;
MicroBlackHole.prototype.speed = 12,
MicroBlackHole.prototype.r=5;
MicroBlackHole.prototype.color = "#4444ff";
MicroBlackHole.prototype.invuln = 0;
MicroBlackHole.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
MicroBlackHole.prototype.draw = function(c){
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.beginPath();
    c.arc(0,0, this.r, 0, Math.PI*2, true);
    c.stroke();
    c.closePath();
    c.restore();
}
MicroBlackHole.prototype.move = function(){
    var p = playermap.getNearest(this),
        a = this.angle,
        s = this.speed,
        r = this.r,
        pi = Math.PI,
        pi2 = pi*2
        random = Math.random;
    this.x+=Math.sin(a)*s;
    this.y+=Math.cos(a)*s;
    a = wallBounce(this);
    var ang=fixAngle(angleTo(this,p));
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        this.angle+=0.16;
    }else {
        this.angle-=0.16;
    }
    this.angle=fixAngle(this.angle);
    insideBoundaries(this);
    return true;
}

function RedShip (){
	this.angle = Math.random()*Math.PI*2;
	gameAudio.play('Enemy_spawn_red');
}
defaultPrototypes(RedShip);
RedShip.prototype.points = 200;
RedShip.prototype.hp = 3;
RedShip.prototype.r = 9;
RedShip.prototype.speed = 0;
RedShip.prototype.maxSpeed = 15;
RedShip.prototype.accel = 0.5;
RedShip.prototype.shottimer = 0;
RedShip.prototype.shooting = 0;
RedShip.prototype.color = "#FF0000";
RedShip.prototype.drawn1 = Math.PI;
RedShip.prototype.drawn2 = Math.PI/3;
RedShip.prototype.drawn3 = Math.PI*2/3;
RedShip.prototype.drawn4 = Math.PI*2;

RedShip.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
RedShip.prototype.draw = function(c){
    var d1 = this.drawn1,
        d2 = this.drawn2,
        d3 = this.drawn3,
        d4 = this.drawn4,
        r = this.r;
    c.save();
	c.translate(this.x,this.y);
	c.rotate(d1-this.angle);//some weird shit with the angle makes it clockwise instead of counter clockwise, so this reverses it.
    c.beginPath();
    c.strokeStyle = this.color;
    c.arc(0,0,r,d2,d3,true);
    c.arc(0,0,r-3,d3,d2,false);
    c.arc(0,0,r,d2,d3,true); //get the extra line and make the outside thicker
    c.moveTo(0,-r);
    c.arc(0,-r+1.5,2,0,d4,true);
    c.stroke();
    c.closePath();
    c.restore();
}
RedShip.prototype.move = function(){
    if (this.invuln > 0)
        return true;
    var p = playermap.getNearest(this),
        a = this.angle,
        ms = this.maxSpeed,
        s = this.speed,
        r = this.r,
        pi = Math.PI,
        pi2 = pi*2,
        pin = pi2/15,
        random = Math.random,
        ang = fixAngle(angleTo(p,this)),
        st = --this.shottimer,
        shots = this.shooting;
    if (Math.abs(ang-a)<pin){
        if (st <= 0){
            st = this.shottimer = 60;
            enemyshoot(this, p);
            shots = 2;
        }
        if (shots==2 && st<=57){
            enemyshoot(this, p);
            shots--;
        }else if (shots==1 && st<=54){
            enemyshoot(this, p);
            shots--;
        }
        this.shooting =shots;
        s++;
    }else {
        s-=0.5;
    }
    s = this.speed = s>ms?ms:s<0?0:s;
    this.x+=Math.sin(a+pi)*s;
    this.y+=Math.cos(a+pi)*s;
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        this.angle+=0.03;
    }else {
        this.angle-=0.03;
    }
    this.angle=fixAngle(this.angle);
    insideBoundaries(this);
    return true;
}

function Serpent (){
    this.tail = [];
	var p = playermap.getNearest(this);
	this.angle = fixAngle(angleTo(p,this));
	gameAudio.play('Snake_spawn');
}
defaultPrototypes(Serpent);
Serpent.prototype.points = 250;
Serpent.prototype.speed = 6,
Serpent.prototype.r=7.5;
Serpent.prototype.step = -1;
Serpent.prototype.color = "#CAF";
Serpent.prototype.tailtime = 0;
Serpent.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
Serpent.prototype.draw = function(c){
    //serpent head
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.beginPath();
    c.arc(0,0, this.r, 0, Math.PI*2, true);
    c.stroke();
    c.closePath();
    c.restore();
}
Serpent.prototype.kill = function(){
    var tailbits = this.tail;
    for (var i = tailbits.length; i--;){
        tailbits[i].deleteme = true;
        Fireworks(tailbits[i],10,50);
    }
}
Serpent.prototype.move = function(){
    if (this.invuln > 0)
        return true;
    var p = playermap.getNearest(this),
        a = this.angle,
        s = this.speed,
        r = this.r,
        pi = Math.PI,
        pie = pi/2,
        pi2 = pi*2,
        ang = fixAngle(angleTo(p,this)),
        step = this.step,
        tailbits = this.tail,
        tailbit;
    if (this.tailtime == 0){
        tailbit = new Serpent.Tail(this);
        tailbits.push(tailbit);
        enemymap.insert(tailbit);
    }
    this.tailtime = (this.tailtime+1)%2;
    if (tailbits.length > 8){
        tailbits.splice(0,tailbits.length - 25);
    }
    this.x-=Math.sin(a)*s;
    this.y-=Math.cos(a)*s;
    switch(step){
        case 0:
        case 2:
            ang = fixAngle(ang+(step?-pie:pie));
            if (((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi))==!!step){
                step++;
            }
            break;
        case 1:
        case 3:
            if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
                step++;
            }
            break;
        case -1:
            this.angle = a = ang;
        default:
            step = 0;
            break;
    }
    this.step = step%4;
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        a+=0.2;
    }else {
        a-=0.2;
    }
    this.angle = fixAngle(a);
    insideBoundaries(this);
    return true;
}
Serpent.Tail = function (s){
    this.x = s.x;
    this.y = s.y;
    this.angle = s.angle;
    this.serpent = s;
}
defaultPrototypes(Serpent.Tail);
stp = Serpent.Tail.prototype;
stp.points = 0;
stp.life = 25;
stp.invuln = 0;
stp.cantkill = true;
stp.hp = 0;
stp.r = 5;
stp.speed = 0;
stp.color = "#F92";
stp.draw = function(c){
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
	c.rotate(Math.PI-this.angle);//some weird shit with the angle makes it clockwise instead of counter clockwise, so this reverses it.
    c.beginPath();
    c.moveTo(0,5);
    c.lineTo(3,-3);
    c.lineTo(-3,-3);
    c.lineTo(0,5);
    c.stroke();
    c.closePath();
    c.restore();
}
stp.move = function(){
    this.life--;
    if (this.life < 1){
        return false;
    }
    return true;
}


function Tix (){
    this.rotation=Math.random();
	gameAudio.play('Mayfly');
}
defaultPrototypes(Tix);
Tix.prototype.points = 25;
Tix.prototype.speed=6;
Tix.prototype.r=6;
Tix.prototype.rd = 4;
Tix.prototype.color="#00f";
Tix.prototype.kill = function(){
	gameAudio.play('Enemy_explode');
}
Tix.prototype.draw = function(c){
    var r = this.rd;
    c.save();
    c.strokeStyle=this.color;
    c.translate(this.x,this.y);
    c.beginPath();
    c.rotate(this.rotation);
    c.moveTo(0,-r);
    c.lineTo(0,r);
    c.moveTo(-r,0);
    c.lineTo(r,0);
    c.stroke();
    c.closePath();
    c.restore();
}
Tix.prototype.move = function(){
    var p = playermap.getNearest(this),
        a = this.angle,
        s = this.speed,
        r = this.r,
        x = this.x,
        y = this.y,
        pi = Math.PI,
        pi2 = pi*2
        random = Math.random;
    this.rotation+=pi/10;
    this.x+=Math.sin(a)*s;
    x = this.x;
    this.y+=Math.cos(a)*s;
    y = this.y;
    a = wallBounce(this);
    
    var ang=fixAngle(angleTo(this,p));
    if ((a<ang && ang-a<pi) || (a>ang && ang-(a-pi2)<pi)){
        this.angle+=0.016;
    }else {
        this.angle-=0.016;
    }
    this.angle=fixAngle(this.angle);
    insideBoundaries(this);
    return true;
}

var Colors = [
    "#fff",
    "#ff0",
    "#f0f",
    "#0ff",
    "#f00",
    "#0f0",
    "#00f"
]
function Bit (o,l,c){
    l = l || o.points || 100;
    var r = Math.random;
    if (l){
        this.maxLength = (0.5+r())*l/10;
        this.maxDistance = (1+r())*l/2;
    }
    this.x = o.x;
    this.y = o.y;
	this.color=c||Colors[Math.round(r()*Colors.length)];
	while(!this.color) // just in case the color is not 
		this.color=c||Colors[Math.round(r()*Colors.length)];
    this.speed = 7*r()+7;
    this.angle = r()*Math.PI*2;
    this.status = 0;
}
defaultPrototypes(Bit);
Bit.prototype.length = 0;
Bit.prototype.maxLength = 15;
Bit.prototype.distance = 0;
Bit.prototype.maxDistance = 100;
Bit.prototype.speed = 15;
Bit.prototype.move = function(){
    if (!fireworks)
        return false;
    var s = this.speed,
        l = this.length,
        ml= this.maxLength,
        d = this.distance,
        md= this.maxDistance,
        st= this.status;
    switch(st){
        case 0:
            l+=s;
            if (l > ml){
                this.status = ++st;
            }
            this.length = l;
            break;
        case 1:
            d+=s;
            if (d > md){
                this.status = ++st;
            }
            this.distance = d;
            break;
        case 2:
            d+=s;
            l-=s;
            if (l <= 0){
                this.status = ++st;
            }
            this.length = l;
            this.distance = d;
            break;
        case 3:
        default:
            this.status = st = 3;
    }
    return st == 3? false : true;
}
Bit.prototype.draw = function(c){
    var a = this.angle,
        d = this.distance,
        s = this.speed,
        l = this.length,
        x = this.x,
        y = this.y;
    c.save();
    c.strokeStyle=this.color;
    c.translate(x,y);
	c.rotate(a);
    c.beginPath();
    c.moveTo(0,d);
    c.lineTo(0,d+l);
    c.stroke();
    c.closePath();
    c.restore();
}
var fireworks = true;
function Fireworks(o,n,l){
    if (!fireworks)
        return;
    var ef = effects,
		c=o.color||Colors[Math.round(Math.random()*Colors.length)];
	if (n > 100)
		n = 100;
	if (l > 500)
		l = 500;
    for (var i = n;i--;){
        ef.insert(new Bit(o,l,c));
    }
}
