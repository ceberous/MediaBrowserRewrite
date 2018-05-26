

function FILTER_GLOBAL_BLACKLIST_AND_WATCHED_AND_SKIPPED( wNewIDS ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const redis = require( "../utils/redisManager.js" ).redis;
			const RU = require( "../utils/redis_Utils.js" );
			const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE;

			const temp_skipped_key = "TMP_KEY.SKIPPED." + Math.random().toString(36).substring(7);
			const temp_blacklist_key = "TMP_KEY.BLACKLIST." + Math.random().toString(36).substring(7);
			const temp_watched_key = "TMP_KEY.WATCHED." + Math.random().toString(36).substring(7);

			// ( rInstance , wDestinationKey , wFilterSetKey , wArray )
			var final_ids = await RU.setSetFromArrayWithSetFilter( redis , temp_skipped_key , RC.SKIPPED , wNewIDS );
			if ( final_ids ) {
				if ( final_ids.length > 0 ) {
					final_ids = await RU.setSetFromArrayWithSetFilter( redis , temp_blacklist_key , RC.GLOBAL_BLACK_LIST , final_ids );
					if ( final_ids ) {
						if ( final_ids.length > 0 ) {
							final_ids = await RU.setSetFromArrayWithSetFilter( redis , temp_watched_key , RC.WATCHED , final_ids );
						}
					}
				}
			}
			await RU.delKey( redis , temp_skipped_key );
			await RU.delKey( redis , temp_watched_key );
			await RU.delKey( redis , temp_blacklist_key );
			resolve( final_ids );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.filterCommon = FILTER_GLOBAL_BLACKLIST_AND_WATCHED_AND_SKIPPED;