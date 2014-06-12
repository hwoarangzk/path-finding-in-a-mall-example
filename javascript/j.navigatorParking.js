
(function(window, $) {

	var canvasWidth = 1028;

	var canvasHeight = 680;

	var _svgPanZoomObj;

	var idPrefix = 'svg';

	var svgContainerDiv = '<div class="svgContainer" id="' + idPrefix + '[i]" floorName="[floorName]"></div>';

	var divCount = 0;

	//svg容器
	var _svgContainer;

	var _svgContainerList = [];

	var _svgPanZoomList = [];

	//初始化数据对象
	var initObj;

	//当前位置坐标对象
	var _currentLocationObj;

	//目标位置小圆圈对象
	var _targetLocationObj;

	//目标位置坐标对象
	var _targetCoordObj = {};

	//当前路径圆点集合
	var _currentPathList = [];

	//楼层对象集合
	var _floorsList = [];

	//当前楼层对象
	var _currentFloorObj;

	//将各区块分组的数组
	var _set = [];

	//寻路器
	var _finder = new PF.AStarFinder();

	//楼层对象类
	function MallFloor() {

		//楼层名
		this.name;

		//区块
		this.blocks;

		//电梯组
		this.elevators;

		//网格地图
		this.grid;

		//黑底白色路线图png url
		this.walkablePngUrl;

		this.image;

		//block url
		this.blockUrl;

		//svg图路径
		this.svgUrl;

		//电梯图路径
		this.elevatorUrl;
	}

	MallFloor.prototype.init = function(obj) {
		this.name = obj.name;
		this.blocks = obj.BLOCKS;
		this.elevators = obj.ELEVATORS;
		this.walkablePngUrl = obj.walkablePngUrl;
		this.svgUrl = obj.svgUrl;
		this.blockUrl = obj.blockUrl;
		this.elevatorUrl = obj.elevatorUrl;
		this.image = new Image();
		this.image.src = this.walkablePngUrl;
	};

	//加载svg文件
	var loadSVGFile = function(file, callback, index){
        $.ajax({
            type: "GET",
            url: file,
            dataType: "xml",
            success: function(svgXML) {
                if($.isFunction(callback))
                    callback(svgXML, index);
            }
        });
    };

	var _floor;
	var _floorBlock;
	var _floorElevator;

	//鼠标点击目标区域，画一个小圆点
	var drawTargetCircle = function(e) {
        if (_targetLocationObj) {
            _targetLocationObj.remove();
        }
        var block = this.data('block');
        _targetCoordObj.x = _currentFloorObj['blocks'][block].x;
        _targetCoordObj.y = _currentFloorObj['blocks'][block].y;
        _targetLocationObj = _svgContainer.circle(_targetCoordObj.x, _targetCoordObj.y, 5).attr({fill : 'black'});
        $('g').append(_targetLocationObj);
    }

	//加载楼层
	MallFloor.loadFloor = function(floorName) {
		if ($('[floorName="' + floorName + '"]').length) {
			$('.svgContainer').hide();
			$('[floorName="' + floorName + '"]').show();
			_svgPanZoomObj = Utils.searchBy('name', floorName, _svgPanZoomList);
			return false;
		}
		$('.svgContainer').hide();
		$('body').append(svgContainerDiv.replace('[i]', divCount).replace('[floorName]', floorName));
		_svgContainer = Raphael(idPrefix + divCount, canvasWidth, canvasHeight);
		_svgContainerList.push(_svgContainer);
		divCount++;
		var floorObj = Utils.searchBy('name', floorName, _floorsList);
		console.log(floorObj);
		var svgUrl = floorObj.svgUrl;
		loadSVGFile(svgUrl, function(svgXML) {
			_floor = _svgContainer.importSVG(svgXML);
            _floorBlock={};
            //绘制停车区域
            for(var b in floorObj.blocks){
            	var blockUrl = floorObj.blockUrl.replace('[item]', b);
                loadSVGFile(blockUrl, function(svgXML,index) {
                    _svgContainer.setStart();
                    _floorBlock[index]=_svgContainer.importSVG(svgXML);
                    var temp = _svgContainer.setFinish();
                    temp.data('block', index);
                    temp.click(drawTargetCircle);
                    _set.push(temp);
                }, b);
            }
            //绘制电梯
            for(var i = 0, len = floorObj.elevators.length; i < len; i++){
            	var elevatorUrl = floorObj.elevatorUrl.replace('[item]', i);
            	_floorElevator = [];
                loadSVGFile(elevatorUrl, function(svgXML,index) {
                    _floorElevator[index]=_svgContainer.importSVG(svgXML);
                    if (index == len - 1) {
	                    setTimeout(function() {
			                _svgContainer.circle(initObj._currentLocationObj.x, initObj._currentLocationObj.y, 5).attr({fill : 'red'});
			                var currentSvgPanRoom = Utils.searchBy('name', floorName, _svgPanZoomList);
			                if (!currentSvgPanRoom) {
			                	var t = Object.create(svgPanZoom);
				                var tempObj = {
				                	name : floorName,
				                	obj : t
				                };
				                t.init({
				                	selector : $('svgContainer').find('svg')[0],
				                	zoomScaleSensitivity: 0.2, 
				                    minZoom: 1, 
				                    maxZoom: 2
				                });
				                _svgPanZoomList.push(tempObj);
				                currentSvgPanRoom = t;
			                }
			                
			                _svgPanZoomObj = t;
			                _svgPanZoomObj.resetZoom();
			                $('[floorName="' + floorName + '"]').show();
			            }, 0);
                    }
                },i);
            }
            _currentFloorObj = floorObj;
		});
	};

	//获得白色路劲数据
	var getGrid = function (url, callback) {
	    var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var w = _currentFloorObj.image.width;
		var h = _currentFloorObj.image.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(_currentFloorObj.image, 0, 0, w, h);
        //获取canvas画布数据
        var data = ctx.getImageData(0, 0, w, h).data;
        var map = [], line = [];
        for (var i = 0, len = data.length; i < len; i += 4) {
            var red = Utils.prefixZero(data[i].toString(16), 2),
            green = Utils.prefixZero(data[i + 1].toString(16), 2),
            blue = Utils.prefixZero(data[i + 2].toString(16), 2),
            hex = red + green + blue;
            if (hex != '000000') {
                line.push(0);
            } else {
                line.push(1);
            }
            if (line.length >= w) {
                map.push(line);
                line = [];
            }
        }
        //获得画布网格坐标系
        grid = new PF.Grid(w, h, map);

        if ($.isFunction(callback)) {
            callback.call(this, grid);
        }
		
	};

	//画路径
	var drawPath = function(path) {
        for (var i in _currentPathList) {
            if (_currentPathList[i]) {
                _currentPathList[i].remove();
            }
        }
        for (var i in path) {
            var t = path[i];
            var temp = _svgContainer.circle(t[0], t[1], 3).attr({fill : 'red'})
            $('g').append(temp);
            _currentPathList.push(temp);
        }
    };

    //找寻路径
    var findPath = function() {
		if (!_targetLocationObj) {
			alert('选个地点先');
			return false;
		}

		if (!_currentFloorObj.grid) {
                var url = _currentFloorObj.walkablePngUrl;
                getGrid(url, function(d) {
                    _currentFloorObj.grid = d;
                    var path = _finder.findPath(_currentLocationObj.x, _currentLocationObj.y, _targetCoordObj.x, _targetCoordObj.y, _currentFloorObj.grid.clone());
                    drawPath(path);
                });
            } else {
                var path = _finder.findPath(_currentLocationObj.x, _currentLocationObj.y, _targetCoordObj.x, _targetCoordObj.y, _currentFloorObj.grid.clone());
                drawPath(path);
            }
	};

	//初始化地图导航页面
	var init = function() {
		//TODO:data here should be fetched by json way
		initObj = PARKING_LOT_DATA;
		_currentLocationObj = initObj._currentLocationObj;
		for (var i in initObj.FLOORS) {
			var mallFloor = new MallFloor();
			mallFloor.init(initObj['FLOORS'][i]);
			_floorsList.push(mallFloor);
		}
		//初始化svg容器为Raphael对象
		MallFloor.loadFloor(initObj.currentFloorName);
		$('[floorName="' + initObj.currentFloorName + '"]').show();
		//点击寻路按钮
		$('#find').click(findPath);

		$('#ZoomOut').click(function() {
			_svgPanZoomObj.zoom(2);
		});

		$('#ZoomIn').click(function() {
			_svgPanZoomObj.resetZoom();
		});
	};

	init();

	window.MallFloor = MallFloor;

})(window, jQuery);

