const fs	= require( "fs" );
const path	= require( "path" );
const colors	= require( "colors" );

const wEmitter	= require("../main.js").wEmitter;
function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

const redis = require( "../main.js" ).redis;
const RU = require( "./utils/redis_Utils.js" );


// MODULES
// ======================================================================
// ======================================================================
const BTN_MAN 	= require( "./buttonManager.js" );

// Currently Importing This here ONLY for its Initialization Block
const LOCAL_MEDIA_MAN = require( "./localMediaManager.js" ); 

const MOPIDY_MAN = require( "./mopidyManager.js" );

const EMAIL_MAN = require( "./emailManager.js" );
// ======================================================================
// ======================================================================


const wSkypeNames = require("../personal.js").skypeNames;
const R_ACTIVE_STATE = "LAST_SS.ACTIVE_STATE";
var CURRENT_STATE = null;

async function MASTER_STATE_STOP() {
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	// 1.) Kill Firefox
	// 2.) Kill Mplayer
}

async function BUTTON_PRESS_0( wArgArray ) {
	wcl( "PRESSED BUTTON 0" );
	wcl( "Youtube Live Background" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	await RU.setKey( redis , R_ACTIVE_STATE , "YOU_TUBE_LIVE_BACKGROUND" );
	CURRENT_STATE = require( "./STATES/YT_Live_Background.js" );
	await CURRENT_STATE.start();
}

async function BUTTON_PRESS_1( wArgArray ) {
	wcl( "PRESSED BUTTON 1" );
	wcl( "Youtube Live Background with Mopidy Classic Random Playlist" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	
	await RU.setKey( redis , R_ACTIVE_STATE , "MOPIDY_BACKGROUND_GENRE" );
	CURRENT_STATE = await require( "./STATES/Mopidy_Foreground_YT_Live_Background.js" );
	await CURRENT_STATE.start();
}

async function BUTTON_PRESS_2( wArgArray ) {
	wcl( "PRESSED BUTTON 2" );
	// MopidyManager.js Needs Rewritten to Use REDIS
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
}

async function BUTTON_PRESS_3( wArgArray ) {
	// YOUTUBE STANDARD / TWITCH LIVE
	// TwitchManager.js Needs Rewritten to Use REDIS
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	CURRENT_STATE = await require( "./STATES/Twitch_Live_Foreground.js" );
	await CURRENT_STATE.start();
}

async function BUTTON_PRESS_4( wArgArray ) {
	// SKYPE One
	wcl( "PRESSED BUTTON 4" );
	wcl( "Skype Call To: " + wSkypeNames.one );
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	// Special Case , Need to Remmeber Current State So We Can Resume Once Call is Over
	CURRENT_STATE = await require( "./STATES/Skype_Foreground.js" );
	await CURRENT_STATE.start( wSkypeNames.one );
}

async function BUTTON_PRESS_5( wArgArray ) {
	// SKYPE Two
	wcl( "PRESSED BUTTON 5" );
	wcl( "Skype Call To: " + wSkypeNames.two );
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	// Special Case , Need to Remmeber Current State So We Can Resume Once Call is Over
	CURRENT_STATE = await require( "./STATES/Skype_Foreground.js" );
	await CURRENT_STATE.start( wSkypeNames.two );
}

function BUTTON_PRESS_6( wArgArray ) {
	// STOP Everything
	wcl( "PRESSED BUTTON 6" );
	wcl( "STOP" );
	MASTER_STATE_STOP();
}

async function BUTTON_PRESS_7( wArgArray ) {
	// PAUSE EVERYTHING
	wcl( "PRESSED BUTTON 7" );
	wcl( "PAUSE" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.pause(); }
}

async function BUTTON_PRESS_8( wArgArray ) {
	// PREVIOUS MEDIA
	wcl( "PRESSED BUTTON 8" );
	wcl( "PREVIOUS" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.previous(); }
}

async function BUTTON_PRESS_9( wArgArray ) {
	// NEXT MEDIA
	wcl( "PRESSED BUTTON 9" );
	wcl( "NEXT" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.next(); }
}

async function BUTTON_PRESS_10( wArgArray ) {
	// LOCAL MOVIE
	wcl( "PRESSED BUTTON 10" );
	wcl( "Local-Media Movie" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	CURRENT_STATE = require( "./STATES/LocalMedia_Movie_Foreground.js" );
	await CURRENT_STATE.start();
}

async function BUTTON_PRESS_11( wArgArray ) { // http://odysseyscoop.com/episodes/Episodes_free.htm
	wcl( "PRESSED BUTTON 11" );
	wcl( "Local-Media Odyssey" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	CURRENT_STATE = require( "./STATES/LocalMedia_Odyssey_Foreground_YT_Live_Background.js" );
	await CURRENT_STATE.start();
}

async function BUTTON_PRESS_12( wArgArray ) {
	// LOCAL TV SHOW
	wcl( "PRESSED BUTTON 12" );
	wcl( "Local-Media TV Show" );
	if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
	CURRENT_STATE = require( "./STATES/LocalMedia_TV_Foreground.js" );
	await CURRENT_STATE.start();
}


const BP_MAP = [
	BUTTON_PRESS_0 , BUTTON_PRESS_1 , BUTTON_PRESS_2 , BUTTON_PRESS_3 , BUTTON_PRESS_4 , BUTTON_PRESS_5 ,
	BUTTON_PRESS_6 , BUTTON_PRESS_7 , BUTTON_PRESS_8 , BUTTON_PRESS_9 , BUTTON_PRESS_10 , BUTTON_PRESS_11 , BUTTON_PRESS_12	
];
function wPressButtonMaster( wButtonNum , wArgArray ) {
	var x1 = "MB-Pressed--" + wButtonNum.toString();
	var dNow = new Date();
	var x2 = dNow.getMonth() + '-' + dNow.getDate() + '-' + dNow.getFullYear() + '--' + dNow.getHours() + '-' + dNow.getMinutes();
	wcl( x2 + " " + x1 );
	//EMAIL_MAN.sendEmail( x2 , x1 );
	//if ( !HALEY_HOME_OVERRIDED_ALREADY && dNow.getHours() === 15 && JOB_OVERRIDE_HALEY_IS_HOME == false ) { JOB_OVERRIDE_HALEY_IS_HOME = true; wButtonNum = 11; }
	BP_MAP[ wButtonNum ]( wArgArray );
}
module.exports.pressButtonMaster = wPressButtonMaster;