function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

// LIVE
module.exports.liveGetVideos = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/live.js" ).getLiveVideos();
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.liveGetFollowers = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/live.js" ).getFollowers( req.params.wID );
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.liveAddFollower = async function( req , res ) {
	await require( "../../YOUTUBE/live.js" ).addFollower( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};
module.exports.liveRemoveFollower = async function( req , res ) {
	await require( "../../YOUTUBE/live.js" ).removeFollower( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};
module.exports.liveGetBlacklist = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/live.js" ).getBlacklist();
	sendJSONResponse( res , 200 , x1 ); 
};
module.exports.liveAddBlacklist = async function( req , res ) {
	await require( "../../YOUTUBE/live.js" ).blacklistVID( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};
module.exports.liveRemoveBlacklist = async function( req , res ) {
	await require( "../../YOUTUBE/live.js" ).removeBlacklistVID( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};


// STANDARD
module.exports.standardUpdate = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/standard.js" ).update();
	sendJSONResponse( res , 200 , x1 ); 
};
module.exports.standardGetQue = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/standard.js" ).getQue();
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.standardDeleteVideo = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/standard.js" ).deleteVideo( req.params.wID );
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.standardGetVideoInfo = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/standard.js" ).getVideoInfo( req.params.wID );
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.standardUpdateVideoInfo = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/standard.js" ).updateVideoInfo( req.params.wID , req.params.wKey , req.params.wValue );
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.standardGetFollowers = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/standard.js" ).getFollowers( req.params.wID );
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.standardAddFollower = async function( req , res ) {
	await require( "../../YOUTUBE/standard.js" ).addFollower( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};
module.exports.standardRemoveFollower = async function( req , res ) {
	await require( "../../YOUTUBE/standard.js" ).removeFollower( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};
module.exports.standardGetBlacklist = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/standard.js" ).getBlacklist();
	sendJSONResponse( res , 200 , x1 ); 
};
module.exports.standardAddBlacklist = async function( req , res ) {
	await require( "../../YOUTUBE/standard.js" ).blacklistVID( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};
module.exports.standardRemoveBlacklist = async function( req , res ) {
	await require( "../../YOUTUBE/standard.js" ).removeBlacklistVID( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};




// Currated
module.exports.curratedGetList = async function( req , res ) {
	const x1 = await require( "../../YOUTUBE/currated.js" ).getList();
	sendJSONResponse( res , 200 , x1 ); 
};

module.exports.curratedAddToList = async function( req , res ) {
	await require( "../../YOUTUBE/currated.js" ).addToList( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};

module.exports.curratedDeleteFromList = async function( req , res ) {
	await require( "../../YOUTUBE/currated.js" ).removeFromList( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};

module.exports.curratedImportPlaylistID = async function( req , res ) {
	await require( "../../YOUTUBE/currated.js" ).importFromPlaylistID( req.params.wID );
	sendJSONResponse( res , 200 , { status: "success" } ); 
};