
/*!
 * Control JavaScript Library v0.0.1
 * Date: 20211025
 */
(function() {
    const version = "0.0.1"
    G.extend({
        PH: {
            expando: "BOLT" + ( version + Math.random() ).replace( /\D/g, "" ),
            formatPositon,
            getMaxHeight,
            addPositionsHeight,
            setPositionsHeight,
            updateHeightForClampToGround,
            getCurrentMousePosition,
            pickCenterPoint,
            GetPercent
        }
    } );
    //计算百分比
    function GetPercent(num, total) {
        /// <summary>
        /// 求百分比
        /// </summary>
        /// <param name="num">当前数</param>
        /// <param name="total">总数</param>
        num = parseFloat(num);
        total = parseFloat(total);
        if (isNaN(num) || isNaN(total)) {
            return "-";
        }
        return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
    }
    //格式化 数字 小数位数
    function formatNum(num, digits) {
        return Number(num.toFixed(digits || 0));
    }

    //格式化坐标点为可显示的可理解格式（如：经度x:123.345345、纬度y:31.324324、高度z:123.1）。
    function formatPositon(position) {
        var carto = Cesium.Cartographic.fromCartesian(position);
        var result = {};
        result.y = formatNum(Cesium.Math.toDegrees(carto.latitude), 6);
        result.x = formatNum(Cesium.Math.toDegrees(carto.longitude), 6);
        result.z = formatNum(carto.height, 2);
        return result;
    }

    /**
     * 获取坐标数组中最高高程值
     * @param {Array} positions Array<Cartesian3> 笛卡尔坐标数组
     * @param {Number} defaultVal 默认高程值
     */
    function getMaxHeight(positions, defaultVal) {
        if (defaultVal == null) defaultVal = 0;

        var maxHeight = defaultVal;
        if (positions == null || positions.length == 0) return maxHeight;

        for (var i = 0; i < positions.length; i++) {
            var tempCarto = Cesium.Cartographic.fromCartesian(positions[i]);
            if (tempCarto.height > maxHeight) {
                maxHeight = tempCarto.height;
            }
        }
        return formatNum(maxHeight, 2);
    }

    /**
    * 在坐标基础海拔上增加指定的海拔高度值
    * @param {Array} positions Cartesian3类型的数组
    * @param {Number} height 高度值
    * @return {Array} Cartesian3类型的数组
    */
    function addPositionsHeight(positions, addHeight) {
        addHeight = Number(addHeight) || 0;

        if (positions instanceof Array) {
            var arr = [];
            for (var i = 0, len = positions.length; i < len; i++) {
                var car = Cesium.Cartographic.fromCartesian(positions[i]);
                var point = Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, car.height + addHeight);
                arr.push(point);
            }
            return arr;
        } else {
            var car = Cesium.Cartographic.fromCartesian(positions);
            return Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, car.height + addHeight);
        }
    }

    /**
    * 设置坐标中海拔高度为指定的高度值
    * @param {Array} positions Cartesian3类型的数组
    * @param {Number} height 高度值
    * @return {Array} Cartesian3类型的数组
    */
    function setPositionsHeight(positions, height) {
        height = Number(height) || 0;

        if (positions instanceof Array) {
            var arr = [];
            for (var i = 0, len = positions.length; i < len; i++) {
                var car = Cesium.Cartographic.fromCartesian(positions[i]);
                var point = Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, height);
                arr.push(point);
            }
            return arr;
        } else {
            var car = Cesium.Cartographic.fromCartesian(positions);
            return Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, height);
        }
    }

    /**
    * 设置坐标中海拔高度为贴地或贴模型的高度（sampleHeight需要数据在视域内） 
    */
    function updateHeightForClampToGround(position) {
        var carto = Cesium.Cartographic.fromCartesian(position);

        var _heightNew = viewer.scene.sampleHeight(carto);
        if (_heightNew != null && _heightNew > 0) //&&carto.height!=0
        {
            var positionNew = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, _heightNew + 1);
            return positionNew;
        }
        return position;
    }

    /**
     * 获取鼠标当前的屏幕坐标位置的三维Cesium坐标 移动时调用会卡顿
     * @param {Cesium.viewer} viewer 
     * @param {Cesium.Cartesian2} position 二维屏幕坐标位置
     */
    function getCurrentMousePosition(viewer, position) {
        var scene = viewer.scene
        var cartesian;
        //在模型上提取坐标  
        var pickedObject = scene.pick(position);
        if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
            //pickPositionSupported :判断是否支持深度拾取,不支持时无法进行鼠标交互绘制
            var cartesian = scene.pickPosition(position);
            if (Cesium.defined(cartesian)) {
                //不是entity时，支持3dtiles地下
                if (!Cesium.defined(pickedObject.id) ) return cartesian;
            }
        }
        return cartesian;
    }

    //获取屏幕中心的三维Cesium坐标
    function pickCenterPoint(scene) {
        var canvas = scene.canvas;
        var center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);

        var ray = scene.camera.getPickRay(center);
        var target = scene.globe.pick(ray, scene);
        return target || scene.camera.pickEllipsoid(center);
    }
})(window);
