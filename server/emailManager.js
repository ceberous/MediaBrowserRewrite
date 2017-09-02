const notifier = require('mail-notifier');

var sD = {
    listenEmail: "olah.ttneilc@gmx.com",
    listenEmailPass: "fz5Jk5zahn3irEXiUF3n3KYNv",
    listenEmailIMAP: "imap.gmx.com",
};
const imap = {
  user: sD.listenEmail,
  password: sD.listenEmailPass,
  host: sD.listenEmailIMAP,
  port: 993, // imap port
  tls: true,// use secure connection
  tlsOptions: { rejectUnauthorized: false }
};
const wEmailNotifier = notifier( imap );

// const sendPYEmailScript = "python " + path.join( __dirname , "sendEmail.py"  );
// const emailMessageFile = path.join( __dirname , "emailMessage.py" );
// function sendEmail( wMessage ) {
//   wMessage = wMessage.replace( /'/g , '*' );
//   wMessage = wMessage.replace( /"/g , '**' );
//   var x1 = "wMSG = '" + wMessage + "'";
//   fs.writeFileSync( emailMessageFile , x1 );
//   exec( sendPYEmailScript , { silent:true , async: false });
// }

function parseTwitch( wMail ) {
    // ${user} just went live on Twitch

    var wSubject = wMail.subject
    var wText = wMail.text;
    console.log( wSubject );
    console.log( wText );
    // var wStop = wText.indexOf("<");
    // wText = wText.substring( 0 , wStop );
    // wText = wText.replace( /(\r\n|\n|\r)/gm , " " );
    // sendEmail( wText );
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
    await wEmailNotifier.start();
    console.log("Email Server-Client Connected");
    wEmailNotifier.on( "end" , () => wEmailNotifier.start() );
    wEmailNotifier.on( "mail" , ( mail ) => parseEmail( mail ) )
})();