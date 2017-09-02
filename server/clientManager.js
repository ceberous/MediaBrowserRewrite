var fs 			= require('fs');
var path 		= require("path");
var colors 		= require("colors");
var jsonfile	= require("jsonfile");

var wEmitter	= require('../main.js').wEmitter;

function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var 	LAST_SS = { PREVIOUS_ACTION: null, CURRENT_ACTION: null, Firefox: {} ,  SkypeCall: {} , LocalVideo: {} , Mopidy: {} , YTLiveBackground: {} , YTFeed: {} , Twitch: {} };
const 	LAST_SS_FILE_PATH 	= path.join( __dirname , "save_files" , "lastSavedState.json" );
function WRITE_LAST_SAVED_STATE_FILE() { jsonfile.writeFileSync( LAST_SS_FILE_PATH , LAST_SS ); }
try { lastSavedState = jsonfile.readFileSync( LAST_SS_FILE_PATH ); }
catch ( error ){ wcl( "LAST_SAVED_STATE_FILE NOT FOUND !!!" ); WRITE_LAST_SAVED_STATE_FILE(); }
function xUpdate_Last_SS( wProp , xProp , wOBJ ) {
	return new Promise( function( resolve , reject ) {
		try {
			console.log( "updating LAST_SS property --> " + wProp + " -- " + xProp + " <-- TO --> " );
			console.log( wOBJ );
			LAST_SS[ wProp ][ xProp ] = wOBJ;
			WRITE_LAST_SAVED_STATE_FILE();
			wEmitter.emit( "controlStatusUpdate" , LAST_SS );
			resolve( "success" );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
//wEmitter.on( "updateLastSS" , ( wProp , xProp , wOBJ )=> { xUpdate_Last_SS( wProp , xProp , wOBJ ); });
module.exports.update_Last_SS = xUpdate_Last_SS;
module.exports.get_Last_SS = function() { return LAST_SS; };
module.exports.restorePreviousAction = restorePreviousAction;

var BTN_MAN 			= require( "./buttonManager.js" );
var USB_IR_MAN 			= require( "./usbIRManager.js" );
//var FIREFOX_MAN 		= require( "./firefoxManager.js" );
var SKYPE_MAN 			= require( "./skypeManager.js" );
var MOPIDY_MAN 			= require( "./mopidyManager.js" );
var LOCAL_VIDEO_MAN		= require( "./localVideoManager.js" );
var TWITCH_MAN			= require( "./twitchManager.js" );
var YOUTUBE_MAN			= require( "./youtubeManager.js" );

function startMopidyYTLiveBackground( wGenre ) {
	//LAST_SS.Mopidy.activeTask = "buildAndPlayRandomGenreList";
	//MOPIDY_MAN.startNewTask( LAST_SS.Mopidy.activeTask , wGenre , "RandomGen1" );
	YOUTUBE_MAN.startYTLiveBackground();

}
function stopMopidyYTLiveBackground() {
	MOPIDY_MAN.shutdown();
	YOUTUBE_MAN.stopYTLiveBackground();
}


const STATE_ACTION_MAP = {
	"MopidyYTLiveBackground": { start: startMopidyYTLiveBackground , stop: stopMopidyYTLiveBackground , pause: MOPIDY_MAN.pause , resume: MOPIDY_MAN.resume  },
	"YTStandard": { start: YOUTUBE_MAN.startYTStandard , stop: YOUTUBE_MAN.stopYTStandard },
	"TwitchLive": {},
	"SkypeCall": { start: SKYPE_MAN.startCall , stop: SKYPE_MAN.endCall },
	"LocalMovie": {},
	"LocalTVShow": {},
	"Odyssey": {},
	"AudioBook": {},
}

function startCurrentAction( wArg ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].start( wArg ); }
function stopCurrentAction( wArg ) { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].stop( wArg ); /*LAST_SS.CURRENT_ACTION = null;*/ } }
function pauseCurrentAction( wArg ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].pause( wArg ); }
function resumeCurrentAction( wArg ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].resume( wArg ); }
function restorePreviousAction( wArg ) {
	wcl("inside restore previous action");
	wcl( LAST_SS.PREVIOUS_ACTION );
	wcl( LAST_SS.CURRENT_ACTION );
	if ( LAST_SS.PREVIOUS_ACTION !== null ) {
		STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].stop();
		LAST_SS.CURRENT_ACTION = LAST_SS.PREVIOUS_ACTION; 
		LAST_SS.PREVIOUS_ACTION = null; 
		STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].start();
	}
}

async function properShutdown() { stopCurrentAction(); await wSleep( 3000 ); process.exit(1); }

wEmitter.on( "closeEverything" , function() { properShutdown(); });
//wEmitter.on( "restorePreviousAction" , function() { console.log("we should be restoring previous action = " + LAST_SS.PREVIOUS_ACTION); restorePreviousAction(); });



wEmitter.on( "button1Press" , async function() {
	wcl( "PRESSED BUTTON 1" );
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "MopidyYTLiveBackground";
	startCurrentAction( "classic" );
});

wEmitter.on( "button2Press" , function() {
	wcl( "PRESSED BUTTON 2" );
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "MopidyYTLiveBackground";
	startCurrentAction( "edm" );
});

wEmitter.on( "button3Press" , function() {
	wcl( "PRESSED BUTTON 3" );
	// YOUTUBE STANDARD
});

wEmitter.on( "button4Press" , function() {
	wcl( "PRESSED BUTTON 4" );
	// SKYPE CAMERON
});

wEmitter.on( "button5Press" , function() {
	wcl( "PRESSED BUTTON 5" );
	// SKYPE COLLIN
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "SkypeCall";
	startCurrentAction( "haley.cerbus" );
});

wEmitter.on( "button6Press" , function() {
	wcl( "PRESSED BUTTON 6" );
	stopCurrentAction();
});

wEmitter.on( "button7Press" , function() {
	wcl( "PRESSED BUTTON 7" );
	// PAUSE EVERYTHING
});

wEmitter.on( "button8Press" , function() {
	wcl( "PRESSED BUTTON 8" );
	// PREVIOUS MEDIA
});

wEmitter.on( "button9Press" , function() {
	wcl( "PRESSED BUTTON 9" );
	// NEXT MEDIA
});

wEmitter.on( "button10Press" , function() {
	wcl( "PRESSED BUTTON 10" );
	// LOCAL MOVIE
});

wEmitter.on( "button11Press" , function() {
	wcl( "PRESSED BUTTON 11" );
	// LOCAL ODYSSEY
});

wEmitter.on( "button12Press" , function() {
	wcl( "PRESSED BUTTON 12" );
	// LOCAL TV SHOW
});