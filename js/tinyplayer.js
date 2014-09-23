/*
 *
 * Tiny HTML5 Music player by Themistokle Benetatos
 * based on http://msdn.microsoft.com/en-us/library/ie/gg589528(v=vs.85).aspx
 *
 */
 
function Track( ID, audioTrack, nextCallback, current, showwaveform ) {
	//Global vars
	//Current track ID
	var ID             = ID;
	//Parent div where the track will be added
	var parentDIV      = 'all_tracks';
	//ID of the html5 audio tag containing this track
	var audioIDName    = 'audioMP3_' + ID.toString();
	//ID of this player
	var audioID        = 'audio_' + ID.toString();
	//ID of the hidden input containing the URL of the MP3
	var audioFile      = 'audioFile_' + ID.toString();
	//ID of the button play
	var audioBTNPlay   = 'audioBTNPlay_' + ID.toString();
	//ID of the image tag of the button play
	var audioBTNImg    = 'audioBTNImg_' + ID.toString();
	//ID of the seek bar of this track
	var audioSeek      = 'audioSeek_' + ID.toString();
	//Audio object
	var oAudio         = null;
	//Canvas object
	var canvas         = null;
	//Error message if canvas are not supported
	var canvasErrorMSG = 'Your browser doesn\'t support HTML5 canvas tag.';
	//Init
	init();
	
	//Set audioplayer HTML
	function showPlayer() {
		//add html content
		var div = document.createElement('div');
		div.id = audioID;
		div.className = 'audioplayer';
		divContent    = '<audio id="'+audioIDName+'">Your browser doesn\'t support HTML5 audio tag.</audio>';
		divContent    += '<div class="audiocontrollers">';
		divContent    += '<input id="'+audioFile+'" type="hidden" value="'+audioTrack.url+'" />';
		divContent    += '<div id="'+audioBTNPlay+'" class="audiobtnplay">';
		divContent    += '<div class="audiobtnplaybgrd">';
		divContent    += '<canvas id="'+audioBTNImg+'" class="audiobtnimg" width="15" height="15"></canvas>';
		divContent    += '</div>';
		divContent    += '</div>';
		divContent    += '<div class="audiodetails">';
		divContent    += '<div class="audiotitle">'+audioTrack.title+'</div>';
		divContent    += '<div class="audioyear">'+audioTrack.year+'</div>';
		divContent    += '</div>';
		divContent    += '</div>';
		divContent    += '<div class="audiodisplay">';
		if ( showwaveform == true )
			divContent    += '<img class="audiowaveform" src="'+audioTrack.url+'.png"/>';
		else
			divContent    += '<div class="noaudiowaveform"></div>';
		divContent    += '<canvas id="'+audioSeek+'" class="audioSeek" width="'+document.getElementById(parentDIV).offsetWidth+'" height="50">'+canvasErrorMSG+'</canvas>';
		divContent    += '</div>';
		div.innerHTML = divContent;
		document.getElementById(parentDIV).appendChild(div);
		drawIcon('play');
	}
	
	//Draw time( context, x1, y1, x2, y2, time, text color )
	function drawTime(ctx, x1, y1, x2, y2, time, textcolor) {
		var mn = ~~(time / 60);
		var sec = ~~(time % 60);
		//duration background
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		//ctx.fillRect(canvas.clientWidth-32, canvas.clientHeight-15, canvas.clientWidth, canvas.clientHeight);
		ctx.fillRect(x1, y1, x2, y2);
		//duration text
		var fontsize = 8;
		ctx.font = fontsize + "pt Arial";
		ctx.fillStyle = textcolor;
		ctx.textAlign = 'right';
		ctx.fillText( (mn < 10 ? '0' + mn : mn ) + ':' + (sec < 10 ? '0' + sec : sec ), x2-3, y2-4 );
	}
	
	//Draw and update progress bar
	function drawBar() { 
		//get current time in seconds
		var elapsedTime = Math.round(oAudio.currentTime);
		//update the progress bar
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			//clear canvas before painting
			ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
			//draw buffering
			if (oAudio.buffered.length > 0) {
				ctx.fillStyle = 'rgba(245,215,110,0.25)';
				var bufferIndex = ( oAudio.buffered.length > 0 ? oAudio.buffered.length-1 : 0 );
				ctx.fillRect(0, 0, (oAudio.buffered.end( bufferIndex ) / oAudio.duration) * (canvas.clientWidth), canvas.clientHeight);
			}
			//draw progress
			if (oAudio.paused) ctx.fillStyle = 'rgba(230,126,34,0.3)';
			else ctx.fillStyle = 'rgba(230,126,34,0.6)';
			var fWidth = (elapsedTime / oAudio.duration) * (canvas.clientWidth);
			if (fWidth > 0) {
				ctx.fillRect(0, 0, fWidth, canvas.clientHeight);
			}
			//show duration box
			if (oAudio.duration) {
				drawTime(ctx, canvas.clientWidth-32, canvas.clientHeight-15, canvas.clientWidth, canvas.clientHeight, oAudio.duration, "#BBBBBB");
			}
			//show current progress box
			if (oAudio.currentTime) {
				drawTime(ctx, 0, canvas.clientHeight-15, 32, canvas.clientHeight, oAudio.currentTime, "#e67e22");
			}
		}
	}

	//Draw icon: play | pause
	function drawIcon(icon) {
		//we save bytes by not using images and instead drawing icon on canvas
		var btncanvas = document.getElementById(audioBTNImg);
		if (btncanvas.getContext){
			var ctx = btncanvas.getContext('2d');
			ctx.clearRect(0, 0, btncanvas.clientWidth, btncanvas.clientHeight);
			ctx.fillStyle = 'rgb(255,255,255)';
			switch(icon) {
				case 'loading':
					ctx.beginPath();
					ctx.arc((btncanvas.clientWidth/2), (btncanvas.clientHeight/2), 6, 0, 2*Math.PI, false);
					ctx.fill();
					break;
				
				case 'pause':
					ctx.fillRect(0, 0, (btncanvas.clientWidth/2)-2, btncanvas.clientHeight);
					ctx.fillRect((btncanvas.clientWidth/2)+2, 0, btncanvas.clientWidth, btncanvas.clientHeight);
					break;
				
				case 'play':
				default:
					ctx.beginPath();
					ctx.moveTo(0,0);
					ctx.lineTo(0, btncanvas.clientHeight);
					ctx.lineTo(btncanvas.clientHeight, btncanvas.clientHeight/2);
					ctx.fill();
					break;
			}
		}
	}
	
	//Public callback for next/previous main controller
	//This method is called from the main controller
	this.callback = function() {
		//4 : HAVE_ENOUGH_DATA - enough data available to start playing
		if (oAudio.readyState == 4) oAudio.currentTime = 0;
		playAudio();
	}
	
	//Seek bar
	//When the user click on the bar it should start playing at the specific time if the buffer reach that point
	//It plays this track on click and pause any other track playing
	function seekBar(e) { 
		//make sure the audio source has been set
		loadMP3();
		//if event is not set assign last window event
		if (!e) e = window.event;
		try {
			//calculate the current time based on position of mouse cursor in canvas box
			var toTime = oAudio.duration * ( (e.offsetX == undefined ? e.layerX : e.offsetX) / canvas.clientWidth);
			if ( isNaN(toTime) ) toTime = 0;
			if ( oAudio.buffered.length > 0 ) {
				var bufferIndex = oAudio.buffered.length-1;
				//if new position hasn't been buffered get to last buffered possible position
				if ( toTime > oAudio.buffered.end( bufferIndex ) ) {
					var seekTime = oAudio.buffered.end( bufferIndex );
					if ( seekTime >= 0 && seekTime < oAudio.duration ) toTime = seekTime;
				}
				oAudio.currentTime = toTime;
			}
			//autoplay on seek
			if (oAudio.paused) {
				if ( current.audio != null && current.audio != oAudio ) current.audio.pause();
				oAudio.play();
				current.audio = oAudio;
				current.id = ID;
			}
		}
		catch(err) {
			console.log('Error while using seek bar: ' + err);
		}
	}
	
	//Play and pause function 
	function playAudio() {
		try {
			//make sure the audio source has been set
			loadMP3();
			
			if (oAudio.paused) {
				if ( current.audio != null && current.audio != oAudio ) current.audio.pause();
				oAudio.play();
				current.audio = oAudio;
				current.id = ID;
			}
			else {
				oAudio.pause();
			}
		}
		catch(err) {
			console.log('Error while playing mp3 file: ' + err);
		}
	}
	
	//Set source of audio object
	function loadMP3() {
		//load mp3 only when someone wants to play current track
		if ( !oAudio.src ) {
			//show loading icon
			drawIcon('loading');
			//set source of audio object
			var audioURL = document.getElementById(audioFile);
			oAudio.src = audioURL.value;
			//force resize of canvas to the parent div width
			canvas.width = document.getElementById(parentDIV).offsetWidth;
		}
	}
	
	//Init setup
	function init() {
		//add audioplayer html
		showPlayer();
		
		//set audio object
		oAudio = document.getElementById(audioIDName);
		//set canvas now that it has been added to the page
		canvas = document.getElementById(audioSeek);

		//event listener for play/pause button
		document.getElementById(audioBTNPlay).addEventListener('click', function(e){ playAudio(); }, false);
		//toggle play/pause image
		oAudio.addEventListener('playing', function() {
			drawIcon('pause');
			//update progress bar
			drawBar();
		}, false);
		oAudio.addEventListener('pause', function() {
			drawIcon('play');
			//update progress bar status when paused
			drawBar();
		}, false);
		//when the track has finished playing reset current time
		oAudio.addEventListener('ended', function() {
			drawIcon('play');
			this.pause();
			this.currentTime = 0;
			//update progress bar
			drawBar();
			//call next track from main controller
			nextCallback(ID);
		}, false);
		
		//set up event to update the progress bar
		oAudio.addEventListener('timeupdate', function(){ 
			drawBar();
		}, false); 
		oAudio.addEventListener('progress', function(){ 
			drawBar();
		}, false); 
		
		//set up mouse down/drag to control position of audio
		canvas.addEventListener('click', function(e){
			seekBar(e);
		}, false);
		canvas.addEventListener('mousedown', function(e){
			document.onmousemove = function(event) {
				seekBar(event);
			}
			document.onmouseup = function() {
				document.onmousemove = null
			}
		}, false);

		//change canvas size on resize
		window.addEventListener('resize', function() {
			canvas.width = document.getElementById(parentDIV).offsetWidth;
		}, false);
		
		//error handle
		oAudio.addEventListener('error', function error(err){ console.log('Error while loading mp3 file: ' + err); }, false); 
	}
	
}

