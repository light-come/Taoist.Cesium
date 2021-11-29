/**
 * You can also import Cesium Object like this
 *
 * import * as Cesium from 'cesium';
 * const viewer = new Viewer('cesiumContainer');
 */
 import * as Cesium from "cesium";
 import * as GIS from "../src/taoist/core";
 import createUnrealBloomStage from "../src/bloom/createUnrealBloomStage";
//  const core = new taoist_core.Taoist();
 import "./css/taoist.mousezoom.css";
 window.onload = () =>{
     render('mapBox')
 }
 export function render(_id: string) {
    let setSelected = (postProcessStage:any,picked:any):void =>{
        postProcessStage.selected = []
        postProcessStage.enabled = false
        if (picked && picked.primitive) {
            
            let primitive = picked.primitive
            let pickIds = primitive._pickIds;
            let pickId = picked.pickId;

            if (!pickId && !pickIds && picked.content) {
                pickIds = picked.content._model._pickIds;
            }
            
            if (!pickId) {
                if (picked.id) {
                    pickId = pickIds.find(pickId => {
                        return pickId.object == picked;
                    })
                } else if (pickIds) {
                    pickId = pickIds[0]
                }
            }

            if (pickId) {
                let pickObject = {
                    pickId: pickId
                }
                postProcessStage.selected = [pickObject]
                postProcessStage.enabled = !postProcessStage.enabled
            } else {
               alert('未找到pickId')
            }

        }
    }
    let postProcessStage = createUnrealBloomStage( 'unrealBloom' )
    postProcessStage.enabled = false
     //  const viewer = new Viewer(_id);
     GIS.create3D({
         id: 'mapBox',
         showGroundAtmosphere: true,
         debug: false,
         success: function (_viewer) {
            _viewer.postProcessStages.add(postProcessStage);

            _water(_viewer)
 
            GIS.addBaseLayer(_viewer, {
                name: "影像底图",
                type: "mapbox", //www_google sl_geoq
                layer: "navigation", //satellite
                // crs: '4326',
                brightness: 1,
            });

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


     function planeGeometry(viewer) {

        var scene = viewer.scene;
        var dimensions = new Cesium.Cartesian3(400000.0, 300000.0, 1.0);
        var positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(116.3912, 39.920);
        var translateMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid);
        var scaleMatrix = Cesium.Matrix4.fromScale(dimensions);
        
        var planeModelMatrix = new Cesium.Matrix4();
        Cesium.Matrix4.multiply(translateMatrix, scaleMatrix, planeModelMatrix);
        
        // 创建平面
        var planeGeometry = new Cesium.PlaneGeometry({
            vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        });
        
        // 创建平面外轮廓
        var planeOutlineGeometry = new Cesium.PlaneOutlineGeometry();
        
        var planeGeometryInstance = new Cesium.GeometryInstance({
            geometry : planeGeometry,
            modelMatrix : planeModelMatrix,
            attributes : {
                color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5))
            }
        });
        
        scene.primitives.add(new Cesium.Primitive({
            geometryInstances : planeGeometryInstance,
            appearance : new Cesium.PerInstanceColorAppearance({
                closed: true
            })
        }));
        
        var planeOutlineGeometryInstance = new Cesium.GeometryInstance({
            geometry : planeOutlineGeometry,
            modelMatrix : planeModelMatrix,
            attributes : {
                color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0))
            }
        });
        
        var Geometry = scene.primitives.add(new Cesium.Primitive({
            geometryInstances : planeOutlineGeometryInstance,
            appearance : new Cesium.PerInstanceColorAppearance({
                flat : true,
                renderState : {
                    lineWidth : Math.min(2.0, scene.maximumAliasedLineWidth)
                }
            })
        }));
        Geometry.readyPromise.then(function () {
            setSelected(postProcessStage,{primitive:Geometry})
        }).otherwise(function (error) {
            console.log(error);
        });
        viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(positionOnEllipsoid, 300000));
     }
     function _water(viewer){

        // let ellipsoid = viewer.entities.add({
        //     id:"unrealBloom",
        //     position: Cesium.Cartesian3.fromDegrees(106.647482019240, 26.621452464821, 50),
        //     ellipsoid: {
        //         radii: new Cesium.Cartesian3(50, 50, 50),
        //         material: Cesium.Color.GREY
        //     }
        // })
        
            

        var scene = viewer.scene;
        scene.globe.depthTestAgainstTerrain = true;

        //创建球体
        let sphereGeometry = new Cesium.SphereGeometry({
            radius: 50,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
        });
        var positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(106.647482019240, 26.621452464821, 50);
        // 移到某个位置，抬高25万米
        var boxModelMatrix = Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
            new Cesium.Cartesian3(0.0, 0.0, 0), new Cesium.Matrix4());
       
        //Add Primitives
        let ellipsoid = scene.primitives.add(
            new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry : sphereGeometry,
                modelMatrix: boxModelMatrix,
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        Cesium.Color.RED.withAlpha(0.5)
                    ),
                },
            }),
            appearance: new Cesium.PerInstanceColorAppearance({
                closed: true,
            }),
            })
        );
       
   
        viewer.camera.flyTo({
            destination: positionOnEllipsoid, //经度、纬度、高度
            duration: 3,
        });
        // viewer.flyTo(ellipsoid)

        ellipsoid.readyPromise.then(function () {
            setSelected(postProcessStage,{primitive:ellipsoid})
        }).otherwise(function (error) {
            console.log(error);
        });

        
        viewer.screenSpaceEventHandler.setInputAction((e) => {
            var mousePosition = e.position;
            var picked = viewer.scene.pick(mousePosition)
            setSelected(postProcessStage,picked)
        },  Cesium.ScreenSpaceEventType.LEFT_CLICK)
       
       
     }
 
 }
 