var express = require("express");
var router = express.Router();

var specialCTRL = require( "../CONTROLLERS/specialCTRL.js" );
router.get( '/router-reboot/' , specialCTRL.rebootRouter );

module.exports = router;