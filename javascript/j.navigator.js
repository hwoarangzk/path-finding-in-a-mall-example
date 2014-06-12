
(function(window, $) {

	var pfx = ['webkit', ''];

	var canvasWidth = 1028;

	var canvasHeight = 680;

	var startFloorName;

	var startFloorObj;

	var _svgPanZoomObj;

	var _currentTargetName;

	var _targetFloorName;

	var idPrefix = 'svg';

	var prevID = -1;

	var drawPathChangeFloorDalay = 200;

	var _selectedElevatorName;

	var svgContainerDiv = '<div class="svgContainer piece" id="' + idPrefix + '[i]" floorName="[floorName]"></div>';

	var divCount = 0;

	var currentFloorIndex = 0;

	var nearestElevator;

	var _selector;

	//svg容器
	var _svgContainer;

	var _svgContainerList = [];

	var _svgPanZoomList = [];

	var _currentShownDiv;

	var isStartLocationDrawn = false;

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



	var showOne = function(node,num) {
    	var className = node.attr("class").split(" ")[0];
    	
  		if(prevID > num){
  			// 下楼 
  		    node.removeClass().addClass('piece').fadeOut();
  			if(prevID>-1){
	  			node.eq(prevID).addClass("downOut");
	  		}
	  		node.eq(num).fadeIn().addClass("downIn");
		}else if(prevID < num){

  			// 上楼
		    node.removeClass().addClass('piece').fadeOut();
  			if(prevID>-1){
	  			node.eq(prevID).addClass("upOut");
	  		}
	  		node.eq(num).fadeIn().addClass("upIn");
	  	}
	  	
		PrefixedEvent(node.eq(num),"AnimationEnd");
		
  		prevID = num;
    }

    

    var PrefixedEvent = function(element,type) {
		for(var p = 0; p < pfx.length; p++){
			if(!pfx[p]){
				type = type.toLowerCase();
			}
			element.bind(pfx[p]+type,function(e){

				if(element.attr("class").indexOf("In") > -1){
					//alert(a + " , " +  element.attr("id"));

				}
				element.unbind();
			});
		}
	};




	//楼层对象类
	function Floor(opt) {

		//楼层名
		this.name = opt.floorName;

		this.baseUrl = opt.baseUrl;

		this.level = opt.level;

		//区块
		this.blocks = opt.blocks;

		//电梯组
		this.elevators = opt.elevators;

		this.atms = opt.atms;

		this.escalators = opt.escalators;

		this.bgUrl = this.baseUrl + 'bg.svg';
		this.pathUrl = this.baseUrl + 'path.png';
		this.facilityUrl = this.baseUrl + 'facility.svg';
		this.storeUrl = this.baseUrl + 'store.svg';

		this.scaleInUrl = this.baseUrl + 'scale_in.svg';
		this.scaleOutUrl = this.baseUrl + 'scale_out.svg'

		//存放svg对象
		this.svgArray = [];

		//网格地图
		this.grid;

		this.image = new Image();
		this.image.src = this.pathUrl;
	}

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

	//鼠标点击目标区域，画一个小圆点
	var drawTargetCircle = function(e, target) {

		var $this = $(this);
		var name = $this.attr('data-svg-group');

		if (target) {
			name = target.name;
		}

        if (name === _currentTargetName && startFloorName == _currentFloorObj.name) {
        	console.log('same name');
        	return false;
        }
        if (_targetLocationObj) {
            _targetLocationObj.remove();
        }

        var target = Utils.searchBy('name', name, _currentFloorObj.blocks);
        if (!target) {
        	return false;
        }
        _currentTargetName = name;
        _targetCoordObj.x = target['position'].x;
        _targetCoordObj.y = target['position'].y;
        _targetLocationObj = _svgContainer.circle(_targetCoordObj.x, _targetCoordObj.y, 5).attr({fill : 'black'});
        _currentShownDiv.find('g.viewport').append(_targetLocationObj);
        _targetFloorName = _currentShownDiv.find('svg').attr('id');
    }

    var zoomOutBlock = function(e) {
    	var t = $(e.target);
    	var container = t.closest('.piece');
    	var left = t.position().left + Number(container.css('margin-left').match(/-?\d+/)[0]);
    	var top = t.position().top;// - Number(container.css('margin-top').match(/-?\d+/)[0]);
    	
    	zoomOut({
    		x : left,
    		y : top
    	});
    };

	//加载楼层
	Floor.loadFloor = function(floorName) {
		if (floorName === $('[floorName="' + floorName + '"]:visible').find('svg').attr('id')) {
			return false;
		}

		if ($('[floorName="' + floorName + '"]').find('svg').length) {
			_selector = '#' + floorName;
			_currentShownDiv = $('[floorName="' + floorName + '"]');
			currentFloorIndex = _currentShownDiv.prevAll('[floorName]').length;
			_svgContainer = _svgContainerList[currentFloorIndex];
			showOne($('.piece'), currentFloorIndex);
			_currentFloorObj = Utils.searchBy('name', floorName, _floorsList);
			_svgPanZoomObj = Utils.searchBy('name', floorName, _svgPanZoomList).obj;
			zoomIn();
			updateCurrentFloorName(_currentFloorObj.name);
			return false;
		}

		divCount = $('[floorName="' + floorName + '"]').prevAll('[floorName]').length;
		_svgContainer = Raphael(idPrefix + divCount, canvasWidth, canvasHeight);
		_svgContainerList.push(_svgContainer);
		var floorObj = Utils.searchBy('name', floorName, _floorsList);
		var bgUrl = floorObj.bgUrl;
		var storeUrl = floorObj.storeUrl;
		var facilityUrl = floorObj.facilityUrl;


		var scaleInUrl = floorObj.scaleInUrl;
		var scaleOutUrl = floorObj.scaleOutUrl;
		
		loadSVGFile(bgUrl, function(data) {
			floorObj.svgBg = _svgContainer.importSVG(data);

			loadSVGFile(scaleInUrl, function(data) {
				floorObj.svgScaleIn = _svgContainer.importSVG(data);
				floorObj.svgArray.push(floorObj.svgScaleIn);

				loadSVGFile(scaleOutUrl, function(data) {
					floorObj.svgScaleOut = _svgContainer.importSVG(data);
					floorObj.svgArray.push(floorObj.svgScaleOut);
					floorObj.svgScaleOut.animate({opacity: 0}, 0);

					//画终端机所在位置
					if (!isStartLocationDrawn) {
						_svgContainer.text(initObj._currentLocationObj.x, initObj._currentLocationObj.y - 8, '您现在的位置');
						_svgContainer.circle(initObj._currentLocationObj.x, initObj._currentLocationObj.y, 5).attr({fill : 'red'});
						isStartLocationDrawn = true;	
					}

					//必须加此延时，否则svgPanZoom无法成功初始化
					setTimeout(function() {
						var currentSvgPanZoom = Utils.searchBy('name', floorName, _svgPanZoomList);
				        if (!currentSvgPanZoom) {
				        	var o = $('[floorName="' + floorName + '"]').find('svg');
				        	o.attr('id', floorName);
				        	_selector = '#' + floorName;
				        	var t = svgPanZoom(_selector, {
								zoomScaleSensitivity: 1, 
				                minZoom: 1, 
				                maxZoom: 2
							});

				            _svgPanZoomList.push({
				            	name : floorName,
				            	obj : t
				            });
				            currentSvgPanZoom = t;
				        }
				        _svgPanZoomObj = t;
				        _svgPanZoomObj.resetZoom();
					}, 0);
			       
			        _currentShownDiv = $('[floorName="' + floorName + '"]');
					currentFloorIndex = _currentShownDiv.prevAll('[floorName]').length;
					showOne($('.piece'), currentFloorIndex);
			        _currentShownDiv.find('[data-svg-group]').on('click', function(e) {
			        	var self = this;
			        	var $this = $(this);
			        	var data = $this.attr('data-svg-group');
			        	if (data.indexOf('block_') != -1) {
			        		zoomOutBlock.call(self, e);
			        	} else {
				        	drawTargetCircle.call(self, e);
						}
			        });
					_currentFloorObj = floorObj;
					updateCurrentFloorName(_currentFloorObj.name);
				});
			});
		});
	};

	//获得白色路劲数据
	Floor.prototype.getGrid = function(callback) {
		var self = this;
	    var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var w = _currentFloorObj.image.width;
		var h = _currentFloorObj.image.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(self.image, 0, 0, w, h);
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

        self.grid = grid;

        if ($.isFunction(callback)) {
            callback.call(self);
        }
		
	};

	var updateCurrentFloorName = function(name) {
		$('#currentFloor').text(name);
	};

	//清除路径圆点
	var clearPath = function() {
		for (var i in _currentPathList) {
            if (_currentPathList[i]) {
                _currentPathList[i].remove();
            }
        }
	};

	//画路径
	var drawPath = function(path, callback) {
        clearPath();
        var i = 0;
        var pathLength = path.length;
        var drawPathInterval = setInterval(function() {
        	i += 17;
        	if (i >= pathLength) {
        		clearInterval(drawPathInterval);
        		if ($.isFunction(callback)) {
        			callback.call(this);
        		}
        		return false;
        	}
        	try {
        		var t = path[i];
	        	var temp = _svgContainer.circle(t[0], t[1], 4).attr({fill : 'red'});
	        	temp.attr('opacity', 0).animate({ opacity: 1.0 }, 500);
	        	 _currentShownDiv.find('g.viewport').append(temp);
	            _currentPathList.push(temp);
        	} catch (e) {
        		console.log(i);
        	}
        	
        }, 150);
    };

    //跨楼层导航，返回所有涉及到的楼层对象数组
    var getRelatedFloorObjs = function(startFloorName, endFloorName) {

    	var startIndex = Utils.getIndex('name', startFloorName, _floorsList);
    	var endIndex = Utils.getIndex('name', endFloorName, _floorsList);

    	return _floorsList.slice(startIndex, (endIndex + 1));

    };


    var getPathObj = function(floorObj, coordObj, startFloorName, endFloorName) {
    	var result = {};
    	var elevators = floorObj.elevators;
    	for (var i in elevators) {
    		var elevator = elevators[i];
    		if ($.inArray(startFloorName, elevator.avail) == -1 || $.inArray(endFloorName, elevator.avail) == -1) {
    			continue;
    		}
    		var path = _finder.findPath(coordObj.x, coordObj.y, elevator.x, elevator.y, floorObj.grid.clone());
    		if (result.path) {
    			if (path.length < result.path.length) {
    				result.path = path;
    				result.elevator = elevator;
    			}
    		} else {
    			result.path = path;
    			result.elevator = elevator;
    		}
    	}
    	return result;
    };


    //根据当前楼层，获取最近的一个电梯对象
    var getElevator = function(floorName, startLocationObj, startFloorName, endFloorName) {
    	var floorObj = Utils.searchBy('name', floorName, _floorsList);
    	var pathObj;
    	if (!floorObj.grid) {
    		floorObj.getGrid(function() {
    			pathObj = getPathObj(floorObj, startLocationObj, startFloorName, endFloorName);
    		});
    	} else {
    		pathObj = getPathObj(floorObj, startLocationObj, startFloorName, endFloorName);
    	}
    	return pathObj;
    };

    var drawCrossFloorPath = function(floorList) {

    	if (floorList.length) {
    		var pathObj = floorList.shift();
    		var floorObj = pathObj.floorObj;
    		var path = pathObj.path;
    		var floorName = floorObj.name;
    		var func = arguments.callee;

    		if (!pathObj.path) {//终点楼层
    			Floor.loadFloor(floorName);
    			var elevator = Utils.searchBy('name', _selectedElevatorName, floorObj.elevators);
    			if (!floorObj.grid) {
    				floorObj.getGrid(function() {
	    				path = _finder.findPath(elevator.x, elevator.y, _targetCoordObj.x, _targetCoordObj.y, floorObj.grid.clone());
	    				drawPath(path, function() {
	    					setTimeout(function() {
		    					func(floorList);
		    				}, drawPathChangeFloorDalay);
	    				});
	    			});
    			} else {
    				path = _finder.findPath(elevator.x, elevator.y, _targetCoordObj.x, _targetCoordObj.y, floorObj.grid.clone());
					drawPath(path, function() {
						setTimeout(function() {
	    					func(floorList);
	    				}, drawPathChangeFloorDalay);
					});	
    			}
    		} else {//起点楼层
    			Floor.loadFloor(floorName);
    			drawPath(path, function() {
					setTimeout(function() {
    					func(floorList);
    				}, drawPathChangeFloorDalay);
				});
    		}
    	}
    };

    //针对珠海项目，假设每一个楼层的电梯均能到达珠海口岸的任意三层
    var goByElevator = function(startFloorName) {
    	var relatedFloorObjs = getRelatedFloorObjs(startFloorName, _targetFloorName);
    	var startFloorObj = relatedFloorObjs[0];
    	var endFloorObj = relatedFloorObjs[relatedFloorObjs.length - 1];
    	if (!nearestElevator) {
    		nearestElevator = getElevator(startFloorName, _currentLocationObj, startFloorObj.name, endFloorObj.name);
    		_selectedElevatorName = nearestElevator.elevator.name;
    	}
    	var startObj = {
    		floorObj : startFloorObj,
    		path : nearestElevator.path
    	}
    	var endObj = {
    		floorObj : endFloorObj
    	}
    	var tempList = [startObj, endObj];

    	drawCrossFloorPath(tempList);

    };

    //找寻路径
    var findPath = function() {
		if (!_targetLocationObj) {
			alert('选个地点先');
			return false;
		}
		zoomIn(function() {
			//判断是否是跨楼层导航
			if (startFloorName != _currentFloorObj.name) {//跨楼层导航

				if (true) {//选择直达电梯
					goByElevator(startFloorName);
				} else {//选择其他方式

				}

			} else {//同楼层导航
				var path;
				
				if (!_currentFloorObj.grid) {
			        _currentFloorObj.getGrid(function() {
			            path = _finder.findPath(_currentLocationObj.x, _currentLocationObj.y, _targetCoordObj.x, _targetCoordObj.y, _currentFloorObj.grid.clone());
			            drawPath(path);
			        });
			    } else {
			        path = _finder.findPath(_currentLocationObj.x, _currentLocationObj.y, _targetCoordObj.x, _targetCoordObj.y, _currentFloorObj.grid.clone());
			        drawPath(path);
			    }
			}
		});
	};

	var zoomIn = function() {
		var callback = arguments[arguments.length - 1];
		_svgPanZoomObj.resetZoom();
		clearPath();
		_currentFloorObj.svgScaleOut.animate({opacity: 0}, 300, function() {
			_currentFloorObj.svgScaleIn.animate({opacity: 1}, 300, function() {
				if ($.isFunction(callback)) {
					callback.call(this);
				}
			});
		});
	};

	var zoomOut = function(obj) {
		if (obj && obj.x && obj.y) {
			_svgPanZoomObj.zoomAtPoint(2, obj);
		} else {
			_svgPanZoomObj.zoom(2);
		}
		clearPath();
		_currentFloorObj.svgScaleIn.animate({opacity: 0}, 300, function() {
			_currentFloorObj.svgScaleOut.animate({opacity: 1}, 300);
		});
	};

	//初始化地图导航页面
	var init = function() {
		//TODO:data here should be fetched by json way
		initObj = STORE_DATA;
		_currentLocationObj = initObj._currentLocationObj;
		for (var i in initObj.floors) {
			var mallFloor = new Floor(initObj['floors'][i]);
			_floorsList.push(mallFloor);
		}
		//初始化svg容器为Raphael对象
		startFloorName = initObj.currentFloorName;
		startFloorObj = Utils.searchBy('name', startFloorName, _floorsList);
		Floor.loadFloor(startFloorName);
		//$('[floorName="' + initObj.currentFloorName + '"]').show();
		//点击寻路按钮
		$('#find').click(findPath);

		$('#ZoomOut').click(zoomOut);

		$('#ZoomIn').click(zoomIn);

		$('#floors input').click(function() {
			Floor.loadFloor($(this).attr('floor'));
		});


	};

	init();

	window.Floor = Floor;

})(window, jQuery);