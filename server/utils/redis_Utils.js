const { map } = require( "p-iteration" );

function REDIS_GET_KEYS_FROM_PATTERN( rInstance , wPattern ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.keys( wPattern , function( err , keys ) { resolve( keys ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_SET_LIST_FROM_ARRAY_BEGINNING( rInstance , wKey , wArray ) {
	console.log( "Here in set to beginnign list" );
	return new Promise( function( resolve , reject ) {
		try { rInstance.lpush.apply( rInstance , [ wKey ].concat( wArray ).concat( function( err , keys ){ resolve( keys ); })); }
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
		try { rInstance.del.apply( rInstance , wKeys , function( err , results ){ if ( err ) { console.log( err ); } else { console.log( results ); resolve(); } });  }
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
		catch( error ) { console.log( error ); resolve( "null" ); }
	});
}
function REDIS_GET_KEY_DE_JSON( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.get( wKey , function( err , key ) {
			try { key = JSON.parse( key ); }
			catch( err ) {}
			resolve( key ); });
		}
		catch( error ) { console.log( error ); resolve( "null" ); }
	});
}
function REDIS_GET_FROM_LIST_BY_INDEX( rInstance , wKey , wIndex ) {
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
		catch( error ) { console.log( error ); resolve( "error" ); }
	});
}
function REDIS_SET_IF_NOT_EXISTS_KEY( rInstance , wKey , wVal ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.set( wKey , wVal , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); resolve( "error" ); }
	});
}
function REDIS_SET_HASH_MULTI( rInstance , ...args ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.hmset( ...args , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_MULTI( rInstance , wArgs ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.multi( wArgs ).exec( function( err , results ) { console.log( err ); resolve( results ); }); }
		catch( error ) { console.log( error ); resolve( "error" ); }
	});
}
function REDIS_POP_RANDOM_FROM_SET( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.spop( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_REMOVE_MATCHING_FROM_SET( rInstance , wSetKey , wMatchKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.srem( wSetKey , wMatchKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_TRIM_LIST( rInstance , wKey , wStart , wEnd ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.ltrim( wKey , wStart , wEnd , function( err , key ) { resolve( key ); }); }
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
		catch( error ) { console.log( error ); resolve( "list probably doesn't even exist" ); }
	});
}
function REDIS_GET_FULL_SET( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.smembers( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_RANDOM_SET_MEMBERS( rInstance , wKey , wNumber ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.srandmember( wKey , wNumber , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_POP_RANDOM_SET_MEMBERS( rInstance , wKey , wNumber ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.spop( wKey , wNumber , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_INCREMENT_INTEGER( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.incr( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_LIST_R_POP( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.rpop( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_DECREMENT_INTEGER( rInstance , wKey ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.decr( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_DIFFERENCE_STORE( rInstance , wStoreKey , wSetKey , wCompareSetKey  ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.sdiffstore( wStoreKey , wSetKey , wCompareSetKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_STORE_UNION( rInstance , wStoreKey , wSetKey1 , wSetKey2  ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.sdiffstore( wStoreKey , wSetKey1 , wSetKey2 , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SELECT_DATABASE( rInstance , wNumber ) {
	return new Promise( function( resolve , reject ) {
		try { rInstance.select( wNumber , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_DELETE_MULTIPLE_PATTERNS( rInstance , wKeyPatterns ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var del_keys = await map( wKeyPatterns , wPattern => REDIS_GET_KEYS_FROM_PATTERN( rInstance , wPattern ) );
			del_keys = [].concat.apply( [] , del_keys );
			console.log( "\ndeleteing these keys --> \n" );
			console.log( del_keys );
			
			if ( del_keys ) {
				if ( del_keys.length > 0 ) {
					del_keys = del_keys.map( x => [ "del" , x  ] );
					await REDIS_SET_MULTI( rInstance , del_keys );
				}
			}

			console.log( "done CLEANSING all R_KEYS" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_KEY_EXISTS( rInstance , wKey ) {
	return new Promise( async function( resolve , reject ) {
		try {
			rInstance.exists( wKey , function( err , answer ) {
				var wFinal = false;
				if ( answer === 1 || answer === "1" ) { wFinal = true; }
				resolve( wFinal );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.exists = REDIS_KEY_EXISTS;
module.exports.getKeysFromPattern = REDIS_GET_KEYS_FROM_PATTERN;
module.exports.delKeys = REDIS_DEL_KEYS;
module.exports.getKey = REDIS_GET_KEY;
module.exports.getKeyDeJSON = REDIS_GET_KEY_DE_JSON;
module.exports.delKey = REDIS_DELETE_KEY;
module.exports.trimList = REDIS_TRIM_LIST;
module.exports.getListLength = REDIS_GET_LIST_LENGTH;
module.exports.getFromListByIndex = REDIS_GET_FROM_LIST_BY_INDEX;
module.exports.removeMatchingFromSet = REDIS_REMOVE_MATCHING_FROM_SET;
module.exports.getMultiKeys = REDIS_GET_MULTI_KEY;
module.exports.getFullList = REDIS_GET_FULL_LIST;
module.exports.getFullSet = REDIS_GET_FULL_SET;
module.exports.getRandomSetMembers = REDIS_GET_RANDOM_SET_MEMBERS;
module.exports.popRandomSetMembers = REDIS_POP_RANDOM_SET_MEMBERS;
module.exports.setKey= REDIS_SET_KEY;
module.exports.setKeyIfNotExists = REDIS_SET_IF_NOT_EXISTS_KEY;
module.exports.setMulti = REDIS_SET_MULTI;
module.exports.setListFromArray = REDIS_SET_LIST_FROM_ARRAY;
module.exports.setListFromArrayBeginning = REDIS_SET_LIST_FROM_ARRAY_BEGINNING;
module.exports.setSetFromArray = REDIS_SET_SET_FROM_ARRAY;
module.exports.setHashMulti = REDIS_SET_HASH_MULTI;
module.exports.popRandomFromSet = REDIS_POP_RANDOM_FROM_SET;
module.exports.listRPOP = REDIS_LIST_R_POP;
module.exports.incrementInteger = REDIS_INCREMENT_INTEGER;
module.exports.decrementInteger = REDIS_DECREMENT_INTEGER;
module.exports.deleteMultiplePatterns = REDIS_DELETE_MULTIPLE_PATTERNS;
module.exports.setDifferenceStore = REDIS_SET_DIFFERENCE_STORE;
module.exports.setStoreUnion = REDIS_SET_STORE_UNION;


module.exports.selectDatabase = REDIS_SELECT_DATABASE;