var colors = require("colors");
var FeedParser = require("feedparser");
var request = require("request");
var cheerio = require("cheerio");
var path = require("path");

// Fucking Glory
// https://github.com/toniov/p-iteration
const { map } = require( "p-iteration" );

// var wEmitter	= require("../main.js").wEmitter;
var wEmitter = new (require("events").EventEmitter);
module.exports.wEmitter = wEmitter;

//var redis = require( "./clientManager.js" ).redis;
var REDIS = require("redis");
var redis = REDIS.createClient( "8443" , "localhost" );
const RU = require( "./utils/redis_Utils.js" );


// var FF_OPEN = require( "./firefoxManager.js" ).openURL;
// var FF_CLOSE = require( "./firefoxManager.js" ).terminateFF;
function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }


// Initialization
const R_YT_Base = "YOU_TUBE.";

const R_YT_LIVE_LATEST_VIDEOS = R_YT_Base + "LIVE.LATEST";
const R_YT_LIVE_FOLLOWERS = R_YT_Base + "LIVE.FOLLOWERS.";
const Default_Live_Followers = [ "UCnM5iMGiKsZg-iOlIO2ZkdQ" , "UCakgsb0w7QB0VHdnCc-OVEA" , "UCZvXaNYIcapCEcaJe_2cP7A" ];
const R_YT_LIVE_BLACKLIST = R_YT_Base + "LIVE.BLACKLIST";
const Default_Live_Blacklist = [ "SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , "nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ];

const R_YT_STANDARD_FOLLOWERS = R_YT_Base + "STANDARD.FOLLOWERS.";
const Default_Standard_Followers = [ "UCk0UErv9b4Hn5ucNNjqD1UQ" , "UCKbVtAdWFNw5K7u2MZMLKIw"  ];
const R_YT_STANDARD_BLACKLIST = R_YT_Base + "STANDARD.BLACKLIST";
const Default_Standard_Blacklist = [];

( async ()=> {
	
	var ek = await RU.getKeysFromPattern( redis , "YOU_TUBE.*" );

	//FORCED-CLEANSING
	// if ( ek.length > 0 ) {
	// 	ek = ek.map( x => [ "del" , x  ] );
	// 	console.log( ek );
	// 	await RU.setMulti( redis , ek );
	// 	console.log( "done cleansing instance" );
	// }
	// await wSleep( 5000 );
	if ( ek.length < 1 ) {
		var R_YT_LIVE_FOLLOWER_KEYS = Default_Live_Followers.map( x => [ "set" , R_YT_LIVE_FOLLOWERS + x , "null" ] );
		var R_YT_STANDARD_FOLLOWER_KEYS = Default_Standard_Followers.map( x => [ "set" , R_YT_STANDARD_FOLLOWERS + x , "null" ] );
		Array.prototype.push.apply( R_YT_LIVE_FOLLOWER_KEYS , R_YT_STANDARD_FOLLOWER_KEYS );
		await RU.setMulti( redis , R_YT_LIVE_FOLLOWER_KEYS );
		await RU.setSetFromArray( redis , R_YT_LIVE_BLACKLIST , Default_Live_Blacklist );
		await RU.setSetFromArray( redis , R_YT_STANDARD_BLACKLIST , Default_Standard_Blacklist );
		console.log( "done building YOU_TUBE REF" );
	}

	await enumerateLiveFollowers();	
	await enumerateStandardFollowers();

})();