/*
 *
 * TrackList object description:
 *
 * [
 *	{
 *		url:'url/of/your.mp3',
 *		title:'Your title',
 *		year:'2014'
 *	}
 * ]
 *
 * The waveform must be in the same folder as the mp3 (exact same name + extension + .png)
 * your.mp3.png would be the waveform name for the file your.mp3
 *
 */
function tinyplayer(TrackList, ShowWaveform, ShowHelp) {
	//if audio element is supported register events
	if (window.HTMLAudioElement) {
		window.addEventListener('DOMContentLoaded', function() { 

			//add help at the top of the track list
			function help(parentdiv) {
				//display help with available shortcuts
				var help = [
				{
					key:'Spacebar',
					description:'Toggle play / pause',
				},
				{
					key:'[',
					description:'Play previous track',
				},
				{
					key:']',
					description:'Play next track',
				},
				{
					key:'p',
					description:'Rewind current track',
				}
				];
				//help container
				var div = document.createElement('div');
				div.id = 'audiohelp';
				//help content
				divContent      = '<div id="audiohelptitle"><h3>List of available shorcuts:</h3></div>';
				divContent     += '<div id="audiohelpcommands">';
				for (var i=0; i<help.length; i++) {
					divContent    += '<div class="audiohelpshortcuts">';
					divContent    += '<div class="audiohelpkey">'+help[i].key+'</div>';
					divContent    += '<div class="audiohelpdescription">'+help[i].description+'</div>';
					divContent    += '</div>';
				}
				divContent     += '</div>';
				div.innerHTML = divContent;
				document.getElementById(parentdiv).appendChild(div);
			}

			//keyboard shortcuts to control playback
			function kbShortcuts(e) {
				switch(e.keyCode) {
					//p key to play current track from start
					case 80:
							e.preventDefault();
							if (current.audio == null) return;
							current.audio.currentTime = 0;
							current.audio.play();
							break;
					//[ key to play previous track
					case 219:
							e.preventDefault();
							if (current.id == null) current.id = 0;
							prevCallback(current.id);
							break;
					//] key to play next track
					case 221:
							e.preventDefault();
							if (current.id == null) current.id = 0;
							nextCallback(current.id);
							break;
					//spacebar to toggle play/pause current track
					case 32:
							e.preventDefault();
							//if current.audio is not specified start with first track
							if (current.audio == null) {
								nextCallback(-1);
								return;
							}
							if ( current.audio.paused ) current.audio.play();
							else current.audio.pause();
							break;
				}
			}

			//play previous track - ID is the current ID of the mp3 playing
			function prevCallback(ID) {
				try {
					//get previous track from alltracks
					alltracks[ (--ID >= 0 ? ID : alltracks.length ) ].callback();
				} catch(err) {
					console.log('Error while playing previous track: ' + err);
				}
			}
			
			//play next track - ID is the current ID of the mp3 playing
			function nextCallback(ID) {
				try {
					//get next track from alltracks
					alltracks[ (++ID < alltracks.length ? ID : 0 ) ].callback();
				} catch(err) {
					console.log('Error while playing next track: ' + err);
				}
			}

			//display help?
			if (ShowHelp != undefined) {
				//add help to all_tracks div ID
				help('all_tracks');
			}
			
			//current track object
			var current = { id: null, audio: null };
			//save all audio objects in this array
			var alltracks = new Array();
			
			//populate array of tracks and use ID, url, title
			for (var i=0; i < TrackList.length; i++) {
				alltracks[i] = new Track( i, TrackList[i], nextCallback, current, ShowWaveform );
			}
		
			//add event listener for keyboard shortcuts
			window.addEventListener("keydown", kbShortcuts, false);
			
		}, false);
	}
}
