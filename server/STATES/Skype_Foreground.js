function wStart( wSkypeNameToCall ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../skypeManager.js" ).startCall( wSkypeNameToCall );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( function( resolve , reject ) {
		try {
			require( "../skypeManager.js" ).endCall();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.stop = wStop;