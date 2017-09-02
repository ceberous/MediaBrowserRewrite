var process = require("process");

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var MPlayer = require('mplayer');

var player = new MPlayer();;
player.setOptions({
    cache: 512,
    cacheMin: 1
});

player.openFile( process.env.mplayerFP );

player.on( "status" , function( wStatus ) {
	process.send( { status: wStatus } );
});

player.on( "time" , function( wTime ) {
	process.send( { time: wTime } );
});

player.on( "stop" ,  function( wTime ) {
	triggerQuit();
});

async function triggerQuit() {
    // player.player.cmd('quit');
    process.send( { feedback: "UNREF_ME" } );
    await sleep( 2000 );
    process.exit(0);
}

process.on( "message" , function( wData ) {
	//console.log( "FROM_PARENT = " + wData );
	var x = wData.split("/");
	switch( x[0] ) {
		case "quit":
			triggerQuit();
			break;
		case "pause":
			if ( player.status.playing ) { player.pause(); }
			else { player.play(); }
			break;
		case "stop":
			player.stop();
			break;
		case "seekSeconds":
			player.seek( x[1] );
			break;
		case "seekPercent":
			player.seekPercent( x[1] );
			break;
		case "hideSubtitles":
			player.hideSubtitles();
			break;
		case "fullscreen":
			player.fullscreen();
			break;									
	}
});