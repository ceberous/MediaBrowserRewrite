const wSkypeNames = require("../../personal.js").skypeNames;
function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var name = wSkypeNames[ wOptions.personal_number ];
			await require( "../skypeManager.js" ).startCall( name );
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