var colors = require("colors");
var request = require("request");
// var cheerio = require('cheerio');
var path = require("path");
var jsonfile = require("jsonfile");

function wcl( wSTR ) { console.log( colors.white.bgMagenta( "[TWITCH_MAN] --> " + wSTR ) ); }
function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var SEND_LSS_UPDATE = require( "./clientManager.js" ).update_Last_SS;
var STREAM_LINK_MAN = require( "./utils/streamlinkManager.js" );
const wTwitchKeys = require( "../personal.js" ).twitch;

var TWITCH_SF = {};
const TWITCH_SF_PATH = path.join( __dirname , "save_files" , "twitch.json" );
function WRITE_TWITCH_SF() { jsonfile.writeFileSync( TWITCH_SF_PATH , TWITCH_SF ); wcl( "UPDATED Twitch SAVE_FILE" ); }
try { YT_SF = jsonfile.readFileSync( TWITCH_SF_PATH ); }
catch( error ) { 
	TWITCH_SF[ "FOLLOWERS" ] = {};
	wcl( "Twitch Save-File Not Found ... recreating" );
	WRITE_TWITCH_SF();
}

function wOpenLiveTwitchStreamlink( wUserName , wQuality ) {
	wQuality = wQuality || "best";
	STREAM_LINK_MAN.openLink( wUserName , wQuality );
}
async function wStopLiveTwitchStreamlink() {
	wcl("inside stop twitch");
	await STREAM_LINK_MAN.quit();
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
						name: xR[ "streams" ][ x1 ][ "channel" ][ "display_name" ] ,
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


module.exports.playLive = wOpenLiveTwitchStreamlink;
module.exports.stopLive = wStopLiveTwitchStreamlink;

module.exports.followerIsNowLive = wFollowerIsNowLiveEmailEvent;

( async ()=> {
	var wLatestLiveFollowers = await wConfirmLiveStatus();
	console.log( wLatestLiveFollowers );
	await SEND_LSS_UPDATE( "Twitch" , "LIVE" , wLatestLiveFollowers );
})();