//var wEmitter = new (require('events').EventEmitter);

const xdo_GETID = require( "./xdotoolWrapper.js" ).getWindowIDFromName;
const xdo_SET_FULL = require( "./xdotoolWrapper.js" ).setFullScreenWithFKey;

require("shelljs/global");
const net = require("net");
const fs = require("fs");
const spawn = require('child_process').spawn;
const path = require("path");
const colors = require("colors");
const rimraf = require("rimraf");

const TMP_DIR_PATH = path.join( __dirname , "TMP2" );
const CREATE_TMP_DIR = function() { if ( !fs.existsSync( TMP_DIR_PATH ) ){ fs.mkdirSync( TMP_DIR_PATH ); } }
const REMOVE_TMP_DIR = function() { return new Promise( function( resolve , reject ) { try { rimraf( TMP_DIR_PATH , function () { resolve("done"); }); } catch( error ) { reject( error ); } }); }
const StreamlinkLauncher_FP = path.join( TMP_DIR_PATH , "streamlinkLauncher.js" );
const MPV_SOCKET_FP = path.join( TMP_DIR_PATH , "mpv.sock" );

const wcl = function( wSTR ) { console.log( colors.black.bgCyan( "[VLC_MAN] --> " + wSTR ) ); }
const sleep = function( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }


// https://mpv.io/manual/master/#property-list
// https://mpv.io/manual/master/#list-of-input-commands

// https://mpv.io/manual/master/#json-ipc
// https://mpv.io/manual/master/#commands
var wMPVSocketClient = null;
var wMPVSocketListenInterval = null;
var wPAUSED = true;
var wLAST_EVENT = null;
var wSTATUS = null;
var wELAPSED_TIME = null;
var wMPV_WID = null;
async function startSocketListeners() {
	wMPVSocketClient = net.createConnection( MPV_SOCKET_FP );
	wMPVSocketClient.on( "connect" , function() { wcl( "CONNECTED TO UNIX-SOCKET !!!!" ); } );
	wMPVSocketClient.on( "end" , function() { clearInterval( wMPVSocketListenInterval ); wcl( "DISCONNECTED FROM UNIX-SOCKET !!!!" ); } );
	wMPVSocketClient.on( "data" , function( wData ) {
		var wSTR = wData;
		try { wData = JSON.parse( wData ); }
		catch( error ) { wData = false; }
		//console.log( wData );
		if ( wData ) {
			if ( wData.event ) { wLAST_EVENT = wData.event }
			wSTATUS = wData.error;
			wELAPSED_TIME = wData.data;
			if ( !wPAUSED && parseInt( wELAPSED_TIME ) > 1 ) { wPAUSED = true; }
		}
		wcl( wLAST_EVENT + " === " + wSTATUS + " === " + wELAPSED_TIME ); 
	});
	await sleep( 2000 );
	startMPVStatusListener();
	await sleep( 5000 ); 
	wFullScreen();
}

async function startMPVStatusListener() { wMPVSocketListenInterval = setInterval( function() { wGetStatus(); } , 3000 );  }

async function LAUNCH_STREAM_LINK_MPV( wURL , wQuality , wPlayerOptions ) {

	CREATE_TMP_DIR();

	exec( "pkill -9 vlc" , { silent: true , async: false } );
	exec( "pkill -9 mpv" , { silent: true , async: false } );
	await sleep( 300 );
	exec( "pkill -9 streamlink" , { silent: true , async: false } );
	await sleep( 300 );

	var SL_CMD = `streamlink --hls-segment-threads 3 ${wURL} ${wQuality}`;
	wPlayerOptions = wPlayerOptions || "";
	SL_CMD = SL_CMD + " -p 'mpv --input-unix-socket=" + MPV_SOCKET_FP + " " + wPlayerOptions + "'";
	console.log( "\n" + SL_CMD );
	
	var WRITE_STR = "var cp = require(\"child_process\"); cp.exec( \""+ SL_CMD +"\" ); setTimeout( function() { process.exit(0); } , 10000 );";
	console.log( "\n" + WRITE_STR );
	fs.writeFileSync( StreamlinkLauncher_FP , WRITE_STR );
	
	spawn( "node" , [ StreamlinkLauncher_FP ], {
	    stdio: 'ignore',
	    detached: true
	}).unref(); // child._channel.unref()
	
	await sleep( 10000 );
	startSocketListeners();

}


function wQuit() {
	return new Promise( async function( resolve , reject ) {
		try {
			exec( "pkill -9 mpv" , { silent: true , async: false } );
			await sleep( 300 );
			exec( "pkill -9 streamlink" , { silent: true , async: false } );
			await REMOVE_TMP_DIR();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}
function wFullScreen() { wMPV_WID = xdo_GETID( "mpv" ); xdo_SET_FULL( wMPV_WID ); }
function wGetStatus() { wMPVSocketClient.write( '{ "command": ["get_property", "playback-time"] }\r\n' ); }

module.exports.openLink = LAUNCH_STREAM_LINK_MPV;
module.exports.quit = wQuit;
module.exports.fullscreen = wFullScreen;
module.exports.getCurrentTime = wGetStatus;















											// "USER_LAND" tests
// --------------------------------------------------------------------------------------------------------------------------------------


//LAUNCH_STREAM_LINK_MPV( "twitch.tv/exbc" , "best" );
//LAUNCH_STREAM_LINK_MPV( "www.youtube.com/watch?v=TEns54J9w6Y" , "best" );

// process.on('SIGINT', async function () {
// 	await REMOVE_TMP_DIR();
// 	process.exit(1);
// });