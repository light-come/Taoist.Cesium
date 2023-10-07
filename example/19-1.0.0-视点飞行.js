var script = ['<!-- 初始化三维库 --><script type="text/javascript" src="/lib/index.js" libpath="../" include="Taoist"></script>'];
script.forEach(element => {
  document.writeln(element);
});
/**
 * 初始化交互
 * @param {*} viewer 球体对象
 */
function init(viewer) {
  const turn = G.Turn(viewer);
  G.BaseLayer(viewer, {
    name: "影像底图",
    type: "mapbox", //www_google sl_geoq
    layer: "satellite",
    // crs: '4326',
    brightness: 0,
  }); //添加底图

  G.E.AtmosphericEffects(viewer);
}

window.onload = () => {
  (function () {
    //初始化地球0
    if (G.U.webglReport()) {
      //判断浏览器是否支持WebGL
      G.create3D(
        {
          id: "mapBox",
          showGroundAtmosphere: true,
          debug: false,
          success: function (_viewer) {
            init(_viewer);
            _viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            // _viewer.scene.globe.show = false;
            _viewer.scene.highDynamicRange = true;
            _viewer.scene.globe.baseColor = new Cesium.Color.fromCssColorString("#171744");
            // _viewer.scene.sun.show = false; //在Cesium1.6(不确定)之后的版本会显示太阳和月亮，不关闭会影响展示
            _viewer.scene.moon.show = false;
            _viewer.scene.skyBox.show = false; //关闭天空盒，否则会显示天空颜色
            _viewer.scene.backgroundColor = new Cesium.Color.fromCssColorString("#171744");

            // 创建视点，duration参数调节每个步骤时长
            var viewPoints = [
              { x: 120.12106394343537, y: 30.274105301409996, z: 1119.16066700343941, heading: 314.5, pitch: -22.5, duration: 6 },
              { x: 120.11390009643563, y: 30.267890699505024, z: 1192.54117701445514, heading: 211.2, pitch: -22.5, duration: 8 },
              { x: 120.08895613024677, y: 30.26896911962106, z: 1116.88607213701032, heading: 127.5, pitch: -17.2, duration: 8 },
              { x: 120.0836462294553, y: 30.293135546496234, z: 1112.787933492948868, heading: 25.4, pitch: -25.3, duration: 8 },
              { x: 120.12245571698338, y: 30.283313866026017, z: 1113.71231531550913, heading: 25.4, pitch: -25.3, duration: 8 },
              { x: 120.12106622695654, y: 30.274224070697493, z: 1120.79887757822699, heading: 25.4, pitch: -25.3, duration: 8 },
            ];

            function flyInACity() {
              const camera = _viewer.scene.camera;
              var currentIndex = 0; // 当前视点索引

              function flyToNextViewPoint() {
                if (currentIndex >= viewPoints.length) {
                  return; // 如果已经遍历完所有视点，结束函数
                }

                const currentViewPoint = viewPoints[currentIndex];

                camera.flyTo({
                  destination: Cesium.Cartesian3.fromDegrees(currentViewPoint.x, currentViewPoint.y, currentViewPoint.z),
                  orientation: {
                    heading: Cesium.Math.toRadians(currentViewPoint.heading),
                    pitch: Cesium.Math.toRadians(currentViewPoint.pitch),
                  },
                  duration:currentViewPoint.duration
                  easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                  complete: function () {
                    currentIndex++; // 前往下一个视点
                    flyToNextViewPoint(); // 递归调用函数，实现循环
                  },
                });
              }

              flyToNextViewPoint(); // 调用函数开始飞行
            }

            flyInACity();
          },
        },
        Cesium
      );
    } else {
      alert("浏览器不支持WebGL，需更换浏览器");
    }
  })();
};
