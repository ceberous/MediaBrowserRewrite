const request = require( "request" );
//https://dev.twitch.tv/docs/v5/reference/users#follow-channel

const wTwitchKeys = require( "../../personal.js" ).twitch;
//var wSES = [ process.argv[2] , process.argv[3] , process.argv[4] , process.argv[5] ];
//console.log( wSES );


const redis = require( "../../main.js" ).redis;
const RU = require( "./redis_Utils.js" );

function followUserName( wUserNameToFollow  ) {
	return new Promise( function( resolve , reject ) {
		try {
			var wURL = "https://api.twitch.tv/kraken/users/" + wTwitchKeys.user_name + "/follows/channels/" + wUserNameToFollow +"?client_id=" +
			wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			console.log( wURL );
			request.put( wURL , function ( err , response , body ) {
		        if ( err ) { console.log( err ); reject( err ); return; }
				resolve( JSON.parse( body ) );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function unfollowUserName( wUserNameToUnFollow ) {
	return new Promise( function( resolve , reject ) {
		try {
			var wURL = "https://api.twitch.tv/kraken/users/" + wTwitchKeys.user_name + "/follows/channels/" + wUserNameToUnFollow +"?client_id=" +
			wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			console.log( wURL );
			request.delete( wURL , function ( err , response , body ) {
		        if ( err ) { console.log( err ); reject( err ); return; }
		        var x11 = null;
		        try { x11 = JSON.parse( body ); }
		        catch( err ) { x11 = ""; }
				resolve( x11 );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function getFollowers() {
	return new Promise( function( resolve , reject ) {
		try {
			var wURL = "https://api.twitch.tv/kraken/streams/followed?client_id=" +
			wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			request( wURL , function ( err , response , body ) {
		        if ( err ) { console.log( err ); reject( err ); return; }
				resolve( JSON.parse( body ) );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const R_TWITCH_LIVE_USERS = "TWITCH.LIVE_USERS";
const R_TWITCH_LIVE_USERS_INDEX = "TWITCH.LIVE_USERS_INDEX";
function UPDATE_LIVE_USERS( wResetIndex ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.delKey( redis , R_TWITCH_LIVE_USERS );
			var xR = null;
			//var fR = [];
			var wTMP = [];
			function parseResults() {
				return new Promise( async function( resolve2 , reject2 ) {
					try {
						for ( var x1 = 0; x1 < xR[ "streams" ].length; ++x1 ) {
							var t1 = new Date( xR[ "streams" ][ x1 ][ "created_at" ] );
							var t2 = Math.round( t1.getTime() / 1000 );
							var wOBJ = {
								name: xR[ "streams" ][ x1 ][ "channel" ][ "display_name" ].toLowerCase() ,
								game: xR[ "streams" ][ x1 ][ "game" ] ,
								_id: xR[ "streams" ][ x1 ][ "_id" ] ,
								start_time: t2 ,
								resolution: xR[ "streams" ][ x1 ][ "video_height" ] ,
								status: xR[ "streams" ][ x1 ][ "stream_type" ] ,
							};
							//fR.push( wOBJ );
							// console.log( wOBJ.status );
							// console.log( ( wOBJ.status === "live" ) ? true:false );
							if ( wOBJ.status === "live" ) {
								console.log( wOBJ );
								wTMP.push( wOBJ.name );
							}
						}
						if ( wTMP.length > 0 ) {
							console.log( wTMP );
							await RU.setListFromArray( redis , R_TWITCH_LIVE_USERS , wTMP );
							//if ( !wResetIndex ) { await RU.setKey( redis , R_TWITCH_LIVE_USERS_INDEX , 0 ); }
							await RU.setKey( redis , R_TWITCH_LIVE_USERS_INDEX , 0 );
						}
						resolve2( wTMP );
					}
					catch( error ) { console.log( error ); reject2( error ); }
				});
			}
			var wURL = "https://api.twitch.tv/kraken/streams/followed?client_id=" +
			wTwitchKeys.client_id + "&oauth_token=" + wTwitchKeys.oauth_token + "&on_site=1";
			request( wURL , async function ( err , response , body ) {
		        //if ( err ) { wcl( err ); reject( err ); return; }
				xR = JSON.parse( body );
				if ( xR[ "error" ] ) { if ( xR[ "error"] === "Bad Request" ) { console.log( xR ); resolve( xR ); } }
				var fr = await parseResults();
				resolve( fr );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.updateLiveUsers = UPDATE_LIVE_USERS;


// ( async ()=> {
// 	var r1 = await followUserName( "jovian" );
// 	console.log( r1 );
// 	var r2 = await getFollowers();
// 	console.log( r2 );
// })();

module.exports.followUserName = followUserName;
module.exports.unfollowUserName = unfollowUserName;
module.exports.getFollowers = getFollowers;