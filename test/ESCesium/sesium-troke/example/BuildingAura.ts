/**
 * You can also import Cesium Object like this
 *
 * import * as Cesium from 'cesium';
 * const viewer = new Viewer('cesiumContainer');
 */
 import * as Cesium from "cesium";
 import * as T from "../src/taoist/core";
 import * as effect from "../src/taoist/effect";

 import "./css/taoist.mousezoom.css";
 window.onload = () =>{
     render('mapBox')
 }
 export function render(_id: string) {
     // const viewer = new Viewer(_id);
     let viewer = T.create3D({
         id: 'mapBox',
         showGroundAtmosphere: true,
         debug: false,
         success: function (_viewer) {
            add3dtiles(_viewer)
 
             _viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
             // _viewer.scene.globe.show = false;
             _viewer.scene.highDynamicRange = true;
             _viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#171744");
             // _viewer.scene.sun.show = false; //在Cesium1.6(不确定)之后的版本会显示太阳和月亮，不关闭会影响展示
             _viewer.scene.moon.show = false;
             _viewer.scene.skyBox.show = false;//关闭天空盒，否则会显示天空颜色
             _viewer.scene.backgroundColor =
               Cesium.Color.fromCssColorString("#171744");
 
         }
     })
     
     function add3dtiles(viewer:Cesium.Viewer) {
        //加载杭州高程地形
        var provider = new Cesium.CesiumTerrainProvider({
            url: 'http://192.168.2.15:57433/HZ%E5%9C%B0%E5%BD%A2%E5%88%87%E7%89%87/%E5%9C%B0%E5%BD%A2%E5%88%87%E7%89%87/',
            requestWaterMask : true,//开启法向量
            requestVertexNormals : true//开启水面特效
        });
        viewer.terrainProvider = provider;
        var tiles =  T.add3DTiles(viewer, {
            name: "倾斜摄影",
            url: 'http://192.168.2.15:57433/%E6%9D%AD%E5%B7%9E%E7%9F%A2%E9%87%8F%E6%A8%A1%E5%9E%8B/tileset.json',
            flyTo: true,
            heightOffset:0,
            height: 0,
            monomer:true
        },{
            color: "color('white', 1)",
            show: true
        })
        T.addBaseLayer(viewer, {
            name: "影像底图",
            type: "mapbox", //www_google sl_geoq
            layer: "navigation", //satellite
            // crs: '4326',
            brightness: 1,
        });
        var setvisible = effect.runshineAnalysis();
            setvisible(viewer,"play");//stop
            effect.Aura(viewer,tiles)
     }
 
       
         
     
 
 }
 