// https://stackoverflow.com/questions/13385029/automatically-start-forever-node-on-system-restart
// https://github.com/zapty/forever-service
// https://github.com/Unitech/pm2
// https://github.com/chovy/node-startup

// https://github.com/sindresorhus/p-retry
// https://github.com/sindresorhus/p-timeout
// https://github.com/sindresorhus/p-limit
// https://github.com/sindresorhus/p-queue
// https://github.com/sindresorhus/p-pipe
// https://github.com/sindresorhus/p-reduce
// https://github.com/sindresorhus/p-some
// https://github.com/sindresorhus/p-all
// https://github.com/sindresorhus/p-props
// https://github.com/sindresorhus/p-if
// https://github.com/sindresorhus/p-wait-for
// https://github.com/sindresorhus/p-waterfall
// https://github.com/sindresorhus/p-forever
// https://github.com/sindresorhus/p-race
// https://github.com/sindresorhus/p-map
// https://github.com/sindresorhus/pify

require("shelljs/global");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
var wEmitter = new (require("events").EventEmitter);
module.exports.wEmitter = wEmitter;

const REDIS = require("redis");
const redis = REDIS.createClient( "8443" , "localhost" );
const RU = require( "./server/utils/redis_Utils.js" );
console.log( "starting" );
//await RU.selectDatabase( redis , 3 ); // testing
console.log( "ended" );
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
wEmitter.on( "sendFFClientMessage" , function( wMessage , wOptions ) {
	wss.clients.forEach( function each( ws ) { wOptions = wOptions || "none"; ws.send( JSON.stringify( { message: wMessage , options: wOptions } ) ); });
});
function sendStagedWebSocketMessage() {
	wss.clients.forEach( function each( ws ) {
		ws.send( STAGED_FF_CLIENT_TASK );
	});
}
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
				//wEmitter.emit( "youtubeReadyForFullScreenGlitch" );
				break;
			case "twitchReadyForFullScreenGlitch":
				require( "./server/firefoxManager.js" ).twitchFullScreen();
				//wEmitter.emit( "twitchReadyForFullScreenGlitch" );
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

process.on( "SIGINT" , function () {
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