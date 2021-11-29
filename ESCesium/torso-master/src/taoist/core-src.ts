/**
 * You can also import Cesium Object like this
 *
 * import * as Cesium from 'cesium';
 * const viewer = new Cesium.Viewer('cesiumContainer');
 */
import { Viewer } from "cesium";
init()
function init() {
    let dom = document.createElement("div");
    dom.setAttribute("class", "map-container");
    dom.setAttribute("style", "z-index: 999;");
    dom.setAttribute("id", "mapBox");
    window.document.body.appendChild( dom );
}
export function render(_id: any) {
    const viewer = new Viewer(_id);
}
