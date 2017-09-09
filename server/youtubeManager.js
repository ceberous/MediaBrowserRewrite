var colors = require("colors");
var FeedParser = require('feedparser');
var request = require("request");
var cheerio = require('cheerio');
var path = require("path");
var jsonfile = require("jsonfile");

var wEmitter = require('../main.js').wEmitter;
var FF_OPEN = require( "./firefoxManager.js" ).openURL;
var FF_CLOSE = require( "./firefoxManager.js" ).terminateFF;

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
		var x1 = 0;
		return new Promise( async function( resolve , reject ) {
			var xResults = [];
			while ( x1 < LMFOLTOTAL ) {
				var wR1 = await LIVE_MAN.searchUserName( LMFOLIDS[ x1 ] );
				xResults.push( wR1 );
				x1 = x1 + 1;
			}
			CACHED_RESULTS = xResults;
			resolve( xResults );
		});
	},

	searchUserName: async function( wChannelID ) {

		var wURL = null;
		if ( wChannelID.substring( 0 , 2 ) === "UC" ) { wURL = "https://www.youtube.com/channel/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
		else { wURL = "https://www.youtube.com/user/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
		
		return new Promise( function( resolve , reject ) {
			var wResults = [];
			var wFR = [];
			request( wURL , function ( err , response , body ) {
		
		        if (err) { wcl( err ); reject(err); return; }
		        try { var $ = cheerio.load(body); }
		        catch(err) { reject("cheerio load failed"); return; }
		        $('.yt-lockup-title > a').each(function () {
		        	var wID = $(this).attr('href');
		        	wID = wID.substring( wID.length - 11 , wID.length );
		        	wResults.push( { title: $(this).text() , id: wID } );
		        });

		        if ( YT_BLACKLIST.LIVE.length < 1 ) { resolve( wResults ); }

		        for ( var i = 0; i < wResults.length; ++i ) {

		        	var wBL = false;
		        	// Check VideoID against Blacklist File 
	        		for ( var j = 0; j < YT_BLACKLIST.LIVE.length; ++j ) { if ( YT_BLACKLIST.LIVE[j] === wResults[i][ "id" ] ) { wBL = true; } }
					
					// If Not In Blacklist , add to Results
					if ( wBL === false ) { YT_SF.LIVE.FOLLOWERS[ wChannelID ][ wResults[i][ "id" ] ] = wResults[i][ "title" ]; wFR.push( wResults[i] ); }
					
					else {
						//wcl( "trying to remove --> " + wResults[i][ "id" ] );
						try { delete YT_SF.LIVE.FOLLOWERS[ wChannelID ][ wResults[i][ "id" ] ]; }
						catch( error ) { wcl( error ); }
					}

				}
				for ( var i = 0; i < wResults.length; ++i ) { wcl( wChannelID + " --> " + wResults[ i ][ "id" ] ); }
				resolve( wFR );

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
// from view-source:https://www.youtube.com/user/$USER_NAME/about
// data-channel-external-id=
// FEED_MAN
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
const wMonth = 2629800;
const wWeek = 604800;
const wDay = 86400;
var FEED_MAN = {

	init: async function() {
		await FEED_MAN.enumerateFollowers();
	},

	enumerateFollowers: function() {
		return new Promise( async function( resolve , reject ) {
			try {
				var x1 = 0;
				var wFollowers = Object.keys( YT_SF[ "FEED" ][ "FOLLOWERS" ] );
				var wTotal = wFollowers.length;
				while( x1 < wTotal ) {
					await FEED_MAN.fetchXML( wFollowers[ x1 ] );
					x1 = x1 + 1;
				}
				FEED_MAN.filterOldVideos();
				WRITE_YT_SF();
				resolve();
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	},

	fetchXML: function( channelID ) {
		return new Promise( function( resolve , reject ) {
			try {
				var wFP_Options = { "normalize": true ,"feedurl": wFeedURL };
				var feedparser = new FeedParser( [ wFP_Options ] );

				var wResults = [];
				var wFeedURL = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelID;
				var req = request( wFeedURL );
				req.on( "error" , function ( error ) { console.log(error); } );
				req.on( "response" , function ( res ) {
					if ( res.statusCode !== 200 ) { reject( res.statusCode ); }
					else { this.pipe( feedparser ); }
				});
				feedparser.on( "error" , function ( error ) { console.log( error ); } );
				feedparser.on( "readable" , function () {
					var item; while ( item = this.read() ) { wResults.push( item ); }
				});
				feedparser.on( "end" , parseResults );
				function parseResults() {
					for ( var i = 0; i < wResults.length; ++i ) {
						var xID = wResults[i]["yt:videoid"]["#"];
						if ( !YT_SF[ "FEED" ][ "FOLLOWERS" ][ channelID ][ xID ] ) {
							var t1 = new Date( wResults[ i ].pubdate );
							var t2 = Math.round( t1.getTime() / 1000 );
							YT_SF[ "FEED" ][ "FOLLOWERS" ][ channelID ][ xID ] = {
								title: wResults[i].title ,
								pubdate: t2 ,
								completed: false ,
								skipped: false ,
								current_time: 0 ,
								remaining_time: 0 ,
								duration: 0 ,
							};
						}
					}
					resolve();
				}
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	},

	filterOldVideos: function() {
		var n1 = new Date();
		var n2 = Math.round( n1.getTime() / 1000 );
		for ( var wCID in YT_SF[ "FEED" ][ "FOLLOWERS" ] ) {
			for ( var wVID in YT_SF[ "FEED" ][ "FOLLOWERS" ][ wCID ] ) {
				var x1 = YT_SF[ "FEED" ][ "FOLLOWERS" ][ wCID ][ wVID ][ "pubdate" ];
				if ( ( n2 - x1 ) > wMonth ) {
					try{ delete YT_SF[ "FEED" ][ "FOLLOWERS" ][ wCID ][ wVID ]; }
					catch( err ) { console.log( err ); }
				}
			}
		}
	},

	addVideo: function( wID , wOBJ ) {
		YT_SF[ "FEED" ][ wID ] = wOBJ;
		WRITE_YT_SF();
	},

	removeVideo: function( wID ) {
		try { delete YT_SF[ "FEED" ][ wID ]; }
		catch( error ) { console.log( error ); }
	},

	updateVideo: function( wID , wOBJ ) {
		if ( YT_SF[ "FEED" ][ wID ] ) { YT_SF[ "FEED" ][ wID ] = wOBJ; WRITE_YT_SF(); }
	},

	addFollower: function( wID ) {
		try { YT_SF.FEED.FOLLOWERS[ wID ] = {}; WRITE_YT_SF(); }
		catch( error ) { wcl( error ); }
	},

	removeFollower: function( wID ) {
		try { delete YT_SF.FEED.FOLLOWERS[ wID ]; WRITE_YT_SF(); }
		catch( error ) { wcl( error ); }
	},

	addToBlacklist: function( wID ) {
		var wF = false;
		for ( var i = 0; i < YT_BLACKLIST.FEED.length; ++i ) {
			if ( YT_BLACKLIST.LIVE[ i ] === wID ) { wF = true; return; }
		}
		if ( wF ) { wcl( "Already Exists in Blacklist File" ); return; }
		else { YT_BLACKLIST.FEED.push( wID ); WRITE_YT_BLACKLIST(); }

		for ( iprop in YT_SF.FEED.FOLLOWERS ) {
			for ( jprop in YT_SF.FEED.FOLLOWERS[ iprop ] ) {
				if ( jprop === wID ) { 
					try { delete YT_SF.FEED.FOLLOWERS[ iprop ][ jprop ]; WRITE_YT_SF(); }
					catch( error ) { wcl( error ); }
				}
			}
		}
	},

	removeFromBlacklist: function( wID ) {
		YT_BLACKLIST.FEED.forEach( function( wItem , wIDX ) {
			if ( wItem === wID ) { YT_BLACKLIST.FEED = YT_BLACKLIST.FEED.splice( wIDX , 1 ); WRITE_YT_BLACKLIST(); return; }
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
	FF_OPEN( "http://localhost:6969/youtubeLiveBackground" );
	WRITE_YT_SF();
}
async function stopYTLiveBackgroundService() {
	wEmitter.emit( "socketSendTask" , "shutdown" );
	await wSleep( 3000 );
	FF_CLOSE();
}

function startYTStandardService() {

}
function stopYTStandardService() {

}

module.exports.startYTLiveBackground = startYTLiveBackgroundService;
module.exports.stopYTLiveBackground = stopYTLiveBackgroundService;

module.exports.startYTStandard 		= startYTStandardService;
module.exports.stopYTStandard 		= stopYTStandardService;

module.exports.getFollowers 		= ()=> { return YT_SF; }

module.exports.updateLiveList 		= LIVE_MAN.enumerateFollowers;
module.exports.addLiveFollower 		= LIVE_MAN.addFollower;
module.exports.removeLiveFollower 	= LIVE_MAN.removeFollower;
module.exports.addLiveBlacklist 	= LIVE_MAN.addToBlacklist;
module.exports.removeLiveBlacklist 	= LIVE_MAN.removeFromBlacklist;

module.exports.updateFeedList		= FEED_MAN.enumerateFollowers;
module.exports.addFeedFollower		= FEED_MAN.addFollower;
module.exports.removeFeedFollower	= FEED_MAN.removeFollower;
module.exports.addFeedBlacklist		= FEED_MAN.addToBlacklist;
module.exports.removeFeedBlacklist	= FEED_MAN.removeFromBlacklist;
module.exports.addFeedVideo			= FEED_MAN.addVideo;
module.exports.removeFeedVideo		= FEED_MAN.removeVideo;
module.exports.updateFeedVideo		= FEED_MAN.updateVideo;


// Kyle Laundry ? = UCk0UErv9b4Hn5ucNNjqD1UQ
// https://www.youtube.com/feeds/videos.xml?channel_id=UCk0UErv9b4Hn5ucNNjqD1UQ
//FEED_MAN.addFollower( "UCk0UErv9b4Hn5ucNNjqD1UQ" );

//LIVE_MAN.init();
//FEED_MAN.init();