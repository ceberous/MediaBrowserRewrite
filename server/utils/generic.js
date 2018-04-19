require( "shelljs/global" );

function W_SLEEP( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.wSleep = W_SLEEP;

function FIX_PATH_SPACE( wFP ) {
	var fixSpace = new RegExp( " " , "g" );
	wFP = wFP.replace( fixSpace , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}
module.exports.fixPathSpace = FIX_PATH_SPACE;

function GET_DURATION( wFP ) {
	try {
		wFP = FIX_PATH_SPACE( wFP );
		var z1 = "ffprobe -v error -show_format -i " + wFP;
		var x1 = exec( z1 , { silent: true , async: false } );
		if ( x1.stderr ) { return( x1.stderr ); }
		var wMatched = x1.stdout.match( /duration="?(\d*\.\d*)"?/ );
		var f1 = Math.floor( wMatched[1] );
		return f1;
	}
	catch( error ) { console.log( error ); }
}
module.exports.getDuration = GET_DURATION;

function SET_STAGED_FF_CLIENT_TASK( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const STAGED_FF_CLIENT_TASK = JSON.stringify( wOptions );
			const redis = require( "./redisManager.js" ).redis;
			await require( "./redis_Utils.js" ).setKey( redis , "STAGED_FF_TASK" , STAGED_FF_CLIENT_TASK );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.setStagedFFClientTask = SET_STAGED_FF_CLIENT_TASK;

function GET_STAGED_FF_CLIENT_TASK( wDontParse ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const redis = require( "./redisManager.js" ).redis;
			var STAGED_FF_CLIENT_TASK = await require( "./redis_Utils.js" ).getKey( redis , "STAGED_FF_TASK" );
			if ( !wDontParse ) { STAGED_FF_CLIENT_TASK = JSON.parse( STAGED_FF_CLIENT_TASK ); }
			resolve( STAGED_FF_CLIENT_TASK );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getStagedFFClientTask = GET_STAGED_FF_CLIENT_TASK;