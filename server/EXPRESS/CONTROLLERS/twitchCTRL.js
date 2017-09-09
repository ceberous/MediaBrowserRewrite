//var GET_FOLLOWERS = require( "../../twitchManager.js" ).getFollowers;

// var FEED_ADD_FOLLOWER = require( "../../youtubeManager.js" ).addFeedFollower;
// var FEED_REMOVE_FOLLOWER = require( "../../youtubeManager.js" ).removeFeedFollower;
// var FEED_ADD_BLACKLIST = require( "../../youtubeManager.js" ).removeLiveFollower; 
// var FEED_REMOVE_BLACKLIST = require( "../../youtubeManager.js" ).removeLiveFollower; 

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }


//module.exports.getFollowers = function( req , res ) { sendJSONResponse( res , 200 , GET_FOLLOWERS() ); };
module.exports.getFollowers = function( req , res ) { sendJSONResponse( res , 200 , { status: "we are here" } ); };

// module.exports.addLiveFollower = function( req , res ) {
// 	LIVE_ADD_FOLLOWER( req.params.wID );
// 	sendJSONResponse( res , 200 , { status: "success" } ); 
// };
// module.exports.removeLiveFollower = function( req , res ) {
// 	LIVE_REMOVE_FOLLOWER( req.params.wID );
// 	sendJSONResponse( res , 200 , { status: "success" } ); 
// };
// module.exports.addLiveBlacklist = function( req , res ) {
// 	LIVE_ADD_BLACKLIST( req.params.wID );
// 	sendJSONResponse( res , 200 , { status: "success" } ); 
// };
// module.exports.removeLiveBlacklist = function( req , res ) {
// 	LIVE_REMOVE_BLACKLIST( req.params.wID );
// 	sendJSONResponse( res , 200 , { status: "success" } ); 
// };