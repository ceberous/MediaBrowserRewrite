var colors = require("colors");
var FeedParser = require('feedparser');
var request = require("request");
var cheerio = require('cheerio');
var path = require("path");
var jsonfile = require("jsonfile");

var wEmitter = require('../main.js').wEmitter;
var FIREFOX_MAN = require( "./firefoxManager.js" );

function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }


// SAVE_FILE
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
var YT_SF = {};
const YT_SF_PATH = path.join( __dirname , "save_files" , "youtube.json" );
function WRITE_YT_SF() { jsonfile.writeFileSync( YT_SF_PATH , YT_SF ); wcl( "UPDATED Live-List SAVE_FILE" ); }
try { YT_SF = jsonfile.readFileSync( YT_SF_PATH ); }
catch( error ) { 
	YT_SF[ "LIVE" ] = {};
	YT_SF[ "LIVE" ][ "FOLLOWERS" ] = {};
	YT_SF[ "FEED" ] = {};
	YT_SF[ "FEED" ][ "FOLLOWERS" ] = {};
	wcl( "YouTube Save-File Not Found ... recreating" );
	WRITE_YT_SF(); 
}
var YT_BLACKLIST = {};
const YT_BLACKLIST_PATH = path.join( __dirname , "save_files" , "youtubeBlacklist.json" );
function WRITE_YT_BLACKLIST() { jsonfile.writeFileSync( YT_BLACKLIST_PATH , YT_BLACKLIST ); wcl( "UPDATED YOUTUBE BLACKLIST FILE" ); }
try { YT_BLACKLIST = jsonfile.readFileSync( YT_BLACKLIST_PATH ); }
catch( error ) { wcl( "YouTube Blacklist-File Not Found ... recreating" ); YT_BLACKLIST[ "LIVE" ] = []; YT_BLACKLIST[ "FEED" ] = []; WRITE_YT_BLACKLIST();  }
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------------------------



