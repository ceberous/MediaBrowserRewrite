const request = require( "request" );
//https://dev.twitch.tv/docs/v5/reference/users#follow-channel

const wTwitchKeys = require( "../../personal.js" ).twitch;
//var wSES = [ process.argv[2] , process.argv[3] , process.argv[4] , process.argv[5] ];
//console.log( wSES );

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
( async ()=> {
	var r1 = await followUserName( "jovian" );
	console.log( r1 );
	var r2 = await getFollowers();
	console.log( r2 );
})();

module.exports.followUserName = followUserName;
module.exports.unfollowUserName = unfollowUserName;
module.exports.getFollowers = getFollowers;