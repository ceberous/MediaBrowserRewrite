const redis = require("../../main.js").redis;
const RU = require( "../utils/redis_Utils.js" );

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME_GENERAL = "TWITCH_IF_LIVE_ELSE_YT_STD_FOREGROUND";
const R_STATE_NAME_TWITCH = "TWITCH_LIVE";
const R_STATE_NAME_YOUTUBE = "YOUTUBE_STANDARD";
const R_TWITCH_LIVE_TASK_PARITY = R_BASE + "TWITCH.LIVE_TASK_PARITY";

var CURRENT_MAN_NAME = null;
var CURRENT_MAN = null;

var CHECK_LIVE_INT = null;
function LIVE_CHECK_INT() {
	return new Promise( async function( resolve , reject ) {
		try {
			var current_live = await require( "../utils/twitchAPI_Utils.js" ).updateLiveUsers();
			console.log( "Current Live Twitch Users = " );
			console.log( current_live );
			if ( current_live.length === 0 ) {
				clearInterval( CHECK_LIVE_INT );
				wStart( true );
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const R_TWITCH_LIVE_USERS = "TWITCH.LIVE_USERS";
const R_TWITCH_LIVE_USERS_SESSION = "TWITCH.LIVE_SESSION";
function wStart( wLocalOverride ) {
	return new Promise( async function( resolve , reject ) {
		try {

			await require( "../utils/twitchAPI_Utils.js" ).followUserName( "chess" );

			var current_state = await RU.getKey( redis , R_STATE );
			var wMulti = [ [ "set" , R_PREVIOUS , current_state ] ];
			var current_live = [];
			var first = null;
			current_live = await require( "../utils/twitchAPI_Utils.js" ).updateLiveUsers();
			if ( current_live.length > 0 ) {
				wMulti.push( [ "set" , R_STATE , R_STATE_NAME_TWITCH ] );
				if ( current_live.length === 1 ) { first = current_live[0]; }
				else { first = current_live.pop(); }
				first = current_live[0];
				CURRENT_MAN_NAME = "twitch";
				CURRENT_MAN = require( "./Twitch_Live_Foreground" );
				await CURRENT_MAN.start( first );
				CHEC_LIVE_INT = setInterval( LIVE_CHECK_INT , 120000 );
			}
			else {
				console.log( "No Live Users , Starting Youtube-Standard" );
				CURRENT_MAN_NAME = "youtube";
				wMulti.push( [ "set" , R_STATE , R_STATE_NAME_YOUTUBE ] );
				CURRENT_MAN = require( "./YT_Standard_Foreground.js" );
				await CURRENT_MAN.start();
			}

			// if ( !wLocalOverride ) {
			// 	current_live = await require( "../utils/twitchAPI_Utils.js" ).updateLiveUsers();
			// 	console.log( "Current Live Twitch Users = " );
			// 	console.log( current_live );			
			// }
			
			// if ( current_live.length > 0 ) {
			// 	var current_state = await RU.getKey( redis , R_STATE );
			// 	var now_playing = await RU.popRandomFromSet( redis , R_TWITCH_LIVE_USERS );
			// 	if ( now_playing !== null ) {
			// 		require( "../../main.js" ).setStagedFFClientTask( { message: "TwitchLiveForeground" , playlist: [ now_playing ] } );
			// 		await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/twitchLive" );
			// 		wMulti.push( [ "set" , R_STATE , R_STATE_NAME_TWITCH ] );
			// 		CHEC_LIVE_INT = setInterval( LIVE_CHECK_INT , 120000 );					
			// 	}
			// 	else { LAUNCH_STANDARD = true; }
			// }
			// else { LAUNCH_STANDARD = true; }

			// if ( LAUNCH_STANDARD ) {
			// 	console.log( "Already Enumerated All Live Twitch Users" );
			// 	console.log( "Now Switching to Youtube-Standard" );
			// 	wMulti.push( [ "set" , R_STATE , R_STATE_NAME_YOUTUBE ] );
			// 	await require( "./YT_Standard_Foreground.js" ).start();
			// }

			await RU.setMulti( redis , wMulti );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			await CURRENT_MAN.pause();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await CURRENT_MAN.stop();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( CURRENT_MAN_NAME === "twitch" ) {
				var next_live = await RU.popRandomFromSet( redis , R_TWITCH_LIVE_USERS );
			}
			await CURRENT_MAN.next();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await CURRENT_MAN.previous();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;