// LIVE_MAN
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
var CACHED_RESULTS = null;
var LMFOLIDS = Object.keys( YT_SF.LIVE.FOLLOWERS );
var LMFOLTOTAL = LMFOLIDS.length;
var LMITER = 0;
var LIVE_MAN = {

	newResults: {},
	computedUnWatchedList: null,

	init: function() {
		LIVE_MAN.enumerateFollowers().then( function( wRSJ ) { WRITE_YT_SF(); });
	},

	enumerateFollowers: async function() {
		if ( !YT_SF.LIVE.FOLLOWERS ) { wcl("No Live Followers!!!"); return; }
		LMFOLIDS = Object.keys( YT_SF.LIVE.FOLLOWERS );
		LMFOLTOTAL = LMFOLIDS.length;
		return new Promise( function( resolve , reject ) {
			var xResults = [];
			LMFOLIDS.forEach( async function( wFollowerID , wIndex ) {
				var wR1 = await LIVE_MAN.searchUserName( wFollowerID );
                xResults.push(wR1);
                if ( wIndex === ( LMFOLTOTAL - 1 ) ) { WRITE_YT_SF(); CACHED_RESULTS = xResults; resolve( xResults ); }
			});
		});
	},

	searchUserName: async function( wChannelID ) {

		var wURL = null;
		if ( wChannelID.substring( 0 , 2 ) === "UC" ) { wURL = "https://www.youtube.com/channel/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
		else { wURL = "https://www.youtube.com/user/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
		
		return new Promise( function( resolve , reject ) {
			var wResults = [];
			request( wURL , function ( err , response , body ) {
		
		        if (err) { wcl( err ); reject(err); return; }
		        try { var $ = cheerio.load(body); }
		        catch(err) { reject("cheerio load failed"); return; }
		        $('.yt-lockup-title > a').each(function () {
		        	var wID = $(this).attr('href');
		        	wID = wID.substring( wID.length - 11 , wID.length );
		        	wResults.push( { title: $(this).text() , id: wID } );
		        });

		        for ( var i = 0; i < wResults.length; ++i ) {

		        	var wBL = false;
		        	if ( YT_BLACKLIST.LIVE.length > 0 ) {
		        		
		        		for ( var j = 0; j < YT_BLACKLIST.LIVE.length; ++j ) {
							if ( YT_BLACKLIST.LIVE[j] === wResults[i][ "id" ] ) { 
								//wcl( "Found Blacklisted ID --> " + wResults[i][ "id" ] );
								wBL = true;
							}
						}
						if ( wBL === false ) { 
							YT_SF.LIVE.FOLLOWERS[ wChannelID ][ wResults[i][ "id" ] ] = wResults[i][ "title" ]; 
							//wcl( wChannelID + " --> " + wResults[i][ "id" ] );
						}
						else {
							//wcl( "trying to remove --> " + wResults[i][ "id" ] );
							try { delete YT_SF.LIVE.FOLLOWERS[ wChannelID ][ wResults[i][ "id" ] ]; }
							catch( error ) { wcl( error ); }
							try { delete wResults[i][ "id" ]; }
							catch( error ) { wcl( error ); }
						}

		        	}

				}
				for ( var i = 0; i < wResults.length; ++i ) { wcl( wChannelID + " --> " + wResults[ i ][ "id" ] ); }
				resolve( wResults );

			});
		});

	},

	addFollower: function( wID ) {
		try { YT_SF.LIVE.FOLLOWERS[ wID ] = {}; WRITE_YT_SF(); }
		catch( error ) { wcl( error ); }
	},

	removeFollower: function( wID ) {
		try { delete YT_SF.LIVE.FOLLOWERS[ wID ]; WRITE_YT_SF(); }
		catch( error ) { wcl( error ); }
	},

	addToBlacklist: function( wID ) {

		var wF = false;
		for ( var i = 0; i < YT_BLACKLIST.LIVE.length; ++i ) {
			if ( YT_BLACKLIST.LIVE[ i ] === wID ) { wF = true; return; }
		}
		if ( wF ) { wcl( "Already Exists in Blacklist File" ); return; }
		else { YT_BLACKLIST.LIVE.push( wID ); WRITE_YT_BLACKLIST(); }

		for ( iprop in YT_SF.LIVE.FOLLOWERS ) {
			for ( jprop in YT_SF.LIVE.FOLLOWERS[ iprop ] ) {
				if ( jprop === wID ) { 
					try { delete YT_SF.LIVE.FOLLOWERS[ iprop ][ jprop ]; WRITE_YT_SF(); }
					catch( error ) { wcl( error ); }
				}
			}
		}

	},

	removeFromBlacklist: function( wID ) {
		YT_BLACKLIST.LIVE.forEach( function( wItem , wIDX ) {
			if ( wItem === wID ) { YT_BLACKLIST.LIVE = YT_BLACKLIST.LIVE.splice( wIDX , 1 ); WRITE_YT_BLACKLIST(); return; }
		});
	},

};
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------------------------



// https://github.com/ceberous/MediaBrowser/blob/master/server/videoManager.js
// FEED_MAN
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
var FEED_MAN = {

	init: async function() {
		await FEED_MAN.enumerateFollowers();
	},

	enumerateFollowers: function() {
		return new Promise( async function( resolve , reject ) {
			try {
				for ( var follower in YT_SF[ "FEED" ][ "FOLLOWERS" ] ) {
					console.log( YT_SF[ "FEED" ][ "FOLLOWERS" ][ follower ] )
					//await fetchXML();
				}
				resolve();
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	},

	fetchXML: function() {
		return new Promise( function( resolve , reject ) {
			try {
				resolve();
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	}

};
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------------------------


var STAGED_FF_ACTION = null;
function emitStagedFFTask() { wEmitter.emit( "socketSendTask" , STAGED_FF_ACTION , { nextVideoTime: 180000 , playlist: CACHED_RESULTS } ); }
wEmitter.on( "FF_YT_Live_Background_Ready" , function() { emitStagedFFTask(); });
async function startYTLiveBackgroundService() {
	STAGED_FF_ACTION = "YTLiveBackground";
	await LIVE_MAN.enumerateFollowers();
	FIREFOX_MAN.openURL( "http://localhost:6969/youtubeLiveBackground" );
}
async function stopYTLiveBackgroundService() {
	wEmitter.emit( "socketSendTask" , "shutdown" );
	await wSleep( 3000 );
	FIREFOX_MAN.terminateFF();
}

function startYTStandardService() {

}
function stopYTStandardService() {

}


//LIVE_MAN.init();

//FEED_MAN.init();


module.exports.startYTLiveBackground = startYTLiveBackgroundService;
module.exports.stopYTLiveBackground = stopYTLiveBackgroundService;

module.exports.startYTStandard = startYTStandardService;
module.exports.stopYTStandard = stopYTStandardService;

module.exports.updateLiveList = LIVE_MAN.enumerateFollowers;
module.exports.addLiveFollower = LIVE_MAN.addFollower;
module.exports.removeLiveFollower = LIVE_MAN.removeLiveFollower;

module.exports.getFollowers = ()=> { return YT_SF; }

module.exports.addLiveFollower = LIVE_MAN.addFollower;
module.exports.removeLiveFollower = LIVE_MAN.removeFollower;
module.exports.addLiveBlacklist = LIVE_MAN.addToBlacklist;
module.exports.removeLiveBlacklist = LIVE_MAN.removeFromBlacklist;


//LIVE_MAN.addFollower( "MontereyBayAquarium" );
//LIVE_MAN.addFollower( "calacademy" );
//LIVE_MAN.addFollower( "ouramazingspace" );

//LIVE_MAN.removeFollower( "UCEpDjqeFIGTqHwk-uULx72Q" );
//LIVE_MAN.removeFollower( "UCbYNIUYxdzeQTKdb9GfJl3w" );