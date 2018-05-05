process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});

( async ()=> {
	
	await require( "./server/utils/redisManager.js" ).loadRedis();
	const redis = require( "./server/utils/redisManager.js" ).redis;
	const RU = require( "./server/utils/redis_Utils.js" );
	const RC = require( "./server/CONSTANTS/redis.js" ).YOU_TUBE;

	var next_video = await RU.nextInCircleList( redis , RC.CURRATED.LIST );
	console.log( next_video );

})();