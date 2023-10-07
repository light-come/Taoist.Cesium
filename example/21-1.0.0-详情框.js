var script = ['<!-- 初始化三维库 --><script type="text/javascript" src="/lib/index.js" libpath="../" include="Taoist"></script>'];
script.forEach(element => {
  document.writeln(element);
});

const index = {
  example: function (params, options, _viewer) {
    _viewer = _viewer ?? this.viewer;
    window.Gear_X = new Gear(_viewer);
    if (_viewer instanceof Cesium.Viewer) return Gear_X[params](options);
  },
  /**
   * 初始化交互
   * @param {*} viewer 球体对象
   */
  init: function (viewer) {
    G.E.AtmosphericEffects(viewer);
    G.C.getPosition(viewer, function (p) {
      console.log(p); //取点击坐标小工具
    });
    dom.setTitle();

    viewer.turn = G.Turn(viewer);
    viewer.turn(viewer, "play"); //stop //为暂停//开始自转
  },
  globeStyle: function (viewer) {
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    viewer.scene.highDynamicRange = true;
    viewer.scene.globe.baseColor = new Cesium.Color.fromCssColorString("#fff");
    viewer.scene.moon.show = false;
    viewer.scene.skyBox.show = false; //关闭天空盒，否则会显示天空颜色
    viewer.scene.backgroundColor = new Cesium.Color.fromCssColorString("#000");
  },
  Load: function (viewer) {
    //资源全部加载后飞行 防止卡顿
    var state = false;
    var percent_state = true; //非b3dm加载不需要使用这个
    let model_index = 0;
    G.IA(
      function (start) {},
      function (end) {
        state = false;
        setTimeout(() => {
          state = true;
        }, 1000);
        // console.log(end)
      },
      function (percent) {
        $("#file-page-percent").html(percent);
        if (percent == "100%") {
          model_index++;
          if (model_index >= 2) {
            percent_state = true;
          }
        }
      }
    );
    var timer = setInterval(() => {
      if (state) {
        viewer.turn(viewer, "stop"); //停止自转
        G.Go(viewer, {
          h: 3.17,
          p: -0.4137201738,
          r: 0,
          x: 120.369909,
          y: 30.000749,
          z: 181.07,
          duration: 3,
        });
      }
      if (state && percent_state) {
        console.log("刷新完成");
        $("#file-page-container").fadeToggle(3000);
        clearInterval(timer);
      }
    }, 1000);
  },
  addTiles(viewer) {
    this.Load(viewer);
    //机甲模型模型
    return G.aGLTF(viewer, {
      url: WEBGL_Server + "/%E4%BA%BA%E7%89%A9%E7%8E%AF%E6%A8%A1%E5%9E%8B/%E7%89%A9%E4%BD%93/%E6%9C%BA%E7%94%B2/scene.gltf",
      scale: 10,
      position: {
        x: 120.36994690602755,
        y: 29.99893731382367,
        z: 0,
      },
    });
  },
  initLine(viewer, model) {
    model.then(event => {
      viewer.scene.postUpdate.addEventListener(function (scene, time) {
        var cartesian3 = Cesium.Matrix4.getTranslation(event.modelMatrix, new Cesium.Cartesian3());
        var cartesian2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian3);
        if (!cartesian2) return;

        const div1 = document.getElementById("div1");
        const div2 = document.getElementById("div2");
        const svg = document.getElementById("line");

        const dragContainer = document.getElementById("drag-container");
        const rect = dragContainer.getBoundingClientRect();

        var x1 = cartesian2.x;
        var y1 = cartesian2.y;
        var x2 = rect.left + window.pageXOffset + dragContainer?.offsetWidth / 2;
        var y2 = rect.top + window.pageYOffset + dragContainer?.offsetHeight / 2;

        div1.style.left = x1.toFixed(4) + "px";
        div1.style.top = y1.toFixed(4) + "px";

        div2.style.left = x2.toFixed(4) + "px";
        div2.style.top = y2.toFixed(4) + "px";

        var top = Math.min(y1, y2);
        var left = Math.min(x1, x2);
        var width = Math.abs(x1 - x2);
        var height = Math.abs(y1 - y2);
        svg.setAttribute("style", "top:" + top.toFixed(4) + "px; left:" + left.toFixed(4) + "px; width:" + width.toFixed(4) + "px; height:" + height.toFixed(4) + "px");
        const line = svg.getElementsByTagName("line")[0];
        if (x2 < x1 && y2 < y1) {
          // console.log("點 在 模型 的左上方");
          line.setAttribute("x2", "0");
          line.setAttribute("y1", "100%");

          line.setAttribute("x1", "100%");
          line.setAttribute("y2", "0");
        }
        if (x2 < x1 && y2 > y1) {
          // console.log("點 在 模型 的左下方");
          line.setAttribute("x2", "0");
          line.setAttribute("y1", "0");

          line.setAttribute("x1", "100%");
          line.setAttribute("y2", "100%");
        }
        if (x2 > x1 && y2 < y1) {
          // console.log("點 在 模型 的右上方");
          line.setAttribute("x2", "100%");
          line.setAttribute("y1", "100%");

          line.setAttribute("x1", "0");
          line.setAttribute("y2", "0");
        }
        if (x2 > x1 && y2 > y1) {
          // console.log("點 在 模型 的右下方");
          line.setAttribute("x2", "100%");
          line.setAttribute("y1", "0");

          line.setAttribute("x1", "0");
          line.setAttribute("y2", "100%");
        }
      });
    });

    return;
  },
};
const dom = {
  setTitle: function () {
    //刷新指引
    new Gear()["setTitle"]({
      text: "点击模型显示具体详情，可对详情窗体进行拖动以及拖拽放大操作",
      title: "详情框",
    });
  },
};
const drag = {
  init: function (id) {
    var dragDiv = document.getElementById(id);

    // 用于保存鼠标按下时鼠标位置与div左上角的偏移量
    var offsetX = 0;
    var offsetY = 0;

    // 鼠标按下时触发的函数
    function mouseDownHandler(e) {
      e = e || window.event;
      e.preventDefault();

      // 获取鼠标相对于div左上角的偏移量
      offsetX = e.clientX - dragDiv.offsetLeft;
      offsetY = e.clientY - dragDiv.offsetTop;

      // 当鼠标移动时触发mousemove事件
      document.addEventListener("mousemove", mouseMoveHandler);
      // 当鼠标松开时触发mouseup事件
      document.addEventListener("mouseup", mouseUpHandler);
    }

    // 鼠标移动时触发的函数
    function mouseMoveHandler(e) {
      e = e || window.event;
      e.preventDefault();

      // 计算div新的位置
      var x = e.clientX - offsetX;
      var y = e.clientY - offsetY;

      // 设置div的新位置
      dragDiv.style.left = x + "px";
      dragDiv.style.top = y + "px";
    }

    // 鼠标松开时触发的函数
    function mouseUpHandler(e) {
      e = e || window.event;

      // 移除mousemove和mouseup事件的监听器
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    }

    // 给div绑定mousedown事件处理函数
    dragDiv.addEventListener("mousedown", mouseDownHandler);
  },
  
};
window.onload = function () {
  G.create3D(
    {
      id: "mapBox",
      showGroundAtmosphere: true,
      debug: false,
      success: async function (_viewer) {
        window.viewer = _viewer;
        index.example("example_runshineAnalysis");
        index.init(_viewer);
        index.globeStyle(_viewer);
        let model = index.addTiles(_viewer);

        index.initLine(_viewer, model);

        drag.init("drag-container");
      },
    },
    Cesium
  );
};
