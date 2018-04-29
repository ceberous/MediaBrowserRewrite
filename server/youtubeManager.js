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

const wMonth = 2629800;
const wWeek = 604800;
const wDay = 86400;
const ytXML_Base = "https://www.youtube.com/feeds/videos.xml?channel_id=";


function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			//await BUILD_REDIS_SKELETON();
			//await enumerateLiveFollowers();
			await RU.setKey( redis , "STATUS.YT_LIVE" , "ONLINE" );
			await STANDARD_FOLLOWERS_GET_LATEST();
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


// ============== STANDARD - SECTION ===========================================// 
// =============================================================================// 
function FILTER_OLD_VIDEOS_BASED_ON_TIME( wItems , wTimeLimit ) {
	if ( !wItems ) {  return; }
	wTimeLimit = wTimeLimit || wMonth;
	var n1 = new Date();
	var n2 = Math.round( n1.getTime() / 1000 );
	for ( var i = 0; i < wItems.length; ++i ) {
		for ( var x = 0; x < wItems[ i ].length; ++x ) {
			if ( ( n2 - wItems[ i ][ x ][ "pubdate" ] ) > wTimeLimit ) {
				wItems[ i ].splice( x , 1 );
			}
		}
	}
	return wItems;
}

function PARSE_STANDARD_FOLLOWER_XML( wResults , wChannelID ) {
	var parsed = [];
	if ( wResults ) {
		for ( var i = 0; i < wResults.length; ++i ) {
			var t1 = new Date( wResults[ i ].pubdate );
			var t2 = Math.round( t1.getTime() / 1000 );
			var xID = wResults[i]["yt:videoid"]["#"];
			if ( xID ) {
				parsed.push({
					id: xID ,
					channel_id: wChannelID ,
					title: wResults[ i ].title ,
					pubdate: t2 ,
					completed: false ,
					skipped: false ,
					current_time: 0 ,
					remaining_time: 0 ,
					duration: 0 ,
				});
			}
		}
	}
	return( parsed );
}

// https://github.com/ceberous/MediaBrowser/blob/master/server/videoManager.js
// from view-source:https://www.youtube.com/user/$USER_NAME/about
// data-channel-external-id=
// FEED_MAN
function STANDARD_FOLLOWERS_FETCH_XML( channelID ) {
	return new Promise( function( resolve , reject ) {
		try {
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
			feedparser.on( "end" , () => {
				var parsed = PARSE_STANDARD_FOLLOWER_XML( wResults , channelID );
				parsed = FILTER_OLD_VIDEOS_BASED_ON_TIME( parsed );
				resolve( parsed );
			});
		}
		catch( error ) { console.log( error ); resolve(); }
	});
}

function STANDARD_FOLLOWERS_GET_LATEST() {
	return new Promise( async function( resolve , reject ) {
		try { 
			var current_followers = await RU.getFullSet( redis , RC.STANDARD.FOLLOWERS );
			if ( current_followers ) {
				if ( current_followers.length > 0 ) {
					var latest = await map( current_followers , userId => STANDARD_FOLLOWERS_FETCH_XML( userId ) );
				}
			}
			if ( current_followers && latest ) {
				if ( current_followers.length === latest.length ) {
					var all_new = [].concat.apply( [] , latest );
					all_new = all_new.sort( function() { return 0.5 - Math.random(); });
					var new_que_ids = all_new.map( x => x[ "id" ] );
					const wNewTotal = new_que_ids.length;
					const current_que_length = await RU.getListLength( redis , RC.STANDARD.QUE );
					//console.log( "Current QUE Length === " + current_que_length.toString() );
					//console.log( "New Additions Total === " + wNewTotal.toString() );
					const space_available = ( 100 - ( current_que_length + wNewTotal ) );
					//console.log( "Space Available === " + space_available.toString() );
					if ( space_available < 0 ) {
						const space_needed = ( 0 - space_available );
						//console.log( "We need to clear " + space_needed.toString() + " slots in que" );
						var wToDeleteIDS = [];
						for ( var i = 0; i < space_needed; ++i ) {
							var xTMP = await RU.listRPOP( redis , RC.STANDARD.QUE );
							wToDeleteIDS.push( xTMP );
						}
						var wToDeleteKeysMulti = wToDeleteIDS.map( x => [ "del" , RC.STANDARD.LATEST + "." + x ] );
						//console.log( "We need to remove these **old** videos" );
						//console.log( wToDeleteKeysMulti );
						await RU.setMulti( redis , wToDeleteKeysMulti );
						//console.log( "supposedly done deleting keys" );
					}
					//console.log( "about to add new ids to QUE" );
					await RU.setListFromArrayBeginning( redis , RC.STANDARD.QUE , new_que_ids );
					//console.log( "done adding to QUE" );
					for ( var i = 0; i < all_new.length; ++i ) {
						var xR_Key = RC.STANDARD.LATEST + "." + all_new[ i ][ "id" ];
						if ( !await RU.exists( redis , xR_Key ) ) {
							await RU.setHashMulti( redis , xR_Key ,
								"title" , all_new[ i ][ "title" ] ,
								"pubdate" , all_new[ i ][ "pubdate" ] ,
								"completed" , all_new[ i ][ "completed" ] ,
								"skipped" , all_new[ i ][ "skipped" ] ,
								"current_time" , all_new[ i ][ "current_time" ] ,
								"remaining_time" , all_new[ i ][ "remaining_time" ] ,
								"duration" , all_new[ i ][ "duration" ] ,
							);
						}			
					}
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
// ============== STANDARD - SECTION ===========================================// 
// =============================================================================// 

module.exports.initialize = INITIALIZE;
module.exports.updateLive = enumerateLiveFollowers;
module.exports.updateStandard = STANDARD_FOLLOWERS_GET_LATEST;