const colors = require("colors");
const FeedParser = require("feedparser");
const request = require("request");
const cheerio = require("cheerio");
const path = require("path");

// Fucking Glory
// https://github.com/toniov/p-iteration
const { map } = require( "p-iteration" );

const wEmitter	= require("../main.js").wEmitter;
//var wEmitter = new (require("events").EventEmitter);
//module.exports.wEmitter = wEmitter;

const redis = require( "../main.js" ).redis;
//var REDIS = require("redis");
//var redis = REDIS.createClient( "8443" , "localhost" );
const RU = require( "./utils/redis_Utils.js" );

function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

// Initialization
const R_YT_Base = "YOU_TUBE.";

const R_YT_LIVE_LATEST_VIDEOS = R_YT_Base + "LIVE.LATEST";
const R_YT_LIVE_FOLLOWERS = R_YT_Base + "LIVE.FOLLOWERS.";
const Default_Live_Followers = [ "UCnM5iMGiKsZg-iOlIO2ZkdQ" , "UCakgsb0w7QB0VHdnCc-OVEA" , "UCZvXaNYIcapCEcaJe_2cP7A" ];
const R_YT_LIVE_BLACKLIST = R_YT_Base + "LIVE.BLACKLIST";
const Default_Live_Blacklist = [ "bNc7rGEBrMA" , "Mk9gQcHueeE" , "uyTAj1sbThg" , "cdKLSA2ke24" , "SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , "nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ];

