process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
    //wEmitter.emit( "closeEverything" );
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
    //wEmitter.emit( "closeEverything" );
});

require("shelljs/global");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
var wEmitter = new (require("events").EventEmitter);
module.exports.wEmitter = wEmitter;

const REDIS = require("redis");
const RU = require( "./server/utils/redis_Utils.js" );

const port = process.env.PORT || 6969;
const ip = require("ip");

const WebSocket = require( "ws" );

function wcl( wSTR ) { console.log( colors.green.bgBlack( "[MAIN] --> " + wSTR ) ); }
function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var INIT_CONFIG = app = redis = localIP = wSIP = server = wss = STAGED_FF_CLIENT_TASK = wss_interval = clientManager = null;

function sendStagedWebSocketMessage() {
	wss.clients.forEach( function each( ws ) {
		ws.send( STAGED_FF_CLIENT_TASK );
	});
}
function SET_STAGED_FF_CLIENT_TASK( wOptions ) {
	return new Promise( function( resolve , reject ) {
		try {
			STAGED_FF_CLIENT_TASK = JSON.stringify( wOptions );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function loadHandlers() {
	module.exports.setStagedFFClientTask = SET_STAGED_FF_CLIENT_TASK;
	wEmitter.on( "sendFFClientMessage" , function( wMessage , wOptions ) {
		wss.clients.forEach( function each( ws ) { wOptions = wOptions || "none"; ws.send( JSON.stringify( { message: wMessage , options: wOptions } ) ); });
	});
	wss.on( "connection" ,  function( socket , req ) {
		const ip = req.connection.remoteAddress;
		socket.isAlive = true;
		wcl( "New WebSocket Client Connected @@@ " + ip );
		sendStagedWebSocketMessage();
		socket.on( "message" ,  function( message ) {
			switch( message ) {
				case "pong":
					//console.log( "inside pong()" );
					this.isAlive = true;
					break;
				case "youtubeReadyForFullScreenGlitch":
					require( "./server/firefoxManager.js" ).youtubeFullScreen();
					break;
				case "twitchReadyForFullScreenGlitch":
					require( "./server/firefoxManager.js" ).twitchFullScreen();
					break;
				case "YTStandardVideoOver":
					clientManager.pressButtonMaster( 9 ); // next
					break;
				default:
					break;
			}
		});
	});
	// May not be necessary , because clients seem to be automatically deleteed in simple testing
	wss_interval = setInterval( function ping() {
		wss.clients.forEach( function each( ws ) {
			if ( ws.isAlive === false ) { console.log( "terminating client" ); return ws.terminate(); }
			ws.isAlive = false;
			ws.send( JSON.stringify( { message: "ping" } ) );
		});
	} , 30000 );



	server.listen( port , function() {
		wcl( "\tServer Started on :" );
		wcl( "\thttp://" + localIP + ":" + port );
		wcl( "\t\t or" );
		wcl( "\thttp://localhost:" + port );
		clientManager = require("./server/clientManager.js");
	});

	wcl( "done loading handlers" );
}

( async ()=> {
	wcl( "starting" );

	R_INIT_CONFIG = require( "./config.js" ).REDIS;
	localIP = ip.address();
	wSIP = 'var socketServerAddress = "' + localIP + '"; var socketPORT = "' + port + '";';	
	fs.writeFileSync( path.join( __dirname , "client" , "js" , "webSocketServerAddress.js" ) , wSIP );
	
	redis = REDIS.createClient( "8443" , "localhost" );
	await RU.selectDatabase( redis , R_INIT_CONFIG[ "DATABASE_NUM" ] ); // testing
	await wsleep( 1000 );
	if ( R_INIT_CONFIG.RESETS ) {
		await RU.deleteMultiplePatterns( redis , R_INIT_CONFIG.RESETS );
	}
	if ( R_INIT_CONFIG.SET_KEYS ) {
		var wMulti = [];
		for ( var wKey in R_INIT_CONFIG.SET_KEYS ) {
			if ( Array.isArray( R_INIT_CONFIG.SET_KEYS[ wKey ] ) ) {
				for ( var i = 0; i < R_INIT_CONFIG.SET_KEYS[ wKey ].length; ++i ) {
					wMulti.push( [ "sadd" , wKey , R_INIT_CONFIG.SET_KEYS[ wKey ][ i ] ] );
				}
			}
			else {
				wMulti.push( [ "set" , wKey , R_INIT_CONFIG.SET_KEYS[ wKey ] ] );
			}
		}
		console.log( wMulti );
		await RU.setMulti( redis , wMulti );
	}
	module.exports.redis = redis;

	app = require( "./server/EXPRESS/expressAPP.js" );
	server = require( "http" ).createServer( app );
	wss = new WebSocket.Server({ server });

	loadHandlers();

	wcl( "SERVER READY" );
})();

process.on( "SIGINT" , function () {
	wEmitter.emit( "closeEverything" );
	setTimeout( ()=> {
		exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
		exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
		process.exit(1);
	} , 2000 );
});