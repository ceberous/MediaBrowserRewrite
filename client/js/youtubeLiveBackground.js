
var YTIFrameManager = {

	"wPlayer" : null,
	"playlist" : null,
	"usingPlaylist": false,
	"muted": true,

	init: function() {

		YTIFrameManager.playlist = YTIFrameManager.buildPlaylistArray( true );
		if ( YTIFrameManager.playlist.length > 1 ) { YTIFrameManager.usingPlaylist = true; }
		YTIFrameManager.showVideo();
		if ( nextVideoTime > 0 ) { YTIFrameManager.startNextVideoInterval(); }

	},

	buildPlaylistArray: function( extraRandom ) {

		function extraShuffle(wArr) {
			var cIDX = wArr.length , wTmp , rIDX;
			while ( 0 !== cIDX ) {
		    	rIDX = Math.floor( Math.random() * cIDX );
		    	cIDX = cIDX - 1;
		    	wTmp = wArr[cIDX];
		    	wArr[ cIDX ] = wArr[ rIDX ];
			    wArr[ rIDX ] = wTmp;
		  	}
			return wArr;
		}

		var wPlaylist = [];
		for ( var i = 0; i < youtubePlaylist.length; ++i ) {
			for( var j = 0; j < youtubePlaylist[ i ].length; ++j ) {
				wPlaylist.push( youtubePlaylist[ i ][ j ].id );
			}
		}
		if ( extraRandom === true ) { wPlaylist = extraShuffle( wPlaylist ); wPlaylist = extraShuffle( wPlaylist ); }
		return wPlaylist;

	},

	tearDown: function() {
		YTIFrameManager.wPlayer.destroy();
		setTimeout(function(){
			YTIFrameManager.wPlayer = null;
			//socket.emit('player closed');
		} , 1000 );
	},

	showVideo: function(wVideo) {

		if ( !wVideo ){ var wVideo = { id: "o2Qmc8Sb6Ws" }; } 

		var wThis = $(window);
		var wOptions = { version: 3 , height: wThis.height() , width: wThis.width() , videoId: YTIFrameManager.playlist[0] , loop: 1 };
		wOptions.events = {
			'onReady': YTIFrameManager.onPlayerReady,
			'onStateChange': YTIFrameManager.onPlayerStateChange,
			'onError': YTIFrameManager.errorHandler,
		};

		YTIFrameManager.wPlayer = new YT.Player( 'player', wOptions );

	},

	errorHandler: function(event) {
		console.log( "error = " + event.data.toString() );
	},

	onPlayerStateChange: function(event) {
		var wID = YTIFrameManager.wPlayer.getVideoUrl().split("https://www.youtube.com/watch?v=")[1];
		switch ( event.data ) {
			case -1:
				console.log(" video is unstarted ");
				//socket.emit( "youtubeLiveStatus" , { status: "unstarted" , id: wID } );
				break;
			case 0:
				console.log(" video is over ");
				socket.emit( "youtubeLiveStatus" , { status: "over" , id: wID } );
				break;
			case 1:
				console.log(" video is now playing ");
				socket.emit( "youtubeLiveStatus" , { status: "playing" , id: wID } );
				break;
			case 2:
				console.log(" video is paused ");
				socket.emit( "youtubeLiveStatus" , { status: "paused" , id: wID } );
				break;
			case 3:
				console.log(" video is buffering ");
				//socket.emit( "youtubeLiveStatus" , { status: "buffering" , id: wID } );
				break;
			case 5:
				console.log(" new video is cued ");
				//socket.emit( "youtubeLiveStatus" , { status: "cued" , id: wID } );
				break;
		}
	},

	onPlayerReady: function(event) {
		console.log("player is supposedly ready");
		if ( YTIFrameManager.usingPlaylist ) { 
			YTIFrameManager.wPlayer.cuePlaylist( YTIFrameManager.playlist );
		}
		setTimeout( function() {
			YTIFrameManager.wPlayer.setShuffle( true );
			YTIFrameManager.wPlayer.setLoop(true);
			if ( YTIFrameManager.muted ) { YTIFrameManager.wPlayer.mute(); }
			socket.emit( "youtubeReadyForFullScreenGlitch" );
			//$( ".ytp-fullscreen-button.ytp-button" ).click();
		} , 1000 );
	},

	startNextVideoInterval: function() {
		setInterval( function() {
			YTIFrameManager.wPlayer.nextVideo();
		} , nextVideoTime );	

	},

};

var socket = null;
var sockIOConnectionString = socketIOServerAddress + ":" + socketIOPORT;
var youtubePlaylist = null;
var nextVideoTime = null;
var twitchPlaylist = null
function wSocketSend( wTaskName ) { socket.emit( wTaskName ); console.log("we told server we are ready"); }
$(document).ready( function() {

	$("#addPlayerHere").append( "<div id='player'></div>" );

	socket = io.connect( sockIOConnectionString );
	
	socket.on( 'newConnection' , function ( data ) {
		console.log(socket.id);
		console.log(data.message);
		$("#wPlaceHolder").hide();
		setTimeout( function(){ wSocketSend( "youtubeLiveBackgroundReady" ); } , 500 );
	});

	socket.on( 'YTLiveBackground' , function( data ) {
		console.log( data );
		nextVideoTime = data.nextVideoTime;
		youtubePlaylist = data.playlist;
		YTIFrameManager.playlist = youtubePlaylist;
		YTIFrameManager.init();
	});

	socket.on( "shutdown" , function( data ) {
		YTIFrameManager.wPlayer.destroy();
	});

});