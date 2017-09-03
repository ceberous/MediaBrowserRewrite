const path = require("path");
const spawn = require("child_process").spawn;
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

function fixPathSpace(wFP) {
	wFP = wFP.replace( " " , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}

const mplayerWrapperScript_FP = path.join( __dirname , "mplayerWrapper.js" );
var wPROC = null;
var wPROC_INT = null;
var wPROC_STATUS = null;
var wPROC_DURATION = null;
var wPROC_TIME = null;
function cleanupChildPROC() { clearInterval( wPROC_INT ); wPROC.unref(); }
function wPlayFilePath( wFP ) {
	
	process.env.mplayerFP = fixPathSpace( wFP );
	//console.log( process.env.mplayerFP );

	var wOptions = {
		stdio: [ "pipe" , 1 , 2 , "ipc" ], // === 2 way communication
		//stdio: [ null , null , 2 , "ipc" ], // === 1 way , from child to parent only
		env: process.env
	}; 

	wPROC = spawn( "node" , [ mplayerWrapperScript_FP ] , wOptions );
	wPROC.on( "message" , function( wMessage ) {
		if ( wMessage.feedback ) { /* console.log( wMessage.feedback ); */  if ( wMessage.feedback === "UNREF_ME" ) { cleanupChildPROC();  } }
		else if ( wMessage.status ) { /* console.log( wMessage.status ); */ wPROC_STATUS = wMessage.status }
		else if ( wMessage.duration ) { /* console.log( wMessage.duration ); */ wPROC_DURATION = wMessage.duration; }
		else if ( wMessage.time ) {  wPROC_TIME = wMessage.time; }
	});

}

function wQuit() { wPROC.send( "quit" ); return wPROC_TIME; }
function wPause() { wPROC.send( "pause" ); return wPROC_TIME; }
function wStop() { wPROC.send( "stop" ); return wPROC_TIME; }
function wSeekSeconds( wSeconds ) { wPROC.send( "seekSeconds/" + wSeconds.toString() ); }
function wSeekPercent( wPercent ) { wPROC.send( "seekPercent/" + wPercent.toString() ); }
function wHideSubtitles() { wPROC.send( "hideSubtitles" ); }
function wFullScreen() { wPROC.send( "fullscreen" ); }
function wGetCurrentTime() { return wPROC_TIME }

module.exports.playFilePath = wPlayFilePath;
module.exports.quit = wQuit;
module.exports.pause = wPause;
module.exports.stop = wStop;
module.exports.seekSeconds = wSeekSeconds;
module.exports.seekPercent = wSeekPercent;
module.exports.hideSubtitles = wHideSubtitles;
module.exports.fullscreen = wFullScreen;
module.exports.getCurrentTime = wGetCurrentTime;



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