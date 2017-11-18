var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var ejs = require("ejs");

var app = express();
var server = require("http").createServer(app);
var port = process.env.PORT || 6969;

// View Engine Setup
app.set( "views" , path.join( __dirname , "../../client" , "views" ) );
app.set( "view engine" , 'ejs' );
app.engine( 'html' , require('ejs').renderFile );

// Set Static Folder
app.use( express.static( path.join( __dirname , "../../client"  ) ) );

// Setup Middleware
//app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );


/*
// Cross-Origin Stuff
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/

// Main-Routes
app.get( "/" , function( req , res , next ) {
	res.render( 'index.html' );
});

var specialRoutes = require( "./ROUTES/specialRTR.js" );
app.use('/special/' , specialRoutes );

var adminPanelRoutes = require( "./ROUTES/adminPanelRTR.js" );
app.use('/admin/v1/' , adminPanelRoutes );
app.get( "/admin" , function( req , res , next ) {
	res.render( 'adminPanel.html' );
});
var buttonsRoutes = require( "./ROUTES/buttonsRTR.js" );
app.use('/buttonpress/' , buttonsRoutes );

// Youtube-Routes
app.get( "/youtubeStandard" , function( req , res , next ) {
	res.render( 'youtubeStandard.html' );
});
app.get( "/youtubeLiveBackground" , function( req , res , next ) {
	res.render( 'youtubeLiveBackground.html' );
});
var youtubeRoutes = require( "./ROUTES/youtubeRTR.js" );
app.use('/youtube/' , youtubeRoutes );

// Twitch-Routes
app.get( "/twitchLive" , function( req , res , next ) {
	res.render( "twitchLive.html" );
});
var twitchRoutes = require( "./ROUTES/twitchRTR.js" );
app.use('/twitch/' , twitchRoutes );

module.exports = app;