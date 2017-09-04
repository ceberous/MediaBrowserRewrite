var wEmitter = require('../main.js').wEmitter;
var wRestorePreviousAction = require( "./clientManager.js" ).restorePreviousAction;

var path = require("path");
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var spawn = require('child_process').spawn;
require('shelljs/global');
var colors = require("colors");

const xdoWrapper = require( "./utils/xdotoolWrapper.js" );

function wcl( wSTR ) { console.log( colors.white.bgBlue( "[SKYPE_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }


const VIDEO_CALL_SCRIPT = path.join( __dirname , "py_scripts" , "callFriend.py" );
//const VIDEO_CALL_SCRIPT = path.join( __dirname , "py_scripts" , "testLongRunning.py" );

function xRestorePreviousAction() {
	if ( NEED_TO_RESTORE_SERVICE ) {
		wRestorePreviousAction();
		NEED_TO_RESTORE_SERVICE = false;
	}
}
function wRestoreCleanup() { exec( "sudo kill -9 " + VIDEO_CALL_SCRIPT_PID.toString() , { silent: true ,  async: false } ); xRestorePreviousAction(); }
function wRegularCleanup() { /*VIDEO_CALL_SCRIPT_PROC.unref(); */  exec( "sudo kill -9 " + VIDEO_CALL_SCRIPT_PID.toString() , { silent: true ,  async: false } ); }
//async function wVoiceMailCleanup() { await wSleep( 5000 );  exec( "sudo kill -9 " + VIDEO_CALL_SCRIPT_PID.toString() , { silent: true ,  async: false } ); }
function wHandleOutput( wMessage ) {
	if ( wMessage === undefined  ) { return; }
	wMessage = wMessage.trim();
	//wcl( "MESSAGE --> " + wMessage );
	//console.log( wMessage );
	switch( wMessage ) {

		case "NeverPlaced":
			setTimeout( ()=> { wVideoCallUserName(); } , 2000 );
			break;

		case "API attachment status: Refused":
			wRestoreCleanup();
			setTimeout( ()=> { wVideoCallUserName(); } , 2000 );
			break;

		case "CallFailed":
			wcl( "Call Failed !!!" );
			wRestoreCleanup();
			//setTimeout( ()=> { wVideoCallUserName(); } , 2000 );
			break;

		case "Call in Progress":
			ACTUALLY_A_LIVE_CALL = true;
			wSetFullScreen();
			break;

		case "Recording":
			setTimeout( function() { wRestoreCleanup(); } , 5000 );
			break;			

		case "Uploading Voicemail":
			wRestoreCleanup();
			break;

		case "Call status: Voicemail Has Been Sent":
			wRestoreCleanup();
			break;

		case "Finished":
			wRestoreCleanup();
			break;

		case "EndedCall":
			wRestoreCleanup();
			break;			

		default:
			break;

	}

}
async function wSetFullScreen() {
	SKYPE_WINDOW_ID = await xdotoolWrapper.ensureWindowNameIsReady( "Call with" );
	xdotoolWrapper.activateWindowID( SKYPE_WINDOW_ID );
	xdotoolWrapper.setWindowIDFocus( SKYPE_WINDOW_ID );
	xdotoolWrapper.windowRaise( SKYPE_WINDOW_ID );
	xdotoolWrapper.setWindowIDFullScreen( SKYPE_WINDOW_ID , "1" );
}

function wMaxTimeoutHandler() {
	setTimeout( function() {
		if ( !ACTUALLY_A_LIVE_CALL ) { wRestoreCleanup(); }
	} , 30000 );
}

var VIDEO_CALL_SCRIPT_PROC = null;
var VIDEO_CALL_SCRIPT_PID = null;
var SKYPE_WINDOW_ID = null;
var CACHED_USER_NAME = null;
var NEED_TO_RESTORE_SERVICE = false;
var ACTUALLY_A_LIVE_CALL = false;
function wVideoCallUserName( wUserName ) {
	ACTUALLY_A_LIVE_CALL = false;
	NEED_TO_RESTORE_SERVICE = true;
	CACHED_USER_NAME = wUserName;
	VIDEO_CALL_SCRIPT_PROC = spawn( 'python' , [ VIDEO_CALL_SCRIPT , CACHED_USER_NAME ] , { detatched: false } );
	wcl( "callFriend.py spawned" );
	VIDEO_CALL_SCRIPT_PID = VIDEO_CALL_SCRIPT_PROC.pid;
	VIDEO_CALL_SCRIPT_PROC.stdout.on( "data" , function( data ) {
		var message = decoder.write(data);
		message = message.trim();
		wHandleOutput( message );
	});
	VIDEO_CALL_SCRIPT_PROC.stderr.on( "data" , function(data) {
		var message = decoder.write(data);
		message = message.trim();
		wHandleOutput(message);
	});
	wMaxTimeoutHandler();
	VIDEO_CALL_SCRIPT_PROC.unref();
}



// (async function placeCallTest() {
// 	//wVideoCallUserName( "haley.cerbus" );
// }());

module.exports.startCall = wVideoCallUserName;
module.exports.endCall = wRegularCleanup

// process.on('SIGINT', function () {
// 	wcl( "Shutting Down" );
// 	wRegularCleanup();
// 	process.exit(1);
// });


// setInterval(function(){
// 	console.log("we are still here");
// } , 3000 );