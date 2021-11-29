import * as Cesium from "cesium";


export {
    create3D
    ,addBaseLayer
    ,hideBaseLayer
    ,showBaseLayer
    ,removeBaseLayer
    ,CZMLModels
    ,helloGltf
    ,byeGltf
    ,Query
    ,Query_X
    ,Rotate
    ,Revolution
    ,RevolutionRelease
    ,Go
}
export interface Options {
    Schrodinger?:{
        Rotate:Boolean,
        RotateExection:Function
    },
    viewer?:Cesium.Viewer,
    multiplier?: number,
    previousTime?: any,
    version?: string,
}
/**
* 默认设置
*/
export default class TaoistConfig implements Options {
    static Schrodinger : {
        Rotate:boolean,
        RotateExection:any
    };
    static previousTime : any = undefined;//球体时间 与旋转速度相关 与日照相关
    static version: string = "0.0.1";//版本号
    static viewer: Cesium.Viewer = undefined;//临时
    static multiplier: number = 200;//球体旋转速度
}
// Define a local copy of Taoist
export class Taoist{
    
    version: "0.0.1"
    static extend:Function
    static fn : {
        extend : any
    }
    prototype: any;
    constructor(
    ) {
            
    }
    
    //遍历器
    each( fn?:any ) : any  {
        let _this = (this as any)
        var length = _this.length;
        for(var i = 0; i < length; i++) {
            fn.call(_this[i], i, _this[i]);
        }
        return _this;
    }
    size(){//原型方法
        return (this as any).length;
    }


