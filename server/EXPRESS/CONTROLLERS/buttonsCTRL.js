var wPressButtonMaster = require('../../clientManager.js').pressButtonMaster;

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.press1 = function( req , res ) { wPressButtonMaster( 1 ); sendJSONResponse( res , 200 , { buttonPress: "Play Youtube.Live Background Video with A 'Classic' Style Mopidy Playlist" } ); };
module.exports.press2 = function( req , res ) { wPressButtonMaster( 2 ); sendJSONResponse( res , 200 , { buttonPress: "Play Youtube.Live Background Video with A 'EDM/House' Style Mopidy Playlist" } ); };
module.exports.press3 = function( req , res ) { wPressButtonMaster( 3 ); sendJSONResponse( res , 200 , { buttonPress: "if ( Twitch-Follower.isLive ) { Play Next Twitch.Live } else { Play Next 'Feed' Video from Youtube/Twitch Followers }" } ); };
module.exports.press4 = function( req , res ) { wPressButtonMaster( 4 ); sendJSONResponse( res , 200 , { buttonPress: "Skype - 'ONE'" } ); };
module.exports.press5 = function( req , res ) { wPressButtonMaster( 5 ); sendJSONResponse( res , 200 , { buttonPress: "Skype - 'TWO'" } ); };
module.exports.press6 = function( req , res ) { wPressButtonMaster( 6 ); sendJSONResponse( res , 200 , { buttonPress: "Stop" } ); };
module.exports.press7 = function( req , res ) { wPressButtonMaster( 7 ); sendJSONResponse( res , 200 , { buttonPress: "Pause" } ); };
module.exports.press8 = function( req , res ) { wPressButtonMaster( 8 ); sendJSONResponse( res , 200 , { buttonPress: "Previous" } ); };
module.exports.press9 = function( req , res ) { wPressButtonMaster( 9 ); sendJSONResponse( res , 200 , { buttonPress: "Next" } ); };
module.exports.press10 = function( req , res ) { wPressButtonMaster( 10 ); sendJSONResponse( res , 200 , { buttonPress: "Play Next Movie" } ); };
module.exports.press11 = function( req , res ) { wPressButtonMaster( 11 ); sendJSONResponse( res , 200 , { buttonPress: "Play Next Odyssey" } ); };
module.exports.press12 = function( req , res ) { wPressButtonMaster( 12 ); sendJSONResponse( res , 200 , { buttonPress: "Play Next TV Show" } ); };