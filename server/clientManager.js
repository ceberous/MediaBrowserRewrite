var fs			= require('fs');
var path		= require("path");
var colors		= require("colors");
//var jsonfile	= require("jsonfile");
var REDIS 		= require("redis");
var redis = REDIS.createClient( "8443" , "localhost" );
//redis.select( 3 , function() { console.log("selected table 3"); });
module.exports.redis = redis;
// https://www.sitepoint.com/caching-a-mongodb-database-with-redis/

var wEmitter	= require("../main.js").wEmitter;
var wSkypeNames = require("../personal.js").skypeNames;


function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

// DATABASE BULLSHIT
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const LAST_SS_SKELETON = { PREVIOUS_ACTION: null, CURRENT_ACTION: null, Firefox: {} ,  SkypeCall: {} , LocalMedia: {} , Mopidy: {} , YTLiveBackground: {} , YTFeed: {} , Twitch: {} };
var LAST_SS = require( "jsonfile-obj-db" );
LAST_SS.open( { path: "./server/save_files/lastSavedState" , skeleton: LAST_SS_SKELETON } );
console.log( LAST_SS.self.LocalMedia.LAST_PLAYED );
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// EXPORTS
// ==========================================================================================================
// ==========================================================================================================
module.exports.edit_Last_SS = LAST_SS.edit;
module.exports.get_Last_SS = function() { return LAST_SS.self; };
module.exports.get_Last_SS_PROP = function( wProp ) { return LAST_SS.self[ wProp ]; };
module.exports.restorePreviousAction = restorePreviousAction;
module.exports.pressButtonMaster = wPressButtonMaster;
// ==========================================================================================================
// ==========================================================================================================


// ADDON ?? INITIALIZATION
// =====================================================================
// =====================================================================
var BTN_MAN 			= require( "./buttonManager.js" );
var EMAIL_MAN 			= require( "./emailManager.js" );
var USB_CEC_MAN 		= require( "./utils/cecClientManager.js" );
var SKYPE_MAN 			= require( "./skypeManager.js" );
var MOPIDY_MAN 			= require( "./mopidyManager.js" );
//var LOCAL_VIDEO_MAN		= require( "./localMediaManager.js" );
var LOCAL_VIDEO_MAN		= require( "./localMediaManagerRewrite.js" );
var TWITCH_MAN			= require( "./twitchManager.js" );
var YOUTUBE_MAN			= require( "./youtubeManager.js" );

LAST_SS.save();
// =====================================================================
// =====================================================================



// STATE-DEFINITIONS
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const STATE_ACTION_MAP = {
	"YTLiveBackground": { start: YOUTUBE_MAN.startYTLiveBackground , stop: YOUTUBE_MAN.stopYTLiveBackground , resume: YOUTUBE_MAN.startYTLiveBackground } ,
	"MopidyYTLiveBackground": { 
		start: startMopidyYTLiveBackground , stop: stopMopidyYTLiveBackground , 
		pause: MOPIDY_MAN.pause , resume: MOPIDY_MAN.resume ,
		next: MOPIDY_MAN.next , previous: MOPIDY_MAN.previous
	},
	"YTStandard": { start: YOUTUBE_MAN.startYTStandard , stop: YOUTUBE_MAN.stopYTStandard },
	"TwitchLive": { start: TWITCH_MAN.playLive , stop: TWITCH_MAN.stopLive },
	"SkypeCall": { start: SKYPE_MAN.startCall , stop: SKYPE_MAN.endCall },
	"LocalMedia": { 
		start: LOCAL_VIDEO_MAN.play , stop: LOCAL_VIDEO_MAN.stop , 
		pause: LOCAL_VIDEO_MAN.pause , resume: LOCAL_VIDEO_MAN.resume , 
		next: LOCAL_VIDEO_MAN.next , previous: LOCAL_VIDEO_MAN.previous 
	},
};
LAST_SS.self.CURRENT_ACTION = null;
var FIRST_ACTION_FROM_BOOT = true;
var RESTORE_VOIDED = false;
var GLOBAL_PAUSED = false;
var CACHED_START_PREVIOUS_ARGS = null;
var CACHED_START_CURRENT_ARGS = null;
var JOB_OVERRIDE_HALEY_IS_HOME = false;
var HALEY_HOME_OVERRIDED_ALREADY = false;
var TWITCH_LIVE_CHANNEL_INDEX = null;
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// STATE-CONTROLLERS
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function startCurrentAction( wArgArray ) {

	USB_CEC_MAN.activate();

	if ( FIRST_ACTION_FROM_BOOT ) {
		CACHED_START_PREVIOUS_ARGS = wArgArray;
		LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
		FIRST_ACTION_FROM_BOOT = false;
	}
	else { CACHED_START_PREVIOUS_ARGS = CACHED_START_CURRENT_ARGS;  }
	CACHED_START_CURRENT_ARGS = wArgArray; 
	//console.log( STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ] ); 
	STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ].start( wArgArray[0] , wArgArray[1] , wArgArray[2] , wArgArray[3] ); 
}
function stopCurrentAction( wArg ) { if ( LAST_SS.self.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ].stop( wArg ); /*LAST_SS.self.CURRENT_ACTION = null;*/ } }
function pauseCurrentAction( wArg ) { if ( LAST_SS.self.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ].pause( wArg ); GLOBAL_PAUSED = true; } }
function resumeCurrentAction( wArg ) { if ( LAST_SS.self.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ].resume( wArg ); GLOBAL_PAUSED = false; } }
async function restorePreviousAction( wArg ) {
	wcl("inside restore previous action");
	if ( RESTORE_VOIDED ) { return; }
	if ( LAST_SS.self.PREVIOUS_ACTION === LAST_SS.self.CURRENT_ACTION ) { return; }
	await wSleep( 3000 );
	wcl( LAST_SS.self.PREVIOUS_ACTION  + " = " + CACHED_START_PREVIOUS_ARGS );
	wcl( LAST_SS.self.CURRENT_ACTION + " = " + CACHED_START_CURRENT_ARGS );
	if ( LAST_SS.self.PREVIOUS_ACTION !== null ) {
		STATE_ACTION_MAP[ LAST_SS.CURRENT_ACTION ].stop( true );
		await wSleep( 3000 );
		LAST_SS.self.CURRENT_ACTION = LAST_SS.PREVIOUS_ACTION; 
		LAST_SS.self.PREVIOUS_ACTION = null; 
		startCurrentAction( CACHED_START_PREVIOUS_ARGS );
	}
}
function nextMediaInCurrentAction() { if ( LAST_SS.self.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ].next(); } }
function previousMediaInCurrentAction() { if ( LAST_SS.self.CURRENT_ACTION !== null ) { STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ].previous(); } }

