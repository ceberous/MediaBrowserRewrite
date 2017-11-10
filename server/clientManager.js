const fs	= require( "fs" );
const path	= require( "path" );
const colors	= require( "colors" );

const BTN_MAN 	= require( "./buttonManager.js" );

const wEmitter	= require("../main.js").wEmitter;
const wSkypeNames = require("../personal.js").skypeNames;

function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var CURRENT_STATE = null;

async function MASTER_STATE_STOP() {
	if ( CURRENT_STATE !== null ) { await CURRENT_STATE.stop(); }
	// 1.) Kill Firefox
	// 2.) Kill Mplayer
}

async function BUTTON_PRESS_0( wArgArray ) {
	wcl( "PRESSED BUTTON 0" );
	wcl( "Youtube Live Background" );
	await CURRENT_STATE.stop();
	CURRENT_STATE = require( "./STATES/YT_Live_Background.js" );
	await CURRENT_STATE.start();
}

function BUTTON_PRESS_1( wArgArray ) {
	wArgArray = wArgArray || [ "classic" ];
	wcl( "PRESSED BUTTON 1" );
	// MopidyManager.js Needs Rewritten to Use REDIS
}

function BUTTON_PRESS_2( wArgArray ) {
	wcl( "PRESSED BUTTON 2" );
	// MopidyManager.js Needs Rewritten to Use REDIS
}

function BUTTON_PRESS_3( wArgArray ) {
	// YOUTUBE STANDARD / TWITCH LIVE
	// TwitchManager.js Needs Rewritten to Use REDIS
}

function BUTTON_PRESS_4( wArgArray ) {
	// SKYPE One
	wcl( "PRESSED BUTTON 4" );
	wcl( "Skype Call To: " + wSkypeNames.one );
	// Special Case , Need to Remmeber Current State So We Can Resume Once Call is Over
	await CURRENT_STATE.stop();
	CURRENT_STATE = require( "./STATES/Skype_Foreground.js" );
	await CURRENT_STATE.start();
}

function BUTTON_PRESS_5( wArgArray ) {
	// SKYPE Two
	wcl( "PRESSED BUTTON 5" );
	wcl( "Skype Call To: " + wSkypeNames.two );
	// Special Case , Need to Remmeber Current State So We Can Resume Once Call is Over
	await CURRENT_STATE.stop();
	CURRENT_STATE = require( "./STATES/Skype_Foreground.js" );
	await CURRENT_STATE.start();
}

function BUTTON_PRESS_6( wArgArray ) {
	// STOP Everything
	wcl( "PRESSED BUTTON 6" );
	MASTER_STATE_STOP();
}

async function BUTTON_PRESS_7( wArgArray ) {
	// PAUSE EVERYTHING
	wcl( "PRESSED BUTTON 7" );
	await CURRENT_STATE.pause();
}

async function BUTTON_PRESS_8( wArgArray ) {
	// PREVIOUS MEDIA
	wcl( "PRESSED BUTTON 8" );
	await CURRENT_STATE.previous();
}

async function BUTTON_PRESS_9( wArgArray ) {
	// NEXT MEDIA
	wcl( "PRESSED BUTTON 9" );
	await CURRENT_STATE.next();
}

async function BUTTON_PRESS_10( wArgArray ) {
	// LOCAL MOVIE
	wcl( "PRESSED BUTTON 10" );
	wcl( "Local-Media Movie" );
	await CURRENT_STATE.stop();
	CURRENT_STATE = require( "./STATES/LocalMedia_Movie_Foreground.js" );
	await CURRENT_STATE.start();
}

async function BUTTON_PRESS_11( wArgArray ) {
	wcl( "PRESSED BUTTON 11" );
	wcl( "Local-Media Odyssey" );
	await CURRENT_STATE.stop();
	CURRENT_STATE = require( "./STATES/LocalMedia_Odyssey_Foreground_YT_Live_Background.js" );
	await CURRENT_STATE.start();	
}

async function BUTTON_PRESS_12( wArgArray ) {
	// LOCAL TV SHOW
	wcl( "PRESSED BUTTON 12" );
	wcl( "Local-Media TV Show" );
	await CURRENT_STATE.stop();
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