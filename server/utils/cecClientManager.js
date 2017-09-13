require('shelljs/global');
module.exports.activate =  function() {
	exec( "echo 'on 0' | cec-client -s -d 1" , { silent:true , async: false } );
	setTimeout( function() {
		exec( "echo 'as' | cec-client -s -d 1" , { silent:true , async: false } );
	} , 2000 );
	setTimeout( function() {
		exec( "echo 'as' | cec-client -s -d 1" , { silent:true , async: false } );
	} , 5000 );	
};