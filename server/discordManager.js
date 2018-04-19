const Eris = require("eris");
var discordBot = null;
var discordCreds = null;

function POST_NOW_PLAYING( wMessage ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.createMessage( discordCreds.channels.now_playing , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.nowPlaying = POST_NOW_PLAYING;

function POST_LOG( wMessage ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.createMessage( discordCreds.channels.log , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.log = POST_LOG;

function POST_ERROR( wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wStatus ) { resolve(); return; }
			if ( typeof wStatus !== "string" ) {
				try { wStatus = wStatus.toString(); }
				catch( e ) { wStatus = e; }
			}
			await discordBot.createMessage( discordCreds.channels.error , wStatus );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.error = POST_ERROR;

function SHUTDOWN() {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.disconnect();			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.shutdown = SHUTDOWN;

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			discordCreds = require( "../personal.js" ).discord;
			discordBot = new Eris( discordCreds.token );

			discordBot.on( "messageCreate" , ( msg ) => {
				if ( msg.content.startsWith( "!next" ) ) {
					require( "./clientManager.js" ).pressButtonMaster( "9" );
				}
				else if ( msg.content.startsWith( "!previous" ) ) {
					require( "./clientManager.js" ).pressButtonMaster( "8" );
				}
				else if ( msg.content.startsWith( "!pause" ) ) {
					require( "./clientManager.js" ).pressButtonMaster( "7" );
				}
				else if ( msg.content.startsWith( "!stop" ) ) {
					require( "./clientManager.js" ).pressButtonMaster( "6" );
				}
				else if ( msg.content.startsWith( "!tvpower" ) ) {
					require( "./utils/cecClientManager.js" ).activate();
				}
				else if ( msg.content.startsWith( "!od" ) ) {
					require( "./clientManager.js" ).pressButtonMaster( "11" );
				}				
				else if ( msg.content.startsWith( "!start" ) ) {
					
					if ( msg.content.includes( "yt live" ) || msg.content.includes( "youtube live" ) || msg.content.includes( "yt background" ) ) {
						require( "./clientManager.js" ).pressButtonMaster( "0" );
					}
					else if (  msg.content.includes( "yt standard" ) || msg.content.includes( "youtube standard" ) ) {
						require( "./clientManager.js" ).pressButtonMaster( "14" );
					}

					else if (  msg.content.includes( "music" ) || msg.content.includes( "mopidy" ) ) {
						if ( msg.content.includes( "classic" ) ) {
							require( "./clientManager.js" ).pressButtonMaster( "1" );
						}
						else if ( msg.content.includes( "edm" ) ) {
							require( "./clientManager.js" ).pressButtonMaster( "2" );
						}
						//else if ( msg.content.includes( "relax" ) ) {
							//require( "./clientManager.js" ).pressButtonMaster( "" );
						//}
						else { require( "./clientManager.js" ).pressButtonMaster( "1" ); }
					}

					else if (  msg.content.includes( "twitch" ) ) {
						if ( msg.content.includes( "live" ) ) {
							require( "./clientManager.js" ).pressButtonMaster( "3" );
						}
						// else if ( msg.content.includes( "vod" ) ) {
						// 	require( "./clientManager.js" ).pressButtonMaster( "" );
						// }
						else { require( "./clientManager.js" ).pressButtonMaster( "3" ); }
					}

					else if (  msg.content.includes( "odyssey" ) ) {
						require( "./clientManager.js" ).pressButtonMaster( "11" );
					}
				}
			});

			await discordBot.connect();			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.intitialize = INITIALIZE;