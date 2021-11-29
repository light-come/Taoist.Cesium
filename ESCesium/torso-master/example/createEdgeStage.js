init()
function init(){
	
}


// init();
// function init() {

//     console.log(create3D)

//         let dom = document.createElement("div");
//         dom.setAttribute("class", "map-container");
//         dom.setAttribute("style", "z-index: 999;");
//         dom.setAttribute("id", "mapBox");

//         // var dom = document.createTextNode('<div id="mapBox" class="map-container"  style="z-index: 999;"></div>');
// 	    window.document.body.appendChild( dom );
       

//         create3D({
//             id: 'mapBox',
//             showGroundAtmosphere: true,
//             debug: false,
//             success: function (_viewer) {
//                 _viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
//                 // _viewer.scene.globe.show = false;
//                 _viewer.scene.highDynamicRange = true;
//                 _viewer.scene.globe.baseColor =new Cesium.Color.fromCssColorString("#171744");
//                 // _viewer.scene.sun.show = false; //在Cesium1.6(不确定)之后的版本会显示太阳和月亮，不关闭会影响展示
//                 _viewer.scene.moon.show = false;
//                 _viewer.scene.skyBox.show = false;//关闭天空盒，否则会显示天空颜色
//                 _viewer.scene.backgroundColor =
//                   new Cesium.Color.fromCssColorString("#171744");
    
//             }
//         })
// }

// function render(viewer){

//     viewer.resolutionScale = devicePixelRatio;
//     viewer.postProcessStages.fxaa.enabled = true
//     viewer.scene.globe.depthTestAgainstTerrain = true
//     //entities
//     var box = viewer.entities.add({
//         position: Cesium.Cartesian3.fromDegrees(106.647382019240, 26.620452464821, 50),
//         box: {
//             dimensions: new Cesium.Cartesian3(100, 100, 100),
//             material: Cesium.Color.GREY
//         }
//     })
//     viewer.entities.add({
//         position: Cesium.Cartesian3.fromDegrees(106.647482019240, 26.621452464821, 50),
//         ellipsoid: {
//             radii: new Cesium.Cartesian3(50, 50, 50),
//             material: Cesium.Color.GREY
//         }
//     })
    
//     //3d tiles
//     var tileset = new Cesium.Cesium3DTileset({
//         url: Cesium.IonResource.fromAssetId(40866),
//     });
//     viewer.scene.primitives.add(tileset);
//     tileset.readyPromise.then(() => {
//         viewer.flyTo(tileset)
//     })
//     viewer.flyTo(box)
//     // viewer.homeButton.viewModel.command.beforeExecute.addEventListener(e => {
//     //     viewer.flyTo(box)
//     //     e.cancel = true
//     // })

//     //鼠标点击，拾取对象并高亮显示
//     viewer.screenSpaceEventHandler.setInputAction((e) => {
//         var mousePosition = e.position;
//         var picked = viewer.scene.pick(mousePosition)

//         edgeStage.selected = []
//         edgeStage.enabled = false

//         if (picked && picked.primitive) {

//             let primitive = picked.primitive
//             let pickIds = primitive._pickIds;
//             let pickId = picked.pickId;

//             if (!pickId && !pickIds && picked.content) {
//                 pickIds = picked.content._model._pickIds;
//             }
            
//             if (!pickId) {
//                 if (picked.id) {
//                     pickId = pickIds.find(pickId => {
//                         return pickId.object == picked;
//                     })
//                 } else if (pickIds) {
//                     pickId = pickIds[0]
//                 }
//             }

//             if (pickId) {
//                 let pickObject = {
//                     pickId: pickId
//                 }
//                 edgeStage.selected = [pickObject]
//                 cesiumStage.selected = [pickObject]
//                 edgeStage.enabled = !cesiumStage.enabled
//             } else {
//                 $message.alert('未找到pickId')
//             }

//         }

//     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

//     console.log(createEdgeStage)
//     var edgeStage = createEdgeStage()
//     edgeStage.visibleEdgeColor = Cesium.Color.fromCssColorString('#a8a8e0')
//     edgeStage.hiddenEdgeColor = Cesium.Color.fromCssColorString('#4d4d4d')
//     edgeStage.selected = []
//     edgeStage.enabled = false
//     viewer.postProcessStages.add(edgeStage);

//     var cesiumStage = Cesium.PostProcessStageLibrary.createSilhouetteStage()
//     cesiumStage.enabled = false;
//     viewer.postProcessStages.add(cesiumStage);

// }
