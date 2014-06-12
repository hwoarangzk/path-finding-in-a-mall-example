var STORE_DATA = {
	currentFloorName : 'F1',
	_currentLocationObj : {
        x : 402,
        y : 235
    },
	floors : [{
		floorName : 'F1',
		level : 0,
		baseUrl : 'svg/zhuhai/F1/',
	    blocks : [{
	    	name : '苹果',
	    	position : {x : 408, y : 180}
	    }, {
	    	name : '千百度',
	    	position : {x : 353, y : 335}
	    }, {
	    	name : '周大福',
	    	position : {x : 641, y : 146}
	    }, {
	    	name : '老庙黄金',
	    	position : {x : 277, y : 237}
	    }, {
	    	name : '中国银行ATM',
	    	position : {x : 156, y : 413}
	    }, {
	    	name : '哈森',
	    	position : {x : 171, y : 440}
	    }, {
	    	name : 'kisscat',
	    	position : {x : 646, y : 450}
	    }, {
	    	name : '蓝棠',
	    	position : {x : 93, y : 148}
	    }],
	    elevators : [{
	    	name : 'A1',
	    	avail : ['F1', 'F2', 'F3'],
	    	x : 336,
	    	y : 237
	    }, {
	    	name : 'A2',
	    	avail : ['F1', 'F2'],
	    	x : 326,
	    	y : 138
	    }, {
	    	name : 'A3',
	    	avail : ['F1'],
	    	x : 453,
	    	y : 335
	    }],
	    atms : [],
	    escalators : []
	}, {
		floorName : 'F2',
		level : 1,
		baseUrl : 'svg/zhuhai/F2/',
	    blocks : [{
	    	name : '苹果',
	    	position : {x : 409, y : 180}
	    }, {
	    	name : 'coco奶茶',
	    	position : {x : 396, y : 97}
	    }, {
	    	name : '周大福',
	    	position : {x : 641, y : 146}
	    }, {
	    	name : '卓怡',
	    	position : {x : 296, y : 211}
	    }],
	    elevators : [{
	    	name : 'A1',
	    	avail : ['F1', 'F2', 'F3'],
	    	x : 336,
	    	y : 237
	    }, {
	    	name : 'A2',
	    	avail : ['F1', 'F2'],
	    	x : 326,
	    	y : 138
	    }],
	    atms : [],
	    escalators : []
	}, {
		floorName : 'F3',
		level : 2,
		baseUrl : 'svg/zhuhai/F3/',
	    blocks : [{
	    	name : 'B2',
	    	position : {x : 323, y : 133}
	    }, {
	    	name : 'C3',
	    	position : {x : 483, y : 193}
	    }, {
	    	name : 'D4',
	    	position : {x : 528, y : 262}
	    }],
	    elevators : [{
	    	name : 'A1',
	    	avail : ['F1', 'F2', 'F3'],
	    	x : 335,
	    	y : 193
	    }, {
	    	name : 'A2',
	    	avail : ['F1', 'F2', 'F3'],
	    	x : 346,
	    	y : 132
	    }],
	    atms : [],
	    escalators : []
	}, ]
};