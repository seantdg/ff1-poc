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
app.get('/middleware/status', function (req, res) {
	res.set({
		'Content-Type': 'application/json',
	});
	res.status(200);
	var body = {
		"success": true
	};
	res.send(JSON.stringify(body));
});

app.post('/middleware/predictions', function (req, res) {
	//check if position is valid
	if (Number(req.body.position) > 22 || Number(req.body.position) < 0) {
		throw "invalid_number";
	}

	//check if driver is valid
	rp({
		uri: "http://ergast.com/api/f1/drivers/" + req.body.driver + ".json",
		method: "GET"
	})
		//check if circuit is valid
		.then(function (driverDetails) {
			return rp({
				uri: "http://ergast.com/api/f1/circuits/" + req.body.circuits + ".json",
				method: "GET"
			});
		})
		.then(function (circuitDetails) {
			return rp({
				url: url + '/ff1/predictions',
				headers: {
					"Content-Type": "application/json"
				},
				method: "POST",
				body: JSON.stringify({
					driver: req.body.driver,
					circuit: req.body.circuit,
					position: req.body.position
				})
			});
		})
		.then(function (resp) {
			return res.status(201).json({ success: true });
		})
		.catch(function (err) {
			return res.status(500).json({ success: false });
		});
	;
});

app.get('/middleware/predictions', function (req, res) {
	var predictions = {};
	var results = {};
	rp.get({
		url: url + '/ff1/predictions',
	})
		.then(function (predictionsData) {
			predictions = JSON.parse(predictionsData);
			return rp.get({
				url: url + '/ff1/results'
			})
		})
		.then(function(resultsData){
			results = JSON.parse(resultsData);
			res.status(200).json(calculatePredictionResults(predictions, results));
		})
	
		.catch(function (err) {
			res.status(500).json({success:false});
		});
});


app.post('/middleware/dummyPredictions', function (req, res) {
	//make some requests to the db to add some dummy data with successful and failed predictions
	var driverData = ['hamilton', 'alonso', 'button'];
	var circuitData = ['silverstone', 'monza', 'monaco'];
	var positionData = [1, 2, 3];
	for (var i = 0; i < 3; i++) {
		request.post({
			url: url + '/ff1/predictions',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				driver: driverData[i],
				circuit: circuitData[i],
				position: positionData[i]
			})
		});
	}
	res.status(202).json({success:true});
});

app.post('/middleware/results', function (req, res) {
	//get results from ergast
	rp("http://ergast.com/api/f1/current/results.json?limit=500")
		.then(function (resultsResponse) {
			//circuit.driver.pos
			var results = JSON.parse(resultsResponse);

			var resultsObj = {};

			results.MRData.RaceTable.Races.forEach(function (race) {
				var driverResults = {};

				race.Results.forEach(function (result) {
					driverResults[result.Driver.driverId] = result.position
				});

				resultsObj[race.Circuit.circuitId] = driverResults

			});

			//create items in db
			request.post({
				url: url + '/ff1/results',
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(resultsObj)
			});
			res.status(202).json({success:true});
		});
});

// start node app
app.listen(3000);
console.log("Started on port 3000!");

function calculatePredictionResults(predictions, results) {

	for(var i = 0; i < predictions.length; i++)  {
		var prediction = predictions[i];
		var predictedPosition = prediction.position;

		try {
			var actualPosition = results[0][prediction.circuit][prediction.driver];
			prediction.result = (predictedPosition == actualPosition ? "correct" : "incorrect");
		}
		catch(e) {
			prediction.result = "pending";
		}
		
		predictions[i] = prediction;	
	}

	return predictions;
}
