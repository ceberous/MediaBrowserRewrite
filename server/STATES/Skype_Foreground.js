// Apparently as of Today , 18NOV2017 , the old skype version I am using
// completely no longer works. 
// Somehow this --> https://github.com/tomorgan/SkypeWebSDKSamples/blob/gh-pages/AV/5-MakingVideoCalls/index.htm
// https://www.pcmag.com/article2/0,2817,2388678,00.asp
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
// or this --> https://chime.aws/
// or this --> http://www.rhubcom.com/v5/web-conferencing.html

// or this --> https://webrtchacks.com/whats-in-a-webrtc-javascript-library/
// https://docs.google.com/document/d/1idl_NYQhllFEFqkGQOLv8KBK8M3EVzyvxnKkHl4SuM8/edit#

// or this --> http://doc-kurento.readthedocs.io/en/stable/tutorials/node/tutorial-helloworld.html

// or this --> https://vidyo.io/
// https://www.vidyo.com/video-conference-systems/desktop-video-calling/vidyoconnect-pricing
// https://developer.vidyo.io/login-widget
// https://developer.vidyo.io/api-reference/4-1-17-5
// https://developer.vidyo.io/documentation/4-1-17-5/getting-started
// https://vidyo.io/how-to-videos/


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