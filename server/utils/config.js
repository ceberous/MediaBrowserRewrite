const RESETS =  [ "YOU_TUBE.LIVE.LATEST*" , "YOU_TUBE.STANDARD.LATEST*" ];

var SET_KEYS = {
	"CONFIG.ARRIVED_HOME": "false" ,
	
	"MOPIDY.STATE": "stopped" ,
	"STAGED_FF_TASK": "null" ,

	"STATUS.USB_BUTTONS": "OFFLINE" ,
	"STATUS.LOCAL_MEDIA": "OFFLINE" ,
	"STATUS.YT_LIVE": "OFFLINE" ,
	"STATUS.TY_STANDARD": "OFFLINE" ,
	"STATUS.TWITCH": "OFFLINE" ,
	"STATUS.SKYPE": "OFFLINE" ,
	"STATUS.MOPIDY": "OFFLINE" ,
};

function SAVE_CONFIG_TO_REDIS() {
	return new Promise( async function( resolve , reject ) {
		try {
			const redis = require( "./redisManager.js" ).redis;

			const YT = require( "../../config/youtube.json" );
			SET_KEYS[ "YOU_TUBE.LIVE.FOLLOWERS" ] = YT.LIVE.FOLLOWERS.map( x => x[ "id" ] );
			SET_KEYS[ "YOU_TUBE.LIVE.BLACKLIST" ] = YT.LIVE.BLACKLIST;
			SET_KEYS[ "YOU_TUBE.STANDARD.FOLLOWERS" ] = YT.LIVE.FOLLOWERS.map( x => x[ "id" ] );
			SET_KEYS[ "YOU_TUBE.STANDARD.BLACKLIST" ] = YT.STANDARD.BLACKLIST;
			const IST = require( "../../config/instagram.json" );
			SET_KEYS[ "INSTAGRAM.FOLLOWERS" ] = IST;

			const GEN = require( "../../config/generic.json" );
			SET_KEYS[ "CONFIG.MOINT_POINT" ] = JSON.stringify( GEN.MEDIA_MOUNT_POINT );

			const REDIS_CONFIG = require( "../../config/redis.json" );
			SET_KEYS[ "CONFIG.REDIS" ] = JSON.stringify( REDIS_CONFIG );

			const DISCORD_CALLES = require( "../../personal.js" ).discordCalles;
			SET_KEYS[ "DISCORD.CALLE1" ] = DISCORD_CALLES[ 0 ];
			SET_KEYS[ "DISCORD.CALLE2" ] = DISCORD_CALLES[ 1 ];

			if ( RESETS ) {
				await require( "./redis_Utils.js").deleteMultiplePatterns( redis , RESETS );
			}
			if ( SET_KEYS ) {
				var wMulti = [];
				for ( var wKey in SET_KEYS ) {
					if ( Array.isArray( SET_KEYS[ wKey ] ) ) {
						for ( var i = 0; i < SET_KEYS[ wKey ].length; ++i ) {
							wMulti.push( [ "sadd" , wKey , SET_KEYS[ wKey ][ i ] ] );
						}
					}
					else {
						wMulti.push( [ "set" , wKey , SET_KEYS[ wKey ] ] );
					}
				}
				console.log( wMulti );
				await require( "./redis_Utils.js" ).setMulti( redis , wMulti );
			}

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.saveConfigToRedis = SAVE_CONFIG_TO_REDIS;