    static  create3D:Function
    static  addBaseLayer:Function
    static  hideBaseLayer:Function
    static  showBaseLayer:Function
    static  removeBaseLayer:Function
    static  CZMLModels:Function
    static  helloGltf:Function
    static  byeGltf:Function
    static  Query:Function
    static  Query_X:Function
    static  Rotate:Function
    static  Revolution:Function
    static  RevolutionRelease:Function
    static  Go:Function

};
Taoist.extend = function extend(obj : any)  {//Taoist.fn.extend =
    //obj是传递过来扩展到this上的对象
    var target = this;
    for (var name in obj){
        //name为对象属性
        //copy为属性值
        let copy = obj[name];
        //防止循环调用
        if(target === copy) continue;
        //防止附加未定义值
        if(typeof copy === 'undefined') continue;
        //赋值
        target[name] = copy;
    }
    return target;
};
const create3D = Taoist.create3D = (options: { id: string; showGroundAtmosphere: boolean; debug: boolean; success: (_viewer: any) => void; }) : Cesium.Viewer =>{
    //底部隐藏
    function _hideCesiumElement() {
        const array = [
            'cesium-viewer-toolbar','cesium-viewer-animationContainer','cesium-viewer-timelineContainer','cesium-viewer-bottom'
        ]
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if(document.getElementsByClassName(element).length >= 1){
                // HTMLElement Element
                let objs = document.getElementsByClassName(element)
                for (let index = 0; index < objs.length; index++) {
                    (objs[index] as HTMLAnchorElement)
                    .style.visibility="hidden"
                }
            }
        }
    }
    //设置鼠标的样式
    function _setMouseStyle(viewer?:Cesium.Viewer, container?:string) {
        //修改视图默认鼠标操作方式
        viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
        viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.PINCH, Cesium.CameraEventType.RIGHT_DRAG];
        // document.body.appendChild( renderer.domElement );

        let buff = document.createElement("div")
        let buff_1 = document.createElement("div")
        buff.setAttribute("class", "cesium-mousezoom")
        buff_1.setAttribute("class", "zoomimg")
        buff.appendChild(buff_1)
        document.getElementById(container).appendChild(buff);
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

        function getMousezoomElement(): HTMLAnchorElement {
            if(document.getElementsByClassName("cesium-mousezoom").length >= 1){
                // HTMLElement Element
                let objs = document.getElementsByClassName("cesium-mousezoom")
                for (let index = 0; index < objs.length; index++) {
                    let Element = (objs[index] as HTMLAnchorElement)
                    return Element
                }
            
            }
            return undefined
        }
        //按住鼠标右键
        handler.setInputAction(function (event) {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            let element = getMousezoomElement()
            if(element){
                element.style.top= (event.position.y + 'px')
                element.style.left= (event.position.x + 'px')
                element.className = 'cesium-mousezoom cesium-mousezoom-visible';
            }
        
        }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
        //抬起鼠标右键
        handler.setInputAction(function (event) {
            let element = getMousezoomElement()
            handler.setInputAction(function (evnet) {
                if(element){
                    element.style.top= (evnet.endPosition.y + 'px')
                    element.style.left= (evnet.endPosition.x + 'px')
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            element.className = 'cesium-mousezoom';
        }, Cesium.ScreenSpaceEventType.RIGHT_UP);

        //按住鼠标中键
        handler.setInputAction(function (event) {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            let element = getMousezoomElement()
            if(element){
                element.style.top= (event.position.y + 'px')
                element.style.left= (event.position.x + 'px')
                element.className = 'cesium-mousezoom cesium-mousezoom-visible';
            }
        }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
        //抬起鼠标中键
        handler.setInputAction(function (event) {
            let element = getMousezoomElement()
            handler.setInputAction(function (evnet) {
                if(element){
                    element.style.top= (evnet.endPosition.y + 'px')
                    element.style.left= (evnet.endPosition.x + 'px')
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            element.className = 'cesium-mousezoom';
        }, Cesium.ScreenSpaceEventType.MIDDLE_UP);

        //滚轮滚动
        handler.setInputAction(function (evnet) {
            let element = getMousezoomElement()
            handler.setInputAction(function (evnet) {
                if(element){
                    element.style.top= (evnet.endPosition.y + 'px')
                    element.style.left= (evnet.endPosition.x + 'px')
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            element.className = 'cesium-mousezoom cesium-mousezoom-visible';
            setTimeout(function () {
                element.className = 'cesium-mousezoom';
            }, 200);
        }, Cesium.ScreenSpaceEventType.WHEEL);
    }
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGZiOTc1NS0zZmZlLTQ4MzUtODFlMS00ZDI2NWE5YTFkZjIiLCJpZCI6MTgwMDUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzMxMTcwODd9.WPytI-wsAoBmC7NLmz01l0GcYoh3bvTES7z1yZQgGMM';
    //初始化部分参数 如果没有就默认设为false;
    var args = ["geocoder", "homeButton", "sceneModePicker", "baseLayerPicker", "navigationHelpButton", "animation", "timeLine", "fullscreenButton", "vrButton", "infoBox", "selectionIndicator", "shadows"];
    for (var i = 0; i < args.length; i++) {
        if (!(options as any)[args[i]]) {
            (options as any)[args[i]] = false;
        }
    }
    (options as any)["shouldAnimate"] = true; //飞行漫游启动 viewer动画效果
    var container = options["id"];
    //创建viewer
    let viewer = new Cesium.Viewer(container, options as any);
    /**对Cesium的改造 *******************************************************************/
    //隐藏Cesium原有的一些控件，默认只剩一个球
    _hideCesiumElement();

    //设置鼠标的样式，在使用滚轮及右键对地球缩放或旋转时在鼠标位置添加一个图标
    _setMouseStyle(viewer, container);

    //解决限定相机进入地下
    viewer.camera.changed.addEventListener(function () {
        if ((viewer.camera as any)._suspendTerrainAdjustment && viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
            (viewer.camera as any)._suspendTerrainAdjustment = false;
            (viewer.camera as any)._adjustHeightForTerrain();
        }
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;
    //开启hdr
    viewer.scene.highDynamicRange = true;

    viewer.scene.globe.enableLighting = true;

    //。。。
    const FeatureDetection = Cesium.FeatureDetection as any
    // 分辨率调整函数
    if(FeatureDetection.supportsImageRenderingPixelated()){//判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio;
    }
    //是否开启抗锯齿
    // viewer.scene.fxaa = true;
    viewer.scene.postProcessStages.fxaa.enabled = true;

    const cesiumWidget = viewer.cesiumWidget as any
    var supportsImageRenderingPixelated = cesiumWidget._supportsImageRenderingPixelated;
    if (supportsImageRenderingPixelated) {
        var vtxf_dpr = window.devicePixelRatio;
        while (vtxf_dpr >= 2.0) { vtxf_dpr /= 2.0; }
        viewer.resolutionScale = vtxf_dpr;
    }


    //移除默认的bing影像图层
    viewer.imageryLayers.removeAll();
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());

    //是否关闭大气效果
    if (options.showGroundAtmosphere && options.showGroundAtmosphere == true) {
        viewer.scene.globe.showGroundAtmosphere = true;
    } else {
        viewer.scene.globe.showGroundAtmosphere = false;
    }

    /************************Debug模式 */
    //debug模式，显示实时帧率
    if (options.debug) {
        viewer.scene.debugShowFramesPerSecond = true;
    }

    (viewer as any).config = options;
    /************************回调函数 */
    //加载成功后回调函数
    if (options.success) {
        options.success(viewer);
    }
    return viewer;
};
/**
 * 添加地图底图图层
 * @param {Object} viewer
 * @param {Object} options
 */
const addBaseLayer = Taoist.addBaseLayer = (viewer:Cesium.Viewer, options:any) => {
    var imageryProvider = createImageryProvider(options);

    var imageryOption :any = {
        show: true,
        alpha: (options.opacity ? 1 : options.opacity),
    };
    if (options.rectangle && options.rectangle.xmin && options.rectangle.xmax && options.rectangle.ymin && options.rectangle.ymax) {
        var xmin = options.rectangle.xmin;
        var xmax = options.rectangle.xmax;
        var ymin = options.rectangle.ymin;
        var ymax = options.rectangle.ymax;
        var rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
        imageryOption.rectangle = rectangle;
    }
    if (options.brightness)
        imageryOption.brightness = options.brightness;
    if (options.minimumTerrainLevel)
        imageryOption.minimumTerrainLevel = options.minimumTerrainLevel;
    if (options.maximumTerrainLevel)
        imageryOption.maximumTerrainLevel = options.maximumTerrainLevel;
    var layer = new Cesium.ImageryLayer(imageryProvider, imageryOption);
    (layer as any).config = options;
    console.log(layer)
    viewer.imageryLayers.add(layer);

    return layer;
}
/**
 * 添加地图底图图层
 * @param {Object} config
 */
//创建地图底图
function createImageryProvider(config:any) {
    let options : any = {}
    for (var key in config) {
        var value = config[key];
        if (value == null) return;

        switch (key) {
            case 'crs':
                if (value == '4326' || value.toUpperCase() == 'EPSG4326') {
                    options.tilingScheme = new Cesium.GeographicTilingScheme({
                        numberOfLevelZeroTilesX: config.numberOfLevelZeroTilesX || 2,
                        numberOfLevelZeroTilesY: config.numberOfLevelZeroTilesY || 1
                    });
                } else {
                    options.tilingScheme = new Cesium.WebMercatorTilingScheme({
                        numberOfLevelZeroTilesX: config.numberOfLevelZeroTilesX || 2,
                        numberOfLevelZeroTilesY: config.numberOfLevelZeroTilesY || 1
                    });
                }
                break;
            case 'rectangle':
                options.rectangle = Cesium.Rectangle.fromDegrees(value.xmin, value.ymin, value.xmax, value.ymax);
                break;
            default:
                options[key] = value;
                break;
        }
    }

    if (options.proxy) {
        options.url = new Cesium.Resource({
            url: options.url,
            proxy: options.proxy
        });
    }
    var layer : any;
    switch (options.type) {
        case 'image':
            layer = new Cesium.SingleTileImageryProvider(options);
            break;
        case 'xyz':
        case 'tile':
            options.customTags = {
                "z&1": function z1(level: number) {
                    return level + 1;
                }
            };
            layer = new Cesium.UrlTemplateImageryProvider(options);
            break;
        case 'wms':
            layer = new Cesium.WebMapServiceImageryProvider(options);
            break;
        case 'wmts':
            layer = new Cesium.WebMapTileServiceImageryProvider(options);
            break;
        case "arcgis":
        case "arcgis_tile":
        case "arcgis_dynamic":
            layer = new Cesium.ArcGisMapServerImageryProvider(options);
            break;
        case "arcgis_cache":
            if (!(Cesium.UrlTemplateImageryProvider as any).padLeft0) {
                (Cesium.UrlTemplateImageryProvider as any).padLeft0 = function (numStr: string | any[], n: number) {
                    numStr = String(numStr);
                    var len = numStr.length;
                    while (len < n) {
                        numStr = "0" + numStr;
                        len++;
                    }
                    return numStr;
                };
            }
            options.customTags = {
                //小写
                arc_x: function arc_x(imageryProvider: { padLeft0: (arg0: any, arg1: number) => any; }, x: { toString: (arg0: number) => any; }, y: any, level: any) {
                    return imageryProvider.padLeft0(x.toString(16), 8);
                },
                arc_y: function arc_y(imageryProvider: { padLeft0: (arg0: any, arg1: number) => any; }, x: any, y: { toString: (arg0: number) => any; }, level: any) {
                    return imageryProvider.padLeft0(y.toString(16), 8);
                },
                arc_z: function arc_z(imageryProvider: { padLeft0: (arg0: any, arg1: number) => any; }, x: any, y: any, level: { toString: () => any; }) {
                    return imageryProvider.padLeft0(level.toString(), 2);
                },
                //大写
                arc_X: function arc_X(imageryProvider: { padLeft0: (arg0: any, arg1: number) => string; }, x: { toString: (arg0: number) => any; }, y: any, level: any) {
                    return imageryProvider.padLeft0(x.toString(16), 8).toUpperCase();
                },
                arc_Y: function arc_Y(imageryProvider: { padLeft0: (arg0: any, arg1: number) => string; }, x: any, y: { toString: (arg0: number) => any; }, level: any) {
                    return imageryProvider.padLeft0(y.toString(16), 8).toUpperCase();
                },
                arc_Z: function arc_Z(imageryProvider: { padLeft0: (arg0: any, arg1: number) => string; }, x: any, y: any, level: { toString: () => any; }) {
                    return imageryProvider.padLeft0(level.toString(), 2).toUpperCase();
                }
            };
            layer = new Cesium.UrlTemplateImageryProvider(options);
            break;
        case "www_gaode":
            //高德
            var _url;
            switch (options.layer) {
                case "vec":
                default:
                    //style=7是立体的，style=8是灰色平面的
                    _url = 'http://' + (options.bigfont ? 'wprd' : 'webrd') + '0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
                    break;
                case "img_d":
                    _url = 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
                    break;
                case "img_z":
                    _url = 'http://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8';
                    break;
                case "time":
                    var time = new Date().getTime();
                    _url = 'http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=' + time;
                    break;
            }

            layer = new Cesium.UrlTemplateImageryProvider({
                url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                subdomains: ['1', '2', '3', '4'],
                maximumLevel: 18
            });
            break;
        case "www_google":
            //谷歌国内
            var _url;

            if (config.crs == '4326' || config.crs == 'wgs84') {
                //wgs84   无偏移
                switch (options.layer) {
                    default:
                    case "img_d":
                        _url = 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}';
                        break;
                }
            } else {
                //有偏移
                switch (options.layer) {
                    case "vec":
                    default:
                        _url = 'http://mt{s}.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile';
                        break;
                    case "img_d":
                        _url = 'http://mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Gali';
                        break;
                    case "img_z":
                        _url = 'http://mt{s}.google.cn/vt/imgtp=png32&lyrs=h@207000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil';
                        break;
                    case "ter":
                        _url = 'http://mt{s}.google.cn/vt/lyrs=t@131,r@227000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galile';
                        break;
                }
            }

            layer = new Cesium.UrlTemplateImageryProvider({
                url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                subdomains: ['1', '2', '3'],
                maximumLevel: 20
            });
            break;
        case "www_osm":
            //OSM开源地图
             _url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            layer = new Cesium.UrlTemplateImageryProvider({
                url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                subdomains: "abc",
                maximumLevel: 18
            });
            break;
        case "www_geoq":
            //智图开源地图
             _url = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}';
            layer = new Cesium.UrlTemplateImageryProvider({
                url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                subdomains: "abc",
                maximumLevel: 18
            });
            break; 
        case "thematic_geoq":
            //智图水系开源地图
             _url = 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}';
            layer = new Cesium.UrlTemplateImageryProvider({
                url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                subdomains: "abc",
                maximumLevel: 18
            }); 
        case "sl_geoq":
            //智图深蓝开源地图
             _url = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
            layer = new Cesium.UrlTemplateImageryProvider({
                url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                subdomains: "abc",
                maximumLevel: 18
            });
            break;
        case "local":
            //本地
             _url = options.url + '/{z}/{y}/{x}.png';
            layer = new Cesium.UrlTemplateImageryProvider({
                url: options.proxy ? new Cesium.Resource({ url: _url, proxy: options.proxy }) : _url,
                subdomains: "abc",
                maximumLevel: 18
            });
            break;
        case "tdt":
            //天地图
            var _url
            // 添加mapbox自定义地图实例 mapbox://styles/1365508153/ckmy004lc1bsj17n94k80cfik
            switch (options.layer) {
                case 'satellite':
                    break;
                case 'navigation': 
                    _url = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    break;
                case 'blue':
                    // _url = "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer?tk=d97070ed5b0f397ed2dd8317bcbb486d";
                    _url = "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
                    break;       
                case 'terrain':
                    break;      
            }
        

            layer = new Cesium.UrlTemplateImageryProvider({
                url: _url,
                subdomains: "abc",
                maximumLevel: 18
            });
            break;
        case "mapbox":
            //mapboxgl的底图
            var style;
            // 添加mapbox自定义地图实例 mapbox://styles/1365508153/ckmy004lc1bsj17n94k80cfik
            var config : any = {
                url:'https://api.mapbox.com/styles/v1',
                username:'1365508153',
                styleId: style,
                accessToken: 'pk.eyJ1IjoiMTM2NTUwODE1MyIsImEiOiJja214ejg5ZWMwZGhqMnJxa3F3MjVuaTJqIn0.ERt-vJ_qoD10EP5CvwsEzQ',
                scaleFactor:true,
            }
            switch (options.layer) {
                case 'satellite':
                    style =  'ckmy0yizu18bx17pdcfh81ikn';
                    break;
                case 'navigation': 
                    style =  'ckmy0li0j1cd717la2xd0mamg';
                    break;
                case 'blue':
                    style =  'ckmy004lc1bsj17n94k80cfik';
                    break;       
                case 'terrain':
                    style =  'ckn9dnm5b2m9a17o0nijfqbl3';
                    default:
                    config.styleId = options.layer;
                    config.accessToken = options.accessToken
                    config.username = options.username
                    break;
            }
            config.styleId = style
            layer=new Cesium.MapboxStyleImageryProvider(config);
            break;
    }
    layer.config = options;
    layer.brightness = options.brightness;
    return layer;
}
/**
 * 隐藏指定的底图图层
 * @param {Object} viewer
 * @param {Object} layer (图层名字或图层对象)
 */
const hideBaseLayer = Taoist.hideBaseLayer = (viewer:Cesium.Viewer, layer:any) => {
    if (layer instanceof Cesium.ImageryLayer) {
        layer.show = false;
    } else {
        for (var i = 0; i < viewer.imageryLayers.length; i++) {
            var name = (viewer.imageryLayers.get(i) as any).config.name;
            if (name == layer) {
                viewer.imageryLayers.get(i).show = false;
            }
        }
    }
}
/**
 * 显示指定的底图图层
 * @param viewer
 * @param layer (图层名字或图层对象)
 */
const showBaseLayer = Taoist. showBaseLayer = (viewer:Cesium.Viewer, layer:any) =>{
    if (layer instanceof Cesium.ImageryLayer) {
        layer.show = true;
    } else {
        for (var i = 0; i < viewer.imageryLayers.length; i++) {
            var name = (viewer.imageryLayers.get(i) as any).config.name;
            if (name == layer) {
                viewer.imageryLayers.get(i).show = true;
            }
        }
    }
}
/**
 * 移除指定的底图图层
 * @param {Object} viewer
 * @param {Object} layer (图层名字或图层对象)
 */
 const removeBaseLayer = Taoist. removeBaseLayer = (viewer:Cesium.Viewer, layer:any) => {
    if (layer instanceof Cesium.ImageryLayer) {
        viewer.imageryLayers.remove(layer);
    } else {
        for (var i = 0; i < viewer.imageryLayers.length; i++) {
            var name = (viewer.imageryLayers.get(i) as any).config.name;
            if (name == layer) {
                viewer.imageryLayers.remove(viewer.imageryLayers.get(i));
            }
        }
    }
}


/**
 * 批量添加czml模型
 * @param {Object} viewer
 * @param {Object} options (图层名字或图层对象)
 */
 const CZMLModels = Taoist. CZMLModels=(viewer:Cesium.Viewer,options:any)=>{
    let models: any[];
    options.ts.forEach((element: { id: any; x: any; y: any; z: any; url: any; scale: any; }) => {

        var czml = [
            {
                id: "document",
                name: "CZML Model",
                version: "1.0",
            },
            {
                id: element.id ,
                name: "Cesium Air",
                position: {
                    cartographicDegrees: [element.x , element.y, element.z],
                },
                model: {
                    gltf: element.url,
                    scale: element.scale,
                    //minimumPixelSize: 128,
                },
            },
            ];
        
        var dataSourcePromise = viewer.dataSources.add(
            Cesium.CzmlDataSource.load(czml)
        );

        // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        //     Cesium.Cartesian3.fromDegrees(element.x , element.y, element.z));
        // var model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
        //     id :element.id,
        //     url: element.url,
        //     modelMatrix: modelMatrix,
        //     scale: element.scale
        // }));
        models.push(dataSourcePromise)
    });
    return models;

}

/**
 * 添加Gltf
 * @param {Object} viewer
 * @param {Object} options (坐标参数，模型地址及，模型朝向)
 */
 const helloGltf = Taoist. helloGltf=(viewer:Cesium.Viewer,options:any) =>{
    var model = viewer.scene.primitives.add(Cesium.Model.fromGltf({
        url: options.url,
        modelMatrix:  Cesium.Transforms.headingPitchRollToFixedFrame(
            Cesium.Cartesian3.fromDegrees(options.position.x , options.position.y, options.position.z),
            new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(options.position.h == null ? 0 : options.position.h), 
                Cesium.Math.toRadians(options.position.p == null ? 0 : options.position.p), 
                Cesium.Math.toRadians(options.position.r == null ? 0 : options.position.r)
            ),
            Cesium.Ellipsoid.WGS84,
            Cesium.Transforms.localFrameToFixedFrameGenerator(
                "north",
                "west"
            )
        ),
        scale: options.scale
    }));
    return model;
}
/**
 * 移除Gltf
 * @param {Object} viewer
 * @param {Object} options (模型名字或模型对象)
 */
 const byeGltf = Taoist. byeGltf=(viewer:Cesium.Viewer,Gltf:any)=>{
    if (Gltf instanceof Cesium.Cesium3DTileset) {
        if (viewer.scene.primitives.contains(Gltf)) {
            viewer.scene.primitives.remove(Gltf);
        }
    } else {
        for (var i = 0; i < viewer.scene.primitives.length; i++) {
            var name = viewer.scene.primitives.get(i).config.id;
            if (name == Gltf) {
                viewer.scene.primitives.remove(viewer.scene.primitives.get(i));
            }
        }
    }
}

/**
 * 根据id查询scene模型,Entities模型
 * @param {Object} viewer
 * @param {Object} options (坐标参数，模型地址及，模型朝向)
 */
const Query = Taoist. Query=(viewer:Cesium.Viewer,options:any)=>{
    if(!options)
    {
        return[viewer.scene.primitives,(viewer.entities as any)._entities._array]
    }
    for (var i = 0; i < viewer.scene.primitives.length; i++) {
        if (viewer.scene.primitives.get(i).id == options.id) {
            return viewer.scene.primitives.get(i);
        }
    }
    var entitys = (viewer.entities as any)._entities._array;
    for (var i = 0; i < entitys.length; i++) {
        if (entitys[i]._id === options.id) {
            return entitys[i];
        }
    }
    return null
}

/**
 * 根据自定义类型查询模型数组
 * @param  {Object} viewer
 * @param  {Object} options (坐标参数，模型地址及，模型朝向)
 */
 const Query_X = Taoist. Query_X=(viewer:Cesium.Viewer,options:any)=>{
    if(!options)
    {
        return[viewer.scene.primitives,(viewer.entities as any)._entities._array]
    }
    var entitys = (viewer.entities as any)._entities._array;
    var _arr = [];
    for (var i = 0; i < entitys.length; i++) {
        if(entitys[i][Object.keys(options)[0]] === options[Object.keys(options)[0]]){
                _arr.push(entitys[i])
        }
        
    }

    for (var i = 0; i < viewer.scene.primitives.length; i++) {
        if(viewer.scene.primitives.get(i)[Object.keys(options)[0]] === options[Object.keys(options)[0]]){
            _arr.push(viewer.scene.primitives.get(i))
        }
        
    }
    return _arr;
} 


/**
 * 绕点旋转
 * @param {Object} viewer
 */
const Rotate = Taoist.Rotate=(viewer:Cesium.Viewer) =>{

    let Exection = TaoistConfig.Schrodinger.RotateExection
    let state = TaoistConfig.Schrodinger.Rotate = false
    function initAutoRotateParameters(options:any, viewer:Cesium.Viewer) {
        if (state) {
            state = false;
            viewer.clock.onTick.removeEventListener(Exection);
            return;
        } else state = true;
        var position = Cesium.Cartesian3.fromDegrees(options.x, options.y, options.z);

        // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
        var pitch = Cesium.Math.toRadians(-30);
        // 给定飞行一周所需时间，比如30s, 那么每秒转动度数
        var angle = 360 / 90;
        // 给定相机距离点多少距离飞行，这里取值为5000m
        var distance = viewer.camera.positionCartographic.height;
        var startTime = Cesium.JulianDate.fromDate(new Date());

        // var stopTime = Cesium.JulianDate.addSeconds(startTime, 10, new Cesium.JulianDate());

        viewer.clock.startTime = startTime.clone();  // 开始时间
        // viewer.clock.stopTime = stopTime.clone();     // 结速时间
        viewer.clock.currentTime = startTime.clone(); // 当前时间
        viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
        // 相机的当前heading
        var initialHeading = viewer.camera.heading;
        Exection = () => {
            // 当前已经过去的时间，单位s
            var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
            var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
            viewer.scene.camera.setView({
                destination: position, // 点的坐标
                orientation: {
                    heading: heading,
                    pitch: pitch,
                }
            });
            viewer.scene.camera.moveBackward(distance);

            if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
                viewer.clock.onTick.removeEventListener(Exection);
            }
        };
        viewer.clock.onTick.addEventListener(Exection);
    }
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        if(viewer.scene.pickPosition(movement.position)){
            var cartographic = Cesium.Cartographic.fromCartesian(viewer.scene.pickPosition(movement.position));
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;//模型高度
            var mapPosition = { x: lng, y: lat, z: 0 }
            initAutoRotateParameters(mapPosition, viewer);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    return initAutoRotateParameters;
}
//球体事件
function onTickCallback() {
    if(!TaoistConfig.viewer && !TaoistConfig.previousTime)return
    var spinRate = 1;
    var currentTime = TaoistConfig.viewer.clock.currentTime.secondsOfDay;
    var delta = (currentTime - TaoistConfig.previousTime) / 1000;
    TaoistConfig.previousTime = currentTime;
    TaoistConfig.viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
}
/**
 * 球体自转
 * @param {Object} viewer
 */
const Revolution = Taoist. Revolution=()=> {
    function setvisible(viewer:Cesium.Viewer,value: string,time?: number) {
        if(!TaoistConfig.previousTime)return
        TaoistConfig.previousTime = viewer.clock.currentTime.secondsOfDay;
        switch (value) {
            case 'play':
                viewer.clock.multiplier = TaoistConfig.multiplier; //速度
                viewer.clock.onTick.addEventListener(onTickCallback);
                break;
            case 'stop':
                viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
                viewer.clock.multiplier = 1; //速度
                viewer.clock.onTick.removeEventListener(onTickCallback);
                break;
            case'delayed':
                setvisible(viewer,"play");
                setTimeout(() => {
                    setvisible(viewer,"stop");
                }, time == null ? 6000 : time);

                break;
        }
    }
    return setvisible;
}
//销毁自转效果
const RevolutionRelease = Taoist. RevolutionRelease=(viewer:Cesium.Viewer)=> {
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
    viewer.clock.multiplier = 1; //速度
    viewer.clock.onTick.removeEventListener(onTickCallback);
}

/**
*坐标定位
* @param viewer 地图对象
* @param mapPosition 坐标对象要包含xyzhpr duration
*/
const Go = Taoist.Go = (viewer:Cesium.Viewer,mapPosition:any) =>{
    var timer = setInterval(() => {
        try {
            if(viewer.clock.multiplier == 1 || mapPosition.force){
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(mapPosition.x, mapPosition.y, mapPosition.z), //经度、纬度、高度
                    orientation: {
                        heading: 0 + mapPosition.h, //绕垂直于地心的轴旋转
                        pitch: 0 + mapPosition.p, //绕纬度线旋转
                        roll: 0 + mapPosition.r//绕经度线旋转
                    },
                    duration: 0 + mapPosition.duration
                });
                clearInterval(timer)
            }
        } catch (error) {
            clearInterval(timer)
            console.error({e:error,message:"定位异常"})
        }
    }, 10);
}
