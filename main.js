process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});
require("shelljs/global");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const wEmitter = new (require("events").EventEmitter);
module.exports.wEmitter = wEmitter;

const port = process.env.PORT || 6969;
const ip = require("ip");

const WebSocket = require( "ws" );

// Need to Switch Client Stuff to this -->
// https://bulma.io/documentation/overview/start/

// sudo leafpad /etc/xdg/lxsession/LXDE/autostart
// xrandr -q
// @xrandr --auto --output HDMI1 --primary --mode 1920x1080+0+0 --right-of eDP1
// @xrandr --auto --output eDP1 --primary --mode 1366x768+0+0 --left-of HDMI1

function wcl( wSTR ) { console.log( colors.green.bgBlack( "[MAIN] --> " + wSTR ) ); }
const wsleep = require( "./server/utils/generic.js" ).wSleep;


var INIT_CONFIG = app = redis = localIP = wSIP = server = wss = STAGED_FF_CLIENT_TASK = wss_interval = clientManager = null;

// Web-Socket Stuff for FF-Client
// ===================================================================================================
// ===================================================================================================
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
function loadWebSocketForFFClient() {
	return new Promise( function( resolve , reject ) {
		try {
			localIP = ip.address();
			wSIP = 'var socketServerAddress = "' + localIP + '"; var socketPORT = "' + port + '";';	
			fs.writeFileSync( path.join( __dirname , "client" , "js" , "webSocketServerAddress.js" ) , wSIP );

			module.exports.setStagedFFClientTask = SET_STAGED_FF_CLIENT_TASK;
			wEmitter.on( "sendFFClientMessage" , function( wMessage , wOptions ) {
				wss.clients.forEach( function each( ws ) { 
					wOptions = wOptions || "none"; 
					ws.send( JSON.stringify( { message: wMessage , options: wOptions } ) ); 
				});
			});
			wss.on( "connection" ,  function( socket , req ) {
				const ip = req.connection.remoteAddress;
				socket.isAlive = true;
				wcl( "New WebSocket Client Connected @@@ " + ip );
				sendStagedWebSocketMessage();
				socket.on( "message" ,  function( message ) {
					try { message = JSON.parse( message ); }
					catch( e ) { var a = message; message = {"message": a}; }
					
					switch( message.message ) {
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
						case "InstagramMediaOver":
							require( "./server/instagramManager.js" ).updateWatchedMedia( message.options )
						default:
							break;
					}
				});
			});
			// May not be necessary , because clients seem to be automatically deleteed in simple testing
			wss_interval = setInterval( function ping() {
				wss.clients.forEach( function each( ws ) {
					if ( ws.isAlive === false ) { wcl( "terminating client" ); return ws.terminate(); }
					ws.isAlive = false;
					ws.send( JSON.stringify( { message: "ping" } ) );
				});
			} , 30000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
// ===================================================================================================
// ===================================================================================================


( async ()=> {
	wcl( "starting" );

	//await loadREDIS();
	await require( "./server/utils/redisManager.js" ).loadRedis();
	wcl( "LOADED Redis-Client" );

	app = require( "./server/EXPRESS/expressAPP.js" );
	server = require( "http" ).createServer( app );
	wss = new WebSocket.Server({ server });

	clientManager = await require("./server/clientManager.js");
	wcl( "LOADED ClientManager" );

	await loadWebSocketForFFClient();
	wcl( "LOADED FF-Client Web-Socket" );

	await require( "./server/slackManager.js" ).initialize();
	wcl( "LOADED Slack-Client" );

	server.listen( port , async function() {
		wcl( "\tServer Started on :" );
		wcl( "\thttp://" + localIP + ":" + port );
		wcl( "\t\t or" );
		wcl( "\thttp://localhost:" + port );
	});

	process.on( "unhandledRejection" , function( reason , p ) {
	    require( "./server/slackManager.js" ).postError( reason );
	});
	process.on( "uncaughtException" , function( err ) {
	    require( "./server/slackManager.js" ).postError( err );
	});

	process.on( "SIGINT" , async function () {
		//wEmitter.emit( "closeEverything" );
		await clientManager.pressButtonMaster( 6 );
		await require( "./server/mopidyManager.js" ).shutdown();
		//await require( "./server/localMediaManager.js" ).shutdown();
		setTimeout( ()=> {
			//exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
			exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
			process.exit(1);
		} , 2000 );
	});

	wcl( "SERVER READY" );
})();