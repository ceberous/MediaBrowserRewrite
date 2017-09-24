var wRebootRouter = require('../../utils/rebootRouter.js');

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.rebootRouter = function( req , res ) { 
	wRebootRouter(); 
	sendJSONResponse( res , 200 , { message: "Rebooted Router" } ); 
};