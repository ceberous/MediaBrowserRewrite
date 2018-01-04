const REDIS = require("redis");
function LOAD_REDIS() {
	return new Promise( async function( resolve , reject ) {
		try {
			const R_INIT_CONFIG = require( "../../config.js" ).REDIS;
			redis = await REDIS.createClient({ 
				host: R_INIT_CONFIG[ "HOST" ] ,
				port: R_INIT_CONFIG[ "PORT" ] ,
				db: R_INIT_CONFIG[ "DATABASE_NUM" ] ,
				retry_strategy: function ( options ) {
			        if ( options.error && options.error.code === "ECONNREFUSED" ) {
			            // End reconnecting on a specific error and flush all commands with
			            // a individual error
			            return new Error( "The server refused the connection" );
			        }
			        if ( options.total_retry_time > 1000 * 60 * 60 ) {
			            // End reconnecting after a specific timeout and flush all commands
			            // with a individual error
			            return new Error( "Retry time exhausted" );
			        }
			        if ( options.attempt > 20 ) {
			            // End reconnecting with built in error
			            return undefined;
			        }
			        // reconnect after
			        return Math.min( options.attempt * 100 , 3000 );
			    }
			});
			await require( "./generic.js" ).wSleep( 1000 );
			if ( R_INIT_CONFIG.RESETS ) {
				await require( "./redis_Utils.js").deleteMultiplePatterns( redis , R_INIT_CONFIG.RESETS );
			}
			if ( R_INIT_CONFIG.SET_KEYS ) {
				var wMulti = [];
				for ( var wKey in R_INIT_CONFIG.SET_KEYS ) {
					if ( Array.isArray( R_INIT_CONFIG.SET_KEYS[ wKey ] ) ) {
						for ( var i = 0; i < R_INIT_CONFIG.SET_KEYS[ wKey ].length; ++i ) {
							wMulti.push( [ "sadd" , wKey , R_INIT_CONFIG.SET_KEYS[ wKey ][ i ] ] );
						}
					}
					else {
						wMulti.push( [ "set" , wKey , R_INIT_CONFIG.SET_KEYS[ wKey ] ] );
					}
				}
				console.log( wMulti );
				await RU.setMulti( redis , wMulti );
			}

			module.exports.redis = redis;
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.loadRedis = LOAD_REDIS;