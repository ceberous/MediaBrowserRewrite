

function REDIS_GET_KEYS_FROM_PATTERN( rInstance , wPattern ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.keys( wPattern , function( err , keys ) { resolve( keys ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_DEL_KEYS( rInstance , wKeys ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.del.apply( rInstance , wKeys , function( err , results ){ if ( err ) { console.log( err ); } else { console.log( results ) } });  }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_KEY( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.get( wKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_FROM_SET_BY_INDEX( rInstance , wKey , wIndex ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.lindex( wKey , wIndex , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_GET_MULTI_KEY( rInstance , ...args ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.mget( ...args , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_MULTI( rInstance , wArgs ) {
	console.log( wArgs );
	return new Promise( function( resolve , reject ) {
		try { rInstance.multi( wArgs ).exec( function( err , results ) { console.log( err ); resolve( results ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.getKeysFromPattern = REDIS_GET_KEYS_FROM_PATTERN;
module.exports.delKeys = REDIS_DEL_KEYS;
module.exports.getKey = REDIS_GET_KEY;
module.exports.getFromSetByIndex = REDIS_GET_FROM_SET_BY_INDEX;
module.exports.getMultiKeys= REDIS_GET_MULTI_KEY;
module.exports.setMulti= REDIS_SET_MULTI;




// function REDIS_GET_KEYS_FROM_PATTERN( wPattern ) {
// 	return new Promise( function( resolve , reject ) {
// 		try { redis.keys( wPattern , function( err , keys ) { resolve( keys ); }); }
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }
// function REDIS_DEL_KEYS( wKeys ) {
// 	return new Promise( function( resolve , reject ) {
// 		try { redis.del.apply( redis , wKeys , function( err , results ){ if ( err ) { console.log( err ); } else { console.log( results ) } });  }
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }
// function REDIS_GET_KEY( wKey ) {
// 	return new Promise( function( resolve , reject ) {
// 		try { redis.get( wKey , function( err , key ) { resolve( key ); }); }
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }
// function REDIS_GET_FROM_SET_BY_INDEX( wKey , wIndex ) {
// 	return new Promise( function( resolve , reject ) {
// 		try { redis.lindex( wKey , wIndex , function( err , key ) { resolve( key ); }); }
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

// function REDIS_GET_MULTI_KEY( ...args ) {
// 	return new Promise( function( resolve , reject ) {
// 		try { redis.mget( ...args , function( err , values ) { resolve( values ); }); }
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

// function REDIS_SET_MULTI( wArgs ) {
// 	console.log( wArgs );
// 	return new Promise( function( resolve , reject ) {
// 		try { redis.multi( wArgs ).exec( function( err , results ) { console.log( err ); resolve( results ); }); }
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }