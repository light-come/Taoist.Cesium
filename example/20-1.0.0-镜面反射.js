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
            window.viewer = _viewer
            init(_viewer);
            _viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            // _viewer.scene.globe.show = false;
            _viewer.scene.highDynamicRange = true;
            _viewer.scene.globe.baseColor = new Cesium.Color.fromCssColorString("#171744");
            // _viewer.scene.sun.show = false; //在Cesium1.6(不确定)之后的版本会显示太阳和月亮，不关闭会影响展示
            _viewer.scene.moon.show = false;
            _viewer.scene.skyBox.show = false; //关闭天空盒，否则会显示天空颜色
            _viewer.scene.backgroundColor = new Cesium.Color.fromCssColorString("#171744");
            G.Go(_viewer, {
              h: 4.87,
              p: -0.3651498703,
              r: 6.28,
              x: 120.12333091729515,
              y: 30.272168072536324,
              z: 1144.48,
              duration: 0,
            });
            G.aTiles(_viewer, {
              type: "建筑",
              url: WEBGL_Server+"/杭州矢量模型/tileset.json", //http://127.0.0.1:64158
              flyTo: false,
              heightOffset: 0,
              height: 0,
              style: {
                color: "color('white', 0.6)",
                show: true,
              },
            });
          },
        },
        Cesium
      );
    } else {
      alert("浏览器不支持WebGL，需更换浏览器");
    }
  })();
};
