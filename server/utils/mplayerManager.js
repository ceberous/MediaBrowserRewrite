const path = require("path");
const spawn = require("child_process").spawn;
const colors = require("colors");
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
function wcl( wSTR ) { console.log( colors.black.bgMagenta( "[MPLAYER_MAN] --> " + wSTR ) ); }

function fixPathSpace(wFP) {
	var fixSpace = new RegExp( " " , "g" );
	wFP = wFP.replace( fixSpace , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}
var wEmitter = require('../../main.js').wEmitter;
const mplayerWrapperScript_FP = path.join( __dirname , "mplayerWrapper.js" );
var wPROC = null;
var wPROC_INT = null;
var wPROC_STATUS = null;
var wPROC_DURATION = null;
var wPROC_TIME = null;
function cleanupChildPROC() { clearInterval( wPROC_INT ); try{wPROC.unref();}catch(e){} wEmitter.emit( "MPlayerOVER" ); }
function wPlayFilePath( wFP ) {
	
	process.env.mplayerFP = fixPathSpace( wFP );
	wcl( process.env.mplayerFP );

	var wOptions = {
		stdio: [ "pipe" , 1 , 2 , "ipc" ], // === 2 way communication
		//stdio: [ null , null , 2 , "ipc" ], // === 1 way , from child to parent only
		env: process.env
	}; 

	wPROC = spawn( "node" , [ mplayerWrapperScript_FP ] , wOptions );
	wPROC.on( "message" , function( wMessage ) {
		if ( wMessage.ended ) { console.log("\nEnded = ");  console.log( wMessage ); console.log("\n");  if ( wMessage.ended === "UNREF_ME" ) { wPROC_TIME = Math.floor( wMessage.time ); cleanupChildPROC();  } }
		if ( wMessage.status ) { /* console.log( wMessage.status ); */  wPROC_STATUS = wMessage.status; wPROC_DURATION = Math.floor( wMessage.status.duration ); }
		if ( wMessage.time ) { var x1 = Math.floor( wMessage.time ); wPROC_TIME = ( x1 >= 1 ) ? x1 : wPROC_TIME; }
	});

}

function wQuit() { if ( wPROC !== null ) { wPROC.send( "quit" ); wPROC = null; return wPROC_TIME;  } }
function wPause() { if ( wPROC !== null ) { wPROC.send( "pause" ); return wPROC_TIME; } }
function wStop() { if ( wPROC !== null ) {
	console.log( "inside wStop() and wPROC_TIME = " + wPROC_TIME.toString() ); 
	try { wPROC.send( "stop" ); }
	catch(e){ /*console.log(e);*/ }
	wPROC = null; 
	return wPROC_TIME;
}}
function wSeekSeconds( wSeconds ) { if ( wPROC !== null ) { wPROC.send( "seekSeconds/" + wSeconds.toString() ); } }
function wSeekPercent( wPercent ) { if ( wPROC !== null ) { wPROC.send( "seekPercent/" + wPercent.toString() ); } }
function wHideSubtitles() { if ( wPROC !== null ) { wPROC.send( "hideSubtitles" ); } }
function wFullScreen() { if ( wPROC !== null ) { wPROC.send( "fullscreen" ); } }
function wGetCurrentTime() { return wPROC_TIME; }
function wGetDuration() { return wPROC_DURATION; }


module.exports.playFilePath = wPlayFilePath;
module.exports.quit = wQuit;
module.exports.pause = wPause;
module.exports.stop = wStop;
module.exports.seekSeconds = wSeekSeconds;
module.exports.seekPercent = wSeekPercent;
module.exports.hideSubtitles = wHideSubtitles;
module.exports.fullscreen = wFullScreen;
module.exports.getCurrentTime = wGetCurrentTime;
module.exports.getDuration = wGetDuration;



											// "USER_LAND" tests
// --------------------------------------------------------------------------------------------------------------------------------------

// var x1S = "/home/morpheous/Downloads/South Park Season 1 480p x264 SCREENTIME/South Park - S01E10 Damien - 480p x264 SCREENTIME.mp4";
// var x2S = "/home/morpheous/TMP2/example.mp4";
// var x3S = "/home/morpheous/TMP2/sliced-output.mp4";
// var x4S = "/home/morpheous/TMP2/test1.mp3";
// var x5S = "/home/morpheous/TMP2/example2.mp4";


//wPlayFilePath( x2S );

// var x1IDX = 0;
// wPROC_INT = setInterval(function(){
// 	x1IDX = x1IDX + 25;
// 	wSeekPercent( x1IDX );
// } , 6000 );

// setTimeout( function() {
// 	wQuit();
// } , 20000 );

// setInterval(function(){
// 	console.log("we are still alive !!! unfortunately ");
// } , 4000 );