var fs 			= require('fs');
var path 		= require("path");
var colors 		= require("colors");
var jsonfile	= require("jsonfile");

var wEmitter	= require('../main.js').wEmitter;

function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }


// DATABASE BULLSHIT
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
			// ehhhh????? 
			// http://www.tingodb.com/
			// https://github.com/louischatriot/nedb
var 	LAST_SS = { PREVIOUS_ACTION: null, CURRENT_ACTION: null, Firefox: {} ,  SkypeCall: {} , LocalVideo: {} , Mopidy: {} , YTLiveBackground: {} , YTFeed: {} , Twitch: {} };
const 	LAST_SS_FILE_PATH 	= path.join( __dirname , "save_files" , "lastSavedState.json" );
function WRITE_LAST_SAVED_STATE_FILE() { jsonfile.writeFileSync( LAST_SS_FILE_PATH , LAST_SS ); }
try { LAST_SS = jsonfile.readFileSync( LAST_SS_FILE_PATH ); }
catch ( error ){ wcl( "LAST_SAVED_STATE_FILE NOT FOUND !!!" ); WRITE_LAST_SAVED_STATE_FILE(); }
function xUpdate_Last_SS( wProp , xProp , wOBJ ) {
	return new Promise( function( resolve , reject ) {
		try {
			// console.log("\n");
			// console.log( LAST_SS[ "LocalVideo" ] );
			// console.log("\n");
			wcl( "updating LAST_SS property --> " + wProp + " -- " + xProp + " <-- TO --> " );
			wcl( wOBJ );
			LAST_SS[ wProp ][ xProp ] = wOBJ;
			WRITE_LAST_SAVED_STATE_FILE();
			wEmitter.emit( "controlStatusUpdate" , LAST_SS );
			resolve( "success" );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function xUpdate_Last_SS_OBJ_PROP( wProp , xProp , wOBJ_Key , jProp ) {
	return new Promise( function( resolve , reject ) {
		try {
			wcl( "updating LAST_SS property --> " + wProp + " -- " + xProp + " <-- TO --> " );
			wcl( jProp );
			LAST_SS[ wProp ][ xProp ][ wOBJ_Key ] = jProp;
			WRITE_LAST_SAVED_STATE_FILE();
			wEmitter.emit( "controlStatusUpdate" , LAST_SS );
			resolve( "success" );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function xUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP( wProp , xProp , wOBJ_Key , wSECONDARY_KEY , jProp ) {
	return new Promise( function( resolve , reject ) {
		try {
			// console.log("\n");
			// console.log( LAST_SS[ "LocalVideo" ] );
			// console.log("\n");			
			wcl( "updating LAST_SS property --> " + wProp + " -- " + xProp + " --- " + wOBJ_Key + " --- " + wSECONDARY_KEY +" <-- TO --> " );
			wcl( jProp );
			LAST_SS[ wProp ][ xProp ][ wOBJ_Key ][ wSECONDARY_KEY ] = jProp;
			WRITE_LAST_SAVED_STATE_FILE();
			wEmitter.emit( "controlStatusUpdate" , LAST_SS );
			resolve( "success" );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
//wEmitter.on( "updateLastSS" , ( wProp , xProp , wOBJ )=> { xUpdate_Last_SS( wProp , xProp , wOBJ ); });
module.exports.update_Last_SS = xUpdate_Last_SS;
module.exports.update_Last_SS_OBJ_PROP = xUpdate_Last_SS_OBJ_PROP;
module.exports.xUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP = xUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP;
module.exports.get_Last_SS = function() { return LAST_SS; };
module.exports.restorePreviousAction = restorePreviousAction;
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


var GLOBAL_PAUSED = false;

var BTN_MAN 			= require( "./buttonManager.js" );
var USB_IR_MAN 			= require( "./usbIRManager.js" );
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
	"LocalTVShow": { start: LOCAL_VIDEO_MAN.play , stop: LOCAL_VIDEO_MAN.stop , pause: LOCAL_VIDEO_MAN.pause , resume: LOCAL_VIDEO_MAN.resume  },
	"Odyssey": {},
	"AudioBook": {},
};

function startCurrentAction( wArg1 , wArg2 , wArg3 , wArg4 ) { console.log( STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ] ); STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].start( wArg1 , wArg2 , wArg3 , wArg4 ); }
function stopCurrentAction( wArg ) { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].stop( wArg ); /*LAST_SS.CURRENT_ACTION = null;*/ } }
function pauseCurrentAction( wArg ) { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].pause( wArg ); GLOBAL_PAUSED = true; } }
function resumeCurrentAction( wArg ) { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].resume( wArg ); GLOBAL_PAUSED = false; } }
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
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "SkypeCall";
	startCurrentAction( "live:ccerb96" );	
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
	// STOP Everything
	stopCurrentAction();
});

wEmitter.on( "button7Press" , function() {
	wcl( "PRESSED BUTTON 7" );
	// PAUSE EVERYTHING
	if ( !GLOBAL_PAUSED ) { pauseCurrentAction(); }
	else { resumeCurrentAction(); }
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
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "LocalTVShow";
	//startCurrentAction( "TVShows" , "SouthPark" , 2 , 13 );
	startCurrentAction( "TVShows" , "TheRedGreenShow" , 2 , 1 );
});