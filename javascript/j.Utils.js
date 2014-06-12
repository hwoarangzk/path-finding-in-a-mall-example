(function() {

	var searchBy = function(key, value, arr) {

	 	var result;

	 	if (arr.length == 0) {
	 		return;
	 	}
	 	for (var i in arr) {
	 		if (arr[i][key] && arr[i][key] == value) {
	 			result = arr[i];
	 			break;
	 		}
	 	}

	 	return result;
	 };

	var getIndex = function(key, value, arr) {

		var result = -1;

		for (var i = 0, len = arr.length; i < arr.length; i++) {
			if (arr[i][key] && arr[i][key] == value) {
	 			result = i;
	 			break;
	 		}	
		}

		return result;
	};

	var prefixZero = function(input) {
		var str = '00' + input;
		return str.charAt(str.length - 2) + str.charAt(str.length - 1);
	};






	window.Utils = window.Utils || {};
	Utils.searchBy = searchBy;
	Utils.getIndex = getIndex;
	Utils.prefixZero = prefixZero;

})();