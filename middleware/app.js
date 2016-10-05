// dependencies
var express = require('express');
var request = require('request');
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

	//check if they are a real driver

	// e.g .post to http://ergast.com/api/f1/drivers/hamilton

	//store prediction in db
	request.post({
		headers: {'content-type' : 'application/json'},
		url:url + '/predictions/entries',
		body:JSON.stringify(req.body)
	}, function(error, response, body){
		if(!error) {
			res.status(201).set({
				'Content-Type': 'application/json',
			}).send({"success":true});
		}
		else {
			res.status(500).json({"success":false, "debug": + body});
		}
	});
});

app.get('/middleware/predictions', function(req, res) {
	request.get({
		url:url + '/predictions/entries',
	}, function(error, response, body){
		if(!error) {
			res.status(200).set({
				'Content-Type': 'application/json',
			}).send(body);
		}
		else {
			res.status(500).send({"success":false, "debug": + body});

		}
	});
});

app.post('/middleware/dummyPredictions', function(req, res) {
//make some requests to the db to add some dummy data with successful and failed predictions

});

// start node app
app.listen(3000);
console.log("Started on port 3000!");
