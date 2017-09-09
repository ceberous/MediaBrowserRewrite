const notifier = require( "mail-notifier" );
const sendEmail = require( "emailjs/email" );

const wEmailCREDS = require( "../personal.js" ).emailServer;
const wNotifyTwitchManViewerIsLive = require( "./twitchManager.js" ).followerIsNowLive;

var sendEmailServer = null;
function wConnectSendEmailServer() {
  return new Promise( async function( resolve , reject ) {
    try {
      sendEmailServer = await sendEmail.server.connect({
        user:     wEmailCREDS.listenEmail , 
        password: wEmailCREDS.listenEmailPass , 
        host:     wEmailCREDS.listenEmailSMTP , 
        ssl:      true
      });
      console.log( "Connected to SMTP !!!" );
      resolve();
    }
    catch( error ) { console.log( error ); reject( error ); }
  });
}
function wSendEmail( wToEmailAddress , wMessageText , wSubject ) {
  return new Promise( async function( resolve , reject ) {
    try {
      wSubject = wSubject || "ALERT FROM: MediaBrowserServer !";
      sendEmailServer.send({
        text: wMessageText , from: wEmailCREDS.listenEmail , 
        to: wToEmailAddress , subject: wSubject
      } , function( err , message ) {
        if ( err ) { reject( err ); }
        resolve( message );
      });
    }
    catch( error ) { console.log( error ); reject( error ); }
  });
}

const imap = {
  user: wEmailCREDS.listenEmail ,
  password: wEmailCREDS.listenEmailPass ,
  host: wEmailCREDS.listenEmailIMAP ,
  port: 993 , // imap port
  tls: true ,// use secure connection
  tlsOptions: { rejectUnauthorized: false }
};
const wEmailNotifier = notifier( imap );

function parseTwitch( wMail ) {
    var wSubject = wMail.subject
    console.log( wSubject );
    var xx = wSubject.split( " " );
    var x1 = xx.shift();
    if ( xx[0] === "just" && xx[1] === "went" && xx[2] === "live" ) {
      wNotifyTwitchManViewerIsLive( x1 );
    }
}

function parseEmail( wMail ) {
    var wFA = wMail.from[0].address;
    switch( wFA ) {
        case "no-reply@twitch.tv":
            parseTwitch( wMail );
            break;
        default:
            console.log("unknown email , skipping");
            break;
    }
}

( async ()=> {
  await wConnectSendEmailServer();
  await wEmailNotifier.start();
  console.log("Email Server-Client Connected");
  wEmailNotifier.on( "end" , () => wEmailNotifier.start() );
  wEmailNotifier.on( "mail" , ( mail ) => parseEmail( mail ) )
})();

module.exports.sendEmail = wSendEmail;