const R_YT_STANDARD_FOLLOWERS = R_YT_Base + "STANDARD.FOLLOWERS.";
const R_YT_STANDARD_FOLLOWERS_UNEQ = R_YT_STANDARD_FOLLOWERS + "UNEQ";
const Default_Standard_Followers = [ "UCk0UErv9b4Hn5ucNNjqD1UQ" , "UCKbVtAdWFNw5K7u2MZMLKIw"  ];
const R_YT_STANDARD_BLACKLIST = R_YT_Base + "STANDARD.BLACKLIST";
const Default_Standard_Blacklist = [];

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			wcl( "inside YOUTUBE_MAN init()" );
			var ek = await RU.getKeysFromPattern( redis , "YOU_TUBE.*" );
			// Repopulate Redis Structure if Nothing Exists
			// build up everything into the 1st array 
			// please ignore naming , it is a storgae container
			if ( ek.length < 1 ) {
				console.log( "keys are less than 1" );
				var R_YT_LIVE_FOLLOWER_KEYS = Default_Live_Followers.map( x => [ "set" , R_YT_LIVE_FOLLOWERS + x , "null" ] );
				var R_YT_STANDARD_FOLLOWER_KEYS = Default_Standard_Followers.map( x => [ "set" , R_YT_STANDARD_FOLLOWERS + x , "null" ] );
				var x1_uneq = Default_Standard_Followers.map( x => [ "sadd" , R_YT_STANDARD_FOLLOWERS_UNEQ , x ] );
				var x1_black = Default_Live_Blacklist.map( x => [ "sadd" , R_YT_LIVE_BLACKLIST , x ] );
				var x1_stand = Default_Standard_Blacklist.map( x => [ "sadd" , R_YT_STANDARD_BLACKLIST , x ] );

				Array.prototype.push.apply( R_YT_LIVE_FOLLOWER_KEYS , R_YT_STANDARD_FOLLOWER_KEYS );
				Array.prototype.push.apply( R_YT_LIVE_FOLLOWER_KEYS , x1_uneq );
				Array.prototype.push.apply( R_YT_LIVE_FOLLOWER_KEYS , x1_black );
				Array.prototype.push.apply( R_YT_LIVE_FOLLOWER_KEYS , x1_stand );
				R_YT_LIVE_FOLLOWER_KEYS = R_YT_LIVE_FOLLOWER_KEYS.filter( x => x.length > 0 );
				console.log( R_YT_LIVE_FOLLOWER_KEYS );
			
				await RU.setMulti( redis , R_YT_LIVE_FOLLOWER_KEYS );
				console.log( "done building YOU_TUBE REF" );
			}
			
			//await enumerateLiveFollowers();
			//await enumerateStandardFollowers();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function enumerateLiveFollowers() {
	var current_followers = current_blacklist = [];
	function searchFollower( wChannelID ) {
		return new Promise( function( resolve , reject ) {
			try {
				var wURL = null;
				if ( wChannelID.substring( 0 , 2 ) === "UC" ) { wURL = "https://www.youtube.com/channel/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				else { wURL = "https://www.youtube.com/user/" + wChannelID + "/videos?view=2&live_view=501&flow=grid"; }
				wcl( wURL );

				var wResults = [];
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
					resolve( wResults );
				});

			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	}
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.delKey( redis , R_YT_LIVE_LATEST_VIDEOS );

			current_followers = await RU.getKeysFromPattern( redis , R_YT_LIVE_FOLLOWERS + "*" );
			current_blacklist = await RU.getFullSet( redis , R_YT_LIVE_BLACKLIST );
			const follower_ids = current_followers.map( x => x.split( R_YT_LIVE_FOLLOWERS )[1] );			
			
			var live_videos = await map( follower_ids , userId => searchFollower( userId ) );
			live_videos = [].concat.apply( [] , live_videos );

			// console.log( "current_blacklist = " );
			// console.log( current_blacklist );
			live_videos = live_videos.filter( function( val ) { return current_blacklist.indexOf( val ) === -1; });
			// console.log( "filtered results = " );
			// console.log( live_videos );			
			
			await RU.setSetFromArray( redis , R_YT_LIVE_LATEST_VIDEOS , live_videos );
			resolve( live_videos );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const wMonth = 2629800;
const wWeek = 604800;
const wDay = 86400;
const ytXML_Base = "https://www.youtube.com/feeds/videos.xml?channel_id=";
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
				var wFeedURL = ytXML_Base + channelID;
				wcl( wFeedURL );
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

			// Gather Data
			current_followers = await RU.getFullSet( redis , R_YT_STANDARD_FOLLOWERS_UNEQ );
			current_blacklist = await RU.getFullSet( redis , R_YT_STANDARD_BLACKLIST );
			await map( current_followers , userId => fetchFollowerXML( userId ) );
			filterOldVideos( wMonth );

			// Build and Store Redis Structure
			// https://redis.io/commands#hash
			// https://github.com/lykmapipo/redis-hashes <<--- ReWriting this would be great....
			// Nevermind ... https://github.com/tj/rediskit
			// https://github.com/tj/rediskit/blob/master/lib/objects/hash.js
			// It doesn't really seem to support the hmset though. so... 
			var wMultis = [];
			//var wVidKeys = {}; // <-- for sunionstore
			for ( var follower in final_results ) {
				var wR_Key_B0 = R_YT_STANDARD_FOLLOWERS + follower;
				var wR_Key_Base = wR_Key_B0 + ".VIDEO.";
				//if ( !wVidKeys[ follower ] ) { wVidKeys[ follower ] = []; } // <--- for sunionstore
				for ( var video_id in final_results[ follower ] ) {
					var wR_VID = wR_Key_Base + video_id;
					//wVidKeys[ follower ].push( wR_VID ); // <-- for sunionstore
					var wHashArray = [ "hmset" , wR_VID ];
					for ( var iprop in final_results[ follower ][ video_id ] ) {
						wHashArray.push( iprop , final_results[ follower ][ video_id ][ iprop ] );
					}
					wMultis.push( wHashArray );
				}
			}
			
			console.log( wMultis );
			await RU.setMulti( redis , wMultis );

			// ============================================================================================================================
			// This is from experimentation with sunionstore , 
			// where the fuck is hunionstore ???
			// *****Leaving here as an example for sunionstore*****
			// ============================================================================================================================
			// await wSleep( 1000 );
			// var final_vid_keys = [];
			// for ( follower in wVidKeys ) {
			// 	var wR_Key_B0 = R_YT_STANDARD_FOLLOWERS + follower + ".UNEQ";
			// 	final_vid_keys.push( [ "SUNIONSTORE" , wR_Key_B0 ] );
			// 	final_vid_keys[ final_vid_keys.length - 1 ] = final_vid_keys[ final_vid_keys.length - 1 ].concat( wVidKeys[ follower ] );
			// }
			// console.log( final_vid_keys );
			// Array.prototype.push.apply( wMultis , final_vid_keys );
			// await RU.setMulti( redis , final_vid_keys );
			// ============================================================================================================================

			resolve( final_results );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.inittialize = INITIALIZE;
module.exports.updateLive = enumerateLiveFollowers;
module.exports.updateStandard = enumerateStandardFollowers;