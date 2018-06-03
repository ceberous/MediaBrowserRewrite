// https://qeled.github.io/discordie/#/docs/GettingStarted.md?_k=n7hmct
// https://qeled.github.io/discordie/#/docs/IDirectMessageChannel?_k=658zxz

// https://support.discordapp.com/hc/en-us/articles/225977308--Windows-Discord-Hotkeys

const Eris = require( "eris" );
var discordBot = null;
var discordCreds = null;

function POST_ID( wMessage , wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.createMessage( wChannelID , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}
module.exports.postID = POST_ID;

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

function GetButtonInfo() {
	wChannelID = wChannelID || discordCreds.channels.log;
	try { delete require.cache[ "../config/buttons.json" ]; }
	catch ( e ) {}
	var state_names = require( "../config/buttons.json" );
	var reply_string = "";
	for ( var state in state_names ) {
		reply_string = reply_string + "!btn " + state + " === " + state_names[ state ][ "name" ] + "\n";
	}
	return reply_string;
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			discordCreds = require( "../personal.js" ).discord;
			//discordBot = new Eris( discordCreds.token );
			discordBot = new Eris.CommandClient( discordCreds.token , {} , {
				description: "MediaBrowser Controller",
				owner: discordCreds.bot_id ,
				prefix: "!"
			});

			// https://github.com/abalabahaha/eris/blob/master/lib/command/CommandClient.js#L301

			discordBot.on( "messageCreate" , async ( msg ) => {
				
				if ( msg[ "author" ][ "id" ] === discordCreds.bot_id ) { return; }
				// Restrict to Only now_playing channel
				//if ( msg.channel.id !== discordCreds.channels.now_playing ) { return; }

				if ( msg.content.startsWith( "!od" ) ) {
					require( "./clientManager.js" ).pressButtonMaster( "11" );
					return;
				}				
				else if ( msg.content.startsWith( "!start" ) || msg.content.startsWith( "!play" ) ) {
					
					if ( msg.content.includes( "yt live" ) || msg.content.includes( "youtube live" ) || msg.content.includes( "yt background" ) ) {
						require( "./clientManager.js" ).pressButtonMaster( "0" );
						return;
					}
					else if ( msg.content.includes( "yt standard" ) || msg.content.includes( "youtube standard" ) ) {
						require( "./clientManager.js" ).pressButtonMaster( "14" );
						return;
					}

					else if ( msg.content.includes( "music" ) || msg.content.includes( "mopidy" ) ) {
						if ( msg.content.includes( "classic" ) ) {
							require( "./clientManager.js" ).pressButtonMaster( "1" );
							return;
						}
						else if ( msg.content.includes( "edm" ) ) {
							require( "./clientManager.js" ).pressButtonMaster( "2" );
							return;
						}
						//else if ( msg.content.includes( "relax" ) ) {
							//require( "./clientManager.js" ).pressButtonMaster( "" );
						//}
						else { require( "./clientManager.js" ).pressButtonMaster( "1" ); return; }
					}

					else if ( msg.content.includes( "odyssey" ) ) {
						require( "./clientManager.js" ).pressButtonMaster( "11" );
						return;
					}
				}
				else if ( msg.content.startsWith( "!youtube" ) || msg.content.startsWith( "!yt" ) ) {
					var second_commands = msg.content.split( " " );
					if ( !second_commands )  { return; }
					if ( second_commands.length < 2 ) { return; }

					if ( second_commands.length === 2 ) {

						if ( second_commands[ 1 ] === "live" ) {
							require( "./clientManager.js" ).pressButtonMaster( "0" );
							return;
						}
						else if ( second_commands[ 1 ] === "standard" ) {
							require( "./clientManager.js" ).pressButtonMaster( "14" );
							return;
						}
						else if ( second_commands[ 1 ] === "currated" ) {
							require( "./clientManager.js" ).pressButtonMaster( "15" );
							return;
						}						
						else if ( second_commands[ 1 ] === "relax" || second_commands[ 1 ] === "relaxing" ) {
							require( "./clientManager.js" ).pressButtonMaster( "16" );
							return;
						}

						var final_options = { position: "FOREGROUND" };
						if ( second_commands[ 1 ].indexOf( "watch?v=" ) !== -1 ) {
							final_options.mode = "SINGLE";
							final_options.single_id = second_commands[ 1 ].split( "watch?v=" )[ 1 ];
						}
						else if ( second_commands[ 1 ].indexOf( "playlist?list=" ) !== -1 ) {
							final_options.mode = "PLAYLIST_OFFICIAL";
							final_options.playlist_id = second_commands[ 1 ].split( "playlist?list=" )[ 1 ];
						}
						else if ( second_commands[ 1 ].indexOf( "youtu.be/" ) !== -1 ) {
							final_options.mode = "SINGLE";
							final_options.single_id = second_commands[ 1 ].split( "youtu.be/" )[ 1 ];
						}						
						else {
							if ( second_commands[ 1 ].length > 15 ) {
								final_options.mode = "PLAYLIST_OFFICIAL";
								final_options.playlist_id = second_commands[ 1 ];
							}
							else {
								final_options.mode = "SINGLE";
								final_options.single_id = second_commands[ 1 ];
							}
						}
						require( "./clientManager.js" ).pressButtonMaster( "17" , final_options );
						return;
					}
 
					const manager_path = "./YOUTUBE/" + second_commands[ 1 ] + ".js";

					if ( second_commands[ 2 ] ===  "follow" ) {

					}
					else if ( second_commands[ 2 ] ===  "unfollow" ) {

					}				
					else if ( second_commands[ 2 ] ===  "import" || second_commands[ 2 ] ===  "add" ) {

						if ( second_commands[ 1 ] === "currated" ) {
							if ( second_commands[ 3 ] ===  "playlist" ) {
								await require( manager_path ).importFromPlaylistID( second_commands[ 4 ] );
							}
							else {
								await require( manager_path ).addToQue( second_commands[ 4 ] );
							}
						}
						else if ( second_commands[ 1 ] === "relax" || second_commands[ 1 ] === "relaxing" ) {
							if ( second_commands[ 3 ] ===  "playlist" ) {
								await require( manager_path ).importFromPlaylistID( second_commands[ 4 ] );
							}
							else {
								await require( manager_path ).addToQue( second_commands[ 4 ] );
							}							
						}

					}
					else if ( second_commands[ 2 ] ===  "que" || second_commands[ 2 ] ===  "videos" ) {
						const que = await require( manager_path ).getQue();
						if ( que ) {
							if ( que.length > 0 ) {
								await POST_ID( "YouTube Standard Que: \n" + que.join( " , " ) , msg.channel.id );
							}
						}
					}					
					else if ( second_commands[ 2 ] ===  "info" ) {
						if ( second_commands[ 1 ] === "standard" ) {
							if ( second_commands[ 3 ] ) {
								const wVideo = await require( manager_path ).getVideoInfo( second_commands[ 3 ] )
								await POST_ID( "YouTube Video Info: [ " + second_commands[ 3 ] + " ]: \n" + 
									"\ttitle == " + wVideo[ "title" ] + "\n" +
									"\tpubdate == " + wVideo[ "pubdate" ] + "\n" +
									"\tcompleted == " + wVideo[ "completed" ] + "\n" +
									"\tskipped == " + wVideo[ "skipped" ] + "\n" +
									"\tcurrent_time == " + wVideo[ "current_time" ] + "\n" +
									"\tremaining_time == " + wVideo[ "remaining_time" ] + "\n" +
									"\tduration == " + wVideo[ "duration" ] + "\n"
								, msg.channel.id );
							}
						}
						//require( "./clientManager.js" ).pressButtonMaster( "17" , { mode: "SINGLE" , position: "FOREGROUND" , single_id: "" } );
					}
					else if ( second_commands[ 2 ] ===  "follower" ) {

					}
					else if ( second_commands[ 2 ] ===  "blacklist" ) {

					}

				}
			});

			// Buttons
			// ========================================================================================
			// ========================================================================================
				var buttonsCommand = discordBot.registerCommand( "button" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "3" );
					}
					return;
				}, {
					description: "Start Twitch State",
					fullDescription: "Start Twitch State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				buttonCommand.registerCommandAlias( "btn" , "button" );

				var stopCommand = discordBot.registerCommand( "stop" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "6" );
					}
					return;
				}, {
					description: "Stop",
					fullDescription: "Stop",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				stopCommand.registerCommandAlias( "quit" , "stop" );

				var pauseCommand = discordBot.registerCommand( "pause" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "7" );
					}
					return;
				}, {
					description: "Pause",
					fullDescription: "Pause",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				var previousCommand = discordBot.registerCommand( "previous" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "8" );
					}
					return;
				}, {
					description: "Previous",
					fullDescription: "Previous",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});	

				var nextCommand = discordBot.registerCommand( "next" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "9" );
					}
					return;
				}, {
					description: "Next",
					fullDescription: "Next",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});			

			// ========================================================================================
			// Buttons=================================================================================

			// Common State Names
			// ========================================================================================
			// ========================================================================================
				var relaxCommand = discordBot.registerCommand( "relax" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "16" );
					}
					return;
				}, {
					description: "Start Relaxing Youtube Videos",
					fullDescription: "Start Relaxing Youtube Videos",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				relaxCommand.registerCommandAlias( "relaxing" , "relax" );
			// ========================================================================================
			// Common State Names======================================================================

			
			// Youtube
			// ========================================================================================
			// ========================================================================================
			
			// ========================================================================================
			// Youtube=================================================================================

			// Twitch
			// ========================================================================================
			// ========================================================================================
				var twitchCommand = discordBot.registerCommand( "twitch" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./clientManager.js" ).pressButtonMaster( "3" );
					}
					return;
				}, {
					description: "Start Twitch State",
					fullDescription: "Start Twitch State",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "follow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( "./utils/twitchAPI_Utils.js" ).followUserName( args[ 0 ] );
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					return followers.join( " , " );
				}, {
					description: "Follow Twitch User",
					fullDescription: "Follow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "unfollow" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return "Invalid input";
					}
					await require( "./utils/twitchAPI_Utils.js" ).unfollowUserName( args[ 0 ] );
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					return followers.join( " , " );
				}, {
					description: "Follow Twitch User",
					fullDescription: "Follow Twitch User",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "live" , async ( msg , args ) => {
					const live_twitch = await require( "./utils/twitchAPI_Utils.js" ).getLiveUsers();
					return live_twitch.join( " , " );
				}, {
					description: "Get Live Twitch Followers",
					fullDescription: "Get Live Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});

				twitchCommand.registerSubcommand( "followers" , async ( msg , args ) => {
					const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
					return followers.join( " , " );
				}, {
					description: "Get Twitch Followers",
					fullDescription: "Get Twitch Followers",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});			
				twitchCommand.registerSubcommandAlias( "following" , "followers" );
			// ========================================================================================
			// Twitch==================================================================================	


			// Misc
			// ========================================================================================
			// ========================================================================================
				var helpCommand = discordBot.registerCommand( "help" , ( msg , args ) => {
					if( args.length === 0 ) {				
						return GetButtonInfo();
					}
				}, {
					description: "Run Command on OS" ,
					fullDescription: "Run Command on OS" ,
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				helpCommand.registerCommandAlias( "cmds" , "help" );
				helpCommand.registerCommandAlias( "commands" , "help" );

				var execCommand = discordBot.registerCommand( "exec" , async ( msg , args ) => {
					if( args.length === 0 ) {
						return;
					}
					const cmd = args.join(" ");
					const output = await require( "./utils/generic.js" ).osCommand( cmd );
					return output;
				}, {
					description: "Run Command on OS",
					fullDescription: "Run Command on OS",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				execCommand.registerCommandAlias( "run" , "exec" );
				execCommand.registerCommandAlias( "os" , "exec" );

				var timeCommand = discordBot.registerCommand( "time" , ( msg , args ) => {
					return require( "./utils/generic.js" ).time();
				}, {
				description: "Get Current Server Time",
					fullDescription: "Get Current Server Time",
					usage: "<text>"
				});

				var tvPowerCommand = discordBot.registerCommand( "tvpower" , ( msg , args ) => {
					if( args.length === 0 ) {
						require( "./utils/cecClientManager.js" ).activate();
					}
					return;
				}, {
					description: "Push TV Power Button",
					fullDescription: "Push TV Power Button",
					usage: "<text>" ,
					reactionButtonTimeout: 0
				});
				tvPowerCommand.registerCommandAlias( "tv" , "tvpower" );
			// ========================================================================================
			// Misc====================================================================================

			await discordBot.connect();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.intitialize = INITIALIZE;