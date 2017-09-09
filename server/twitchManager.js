var colors = require("colors");
var request = require("request");
// var cheerio = require('cheerio');
var path = require("path");
var jsonfile = require("jsonfile");

function wcl( wSTR ) { console.log( colors.white.bgMagenta( "[TWITCH_MAN] --> " + wSTR ) ); }
function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

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

function wFollowerIsNowLiveEvent( wFollower ) {
	wcl( "I guess we recieved notice that " + wFollower + " is live." );
}

function wGetCurrentLiveFollowers() {
	return new Promise( function( resolve , reject ) {
		try {
			var wURL = "https://api.twitch.tv/kraken/streams/followed?client_id=" +
			wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			console.log( wURL );
			var wResults = [];
			var wFR = [];
			request( wURL , function ( err , response , body ) {

		        if (err) { wcl( err ); reject(err); return; }
		        // try { var $ = cheerio.load(body); }
		        // catch(err) { reject("cheerio load failed"); return; }
		        // $('.yt-lockup-title > a').each(function () {
		        // 	var wID = $(this).attr('href');
		        // 	wID = wID.substring( wID.length - 11 , wID.length );
		        // 	wResults.push( { title: $(this).text() , id: wID } );
		        // });
				console.log( err );
				var x1 = JSON.parse( body );
				console.log( x1 );
				resolve();

			});
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


module.exports.playLive = wOpenLiveTwitchStreamlink;
module.exports.stopLive = wStopLiveTwitchStreamlink;

module.exports.followerIsNowLive = wFollowerIsNowLiveEvent;

( async ()=> {
	await wGetCurrentLiveFollowers();
})();