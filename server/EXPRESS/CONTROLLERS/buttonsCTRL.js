var wPressButtonMaster = require('../../clientManager.js').pressButtonMaster;

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.press0 = function( req , res ) { wPressButtonMaster( 0 ); sendJSONResponse( res , 200 , { buttonPress: "Play Youtube.Live Background Video" } ); };
module.exports.press1 = function( req , res ) { wPressButtonMaster( 1 ); sendJSONResponse( res , 200 , { buttonPress: "Play Youtube.Live Background Video with A 'Classic' Style Mopidy Playlist" } ); };
module.exports.press2 = function( req , res ) { wPressButtonMaster( 2 ); sendJSONResponse( res , 200 , { buttonPress: "Play Youtube.Live Background Video with A 'EDM/House' Style Mopidy Playlist" } ); };
module.exports.press3 = function( req , res ) { wPressButtonMaster( 3 ); sendJSONResponse( res , 200 , { buttonPress: "if ( Twitch-Follower.isLive ) { Play Next Twitch.Live } else { Play Next 'Feed' Video from Youtube/Twitch Followers }" } ); };
module.exports.press4 = function( req , res ) { wPressButtonMaster( 4 ); sendJSONResponse( res , 200 , { buttonPress: "PeerCall - 'ONE'" } ); };
module.exports.press5 = function( req , res ) { wPressButtonMaster( 5 ); sendJSONResponse( res , 200 , { buttonPress: "PeerCall - 'TWO'" } ); };
module.exports.press6 = function( req , res ) { wPressButtonMaster( 6 ); sendJSONResponse( res , 200 , { buttonPress: "Stop" } ); };
module.exports.press7 = function( req , res ) { wPressButtonMaster( 7 ); sendJSONResponse( res , 200 , { buttonPress: "Pause" } ); };
module.exports.press8 = function( req , res ) { wPressButtonMaster( 8 ); sendJSONResponse( res , 200 , { buttonPress: "Previous" } ); };
module.exports.press9 = function( req , res ) { wPressButtonMaster( 9 ); sendJSONResponse( res , 200 , { buttonPress: "Next" } ); };
module.exports.press10 = function( req , res ) { wPressButtonMaster( 10 ); sendJSONResponse( res , 200 , { buttonPress: "Play Next Movie" } ); };
module.exports.press11 = function( req , res ) { wPressButtonMaster( 11 ); sendJSONResponse( res , 200 , { buttonPress: "Play Next Odyssey" } ); };
module.exports.press12 = function( req , res ) { wPressButtonMaster( 12 ); sendJSONResponse( res , 200 , { buttonPress: "Play Next TV Show" } ); };
module.exports.press13 = function( req , res ) { wPressButtonMaster( 13 ); sendJSONResponse( res , 200 , { buttonPress: "YT_STD_Currated_THEN_Odyssey_And_YT_Live" } ); };
module.exports.press14 = function( req , res ) { wPressButtonMaster( 14 ); sendJSONResponse( res , 200 , { buttonPress: "YT_Standard_Foreground" } ); };
module.exports.press15 = function( req , res ) { wPressButtonMaster( 15 ); sendJSONResponse( res , 200 , { buttonPress: "Instagram_Background" } ); };
module.exports.press16 = function( req , res ) { wPressButtonMaster( 16 ); sendJSONResponse( res , 200 , { buttonPress: "PeerCall Recieved Call" } ); };