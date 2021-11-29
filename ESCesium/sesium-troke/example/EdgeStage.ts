/**
 * You can also import Cesium Object like this
 *
 * import * as Cesium from 'cesium';
 * const viewer = new Viewer('cesiumContainer');
 */
import * as Cesium from "cesium";
import * as T from "../src/taoist/core";
import createEdgeStage from "../src/stage/createEdgeStage";
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
            initBox(_viewer)

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
    function initBox(viewer:Cesium.Viewer) {
        //entities
        var box = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(106.647382019240, 26.620452464821, 50),
            box: {
                dimensions: new Cesium.Cartesian3(100, 100, 100),
                material: Cesium.Color.GREY
            }
        })
        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(106.647482019240, 26.621452464821, 50),
            ellipsoid: {
                radii: new Cesium.Cartesian3(50, 50, 50),
                material: Cesium.Color.GREY
            }
        })
        
        viewer.flyTo(box)
    }
    
    var edgeStage = createEdgeStage()
    edgeStage.visibleEdgeColor = Cesium.Color.fromCssColorString('#a8a8e0')
    edgeStage.hiddenEdgeColor =  Cesium.Color.fromCssColorString('#4d4d4d')
    edgeStage.selected = []
    edgeStage.enabled = false
    viewer.postProcessStages.add(edgeStage);
    var cesiumStage =  Cesium.PostProcessStageLibrary.createSilhouetteStage()
    cesiumStage.enabled = false;
    viewer.postProcessStages.add(cesiumStage);
    //鼠标点击，拾取对象并高亮显示
    viewer.screenSpaceEventHandler.setInputAction((e) => {
        var mousePosition = e.position;
        var picked = viewer.scene.pick(mousePosition)

        edgeStage.selected = []
        edgeStage.enabled = false
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
                edgeStage.selected = [pickObject]
                cesiumStage.selected = [pickObject]
                edgeStage.enabled = !cesiumStage.enabled
            } else {
               alert('未找到pickId')
            }

        }

    },  Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // //
    
    // console.log(createEdgeStage)

}
