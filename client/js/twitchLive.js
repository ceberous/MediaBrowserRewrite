function startPlayer() {
	var xWidth = $( window ).width();
	var xHeight = ( xWidth / 2 );
	var xOptions = {
		width: xWidth ,
		height: xHeight ,
		channel: LIVE_USERS[0] ,
		allowfullscreen: true ,
		autoplay: true ,
		muted: false ,
	};
	TWITCH_PLAYER = new Twitch.Player( "addTwitchPlayerHere" , xOptions );
	TWITCH_PLAYER.addEventListener( "online" , function () {
		console.log( "Player ONLINE !!!" );
	});
	TWITCH_PLAYER.addEventListener( "offline" , function () {
		console.log( "Player OFFLINE !!!" );
	});
	TWITCH_PLAYER.addEventListener( "ready" , function () {
		console.log( "Player READY !!!" );
	});
	TWITCH_PLAYER.addEventListener( "ended" , function () {
		console.log( "Player ENDED !!!" );
	});
	TWITCH_PLAYER.addEventListener( "play" , function () {
		console.log( "Player PLAY !!!" );
		socket.emit( "twitchReadyForFullScreenGlitch" );
	});
	TWITCH_PLAYER.addEventListener( "pause" , function () {
		console.log( "Player PAUSE !!!" );
	});	
	//player.setVolume( 0.5 );
}



var TWITCH_PLAYER = null;
var LIVE_USERS = null;

var socket = null;
var sockIOConnectionString = socketIOServerAddress + ":" + socketIOPORT;
function wSocketSend( wTaskName ) { socket.emit( wTaskName ); console.log("we told server we are ready"); }
$(document).ready( function() {

	$("#addPlayerHere").append( "<div id='player'></div>" );

	socket = io.connect( sockIOConnectionString );
	
	socket.on( "newConnection" , function ( data ) {
		console.log( socket.id );
		console.log( data.message );
		console.log( data.twitchLiveName );
		$( "#wPlaceHolder" ).hide();
		setTimeout( function(){ wSocketSend( "twitchLiveReady" ); } , 500 );
	});

	socket.on( "StartLiveTwitch" , function( data ) {
		//YTIFrameManager.init();
		console.log( data );
		LIVE_USERS = data.liveUsers;
		startPlayer();
		//alert( "We are supposed to start twitch player now" );

	});

	socket.on( "shutdown" , function( data ) {
		//YTIFrameManager.wPlayer.destroy();
	});

});