require("shelljs/global");
const fs = require('fs');
const path = require("path");
const colors = require("colors");
var wEmitter = new (require('events').EventEmitter);
module.exports.wEmitter = wEmitter;

const REDIS = require("redis");
const redis = REDIS.createClient( "8443" , "localhost" );
module.exports.redis = redis;

function wcl( wSTR ) { console.log( colors.green.bgBlack( "[MAIN] --> " + wSTR ) ); }

const port = process.env.PORT || 6969;
const ip = require("ip");
const localIP = ip.address();
const wSIP = 'var socketServerAddress = "' + localIP + '"; var socketPORT = "' + port + '";';
fs.writeFileSync( path.join( __dirname , "client" , "js" , "webSocketServerAddress.js" ) , wSIP );
const app = require( "./server/EXPRESS/expressAPP.js" );
const server = require( "http" ).createServer( app );

const WebSocket = require( "ws" );
const wss = new WebSocket.Server({ server });
var STAGED_FF_CLIENT_TASK = null;
module.exports.setStagedFFClientTask = function( wOptions ) { STAGED_FF_CLIENT_TASK = JSON.stringify( wOptions ); }
wEmitter.on( "sendFFClientMessage" , function( wMessage ) {
	wss.clients.forEach( function each( ws ) { ws.send( JSON.stringify( { message: wMessage } ) ); });
});
function sendWebSocketMessage() {
	wss.clients.forEach( function each( ws ) {
		ws.send( STAGED_FF_CLIENT_TASK );
	});
}
wss.on( "connection" ,  function( socket , req ) {
	const ip = req.connection.remoteAddress;
	socket.isAlive = true;
	wcl( "New WebSocket Client Connected @@@ " + ip );
	sendWebSocketMessage();
	socket.on( "message" , function( message ) {
		switch( message ) {
			case "pong":
				//console.log( "inside pong()" );
				this.isAlive = true;
				break;
			case "youtubeReadyForFullScreenGlitch":
				wEmitter.emit( "youtubeReadyForFullScreenGlitch" );
				break;
			default:
				break;
		}
	});
});
// May not be necessary , because clients seem to be automatically deleteed in simple testing
const wss_interval = setInterval( function ping() {
	wss.clients.forEach( function each( ws ) {
		if ( ws.isAlive === false ) { console.log( "terminating client" ); return ws.terminate(); }
		ws.isAlive = false;
		ws.send( JSON.stringify( { message: "ping" } ) );
	});
} , 30000 );


const clientManager = require("./server/clientManager.js");


server.listen( port , function() {
	wcl( "\tServer Started on :" );
	wcl( "\thttp://" + localIP + ":" + port );
	wcl( "\t\t or" );
	wcl( "\thttp://localhost:" + port );
});

process.on('SIGINT', function () {
	wEmitter.emit( "closeEverything" );
	setTimeout( ()=> {
		exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
		exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
		process.exit(1);
	} , 2000 );
});

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