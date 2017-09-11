var colors = require("colors");
var request = require("request");
var path = require("path");
var jsonfile = require("jsonfile");

// REQUIREMENT =
// https://addons.mozilla.org/en-US/firefox/addon/twitch-video-control/?src=search

function wcl( wSTR ) { console.log( colors.white.bgMagenta( "[TWITCH_MAN] --> " + wSTR ) ); }
function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

	// Custom-Imports
// =======================================================================
// =======================================================================
var wEmitter = require( "../main.js" ).wEmitter;
var FF_OPEN = require( "./firefoxManager.js" ).openURL;
var FF_CLOSE = require( "./firefoxManager.js" ).terminateFF;

var SEND_LSS_UPDATE = require( "./clientManager.js" ).update_Last_SS;
const wTwitchKeys = require( "../personal.js" ).twitch;

var STREAM_LINK_MAN = require( "./utils/streamlinkManager.js" );
// var IRC_MAN = require( "./utils/twitchIRCWrapper.js" );
// =======================================================================
// =======================================================================


	// Database Stuff
// =========================================================================================================================
// =========================================================================================================================
var TWITCH_SF = {};
const TWITCH_SF_PATH = path.join( __dirname , "save_files" , "twitch.json" );
function WRITE_TWITCH_SF() { jsonfile.writeFileSync( TWITCH_SF_PATH , TWITCH_SF ); wcl( "UPDATED Twitch SAVE_FILE" ); }
try { YT_SF = jsonfile.readFileSync( TWITCH_SF_PATH ); }
catch( error ) { 
	TWITCH_SF[ "FOLLOWERS" ] = {};
	wcl( "Twitch Save-File Not Found ... recreating" );
	WRITE_TWITCH_SF();
}
async function wFollowerIsNowLiveEmailEvent( wFollower ) {
	wcl( "I guess we recieved email notice that " + wFollower + " is live." );
	var wNL = await wConfirmLiveStatus();
	await SEND_LSS_UPDATE( "Twitch" , "LIVE" , wNL );
}
function wConfirmLiveStatus() {
	return new Promise( function( resolve , reject ) {
		try {
			var xR = null;
			var fR = [];
			function parseResults() {
				for ( var x1 = 0; x1 < xR[ "streams" ].length; ++x1 ) {
					var t1 = new Date( xR[ "streams" ][ x1 ][ "created_at" ] );
					var t2 = Math.round( t1.getTime() / 1000 );
					fR.push({
						name: xR[ "streams" ][ x1 ][ "channel" ][ "display_name" ].toLowerCase() ,
						game: xR[ "streams" ][ x1 ][ "game" ] ,
						_id: xR[ "streams" ][ x1 ][ "_id" ] ,
						start_time: t2 ,
						resolution: xR[ "streams" ][ x1 ][ "video_height" ] ,
						status: xR[ "streams" ][ x1 ][ "stream_type" ] ,
					});
				}
				resolve( fR );
			}
			var wURL = "https://api.twitch.tv/kraken/streams/followed?client_id=" +
			wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			request( wURL , function ( err , response , body ) {
		        if ( err ) { wcl( err ); reject( err ); return; }
				xR = JSON.parse( body );
				parseResults();
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
// =========================================================================================================================
// =========================================================================================================================

	// State-Definitions
var PLAYING = false;




	// Sate-Controllers
// =========================================================================================================================
// =========================================================================================================================
function wOpenLiveTwitchStreamlink( wUserName , wQuality ) {
	wQuality = wQuality || "best";
	STREAM_LINK_MAN.openLink( wUserName , wQuality );
}
async function wStopLiveTwitchStreamlink() {
	wcl("inside stop twitch");
	await STREAM_LINK_MAN.quit();
}

var STAGED_FF_ACTION = null;
var STAGED_LIVE_USERS = null;
async function emitStagedFFTask() { 
	wEmitter.emit( "socketSendTask" , STAGED_FF_ACTION , { liveUsers: [ STAGED_LIVE_USERS ] } );
	await wsleep( 20000 );
	testingNextChannel();
}
wEmitter.on( "FF_Twitch_Live_Ready" , function() { emitStagedFFTask(); });
function wOpenLiveTwitchFirefox( wUserName , wQuality ) {
	STAGED_FF_ACTION = "StartLiveTwitch";
	STAGED_LIVE_USERS = wUserName;
	FF_OPEN( "http://localhost:6969/twitchLive" );
}
async function wStopLiveTwitchFirefox() {
	wEmitter.emit( "socketSendTask" , "shutdown" );
	await wsleep( 3000 );
	FF_CLOSE();
}

wEmitter.on( "twitchLiveStatus" , function( wData ) {
	console.log( wData );
});


function testingNextChannel() { wEmitter.emit( "socketSendTask" , "twitchLiveNewChannel" , { newChannelName: "awkwards_travel" } ); }
// =========================================================================================================================
// =========================================================================================================================




// module.exports.playLive = wOpenLiveTwitchStreamlink;
// module.exports.stopLive = wStopLiveTwitchStreamlink;
module.exports.playLive = wOpenLiveTwitchFirefox;
module.exports.stopLive = wStopLiveTwitchFirefox;

module.exports.followerIsNowLiveEmailUpdate = wFollowerIsNowLiveEmailEvent;

( async ()=> {
	var wLatestLiveFollowers = await wConfirmLiveStatus();
	console.log( wLatestLiveFollowers );
	await SEND_LSS_UPDATE( "Twitch" , "LIVE" , wLatestLiveFollowers );
})();