/*第三方类库加载管理js，方便切换lib*/
(function () {
  window.WEBGL_DEBUG = false; //是否为调试模式
  window.WEBGL_Local = "http://127.0.0.1:8077";
  window.WEBGL_Server = "http://121.40.42.254:8008";

  var r = new RegExp("(^|(.*?\\/))(index.js)(\\?|$)"),
    s = document.getElementsByTagName("script"),
    targetScript;
  for (var i = 0; i < s.length; i++) {
    var src = s[i].getAttribute("src");
    if (src) {
      var m = src.match(r);
      if (m) {
        targetScript = s[i];
        break;
      }
    }
  }

  //当前版本号,用于清理浏览器缓存
  var cacheVersion = Date.parse(new Date());

  // cssExpr 用于判断资源是否是css
  var cssExpr = new RegExp("\\.css");

  function inputLibs(list) {
    if (list == null || list.length == 0) return;

    for (var i = 0, len = list.length; i < len; i++) {
      var url = list[i];
      if (cssExpr.test(url)) {
        var css = '<link rel="stylesheet" href="' + url +  (WEBGL_DEBUG ? "?time=" +cacheVersion : "") + '">';
        document.writeln(css);
      } else {
        var script = '<script type="text/javascript" src="' + url + (WEBGL_DEBUG ? "?time=" +cacheVersion : "") + '"><' + "/script>";
        document.writeln(script);
      }
    }
  }

  //加载类库资源文件
  function load() {
    var arrInclude = (targetScript.getAttribute("include") || "").split(",");
    var libpath = targetScript.getAttribute("libpath") || "";
    if (libpath.lastIndexOf("/") != libpath.length - 1) libpath += "/";

    var libsConfig = {
      Taoist: [
        libpath + "lib/Cesium/Cesium.js",
        libpath + "lib/Cesium/Widgets/widgets.css",

        libpath + "lib/Plugins/jQuery/jquery-3.5.1.min.js",
        libpath + "lib/Plugins/jQuery/JquerySession.js",

        libpath + "lib/Plugins/heatmap/heatmap.js",
        libpath + "lib/Plugins/Canvas2Image/Canvas2Image.js",
        libpath + "lib/Plugins/cesium-navigation/viewerCesiumNavigationMixin.js",
        libpath + "lib/Plugins/ViewShed/ViewShed3D.js",
        libpath + "lib/Plugins/ViewShed/sensor1.8x.js",
        libpath + "lib/Plugins/ViewShed/getCurrentMousePosition.js",

        libpath + "assets/css/taoist.mousezoom.css",

        libpath + "lib/Taoist.core-src.js",
        libpath + "lib/Taoist.control-src.js",
        libpath + "lib/Taoist.util-src.js",
        libpath + "lib/Taoist.positionHandler-src.js",
        libpath + "lib/Taoist.effect-src.js",
        libpath + "lib/Taoist.draw-src.js",
        libpath + "lib/Taoist.measure-src.js",
        libpath + "./example/example.js"
      ],
    };

    for (var i in arrInclude) {
      var key = arrInclude[i];
      inputLibs(libsConfig[key]);
    }

  }

  load();
})();
