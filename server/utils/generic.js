const request = require( "request" );
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

function GET_STATUS_REPORT() {
	return new Promise( async function( resolve , reject ) {
		try {
			const redis = require( "./redisManager.js" ).redis;
			const StatusKeys = require( "../CONSTANTS/redis.js" ).STATUS;
			console.log( StatusKeys.join( "," ) );
			var wStatusReport = await require( "./redis_Utils.js" ).getMultiKeys( redis , StatusKeys.join( "," ) );
			console.log( "\n\nSTATUS REPORT ====\n" );
			console.log( wStatusReport )
			resolve( wStatusReport );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getStatusReport = GET_STATUS_REPORT;


function CHECK_STATUS( wComponent ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const redis = require( "./redisManager.js" ).redis;
			var isComponentLive = await require( "./redis_Utils.js" ).getKey( redis , "STATUS." + wComponent );
			var answer = false;
			if ( isComponentLive ) {
				if ( isComponentLive === "ONLINE" ) { answer = true; }
			}
			resolve( answer );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.checkStatus = CHECK_STATUS;

function SET_STATUS( wComponent , wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const redis = require( "./redisManager.js" ).redis;
			await require( "./redis_Utils.js" ).setKey( redis , "STATUS." + wComponent , wStatus );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.setStatus = SET_STATUS;


function REBOOT_ROUTER() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wURL = "http://192.168.0.1/goform/login";
			var wBody = "loginUsername=admin&loginPassword=admin";
			console.log( wURL );
			request.post({
			  headers: { "content-type": "application/x-www-form-urlencoded" },
			  url:     wURL ,
			  body:    wBody ,
			}, function( error, response, body){
				console.log( body );
			  	var w1URL = "http://192.168.0.1/goform/RgSecurity";
				var w1Body = "UserId=&OldPassword=&Password=&PasswordReEnter=&ResRebootYes=0x01&RestoreFactoryNo=0x00&RgRouterBridgeMode=1";
				console.log( w1URL );
				request.post({
				  headers: { "content-type" : "application/x-www-form-urlencoded" },
				  url:     w1URL ,
				  body:    w1Body ,
				}, function( w1error, w1response, w1body){
				  console.log( w1body );
				  resolve();
				});

			});	

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.rebootRouter = REBOOT_ROUTER;


function RESTART_PM2() {
	return new Promise( function( resolve , reject ) {
		try {
			exec( "pm2 restartAll" , { silent: true , async: false } );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.restartPM2 = RESTART_PM2;


function OS_COMMAND( wTask ) {
	return new Promise( function( resolve , reject ) {
		try {
			var result = null;
			var x1 = exec( wTask , { silent: true , async: false } );
			if ( x1.stderr ) { result = x1.stderr }
			else { result = x1.stdout.trim() }
			resolve( result );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.osCommand = OS_COMMAND;