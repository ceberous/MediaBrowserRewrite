require("shelljs/global");
const path = require("path");
const notifier = require( "mail-notifier" );

const redis = require( "../main.js" ).redis;
const RU = require( "./utils/redis_Utils.js" );

const wEmailCREDS = require( "../personal.js" ).emailServer;
//const wNotifyTwitchManViewerIsLive = require( "./twitchManager.js" ).followerIsNowLiveEmailUpdate;

const wPYSEmailScriptPath = path.join( __dirname , "py_scripts" , "sendEmail.py" );
function wSendEmail( wMessageText , wSubject , wToEmailAddress ) {
  return new Promise( async function( resolve , reject ) {
    try {
      wSubject = wSubject || "MediaManager: Button Press";
      wToEmailAddress = wToEmailAddress || wEmailCREDS.defaultSendAddress;
      var wFS = "python " + wPYSEmailScriptPath + " " +  wEmailCREDS.listenEmail + " " + 
      wEmailCREDS.listenEmailPass + " " + wToEmailAddress + " " + wSubject + " " + wMessageText;
      console.log( wFS );
      var wR = exec( wFS , { silent:true , async: false } );
      if ( wR.stderr.length > 1 ) { reject(); }
    	console.log( "sent email" );
      resolve( wR.stdout.trim() );
    }
    catch( error ) { console.log( error ); reject( error ); }
  });
}

const imap = {
  user: wEmailCREDS.listenEmail ,
  password: wEmailCREDS.listenEmailPass ,
  host: wEmailCREDS.listenEmailIMAP ,
  port: 993 ,
  tls: true ,
  tlsOptions: { rejectUnauthorized: false }
};
const wEmailNotifier = notifier( imap );

const R_TWITCH_LIVE_USERS = "TWITCH.LIVE_FOLLOWERS";
function updateLiveFollowers( wFollower ) {
  return new Promise( async function( resolve , reject ) {
    try {
    var current_live = await require( "./utils/twitchAPI_Utils.js" ).updateLiveUsers();
    console.log( "Current Live Twitch Users = " );
    console.log( current_live );
    resolve();
    }
    catch( error ) { console.log( error ); reject( error ); }
  });
}

async function parseTwitch( wMail ) {
    var wSubject = wMail.subject
    console.log( wSubject );
    var xx = wSubject.split( " " );
    var x1 = xx.shift();
    if ( xx[0] === "just" && xx[1] === "went" && xx[2] === "live" ) {
      //wNotifyTwitchManViewerIsLive( x1 );
      await updateLiveFollowers( x1 );
    }
}

function parseEmail( wMail ) {
    var wFA = wMail.from[0].address;
    switch( wFA ) {
        case "no-reply@twitch.tv":
            parseTwitch( wMail );
            break;
        default:
            //console.log("unknown email , skipping");
            break;
    }
}

( async ()=> {
  await wEmailNotifier.start();
  console.log("Email Server-Client Connected");
  wEmailNotifier.on( "end" , () => wEmailNotifier.start() );
  wEmailNotifier.on( "mail" , ( mail ) => parseEmail( mail ) )
})();

module.exports.sendEmail = wSendEmail;
