const colors = require("colors");
const FeedParser = require("feedparser");
const request = require("request");
const cheerio = require("cheerio");
const path = require("path");

const { map } = require( "p-iteration" );

const wEmitter	= require("../main.js").wEmitter;

const redis = require( "./utils/redisManager.js" ).redis;
const RU = require( "./utils/redis_Utils.js" );
const RC = require( "./CONSTANTS/redis.js" ).YOU_TUBE;

function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_MAN] --> " + wSTR ) ); }
const wSleep = require( "./utils/generic.js" ).wSleep;


// function BUILD_REDIS_SKELETON() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			var wMulti = [];
// 			for ( var wKey in R_SKELETON ) {
// 				wMulti.push( [ "setnx" , wKey , R_SKELETON[ wKey ] ] );
// 			}
// 			console.log( wMulti );
// 			await RU.setMulti( redis , wMulti );			
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }


function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			//await BUILD_REDIS_SKELETON();
			//await enumerateLiveFollowers();
			await RU.setKey( redis , "STATUS.YT_LIVE" , "ONLINE" );
			await enumerateStandardFollowers();
			await RU.setKey( redis , "STATUS.YT_STANDARD" , "ONLINE" );
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
			await RU.delKey( redis , RC.LIVE.LATEST );

			current_followers = await RU.getFullSet( redis , RC.LIVE.FOLLOWERS );
			current_blacklist = await RU.getFullSet( redis , RC.LIVE.BLACKLIST );
			
			var live_videos = await map( current_followers , userId => searchFollower( userId ) );

			live_videos = [].concat.apply( [] , live_videos );
			live_videos = live_videos.filter( function( val ) { return current_blacklist.indexOf( val ) === -1; } );
			
			await RU.setSetFromArray( redis , RC.LIVE.LATEST , live_videos );
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
	var final_ids = [];
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
				req.on( "error" , function ( error ) { console.log(error); resolve(); return; } );
				req.on( "response" , function ( res ) {
					if ( res.statusCode !== 200 ) { /*reject( res.statusCode ); */  resolve(); return; }
					else { this.pipe( feedparser ); }
				});
				feedparser.on( "error" , function ( error ) { console.log( error ); } );
				feedparser.on( "readable" , function () { var item; while ( item = this.read() ) { wResults.push( item ); } } );
				feedparser.on( "end" , parseResults );
				function parseResults() {
					if ( wResults ) {
						for ( var i = 0; i < wResults.length; ++i ) {
							var xID = wResults[i]["yt:videoid"]["#"];
							if ( !final_results[ channelID ][ xID ] ) {
								var t1 = new Date( wResults[ i ].pubdate );
								var t2 = Math.round( t1.getTime() / 1000 );
								final_ids.push( xID );
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
					}
					resolve();
				}
			}
			catch( error ) { console.log( error ); resolve(); }
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
			current_followers = await RU.getFullSet( redis , RC.STANDARD.FOLLOWERS );
			current_blacklist = await RU.getFullSet( redis , RC.STANDARD.BLACKLIST );
			if ( current_followers ) {
				await map( current_followers , userId => fetchFollowerXML( userId ) );
				if ( current_blacklist ) {
					filterOldVideos( wMonth );
				}
			}

			final_ids = final_ids.filter( function( val ) { return current_blacklist.indexOf( val ) === -1; } );
			
			const wQueExists = await RU.exists( redis , RC.STANDARD.QUE );
			if ( !wQueExists ) {
				console.log( "Que Doesn't Exist , just setting to latest videos" );
				console.log( RC.STANDARD.QUE );
				await RU.setSetFromArray( redis , RC.STANDARD.QUE , final_ids );
			}
			else {
				const wAlreadyWatchedList = await RU.exists( redis , RC.STANDARD.WATCHED );
				if ( wAlreadyWatchedList ) {
					await RU.setSetFromArray( redis , RC.STANDARD.LATEST , final_ids );
					await RU.setDifferenceStore( redis , RC.STANDARD.PLACEHOLDER , RC.STANDARD.LATEST , RC.STANDARD.WATCHED );
					await RU.setStoreUnion( redis , RC.STANDARD.QUE , RC.STANDARD.PLACEHOLDER , RC.STANDARD.QUE );
					await RU.delKey( redis , RC.STANDARD.PLACEHOLDER );
				}
				else {
					console.log( "ALREADY_WATCHED Doesn't Exist" );
					await RU.setSetFromArray( redis , RC.STANDARD.QUE , final_ids );
				}
			}
			
			// const wQue = await RU.getFullSet( redis , RC.STANDARD.QUE );
			// console.log( "\n\nYOUTUBE STANARD QUE ==== " );
			// console.log( wQue );

			// const wQue = await RU.getFullSet( redis , RC.STANDARD.QUE );
			// console.log( "\n\nYOUTUBE STANARD QUE ==== " );
			// console.log( wQue );

			// If you wanted a detailed hash for some reason
			//var wMultis = [];
			//var wVidKeys = {}; // <-- for sunionstore
			// for ( var follower in final_results ) {
			// 	var wR_Key_B0 = RC.STANDARD.LATEST + "." + follower;
			// 	var wR_Key_Base = wR_Key_B0 + ".VIDEO.";
			// 	//if ( !wVidKeys[ follower ] ) { wVidKeys[ follower ] = []; } // <--- for sunionstore
			// 	for ( var video_id in final_results[ follower ] ) {
			// 		var wR_VID = wR_Key_Base + video_id;
			// 		//wVidKeys[ follower ].push( wR_VID ); // <-- for sunionstore
			// 		var wHashArray = [ "hmset" , wR_VID ];
			// 		for ( var iprop in final_results[ follower ][ video_id ] ) {
			// 			wHashArray.push( iprop , final_results[ follower ][ video_id ][ iprop ] );
			// 		}
			// 		wMultis.push( wHashArray );
			// 	}
			// }
			// console.log( wMultis );
			// await RU.setMulti( redis , wMultis );
			

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

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.initialize = INITIALIZE;
module.exports.updateLive = enumerateLiveFollowers;
module.exports.updateStandard = enumerateStandardFollowers;




// FILTER Example

// const R_SCIENCE_DIRECT_ARTICLE_HASH = "SCIENCE_DIRECT.ARTICLES";
// const R_SCIENCE_DIRECT_ARTICLES = "SCANNERS_SCIENCE_DIRECT.ALREADY_TRACKED";
// function FILTER_ALREADY_TRACKED_SD_ARTICLE_IDS( wResults ) {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			var wArticleIDS = wResults.map( x => x[ "sdAID" ] );
// 			//console.log( wArticleIDS );

// 			// 1.) Generate Random-Temp Key
// 			var wTempKey = Math.random().toString(36).substring(7);
// 			var R_PLACEHOLDER = "SCANNERS." + wTempKey + ".PLACEHOLDER";
// 			var R_NEW_TRACKING = "SCANNERS." + wTempKey + ".NEW_TRACKING";

// 			await RU.setSetFromArray( redis , R_PLACEHOLDER , wArticleIDS );
// 			await RU.setDifferenceStore( redis , R_NEW_TRACKING , R_PLACEHOLDER , R_SCIENCE_DIRECT_ARTICLES );
// 			await RU.delKey( redis , R_PLACEHOLDER );
// 			//await RU.setSetFromArray( redis , R_GLOBAL_ALREADY_TRACKED_DOIS , wArticleIDS );

// 			const wNewTracking = await RU.getFullSet( redis , R_NEW_TRACKING );
// 			if ( !wNewTracking ) { 
// 				await RU.delKey( redis , R_NEW_TRACKING ); 
// 				console.log( "nothing new found" ); 
// 				PrintNowTime(); 
// 				resolve( [] );
// 				return;
// 			}
// 			if ( wNewTracking.length < 1 ) {
// 				await RU.delKey( redis , R_NEW_TRACKING );
// 				console.log( "nothing new found" ); 
// 				PrintNowTime();
// 				resolve( [] );
// 				return;
// 			}
// 			wResults = wResults.filter( x => wNewTracking.indexOf( x[ "sdAID" ] ) !== -1 );
// 			await RU.delKey( redis , R_NEW_TRACKING );
// 			resolve( wResults );
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }