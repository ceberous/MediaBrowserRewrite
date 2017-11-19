// Apparently as of Today , 18NOV2017 , the old skype version I am using
// completely no longer works. 
// Somehow this --> https://github.com/tomorgan/SkypeWebSDKSamples/blob/gh-pages/AV/5-MakingVideoCalls/index.htm
// http://code.skypewebsdk.com/
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/objectmodel
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/gettingstarted#sectionSection2
// https://msdn.microsoft.com/Skype/WebSDK/docs/GettingStarted
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/skypewebsdk
// https://msdn.microsoft.com/en-gb/skype/websdk/docs/getapientrysignin
// https://github.com/OfficeDev/skype-docs
// https://www.thoughtstuff.co.uk/skype-web-sdk
// https://github.com/OfficeDev/skype-web-sdk-samples
// or this --> https://vsee.com/
// or this --> https://tokbox.com/
// or this --> http://peerjs.com/
// or this --> https://gist.github.com/kalkov/1744211
// or this --> https://media.twiliocdn.com/sdk/js/video/releases/1.6.0/docs/
// https://www.twilio.com/docs/api/video/javascript-v1-getting-started
// or this --> https://trueconf.com/downloads/linux.html

// or this --> https://webrtchacks.com/whats-in-a-webrtc-javascript-library/
// https://docs.google.com/document/d/1idl_NYQhllFEFqkGQOLv8KBK8M3EVzyvxnKkHl4SuM8/edit#

const wSkypeNames = require("../../personal.js").skypeNames;
function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var name = wSkypeNames[ wOptions.personal_number ];
			await require( "../skypeManager.js" ).startCall( name );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( function( resolve , reject ) {
		try {
			require( "../skypeManager.js" ).endCall();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.stop = wStop;