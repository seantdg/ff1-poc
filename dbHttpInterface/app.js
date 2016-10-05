var mongodbRest = require('mongodb-rest/server.js');

var config = { 
	//"db": "mongodb://localhost:27017",
	"db":"mongodb://" + process.env.MONGODB_PORT_27017_TCP_ADDR + ":" + process.env.MONGODB_PORT_27017_TCP_PORT,
	"server": {
		"port": 3000,
		"address": "0.0.0.0"
	},
	"accessControl": {
		"allowOrigin": "*",
		"allowMethods": "GET,POST,PUT,DELETE,HEAD,OPTIONS",
		"allowCredentials": false
	},
	"mongoOptions": {
		"serverOptions": {
		},
		"dbOptions": {
			"w": 1
		}
	},
	"humanReadableOutput": true,
	"urlPrefix": ""
};

mongodbRest.startServer(config);
