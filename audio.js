//audio
var gameAudio = {
    files : [
        'GW2_ui',
        'GW2_ingame',
        'bullet_hitwall',
        //'Enemy_explode', // don't like this sound
        //'Enemy_red_hit', // don't like this sound
        'Enemy_red_suck',
        'Enemy_red_warning',
        'Enemy_spawn_blue',
        'Enemy_spawn_green',
        'Enemy_spawn_orange',
        'Enemy_spawn_red',
        'Fire_Hispeed', // this would be better if I could make it faster
        'Fire_homing', // this is an awful sound
        'Fire_normal', // this would be better if I could make it faster
        'Fire_smartbomb',
        'Fire_smartbomb_low',
        'Fire_triway',
        'Game_over',
        'Game_start',
        'Gravity_well_die',
        'Gravity_well_explode',
        'Hi_Score_achieved',
        'Mayfly', //this could be shorter
        'Multiplier',
        'pickup_extralife',
        'pickup_smartbomb',
        'pickup_weapon',
        'Player_shielded_hit_enemy',
        'Player_Spawn',
        'SFX_ambience',
        'Shield_off',
        'Shield_on',
        'Ship_explode',
        'Ship_hitwall',
        'Ship_thrust_loop',
        'silence',
        'Snake_spawn',
        'UI_Change',
        'UI_Confirm',
        'UI_Delete',
        'Wanderer_spawn'
    ],
    ready:false,
    effects:true,
    music:true,
    _:{},
    support:null,
    load:function(){
        var browser = navigator.userAgent;
        if (browser.indexOf('MSIE')>-1)
            browser = 'ie';
        else if (browser.indexOf('Firefox')>-1)
            browser = 'ff';
        else if (browser.indexOf('WebKit')>-1)
            browser = 'wk';
        if (!gameAudio.support){
            gameAudio.loaded();
            return;
        }
        var i = 0, l = gameAudio.files.length;
        function loopMe(){
            this.play();
        }
        function resetMe(){
            this.currentTime = 0;
            this.pause();
        }
        function loading(e){
            if (this.readyState == 4 && !this.isLoaded){
                this.isLoaded = true;
                //document.getElementById('debug').innerHTML += '<div class="success">Success : '+this.id+'</div>';
                loadNextAudio();
            }
        }
        function loadNextAudio(){
            if (i>=l){
                gameAudio.loaded();
                return;
            }
            var f = gameAudio.files[i++],
                a = gameAudio._[f] = document.createElement('audio');
                //console.warn(f);
            a.id = f;
            switch(browser){
                case 'wk':
                    a.addEventListener('durationchange',loading,true); // chrome does not support the progress event right now
                    break;
                case 'ff':
                default:
                    a.addEventListener('progress',loading,true); // this is the only thing I should have to use
                    break;
            }
            if (f === 'GW2_ui' || f === 'GW2_ingame'){
                a.addEventListener('ended',loopMe,true);
            }else{
                a.addEventListener('ended',resetMe,true);
            }
            a.src = "audio/"+gameAudio.support+"/"+f+"."+gameAudio.support;
            //document.getElementById('debug').innerHTML += '<div>Loading : '+f+'</div>';
            try {
                a.load();
                gameAudio._[f] = a;
            }catch(er){
                delete gameAudio._[f];
                //document.getElementById('debug').innerHTML += '<div class="failed">Failed : '+f+'<br>'+er.message+'</div>';
                loadNextAudio();
            }
            if (browser == 'ie')
                setTimeout(loadNextAudio,100); // IE doesn't support any of the media events properly
        }
        setTimeout(loadNextAudio,10);
    },
    loaded:function(){
        if (gameAudio.ready)
            return;
        gameAudio.ready = true;
        if (gameAudio.music){
            gameAudio.play(document.body.childNodes[0].className == 'game'?'GW2_ingame':'GW2_ui');
        }
    },
    play:function(id){
        if (!gameAudio.ready || !gameAudio._[id])
            return;
        if (id.indexOf("GW2") === 0){
            if (!gameAudio.music)
                return;
        }else {
            if (!gameAudio.effects)
                return;
        }
        gameAudio._[id].currentTime = 0;
        gameAudio._[id].play();
    },
    stop:function(t){
        if (!gameAudio.ready)
            return;
        var _ = gameAudio._;
        for (var i in _){
            var a = _[i];
            if (!t || (t === 'music' && i.indexOf('GW2') === 0) || (t === 'effects' && i.indexOf('GW2') !== 0)){
                a.pause();
                a.currentTime = 0;
            }
        }
    },
    toggle:function(t){
        if (!gameAudio.ready)
            return;
        if (t == 'music'){
            var e = gameAudio.music = !gameAudio.music;
            if (e){
                gameAudio.play(document.body.childNodes[0].className == 'game'?'GW2_ingame':'GW2_ui');
            }else {
                gameAudio.stop('music');
            }
        }else {
            var e = gameAudio.effects = !gameAudio.effects;
            if (e)
                gameAudio.play('Ship_explode');
            else
                gameAudio.stop('effects');
        }
    },
    init:function(){
        var myAudio = document.createElement('audio');
        if (!myAudio.canPlayType)
            return;
        var ogg = myAudio.canPlayType('audio/ogg'),
            mp3 = myAudio.canPlayType('audio/mp3'),
            wav = myAudio.canPlayType('audio/wave');
        ogg = (ogg && ogg!='no')?true:false;
        mp3 = (mp3 && mp3!='no')?true:false;
        wav = (wav && wav!='no')?true:false;
        gameAudio.support = ogg?'ogg':mp3?'mp3':wav?'wav':false;
            document.getElementById('audioused').innerHTML = gameAudio.support;//debugging data
        gameAudio.load();
    }
}