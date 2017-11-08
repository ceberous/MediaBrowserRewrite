var colors = require("colors");
var FeedParser = require('feedparser');
var request = require("request");
var cheerio = require('cheerio');
var path = require("path");

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

const R_YT_LIVE_FOLLOWERS = R_YT_Base + "LIVE.FOLLOWERS.";
const Default_Live_Followers = [ "UCnM5iMGiKsZg-iOlIO2ZkdQ" , "UCakgsb0w7QB0VHdnCc-OVEA" , "UCZvXaNYIcapCEcaJe_2cP7A" ];
const R_YT_LIVE_BLACKLIST = R_YT_Base + "LIVE.BLACKLIST";
const Default_Live_Blacklist = [ "SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , "nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ];

const R_YT_STANDARD_FOLLOWERS = R_YT_Base + "STANDARD.FOLLOWERS.";
const Default_Standard_Followers = [ "UCk0UErv9b4Hn5ucNNjqD1UQ" , "4sWTLBsuO98" , "Vhs0ffpJyro" ];
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

	if ( ek.length < 1 ) {
		var R_YT_LIVE_FOLLOWER_KEYS = Default_Live_Followers.map( x => [ "set" , R_YT_LIVE_FOLLOWERS + x , "null" ] );
		var R_YT_STANDARD_FOLLOWER_KEYS = Default_Standard_Followers.map( x => [ "set" , R_YT_STANDARD_FOLLOWERS + x , "null" ] );
		Array.prototype.push.apply( R_YT_LIVE_FOLLOWER_KEYS , R_YT_STANDARD_FOLLOWER_KEYS );
		await RU.setMulti( redis , R_YT_LIVE_FOLLOWER_KEYS );
		await RU.setSetFromArray( redis , R_YT_LIVE_BLACKLIST , Default_Live_Blacklist );
		await RU.setSetFromArray( redis , R_YT_STANDARD_BLACKLIST , Default_Standard_Blacklist );
		console.log( "done building YOU_TUBE REF" );
	}

})();




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