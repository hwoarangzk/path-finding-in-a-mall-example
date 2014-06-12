var zeroFill = function (num, padding) {
        return Array(padding + 1 - (num + '').length).join('0') + num;
    }

var printed = 0;

var grid;

var getGrid = function (url, callback) {
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
    image = new Image();
    image.src = url;
    //读取遮罩图片
    image.onload = function () {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        //获取canvas画布数据
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        var map = [], line = [];
        for (var i = 0; i < data.length; i += 4) {
            var red = zeroFill(data[i].toString(16), 2),
            green = zeroFill(data[i + 1].toString(16), 2),
            blue = zeroFill(data[i + 2].toString(16), 2),
            hex = red + green + blue;
            if (hex != '000000') {
                line.push(0);
            } else {
                line.push(1);
            }
            if (line.length >= image.width) {
                map.push(line);
                line = [];
            }
        }
        //获得画布网格坐标系
        grid = new PF.Grid(image.width, image.height, map);
        // console.log(map);

        if ($.isFunction(callback)) {
            callback.call(this, grid);
        }

        // var n = map.nodes;
        // for (var i in n) {
        //     if (printed > 10){
        //         break;
        //     }
        //     var m = n[i];
        //     for (var j in m) {
        //         if (m[j]['walkable']) {
        //             console.log('x:' + m[j].x + ' y:' + m[j].y);
        //             printed++;
        //         }
        //     }
        // }
   }
}