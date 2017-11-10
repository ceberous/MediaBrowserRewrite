const getStagedTask = require( "../main.js" ).getStagedFFClientTask;
module.exports.onConnection = function( socket , req ) {
	const ip = req.connection.remoteAddress;
	socket.isAlive = true;
	console.log( "New Client Connected @@@ " + ip );
	var stagedTask = getStagedTask();
	console.log( stagedTask );
	socket.send( stagedTask );
	socket.on( "message" , function( message ) {
		switch( message ) {
			case "pong":
				console.log( "inside pong()" );
				this.isAlive = true;
				break;
			default:
				break;
		}
		console.log( message );
	});
}