var wEmitter = require('../../../main.js').wEmitter;

function sendJSONResponse( res , status , content ) {
    if ( status ) { res.status( status ); }
    res.json( content );
}

module.exports.press1 = function( req , res ) { wEmitter.emit("button1Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press2 = function( req , res ) { wEmitter.emit("button2Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press3 = function( req , res ) { wEmitter.emit("button3Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press4 = function( req , res ) { wEmitter.emit("button4Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press5 = function( req , res ) { wEmitter.emit("button5Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press6 = function( req , res ) { wEmitter.emit("button6Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press7 = function( req , res ) { wEmitter.emit("button7Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press8 = function( req , res ) { wEmitter.emit("button8Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press9 = function( req , res ) { wEmitter.emit("button9Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press10 = function( req , res ) { wEmitter.emit("butto10Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press11 = function( req , res ) { wEmitter.emit("button11Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };
module.exports.press12 = function( req , res ) { wEmitter.emit("button12Press"); sendJSONResponse( res , 200 , { buttonPress: "success" } ); };