
var sequences=[[],[],[],[],[]], // 5 difficulty levels
    currentSequence=0,
    sequenceModifier=Math.round(Math.random()*100),
    seqLocation=0,
    delayTime=0,
    lastTime = 0,
    pauseTime = 0,
	difficultyLevel = 0,
	sequenceSpeed = 1;

function pauseSequence(){
    pauseTime = now();
}
function unpauseSequence(){
    lastTime+= now()-pauseTime;
}
function getNextSequence(){
	if (difficultyLevel === 0){
		currentSequence = sequences[0][0];
		difficultyLevel = 1;
		return;
	}
    var m = Math, random = m.random, round = m.round;
	seqLocation=0;
	sequenceModifier=round(random()*100);
	var dif = round((difficultyLevel-1)*random()+1);
	if (dif > difficultyLevel || dif < 1)
		dif = Math.floor(difficultyLevel);
	sequenceSpeed = 1+(dif-difficultyLevel)/2;
	var cs = sequences[dif];
	csid =Math.floor((cs.length+1)*random());
	currentSequence = cs[csid];
	if (!currentSequence){
		csid = cs.length-1;
		currentSequence = cs[csid];
	}
	difficultyLevel += 0.3/Math.floor(difficultyLevel);
	if (difficultyLevel>4)
		difficultyLevel = 4;
}
function getNextSet(){
    var set = [], n = now(), cs = currentSequence, dt = delayTime;
    if (dt <= n-lastTime){
        lastTime = n;
        dt = 0;
        for (var l = cs.length;seqLocation<l && dt == 0;seqLocation++){
            var o = cs[seqLocation], e = o.enemy();
            o.location(e);
            dt+=o.delayAfter;
            set.push(e);
        }
        delayTime = dt;
    }
    if (seqLocation>=cs.length){
        getNextSequence();
    }
    return set;
}
function resetSequences(){
    currentSequence=sequences[0][0];
    sequenceModifier=Math.round(Math.random()*100);
    seqLocation=0;
    delayTime=0;
    lastTime = 0;
    pauseTime = 0;
	difficultyLevel = 1;
}

var Enemy = {
    Star:function (){return new Star;},
    BlueBox:function (){return new BlueBox;},
    GreenBox:function (){return new GreenBox;},
    PurpleBox:function (){return new PurpleBox;},
    PurpleMini:function (){return new PurpleMini;},
    BlackHole:function (){return new BlackHole;},
    MicroBlackHole:function (){return new MicroBlackHole;},
    RedShip:function (){return new RedShip;},
    Serpent:function(){return new Serpent;},
    Tix:function(){return new Tix;},
    random:(function (){
        var enemy = [Star,BlueBox,GreenBox,PurpleBox,RedShip,Serpent], pc = [0.25,0.25,0.2,0.2,0.05,0.05];
        return function(){
            var er = Math.random(), n = 0, i;
            for (var i = 0; i<pc.length && n<er;i++){
                n+=pc[i];
            }
			var e = new (enemy[i]||Star);
            return e;
        }
    })()
}

	//Default location function
function dl(e){
        //random location, but don't appear on top of player, or too close (100px margin should be more than enough)
    var random=Math.random;
	e.x=random()*w;
	e.y=random()*h;
	while (distance(e,playermap.getNearest(this))<=100){
		e.x=random()*w;
		e.x=random()*h;
	}
}

function topLeft(e){
    var random=Math.random;
	e.x=15+random(); // the random helps prevent things being in exactly the same place, so they'll try to avoid eachother
	e.y=15+random();
	e.angle=angleTo(e,{x:w2,y:h2})
}
function topRight(e){
    var random=Math.random;
	e.x=w-15+random();
	e.y=15+random();
	e.angle=angleTo(e,{x:w2,y:h2})
}
function bottomLeft(e){
    var random=Math.random;
	e.x=15+random();
	e.y=h-15+random();
	e.angle=angleTo(e,{x:w2,y:h2})
}
function bottomRight(e){
    var random=Math.random;
	e.x=w-15+random();
	e.y=h-15+random();
	e.angle=angleTo(e,{x:w2,y:h2})
}
function gotoplayer(e,n){
    n=n||0;
    var p = playermap.list[n].o;
    e.x=p.x||w/2;
    e.y=p.y||h/2;
}
function up(e){
    gotoplayer(e);
    e.y-=100;
}
function down(e){
    gotoplayer(e);
    e.y+=100;
}
function left(e){
    gotoplayer(e);
    e.x-=100;
}
function right(e){
    gotoplayer(e);
    e.x+=100;
}
function upleft(e){
    gotoplayer(e);
    e.y-=100;
    e.x-=100;
}
function upright(e){
    gotoplayer(e);
    e.y-=100;
    e.x+=100;
}
function downleft(e){
    gotoplayer(e);
    e.y+=100;
    e.x-=100;
}
function downright(e){
    gotoplayer(e);
    e.y+=100;
    e.x+=100;
}
	//delay after is in milliseconds
