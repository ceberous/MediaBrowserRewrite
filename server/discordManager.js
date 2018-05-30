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

function PostButtons( wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wChannelID = wChannelID || discordCreds.channels.log;
			try { delete require.cache[ "../config/buttons.json" ]; }
			catch ( e ) {}
			var state_names = require( "../config/buttons.json" );
			var replay_string = "";
			for ( var state in state_names ) {
				replay_string = replay_string + "!btn " + state + " === " + state_names[ state ][ "name" ] + "\n";
			}
			//console.log( replay_string );
			await discordBot.createMessage( wChannelID , replay_string );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			discordCreds = require( "../personal.js" ).discord;
			discordBot = new Eris( discordCreds.token );

			discordBot.on( "messageCreate" , async ( msg ) => {
				
				if ( msg[ "author" ][ "id" ] === discordCreds.bot_id ) { return; }
				// Restrict to Only now_playing channel
				//if ( msg.channel.id !== discordCreds.channels.now_playing ) { return; }

				if ( msg.content.startsWith( "!help" ) || msg.content.startsWith( "!cmds" ) || msg.content.startsWith( "!commands" ) ) {
					PostButtons( msg.channel.id );
				}
				else if ( msg.content.startsWith( "!btn" ) || msg.content.startsWith( "!btns" ) || msg.content.startsWith( "!button" ) ) {
					var num = msg.content.split( " " )[ 1 ];
					require( "./clientManager.js" ).pressButtonMaster( num );
				}
				else if ( msg.content.startsWith( "!next" ) ) {
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
				else if ( msg.content.startsWith( "!relax" ) ) {
					// Start Relaxing Youtube Playlists or something
					require( "./clientManager.js" ).pressButtonMaster( "16" );
				}
				else if ( msg.content.startsWith( "!od" ) ) {
					require( "./clientManager.js" ).pressButtonMaster( "11" );
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

					else if ( msg.content.includes( "twitch" ) ) {
						if ( msg.content.includes( "live" ) ) {
							require( "./clientManager.js" ).pressButtonMaster( "3" );
						}
						// else if ( msg.content.includes( "vod" ) ) {
						// 	require( "./clientManager.js" ).pressButtonMaster( "" );
						// }
						else { await require( "./clientManager.js" ).pressButtonMaster( "3" ); return; }
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

						if ( second_commands[ 3 ] ===  "playlist" ) {

						}
						else {

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
				else if ( msg.content.startsWith( "!twitch" ) ) {
					var second_commands = msg.content.split( " " );
					if ( !second_commands )  { return; }
					if ( second_commands.length < 2 ) { return; }

					console.log( second_commands );
					if ( second_commands[ 1 ] ===  "followers" ) {
						const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
						await POST_ID( "Following: \n" + followers.join( " , " ) , msg.channel.id );
					}
					else if ( second_commands[ 1 ] ===  "follow" ) {
						if ( second_commands[ 2 ] ) { await require( "./utils/twitchAPI_Utils.js" ).followUserName( second_commands[ 2 ] ); }
						const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
						await POST_ID( "Following: \n" + followers.join( " , " ) , msg.channel.id );
					}
					else if ( second_commands[ 1 ] ===  "unfollow" ) {
						if ( second_commands[ 2 ] ) { await require( "./utils/twitchAPI_Utils.js" ).unfollowUserName( second_commands[ 2 ] ); }
						const followers = await require( "./utils/twitchAPI_Utils.js" ).getFollowers();
						await POST_ID( "Following: \n" + followers.join( " , " ) , msg.channel.id );						
					}
					else if ( second_commands[ 1 ] ===  "live" ) {
						const live_twitch = await require( "./utils/twitchAPI_Utils.js" ).getLiveUsers();
						await POST_ID( "Live Twitch Users == \n" + live_twitch.join( " , " ) , msg.channel.id );
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