

function REDIS_GET_KEYS_FROM_PATTERN( rInstance , wPattern ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.keys( wPattern , function( err , keys ) { resolve( keys ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_SET_LIST_FROM_ARRAY( rInstance , wKey , wArray ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.rpush.apply( rInstance , [ wKey ].concat( wArray ).concat( function( err , keys ){ resolve( keys ); })); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_SET_SET_FROM_ARRAY( rInstance , wKey , wArray ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.sadd.apply( rInstance , [ wKey ].concat( wArray ).concat( function( err , keys ){ resolve( keys ); })); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
// This Needs ReWritten. It fails when a large **unknown actual amount** ok keys need deleted
// Possibly limit to 10-20 at a time
function REDIS_DEL_KEYS( rInstance , wKeys ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.del.apply( rInstance , wKeys , function( err , results ){ if ( err ) { console.log( err ); } else { console.log( results ) } });  }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_DELETE_KEY( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.del( wKey , function( err , keys ) { resolve( keys ); }); }
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
function REDIS_SET_KEY( rInstance , wKey , wVal ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.set( wKey , wVal , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_MULTI( rInstance , wArgs ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.multi( wArgs ).exec( function( err , results ) { console.log( err ); resolve( results ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_LIST_LENGTH( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.llen( wKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_FULL_LIST( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.lrange( wKey , 0 , -1 , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_FULL_SET( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.smembers( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}


module.exports.getKeysFromPattern = REDIS_GET_KEYS_FROM_PATTERN;
module.exports.delKeys = REDIS_DEL_KEYS;
module.exports.getKey = REDIS_GET_KEY;
module.exports.delKey = REDIS_DELETE_KEY;
module.exports.getListLength = REDIS_GET_LIST_LENGTH;
module.exports.getFromSetByIndex = REDIS_GET_FROM_SET_BY_INDEX;
module.exports.getMultiKeys= REDIS_GET_MULTI_KEY;
module.exports.getFullList= REDIS_GET_FULL_LIST;
module.exports.getFullSet= REDIS_GET_FULL_SET;
module.exports.setKey= REDIS_SET_KEY;
module.exports.setMulti= REDIS_SET_MULTI;
module.exports.setListFromArray= REDIS_SET_LIST_FROM_ARRAY;
module.exports.setSetFromArray= REDIS_SET_SET_FROM_ARRAY;