sequences[0].push([
	{enemy:Enemy.Star,delayAfter:3000,location:dl},
	{enemy:Enemy.Star,delayAfter:3000,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.BlueBox,delayAfter:3000,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.BlueBox,delayAfter:3000,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.BlueBox,delayAfter:3000,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.BlueBox,delayAfter:3000,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:function (){return sequenceModifier>50?new GreenBox():new PurpleBox()},delayAfter:0,location:dl},
	{enemy:function (){return sequenceModifier>50?new GreenBox():new PurpleBox()},delayAfter:3000,location:dl},
	{enemy:Enemy.BlueBox,delayAfter:0,location:dl},
	{enemy:Enemy.BlueBox,delayAfter:0,location:dl},
	{enemy:function (){return sequenceModifier>50?new GreenBox():new PurpleBox()},delayAfter:0,location:dl},
	{enemy:function (){return sequenceModifier>50?new GreenBox():new PurpleBox()},delayAfter:3000,location:dl},
	{enemy:Enemy.BlueBox,delayAfter:0,location:dl},
	{enemy:Enemy.PurpleBox,delayAfter:0,location:dl},
	{enemy:Enemy.Star,delayAfter:0,location:dl},
	{enemy:Enemy.GreenBox,delayAfter:0,location:dl},
	{enemy:Enemy.BlackHole,delayAfter:5000,location:dl}
]);
sequences[1].push([
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:10000,location:bottomRight}
]);
sequences[1].push([
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:120,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:8000,location:bottomRight}
]);
sequences[1].push([
	{enemy:Enemy.BlueBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.PurpleBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlackHole,delayAfter:0,location:topLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:topRight},
	{enemy:Enemy.PurpleBox,delayAfter:0,location:topRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:topRight},
    {enemy:Enemy.BlackHole,delayAfter:0,location:topRight},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.PurpleBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlackHole,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:bottomRight},
	{enemy:Enemy.PurpleBox,delayAfter:0,location:bottomRight},
	{enemy:Enemy.GreenBox,delayAfter:0,location:bottomRight},
	{enemy:Enemy.BlackHole,delayAfter:5000,location:bottomRight}
]);
sequences[2].push([
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:300,location:dl},
	{enemy:Enemy.random,delayAfter:10000,location:dl}
]);
sequences[2].push([
	{enemy:Enemy.Serpent,delayAfter:0,location:topLeft},
	{enemy:Enemy.Serpent,delayAfter:0,location:topRight},
	{enemy:Enemy.Serpent,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Serpent,delayAfter:7000,location:bottomRight}
]);
sequences[3].push([
    {enemy:Enemy.RedShip,delayAfter:0,location:dl},
    {enemy:Enemy.RedShip,delayAfter:2000,location:dl}
]);
sequences[3].push([
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:40,location:bottomRight},
	{enemy:Enemy.Tix,delayAfter:0,location:topLeft},
	{enemy:Enemy.Tix,delayAfter:0,location:topRight},
	{enemy:Enemy.Tix,delayAfter:0,location:bottomLeft},
	{enemy:Enemy.Tix,delayAfter:3000,location:bottomRight}
]);
sequences[4].push([
	{enemy:Enemy.BlueBox,delayAfter:0,location:up},
	{enemy:Enemy.BlueBox,delayAfter:0,location:down},
	{enemy:Enemy.BlueBox,delayAfter:0,location:left},
	{enemy:Enemy.BlueBox,delayAfter:0,location:right},
	{enemy:Enemy.BlueBox,delayAfter:0,location:upleft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:upright},
	{enemy:Enemy.BlueBox,delayAfter:0,location:downleft},
	{enemy:Enemy.BlueBox,delayAfter:300,location:downright},
	{enemy:Enemy.BlueBox,delayAfter:0,location:up},
	{enemy:Enemy.BlueBox,delayAfter:0,location:down},
	{enemy:Enemy.BlueBox,delayAfter:0,location:left},
	{enemy:Enemy.BlueBox,delayAfter:0,location:right},
	{enemy:Enemy.BlueBox,delayAfter:0,location:upleft},
	{enemy:Enemy.BlueBox,delayAfter:0,location:upright},
	{enemy:Enemy.BlueBox,delayAfter:0,location:downleft},
	{enemy:Enemy.BlueBox,delayAfter:5000,location:downright}
]);
