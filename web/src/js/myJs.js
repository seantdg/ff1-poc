var makePrediction = function() {
	var driver = $('#inDriver').val();
	var pos = $('#inPos').val();
	var round = $('#inRound').val();

	//make sure they have provided values
	if(driver.length > 0 && pos.length > 0){
		//ajax call to backend
		$.ajax({
			url:"/middleware/predictions",
			contentType:"application/json",
			type:"POST",
			data:JSON.stringify({
				driver: driver,
				pos: pos,
				round: round
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
		$('#inRound').val('');
	}
};

var populateList = function () {
	$.get("/middleware/predictions", function(data) {
		var list = "";
		data.forEach(function(element){
			if(element.item) {
				list+='<li class="list-group-item">' + element.item + '</li>';
			}
		});

		$("#results").html(list);
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
