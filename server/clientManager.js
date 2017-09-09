var fs			= require('fs');
var path		= require("path");
var colors		= require("colors");
var jsonfile	= require("jsonfile");

var wEmitter	= require("../main.js").wEmitter;
var wSkypeNames = require("../personal.js").skypeNames;

function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

// EXPORTS
// ==========================================================================================================
// ==========================================================================================================
module.exports.update_Last_SS = xUpdate_Last_SS;
module.exports.update_Last_SS_OBJ_PROP = xUpdate_Last_SS_OBJ_PROP;
module.exports.xUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP = xUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP;
module.exports.get_Last_SS = function() { return LAST_SS; };
module.exports.restorePreviousAction = restorePreviousAction;
module.exports.pressButtonMaster = wPressButtonMaster;
// ==========================================================================================================
// ==========================================================================================================

// DATABASE BULLSHIT
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
			// ehhhh????? 
			// http://www.tingodb.com/
			// https://github.com/louischatriot/nedb
var 	LAST_SS = { PREVIOUS_ACTION: null, CURRENT_ACTION: null, Firefox: {} ,  SkypeCall: {} , LocalMedia: {} , Mopidy: {} , YTLiveBackground: {} , YTFeed: {} , Twitch: {} };
const 	LAST_SS_FILE_PATH 	= path.join( __dirname , "save_files" , "lastSavedState.json" );
function WRITE_LAST_SAVED_STATE_FILE() { jsonfile.writeFileSync( LAST_SS_FILE_PATH , LAST_SS ); }
try { LAST_SS = jsonfile.readFileSync( LAST_SS_FILE_PATH ); }
catch ( error ){ wcl( "LAST_SAVED_STATE_FILE NOT FOUND !!!" ); WRITE_LAST_SAVED_STATE_FILE(); }
function xUpdate_Last_SS( wProp , xProp , wOBJ ) {
	return new Promise( function( resolve , reject ) {
		try {
			// console.log("\n");
			// console.log( LAST_SS[ "LocalMedia" ] );
			// console.log("\n");
			wcl( "updating LAST_SS property --> " + wProp + " -- " + xProp + " <-- TO --> " );
			console.log( wOBJ );
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
			console.log( jProp );
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
			// console.log( LAST_SS[ "LocalMedia" ] );
			// console.log("\n");			
			wcl( "updating LAST_SS property --> " + wProp + " -- " + xProp + " --- " + wOBJ_Key + " --- " + wSECONDARY_KEY +" <-- TO --> " );
			console.log( jProp );
			LAST_SS[ wProp ][ xProp ][ wOBJ_Key ][ wSECONDARY_KEY ] = jProp;
			WRITE_LAST_SAVED_STATE_FILE();
			wEmitter.emit( "controlStatusUpdate" , LAST_SS );
			resolve( "success" );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ADDON ?? INITIALIZATION
// =====================================================================
// =====================================================================
var BTN_MAN 			= require( "./buttonManager.js" );
var EMAIL_MAN 			= require( "./emailManager.js" );
var USB_IR_MAN 			= require( "./usbIRManager.js" );
var SKYPE_MAN 			= require( "./skypeManager.js" );
var MOPIDY_MAN 			= require( "./mopidyManager.js" );
var LOCAL_VIDEO_MAN		= require( "./localMediaManager.js" );
var TWITCH_MAN			= require( "./twitchManager.js" );
var YOUTUBE_MAN			= require( "./youtubeManager.js" );
// =====================================================================
// =====================================================================


// STATE-DEFINITIONS
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const STATE_ACTION_MAP = {
	"MopidyYTLiveBackground": { start: startMopidyYTLiveBackground , stop: stopMopidyYTLiveBackground , pause: MOPIDY_MAN.pause , resume: MOPIDY_MAN.resume  },
	"YTStandard": { start: YOUTUBE_MAN.startYTStandard , stop: YOUTUBE_MAN.stopYTStandard },
	"TwitchLive": { start: TWITCH_MAN.playLive , stop: TWITCH_MAN.stopLive },
	"SkypeCall": { start: SKYPE_MAN.startCall , stop: SKYPE_MAN.endCall },
	"LocalMedia": { 
		start: LOCAL_VIDEO_MAN.play , stop: LOCAL_VIDEO_MAN.stop , 
		pause: LOCAL_VIDEO_MAN.pause , resume: LOCAL_VIDEO_MAN.resume , 
		next: LOCAL_VIDEO_MAN.next , previous: LOCAL_VIDEO_MAN.previous 
	},
};
LAST_SS.CURRENT_ACTION = null;
var FIRST_ACTION_FROM_BOOT = true;
var GLOBAL_PAUSED = false;
var CACHED_START_PREVIOUS_ARGS = null;
var CACHED_START_CURRENT_ARGS = null;
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// STATE-CONTROLLERS
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function startCurrentAction( wArgArray ) {
	if ( FIRST_ACTION_FROM_BOOT ) {
		CACHED_START_PREVIOUS_ARGS = wArgArray;
		LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
		FIRST_ACTION_FROM_BOOT = false;
	}
	else { CACHED_START_PREVIOUS_ARGS = CACHED_START_CURRENT_ARGS;  }
	CACHED_START_CURRENT_ARGS = wArgArray; 
	//console.log( STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ] ); 
	STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].start( wArgArray[0] , wArgArray[1] , wArgArray[2] , wArgArray[3] ); 
}
function stopCurrentAction( wArg ) { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].stop( wArg ); /*LAST_SS.CURRENT_ACTION = null;*/ } }
function pauseCurrentAction( wArg ) { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].pause( wArg ); GLOBAL_PAUSED = true; } }
function resumeCurrentAction( wArg ) { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].resume( wArg ); GLOBAL_PAUSED = false; } }
async function restorePreviousAction( wArg ) {
	wcl("inside restore previous action");
	if ( LAST_SS.PREVIOUS_ACTION === LAST_SS.CURRENT_ACTION ) { return; }
	await wSleep( 3000 );
	wcl( LAST_SS.PREVIOUS_ACTION  + " = " + CACHED_START_PREVIOUS_ARGS );
	wcl( LAST_SS.CURRENT_ACTION + " = " + CACHED_START_CURRENT_ARGS );
	if ( LAST_SS.PREVIOUS_ACTION !== null ) {
		STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].stop( true );
		await wSleep( 3000 );
		LAST_SS.CURRENT_ACTION = LAST_SS.PREVIOUS_ACTION; 
		LAST_SS.PREVIOUS_ACTION = null; 
		startCurrentAction( CACHED_START_PREVIOUS_ARGS );
	}
}
function nextMediaInCurrentAction() { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].next(); } }
function previousMediaInCurrentAction() { if ( LAST_SS.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].previous(); } }

