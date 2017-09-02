var colors = require("colors");
var wEmitter = require('../main.js').wEmitter;
var clientManager = require("./clientManager.js");

function wcl( wSTR ) { console.log( colors.black.bgBlue( "[SIO_SERV_MAN] --> " + wSTR ) ); }
function wEmitFFReady() { wEmitter.emit( "FF_YT_Live_Background_Ready" ); }
module.exports.wOC = function( socket ) {


	var wC = socket.request.connection._peername;
	wcl( wC.address.toString() +  " connected" );

	socket.emit( 'newConnection', { 
		message: 'you are now connected to the sock.io server',
		status: clientManager.get_Last_SS()
	});

	socket.on( "youtubeLiveBackgroundReady" , function() { wEmitFFReady(); });
	socket.on( 'youtubeLiveStatus' , function( data ) { clientManager.update_Last_SS( "YTLiveBackground" , "nowPlaying" , data ); });
	socket.on( 'youtubeReadyForFullScreenGlitch' , function( data ){ wEmitter.emit( "ffGlitchFullScreenYoutube" ); });

	wEmitter.on( 'controlStatusUpdate' , function( wLast_SS ) { socket.emit( 'controlStatusUpdate' , wLast_SS ); } );

	wEmitter.on( 'socketSendTask' , function( wTask , wOptions ) {
		wcl( "socketEmit--> " + wTask );
		socket.emit( wTask , wOptions );
	});

}