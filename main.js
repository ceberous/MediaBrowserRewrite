require("shelljs/global");
var fs = require('fs');
var path = require("path");
var colors = require("colors");
var wEmitter = new (require('events').EventEmitter);
module.exports.wEmitter = wEmitter;
console.trace();
function wcl( wSTR ) { console.log( colors.green.bgBlack( "[MAIN] --> " + wSTR ) ); }

var port = process.env.PORT || 6969;
var ip = require("ip");
var localIP = ip.address();
var wSIP = 'var socketIOServerAddress = "http://' + localIP + '"; var socketIOPORT = "' + port + '";';
fs.writeFileSync( path.join( __dirname , "client" , "js" , "sockioServerAddress.js" ) , wSIP );
var app = require("./server/EXPRESS/expressAPP.js");
var server = require("http").createServer(app);

var io = require('socket.io')(server);
var sockIOServerManager = require("./server/socketIOManager.js");
io.sockets.setMaxListeners(0);
io.on( "connection" , sockIOServerManager.wOC );


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
		process.exit(1);
	} , 5000 );
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