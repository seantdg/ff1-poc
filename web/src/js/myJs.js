var makePrediction = function() {
	var driver = $('#inDriver').val();
	var position = $('#inPos').val();
	var circuit = $('#inCircuit').val();

	//make sure they have provided values
	if(driver.length > 0 && position.length > 0){
		//ajax call to backend
		$.ajax({
			url:"/middleware/predictions",
			contentType:"application/json",
			type:"POST",
			data:JSON.stringify({
				driver: driver,
				position: position,
				circuit: circuit
			}),
			dataType: 'json',
			success:function(data){
						populateList();
					},
			error: function(jqXHR){
				alert('Are you sure that youve entered your prediction correctly?');
			}
		});

		//reset fields
		$('#inDriver').val('');
		$('#inPos').val('');
		$('#inCircuit').val('');
	}
};

var populateList = function () {
	$.get("/middleware/predictions", function(data) {
		var list = "";
		var predictions = data;
		predictions.forEach(function(prediction){
			list+='<li class="list-group-item">' + prediction.driver + " - " + prediction.circuit + " - " + prediction.position + " - " + prediction.result + '</li>';
		});

		$("#predictions").html(list);
	});
}

var addDummyData = function() {
		$.ajax({
			url:"/middleware/dummyPredictions",
			contentType:"application/json",
			type:"POST",
			success:function(data){
						populateList();
					},
			error: function(jqXHR){
				alert('Sorry, there was a problem connecting to the server');
			}
		});
};

$(document).ready(function() {
	populateList();

});
