// dependencies
var express = require('express');
var request = require('request');
var rp = require('request-promise');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
var url = 'http://' + process.env.DBFACADE_PORT_3000_TCP_ADDR + ':' + process.env.DBFACADE_PORT_3000_TCP_PORT
console.log("backend url is:" + url);

// define supported routes
app.get('/middleware/status', function(req, res){
	res.set({
		'Content-Type': 'application/json',
	});
	res.status(200);
	var body = {
		"success":true
	};
	res.send(JSON.stringify(body));
});

app.post('/middleware/predictions', function(req, res) {
	//check if position is valid
	if(Number(req.body.position) > 22 || Number(req.body.position) < 0) {
		throw "invalid_number";
	}

	//check if driver is valid
	rp({
 		uri: "http://ergast.com/api/f1/drivers/" + req.body.driver,
 		method: "GET"
	})
	//check if circuit is valid
	.then(function(driverDetails) {
 		return rp({
 			uri: "http://ergast.com/api/f1/circuits/" + req.body.circuits,
  			method: "GET"
 		});
	})
	.then(function(circuitDetails){
		return rp({
			url:url + '/ff1/predictions',
			headers: {
				"Content-Type":"application/json"
			},
			body: JSON.stringify({
				driver:req.body.driver,
				circuit:req.body.circuit,
				position: req.body.position
			})
		});
	})
	.then(function(){
		return res.status(201).json({success:true});
	})
	.catch(function(err){
		return res.status(500).json({success:false});
	});
;
});

app.get('/middleware/predictions', function(req, res) {
	rp.get({
		url: url + '/ff1/predictions',
	})
	.then(function(predictionsData){
		for(var i = 0; i < predictionsData.length; i++) {
			rp.get({
				url: 'http://ergast.com/api/f1/drivers/' + predictionsData[i].driver + '/circuits/' + predictionsData[i].circuit + '.json' 
			})	
			.then(function(predictionResult)) {
				//TODO - if race hasnt happened, set status to "Pending"

				var actualPosition = JSON.parse(predictionResult).position;
				predictionsData[i].state = (actualPosition == predictionsData[i].position);
			}
		}
		res.status(200).json(predictionsData);
	});
});


app.post('/middleware/dummyPredictions', function(req, res) {
//make some requests to the db to add some dummy data with successful and failed predictions
	var driverData = ['hamilton', 'alonso', 'button'];
	var circuitData = ['silverstone', 'monza', 'monaco'];
	var positionData = [1,2,3];
	for(var i = 0; i < 3; i++) {
		request.post({
			url: url + '/ff1/predictions'
			headers: {
				"Content-Type":"application/json"
			},
			body: JSON.stringify({
				driver: driverData[i],
				circuit: circuitData[i],
				position: positionData[i]
			})
		});
	}

});

// start node app
app.listen(3000);
console.log("Started on port 3000!");
