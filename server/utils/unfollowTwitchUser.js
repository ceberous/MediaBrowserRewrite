const request = require( "request" );
//https://dev.twitch.tv/docs/v5/reference/users#follow-channel

var wSES = [ process.argv[2] , process.argv[3] , process.argv[4] , process.argv[5] ];
console.log( wSES );
function unfollowUserName( wUN , wUserNameToFollow , wClientID , wOauth ) {
	return new Promise( function( resolve , reject ) {
		try {
			var wURL = "https://api.twitch.tv/kraken/users/" + wSES[0] + "/follows/channels/" + wSES[1] +"?client_id=" +
			wSES[2] + "&oauth_token=" + wSES[3] + "&on_site=1";
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
			wSES[2] + "&oauth_token=" + wSES[3] + "&on_site=1";
			request( wURL , function ( err , response , body ) {
		        if ( err ) { console.log( err ); reject( err ); return; }
				resolve( JSON.parse( body ) );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
( async ()=> {
	var r1 = await unfollowUserName();
	console.log( r1 );
	var r2 = await getFollowers();
	console.log( r2 );
})();
