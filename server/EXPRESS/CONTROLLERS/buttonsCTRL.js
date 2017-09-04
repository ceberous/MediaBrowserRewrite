var wEmitter = require('../../../main.js').wEmitter;

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

module.exports.press1 = function( req , res ) { wEmitter.emit("button1Press"); sendJSONResponse( res , 200 , { buttonPress: "Play Youtube.Live Background Video with A 'Classic' Style Mopidy Playlist" } ); };
module.exports.press2 = function( req , res ) { wEmitter.emit("button2Press"); sendJSONResponse( res , 200 , { buttonPress: "Play Youtube.Live Background Video with A 'EDM/House' Style Mopidy Playlist" } ); };
module.exports.press3 = function( req , res ) { wEmitter.emit("button3Press"); sendJSONResponse( res , 200 , { buttonPress: "if ( Twitch-Follower.isLive ) { Play Next Twitch.Live } else { Play Next 'Feed' Video from Youtube/Twitch Followers }" } ); };
module.exports.press4 = function( req , res ) { wEmitter.emit("button4Press"); sendJSONResponse( res , 200 , { buttonPress: "Skype - 'cameron'" } ); };
module.exports.press5 = function( req , res ) { wEmitter.emit("button5Press"); sendJSONResponse( res , 200 , { buttonPress: "Skype - '*******'" } ); };
module.exports.press6 = function( req , res ) { wEmitter.emit("button6Press"); sendJSONResponse( res , 200 , { buttonPress: "Stop" } ); };
module.exports.press7 = function( req , res ) { wEmitter.emit("button7Press"); sendJSONResponse( res , 200 , { buttonPress: "Pause" } ); };
module.exports.press8 = function( req , res ) { wEmitter.emit("button8Press"); sendJSONResponse( res , 200 , { buttonPress: "Previous" } ); };
module.exports.press9 = function( req , res ) { wEmitter.emit("button9Press"); sendJSONResponse( res , 200 , { buttonPress: "Next" } ); };
module.exports.press10 = function( req , res ) { wEmitter.emit("butto10Press"); sendJSONResponse( res , 200 , { buttonPress: "Play Next Movie" } ); };
module.exports.press11 = function( req , res ) { wEmitter.emit("button11Press"); sendJSONResponse( res , 200 , { buttonPress: "Play Next Odyssey" } ); };
module.exports.press12 = function( req , res ) { wEmitter.emit("button12Press"); sendJSONResponse( res , 200 , { buttonPress: "Play Next TV Show" } ); };