function properShutdown() { stopCurrentAction(); MOPIDY_MAN.shutdown(); LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION; LAST_SS.save(); }
//wEmitter.on( "restorePreviousAction" , function() { console.log("we should be restoring previous action = " + LAST_SS.self.PREVIOUS_ACTION); restorePreviousAction(); });
wEmitter.on( "closeEverything" , function() { properShutdown(); });

function startMopidyYTLiveBackground( wGenre ) {
	RESTORE_VOIDED = false;
	LAST_SS.self.Mopidy.activeTask = "buildAndPlayRandomGenreList";
	LAST_SS.self.Mopidy.selectedGenre = wGenre;
	LAST_SS.self.Mopidy.activeListName = "RandomGen1";
	MOPIDY_MAN.startNewTask( LAST_SS.self.Mopidy.activeTask , wGenre , "RandomGen1" );
	YOUTUBE_MAN.startYTLiveBackground();
}
function stopMopidyYTLiveBackground() {
	MOPIDY_MAN.stop();
	YOUTUBE_MAN.stopYTLiveBackground();
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// USER-CONTROL
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function BUTTON_PRESS_0( wArgArray ) {
	wcl( "PRESSED BUTTON 0" );
	wArgArray = wArgArray || [ "nothing" ];
	LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	LAST_SS.self.CURRENT_ACTION = "YTLiveBackground";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_1( wArgArray ) {
	wArgArray = wArgArray || [ "classic" ];
	wcl( "PRESSED BUTTON 1" );
	if ( LAST_SS.self.CURRENT_ACTION !== "MopidyYTLiveBackground" ) { stopCurrentAction(); }
	LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	LAST_SS.self.CURRENT_ACTION = "MopidyYTLiveBackground";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_2( wArgArray ) {
	wcl( "PRESSED BUTTON 2" );
	wArgArray = wArgArray || [ "edm" ];
	if ( LAST_SS.self.CURRENT_ACTION !== "MopidyYTLiveBackground" ) { stopCurrentAction(); }
	LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	LAST_SS.self.CURRENT_ACTION = "MopidyYTLiveBackground";
	startCurrentAction( wArgArray );
}

async function BUTTON_PRESS_3( wArgArray ) {
	// YOUTUBE STANDARD / TWITCH LIVE 
	console.log("are we here ???");
	RESTORE_VOIDED = false;
	wArgArray = wArgArray || [ "exbc" ];
	
	LAST_SS.self[ "Twitch" ][ "LIVE" ] = await TWITCH_MAN.confirmLiveStatus();
	console.log( LAST_SS.self[ "Twitch" ][ "LIVE" ] );
	if ( LAST_SS.self[ "Twitch" ][ "LIVE" ].length > 0 ) {
		if ( LAST_SS.self[ "Twitch" ][ "LIVE" ].length == 1 ) {
			TWITCH_LIVE_CHANNEL_INDEX = 0;
		}
		else {
			if ( TWITCH_LIVE_CHANNEL_INDEX !== null ) { TWITCH_LIVE_CHANNEL_INDEX += 1; }
			else { TWITCH_LIVE_CHANNEL_INDEX = 0; }
			if ( TWITCH_LIVE_CHANNEL_INDEX >= LAST_SS.self[ "Twitch" ][ "LIVE" ].length ) { TWITCH_LIVE_CHANNEL_INDEX = 0; }
		}		
	}
	var x1 = LAST_SS.self[ "Twitch" ][ "LIVE" ][ TWITCH_LIVE_CHANNEL_INDEX ].name;
	console.log( x1 );
	wArgArray = [ x1 , "best" ];

	wcl( "PRESSED BUTTON 3" );
	stopCurrentAction();
	LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	LAST_SS.self.CURRENT_ACTION = "TwitchLive";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_4( wArgArray ) {
	// SKYPE One
	wArgArray = wArgArray || [ wSkypeNames.one ];
	wcl( "PRESSED BUTTON 4" );
	stopCurrentAction();
	LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	LAST_SS.self.CURRENT_ACTION = "SkypeCall";
	startCurrentAction( wArgArray );	
}

function BUTTON_PRESS_5( wArgArray ) {
	// SKYPE Two
	wArgArray = wArgArray || [ wSkypeNames.two ];
	wcl( "PRESSED BUTTON 5" );
	stopCurrentAction();
	LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	LAST_SS.self.CURRENT_ACTION = "SkypeCall";
	startCurrentAction( wArgArray );
}

function BUTTON_PRESS_6( wArgArray ) {
	// STOP Everything
	wcl( "PRESSED BUTTON 6" );
	RESTORE_VOIDED = true;
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

const STATE_MAN = require( "./stateManager.js" );
async function BUTTON_PRESS_11( wArgArray ) {
	
	// LOCAL ODYSSEY
	// wcl( "PRESSED BUTTON 11" );
	// RESTORE_VOIDED = false;
	// stopCurrentAction();
	// await wSleep( 1000 );
	// LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	// LAST_SS.self.CURRENT_ACTION = "LocalMedia";
	// startCurrentAction( [ { type: "Odyssey" , last_played: LAST_SS.self[ "LocalMedia" ][ "LAST_PLAYED" ][ "Odyssey" ] } ] );
	// YOUTUBE_MAN.startYTLiveBackground();
	// if ( JOB_OVERRIDE_HALEY_IS_HOME ) { JOB_OVERRIDE_HALEY_IS_HOME = false; HALEY_HOME_OVERRIDED_ALREADY = true; }

	//console.log( LAST_SS.self.LocalMedia.LAST_PLAYED );
	STATE_MAN.start( "./STATES/LocalMedia_Odyseey_Foreground.js" , LAST_SS.self.LocalMedia.LAST_PLAYED.Odyssey || null );

}
wEmitter.on( "forkedStateOver" , function( wEvent ) {
	console.log( "forked state OVER !!!" );
});

async function BUTTON_PRESS_12( wArgArray ) {
	// LOCAL TV SHOW
	wcl( "PRESSED BUTTON 12" );
	RESTORE_VOIDED = false;
	stopCurrentAction();
	await wSleep( 1000 );
	LAST_SS.self.PREVIOUS_ACTION = LAST_SS.self.CURRENT_ACTION;
	LAST_SS.self.CURRENT_ACTION = "LocalMedia";
	startCurrentAction( [ { type: "TVShows" , last_played: LAST_SS.self[ "LocalMedia" ][ "LAST_PLAYED" ][ "TVShows" ] } ] );
}

function wPressButtonMaster( wButtonNum , wArgArray ) {
	var x1 = "MB-Pressed--" + wButtonNum.toString();
	var dNow = new Date();
	var x2 = dNow.getMonth() + '-' + dNow.getDate() + '-' + dNow.getFullYear() + '--' + dNow.getHours() + '-' + dNow.getMinutes();
	EMAIL_MAN.sendEmail( x2 , x1 );
	if ( !HALEY_HOME_OVERRIDED_ALREADY && dNow.getHours() === 15 && JOB_OVERRIDE_HALEY_IS_HOME == false ) { JOB_OVERRIDE_HALEY_IS_HOME = true; wButtonNum = 11; }
	switch( wButtonNum ) {
		case 0:
			BUTTON_PRESS_0( wArgArray );
			break;
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

// Testing32

var schedule = require('node-schedule');
var wStartTime = "01 16 * * 1,2,3,4,5";
var wStopTime = "01 18 * * 1,2,3,4,5";
var j1 = schedule.scheduleJob( wStartTime , function() { if ( !JOB_OVERRIDE_HALEY_IS_HOME ) { BUTTON_PRESS_11(); } });
//var j2 = schedule.scheduleJob( wStopTime , function(){ if ( LAST_SS.self.CURRENT_ACTION === "YTLiveBackground" ) { BUTTON_PRESS_6(); } });
var j2 = schedule.scheduleJob( wStopTime , function(){ BUTTON_PRESS_6(); YOUTUBE_MAN.stopYTLiveBackground(); HALEY_HOME_OVERRIDED_ALREADY = false; } );