function enumerateLiveFollowers() {
	var current_followers = current_blacklist = [];
	function searchFollower( wChannelID ) {
		return new Promise( function( resolve , reject ) {
			try {
				var wURL = null;
				if ( wChannelID.substring( 0 , 2 ) === "UC" ) { wURL = "https://www.youtube.com/channel/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				else { wURL = "https://www.youtube.com/user/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				console.log( wURL );

				var wResults = [];
				var wFR = [];
				request( wURL , function ( err , response , body ) {
			
					if ( err ) { console.log( err ); reject( err ); return; }
					try { var $ = cheerio.load( body ); }
					catch(err) { reject( "cheerio load failed" ); return; }
					$( ".yt-lockup-title > a" ).each( function () {
						var wID = $( this ).attr( "href" );
						wID = wID.substring( wID.length - 11 , wID.length );
						//wResults.push( { title: $( this ).text() , id: wID } );
						wResults.push( wID );
					});

					if ( current_blacklist.length < 1 ) { resolve( wResults ); }

					for ( var i = 0; i < wResults.length; ++i ) {

						var wBL = false;
						// Check VideoID against Blacklist File 
						//for ( var j = 0; j < current_blacklist.length; ++j ) { if ( current_blacklist[j] === wResults[i][ "id" ] ) { wBL = true; } }
						for ( var j = 0; j < current_blacklist.length; ++j ) { if ( current_blacklist[j] === wResults[i] ) { wBL = true; } }
						
						// If Not In Blacklist , add to Results
						if ( wBL === false ) { wFR.push( wResults[i] ); }

					}
					//for ( var i = 0; i < wResults.length; ++i ) { console.log( wChannelID + " --> " + wResults[ i ][ "id" ] ); }
					resolve( wFR );
				});

			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	}
	return new Promise( async function( resolve , reject ) {
		try {
			current_followers = await RU.getKeysFromPattern( redis , R_YT_LIVE_FOLLOWERS + "*" );
			current_blacklist = await RU.getFullSet( redis , R_YT_LIVE_BLACKLIST );
			const follower_ids = current_followers.map( x => x.split( R_YT_LIVE_FOLLOWERS )[1] );
			var live_videos = await map( follower_ids , userId => searchFollower( userId ) );
			live_videos = [].concat.apply( [] , live_videos );
			await RU.setListFromArray( redis , R_YT_LIVE_LATEST_VIDEOS , live_videos );
			resolve( live_videos );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const wMonth = 2629800;
const wWeek = 604800;
const wDay = 86400;
function enumerateStandardFollowers() {
	var current_followers = current_blacklist = [];
	var final_results = {};
	// https://github.com/ceberous/MediaBrowser/blob/master/server/videoManager.js
	// from view-source:https://www.youtube.com/user/$USER_NAME/about
	// data-channel-external-id=
	// FEED_MAN
	function fetchFollowerXML( channelID ) {
		return new Promise( function( resolve , reject ) {
			try {
				if ( !final_results[ channelID ] ) { final_results[ channelID ] = {}; }
				var wFP_Options = { "normalize": true ,"feedurl": wFeedURL };
				var feedparser = new FeedParser( [ wFP_Options ] );

				var wResults = [];
				var wFeedURL = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelID;
				console.log( wFeedURL );
				var req = request( wFeedURL );
				req.on( "error" , function ( error ) { console.log(error); } );
				req.on( "response" , function ( res ) {
					if ( res.statusCode !== 200 ) { /*reject( res.statusCode ); */ }
					else { this.pipe( feedparser ); }
				});
				feedparser.on( "error" , function ( error ) { console.log( error ); } );
				feedparser.on( "readable" , function () { var item; while ( item = this.read() ) { wResults.push( item ); } } );
				feedparser.on( "end" , parseResults );
				function parseResults() {
					for ( var i = 0; i < wResults.length; ++i ) {
						var xID = wResults[i]["yt:videoid"]["#"];
						if ( !final_results[ channelID ][ xID ] ) {
							var t1 = new Date( wResults[ i ].pubdate );
							var t2 = Math.round( t1.getTime() / 1000 );
							final_results[ channelID ][ xID ] = {
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
					console.log( "done" );
					console.log( final_results );
					resolve();
				}
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	}
	function filterOldVideos( wTimeLimit ) {
		var n1 = new Date();
		var n2 = Math.round( n1.getTime() / 1000 );
		for ( var wCID in final_results ) {
			for ( var wVID in final_results[ wCID ] ) {
				var x1 = final_results[ wCID ][ wVID ][ "pubdate" ];
				if ( ( n2 - x1 ) > wTimeLimit ) {
					try{ delete final_results[ wCID ][ wVID ]; }
					catch( err ) { console.log( err ); }
				}
			}
		}
	}	
	return new Promise( async function( resolve , reject ) {
		try {
			current_followers = await RU.getKeysFromPattern( redis , R_YT_STANDARD_FOLLOWERS + "*" );
			current_blacklist = await RU.getFullSet( redis , R_YT_STANDARD_BLACKLIST );
			const follower_ids = current_followers.map( x => x.split( R_YT_STANDARD_FOLLOWERS )[1] );
			await map( follower_ids , userId => fetchFollowerXML( userId ) );
			filterOldVideos( wMonth );

			var wMultis = [];
			for ( var follower in final_results ) {
				var wR_Key_Base = R_YT_STANDARD_FOLLOWERS + follower + ".";
				for ( var video_id in final_results[ follower ] ) {
					var wR_VID = wR_Key_Base + video_id;
					var wHashArray = [ "hmset" , wR_VID ];
					for ( var iprop in final_results[ follower ][ video_id ] ) {
						wHashArray.push( iprop );
						wHashArray.push( final_results[ follower ][ video_id ][ iprop ] );
					}
					wMultis.push( wHashArray );
				}
			}
			await RU.setMulti( redis , wMultis );
			resolve( final_results );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

process.on( "SIGINT" , async function () {
	redis.quit();
	await wSleep( 3000 );
});

process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});