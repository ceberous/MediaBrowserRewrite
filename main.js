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

function wcl( wSTR ) { console.log( colors.green.bgBlack( "[MAIN] --> " + wSTR ) ); }
const wsleep = require( "./server/utils/generic.js" ).wSleep;

// Need to Switch Client Stuff to this -->
// https://bulma.io/documentation/overview/start/

// sudo leafpad /etc/xdg/lxsession/LXDE/autostart
// xrandr -q
// @xrandr --auto --output HDMI1 --primary --mode 1920x1080+0+0 --right-of eDP1
// @xrandr --auto --output eDP1 --primary --mode 1366x768+0+0 --left-of HDMI1

var INIT_CONFIG = app = redis = wsManger = localIP = wSIP = server = wss = STAGED_FF_CLIENT_TASK = wss_interval = clientManager = null;

function SEND_STAGED_WS_MESSAGE() {
	return new Promise( async function( resolve , reject ) {
		try {
			var STAGED_FF_CLIENT_TASK = await require( "./server/utils/generic.js" ).getStagedFFClientTask( true );
			wss.clients.forEach( function each( ws ) {
				ws.send( STAGED_FF_CLIENT_TASK );
			});
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

( async ()=> {
	wcl( "starting" );

	await require( "./server/utils/redisManager.js" ).loadRedis();
	wcl( "LOADED Redis-Client" );
	await require( "./server/utils/generic.js" ).wSleep( 2000 );
	await require( "./server/utils/config.js" ).saveConfigToRedis();

	app = require( "./server/EXPRESS/expressAPP.js" );
	server = require( "http" ).createServer( app );
	wss = new WebSocket.Server({ server });

	clientManager = await require("./server/clientManager.js");
	wcl( "LOADED ClientManager" );

	await require( "./server/websocketManager.js" ).initialize( port );
	wss.on( "connection" , require( "./server/websocketManager.js" ).onConnection ); 
	wEmitter.on( "sendFFClientMessage" , async function( wMessage , wOptions ) {
		await require( "./server/websocketManager.js" ).broadcast( wss , wMessage , wOptions )
	});
	module.exports.sendStagedWebSocketMessage = SEND_STAGED_WS_MESSAGE;
	
	wcl( "LOADED FF-Client Web-Socket Stuff" );

	//await require( "./server/slackManager.js" ).initialize();
	//wcl( "LOADED Slack-Client" );

	await require( "./server/discordManager.js" ).intitialize();
	await require( "./server/utils/generic.js" ).wSleep( 2000 );
	wcl( "LOADED Discord-Client" );

	server.listen( port , async function() {
		const localIP = ip.address();
		wcl( "\tServer Started on :" );
		wcl( "\thttp://" + localIP + ":" + port );
		wcl( "\t\t or" );
		wcl( "\thttp://localhost:" + port );
	});

	process.on( "unhandledRejection" , async function( reason , p ) {
	    //require( "./server/slackManager.js" ).postError( reason );
	    await require( "./server/discordManager.js" ).error( reason );
	});
	process.on( "uncaughtException" , async function( err ) {
	    await require( "./server/discordManager.js" ).error( err );
	});

	process.on( "SIGINT" , async function () {
		//wEmitter.emit( "closeEverything" );
		await clientManager.pressButtonMaster( 6 );
		await require( "./server/mopidyManager.js" ).shutdown();
		//await require( "./server/localMediaManager.js" ).shutdown();
		await require( "./server/discordManager.js" ).shutdown();
		setTimeout( ()=> {
			//exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
			exec( "sudo pkill -9 mplayer" , { silent: true ,  async: false } );
			process.exit(1);
		} , 2000 );
	});

	wcl( "SERVER READY" );
})();