function properShutdown() { stopCurrentAction(); LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION; WRITE_LAST_SAVED_STATE_FILE(); }
//wEmitter.on( "restorePreviousAction" , function() { console.log("we should be restoring previous action = " + LAST_SS.PREVIOUS_ACTION); restorePreviousAction(); });
wEmitter.on( "closeEverything" , function() { properShutdown(); });

function startMopidyYTLiveBackground( wGenre ) {
	//LAST_SS.Mopidy.activeTask = "buildAndPlayRandomGenreList";
	//MOPIDY_MAN.startNewTask( LAST_SS.Mopidy.activeTask , wGenre , "RandomGen1" );
	YOUTUBE_MAN.startYTLiveBackground();

}
function stopMopidyYTLiveBackground() {
	MOPIDY_MAN.shutdown();
	YOUTUBE_MAN.stopYTLiveBackground();
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// USER-CONTROL
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function BUTTON_PRESS_1( wArgArray ) {
	wArgArray = wArgArray || [ "classic" ];
	wcl( "PRESSED BUTTON 1" );
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "MopidyYTLiveBackground";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_2( wArgArray ) {
	wcl( "PRESSED BUTTON 2" );
	wArgArray = wArgArray || [ "edm" ];
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "MopidyYTLiveBackground";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_3( wArgArray ) {
	// YOUTUBE STANDARD / TWITCH LIVE 
	wArgArray = wArgArray || [ "twitch.tv/tim885885" ];
	wcl( "PRESSED BUTTON 3" );
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "TwitchLive";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_4( wArgArray ) {
	// SKYPE One
	wArgArray = wArgArray || [ wSkypeNames.one ];
	wcl( "PRESSED BUTTON 4" );
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "SkypeCall";
	startCurrentAction( wArgArray );	
}

function BUTTON_PRESS_5( wArgArray ) {
	// SKYPE Two
	wArgArray = wArgArray || [ wSkypeNames.two ];
	wcl( "PRESSED BUTTON 5" );
	stopCurrentAction();
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "SkypeCall";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_6( wArgArray ) {
	// STOP Everything
	wcl( "PRESSED BUTTON 6" );
	stopCurrentAction();
}

function BUTTON_PRESS_7( wArgArray ) {
	// PAUSE EVERYTHING
	wcl( "PRESSED BUTTON 7" );
	if ( !GLOBAL_PAUSED ) { pauseCurrentAction(); }
	else { resumeCurrentAction(); }
}

function BUTTON_PRESS_8( wArgArray ) {
	// PREVIOUS MEDIA
	wcl( "PRESSED BUTTON 8" );
	previousMediaInCurrentAction();
}

function BUTTON_PRESS_9( wArgArray ) {
	// NEXT MEDIA
	wcl( "PRESSED BUTTON 9" );
	nextMediaInCurrentAction();
}

function BUTTON_PRESS_10( wArgArray ) {
	// LOCAL MOVIE
	wcl( "PRESSED BUTTON 10" );
}

function BUTTON_PRESS_11( wArgArray ) {
	// LOCAL ODYSSEY
	wcl( "PRESSED BUTTON 11" );
}

async function BUTTON_PRESS_12( wArgArray ) {
	// LOCAL TV SHOW
	wcl( "PRESSED BUTTON 12" );
	stopCurrentAction();
	await wSleep( 1000 );
	LAST_SS.PREVIOUS_ACTION = LAST_SS.CURRENT_ACTION;
	LAST_SS.CURRENT_ACTION = "LocalMedia";
	startCurrentAction( [ { type: "TVShows" , last_played: LAST_SS[ "LocalMedia" ][ "LAST_PLAYED" ][ "TVShows" ] } ] );
}

function wPressButtonMaster( wButtonNum , wArgArray ) { 
	switch( wButtonNum ) {
		case 1:
			BUTTON_PRESS_1( wArgArray );
			break;
		case 2:
			BUTTON_PRESS_2( wArgArray );
			break;
		case 3:
			BUTTON_PRESS_3( wArgArray );
			break;
		case 4:
			BUTTON_PRESS_4( wArgArray );
			break;
		case 5:
			BUTTON_PRESS_5( wArgArray );
			break;
		case 6:
			BUTTON_PRESS_6( wArgArray );
			break;
		case 7:
			BUTTON_PRESS_7( wArgArray );
			break;
		case 8:
			BUTTON_PRESS_8( wArgArray );
			break;
		case 9:
			BUTTON_PRESS_9( wArgArray );
			break;
		case 10:
			BUTTON_PRESS_10( wArgArray );
			break;
		case 11:
			BUTTON_PRESS_11( wArgArray );
			break;
		case 12:
			BUTTON_PRESS_12( wArgArray );
			break;
		default:
			break;																																				
	}
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
