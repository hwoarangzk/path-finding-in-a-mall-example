var STORE_DATA = {
	currentFloorName : 'B1',
	_currentLocationObj : {
        x : 645,
        y : 82
    },
	floors : [{
		floorName : 'B1',
		level : 0,
		baseUrl : 'svg/store/B1/',
	    blocks : [{
	    	name : '苹果',
	    	position : {x : 280, y : 146}
	    }, {
	    	name : '周大福',
	    	position : {x : 429, y : 135}
	    }, {
	    	name : '天宝龙凤',
	    	position : {x : 445, y : 157}
	    }, {
	    	name : '老庙黄金',
	    	position : {x : 377, y : 158}
	    }],
	    elevators : [{
	    	name : 'A1',
	    	avail : ['B1', 'B2', 'B3'],
	    	x : 488,
	    	y : 376
	    }, {
	    	name : 'A2',
	    	avail : ['B1', 'B2'],
	    	x : 949,
	    	y : 152
	    }],
	    atms : [],
	    escalators : []
	}, {
		floorName : 'B2',
		level : 1,
		baseUrl : 'svg/store/B2/',
	    blocks : [{
	    	name : 'M2',
	    	position : {x : 275, y : 241}
	    }, {
	    	name : 'esprit',
	    	position : {x : 261, y : 203}
	    }, {
	    	name : 'basic_house',
	    	position : {x : 333, y : 138}
	    }, {
	    	name : 'etam',
	    	position : {x : 409, y : 138}
	    }],
	    elevators : [{
	    	name : 'A1',
	    	avail : ['B1', 'B2', 'B3'],
	    	x : 495,
	    	y : 334
	    }, {
	    	name : 'A2',
	    	avail : ['B1', 'B2'],
	    	x : 882,
	    	y : 210
	    }],
	    atms : [],
	    escalators : []
	}, {
		floorName : 'B3',
		level : 2,
		baseUrl : 'svg/store/B3/',
	    blocks : [{
	    	name : '苹果',
	    	position : {x : 280, y : 146}
	    }, {
	    	name : '周大福',
	    	position : {x : 429, y : 135}
	    }, {
	    	name : '天宝龙凤',
	    	position : {x : 445, y : 157}
	    }, {
	    	name : '老庙黄金',
	    	position : {x : 377, y : 158}
	    }],
	    elevators : [],
	    atms : [],
	    escalators : []
	}, ]
};