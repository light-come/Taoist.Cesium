
/*!
 * Control JavaScript Library v0.0.1
 * Date: 20211025
 */
(function() {
    const version = "0.0.1"
    let BOLT = { expando: "BOLT" + ( version + Math.random() ).replace( /\D/g, "" )}
    G.extend({
        BOLT
    } );
 
     /**
     * 
     * @param {*} viewer 
     * @param {*} opt 
     *      opt.type：类型，默认为1，即为鼠标移动提示框；type=2 ，定点提示框
     *      opt.popupCartesian : 定点提示框的位置（Cartesian3），仅当opt.type=2时可用
     *      opt.content ： 框内所展示的信息 （可传入html标签、也可以传入文本）
     *      opt.style : 为框体的相关样式 （即css样式）
     *      opt.show ： 是否显示框体
     */
    BOLT.MovePrompt = window.MovePrompt = function (viewer, opt) {
        if (!opt) opt = {};
        
        var randomId = opt.id == null ?  VMSDS.core.uuid() : opt.id;
        this.innerHTML = opt.innerHTML;
        this.id = randomId;
        this.style = opt.style;
        this.viewer = viewer;
        if (!this.viewer) return;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.mapContainer = this.viewer.container.id;
        this.rendHandler = null;
        if (!this.mapContainer) return;

        this.trackPopUpId = "trackPopUp" + randomId;
        this.promptContentId = "promptContent" + randomId;
        this.promptDivId = "promptDiv" + randomId;
        this.trackPopUpContentId = "trackPopUpContent" + randomId;
        this.closeBtnId = "closeBtn" + randomId;

        var infoDiv;
        var max_width = 300;
        var max_height = 500;
        infoDiv = win.document.createElement("div");
        infoDiv.id = this.trackPopUpId;
        infoDiv.className = "trackPopUp";

        this.content = opt.content || ""; //提示框内容

        

        if(opt.innerHTML == undefined || opt.innerHTML== null){
            if (!opt.type || opt.type == 1) {
                infoDiv.innerHTML = `<div id="` + this.trackPopUpContentId + `" class="cesium-popup" style="top:0;left:0;"><div class="cesium-prompt-content-wrapper" id="` + this.promptDivId + `"><div id="trackPopUpLink" class="cesium-popup-content" style=""><span class="promptContent" id="` + this.promptContentId + `">` + this.content + `</span></div></div></div>`;
            } else {
                infoDiv.innerHTML = `<div id="` + this.trackPopUpContentId + `" class="cesium-popup" style="top:0;left:0;"><a class="cesium-popup-close-button" href="javascript:void(0)" id="` + this.closeBtnId + `">×</a><div class="cesium-popup-content-wrapper" id="` + this.promptDivId + `"><div id="trackPopUpLink" class="cesium-popup-content" style=""><span class="popupContent" id="` + this.promptContentId + `" >` + this.content + `</span></div></div><div class="cesium-popup-tip-container"><div class="cesium-popup-tip"></div></div></div>`;
            }
        }else{
            if (!opt.type || opt.type == 1) {
                infoDiv.innerHTML = this.innerHTML[0]
            } else {
                infoDiv.innerHTML  = this.innerHTML[1]
            }
        }
        infoDiv.innerHTML = infoDiv.innerHTML.replace(/this.trackPopUpContentId/g,this.trackPopUpContentId)
        infoDiv.innerHTML = infoDiv.innerHTML.replace(/this.promptDivId/g,this.promptDivId)
        infoDiv.innerHTML = infoDiv.innerHTML.replace(/this.promptContentId/g,this.promptContentId)
        infoDiv.innerHTML = infoDiv.innerHTML.replace(/this.content/g,this.content)
        infoDiv.innerHTML = infoDiv.innerHTML.replace(/this.closeBtnId/g,this.closeBtnId)
        
        win.document.getElementById(this.mapContainer).appendChild(infoDiv);
        win.document.getElementById(this.trackPopUpId).style.display = "block";

        this.offset = opt.offset || {};

        this.infoDiv = win.document.getElementById(this.trackPopUpId);
        this.trackPopUpContent = win.document.getElementById(this.trackPopUpContentId);

        this.promptDiv = win.document.getElementById(this.promptDivId);
        this.promptContent = win.document.getElementById(this.promptContentId);
        this.trackPopUpLink = win.document.getElementById(this.promptContentId);

        this.popupCartesian = opt.popupCartesian;
        this.rendHandler = null;
        this.show = (opt.show == undefined ? true : opt.show);
        if (opt.type == 2) {
            if (!this.popupCartesian) {
                console.warn("缺少空间坐标！");
                return;
            }
        }
        if (opt.type && opt.type != 1 && this.popupCartesian) {
            // this.popupCartesian = this.getPosition(this.popupCartesian) || this.popupCartesian;

            var that = this;
            win.document.getElementById(that.closeBtnId).addEventListener("click", function () {
                that.setVisible(false);
            });
            
            var offsetHeight = -(Math.ceil(this.trackPopUpContent.offsetHeight));
            var offsetWidth = -(Math.ceil(this.trackPopUpContent.offsetWidth / 2));

            this.rendHandler = this.viewer.scene.postRender.addEventListener(function () {
                if (that.popupCartesian) {
                    var px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(that.scene, that.popupCartesian);
                    if (px != null) {
                        that.trackPopUpContent = win.document.getElementById(that.trackPopUpContentId)
                        // console.log(that.trackPopUpContent.offsetHeight,that.trackPopUpContent.clientHeight)
                        that.trackPopUpContent.style.left = px.x + (that.offset.x || 0) + offsetWidth + "px";
                        that.trackPopUpContent.style.top = px.y + (that.offset.y || 0) + offsetHeight + "px";
                    }

                    var res = false;
                    var e = that.popupCartesian,
                        i = that.camera.position,
                        n = that.scene.globe.ellipsoid.cartesianToCartographic(i).height;
                    if (!(n += 1 * that.scene.globe.ellipsoid.maximumRadius, Cesium.Cartesian3.distance(i, e) > n)) {
                        res = true;
                    }
                    if (res && that.show) {
                        if (that.infoDiv) that.infoDiv.style.display = "block";
                    } else {
                        if (that.infoDiv) that.infoDiv.style.display = "none";
                    }
                }
            });
        }
    }
    BOLT.MovePrompt.prototype = {
        //设置提示框的文本内容
        setHtml: function (html) {
            if (!html) {
                return;
            }
            if (this.trackPopUpLink) {
                this.trackPopUpLink.innerHtml = html;
            }
        },
        //销毁提示框对象
        destroy: function () {
            if (this.infoDiv && this.mapContainer) {
                this.infoDiv.style.display = "none";
                win.document.getElementById(this.mapContainer).removeChild(this.infoDiv);
                this.infoDiv = null;
            }
            if (this.rendHandler) {
                this.rendHandler();
                this.rendHandler = null;
            }
        },

        displayPrompt: function (display) {
            if (this.infoDiv) this.infoDiv.style.display = display ? "block" : "none";
        },
        //修改提示框样式
        updateStyle: function (opt) {
            if (!opt) opt = {};
            this.promptDiv.style.background = opt.rgba || "rgba(0,0,0,.4)";
            this.promptContent.style.color = opt.fontColor || "white";
            if(opt.additional != null){
                for (let index = 0; index < opt.additional.length; index++) {
                    const element = opt.additional[index];
                    $(this.promptDiv).css(element.name,element.txt);
                }
            }
        },
        //更新提示框的内容和位置
        updatePrompt: function (px, html) {
            if (!px) return;
            this.infoDiv.style.display = "block";
            this.trackPopUpContent.style.left = px.x + (this.offset.x || 30) + "px";
            this.trackPopUpContent.style.top = px.y + (this.offset.y || 30) + "px";
            this.setHtml(html);
        },
        //  控制提示框的显示隐藏
        setVisible: function (isOpen) {
            if (isOpen == undefined) isOpen = true;
            if (isOpen) {
                this.infoDiv.style.display = "block";
                this.show = true;
            } else {
                this.infoDiv.style.display = "none";
                this.show = false;
            }
        }
    }

    //添加导航控件
    //引用了lib/CesiumPlugins/cesium-navigation
    BOLT.NavigationBox = function(viewer, cameraView) {
        viewer.extend(Cesium.viewerCesiumNavigationMixin, {
            defaultResetView: { 
                "y": cameraView.y, 
                "x": cameraView.x, 
                "z": cameraView.z, 
                "heading": cameraView.heading, 
                "pitch": cameraView.pitch, 
                "roll": cameraView.roll 
            }
        });
    }
    //度转度°分′秒″
    function ToDegrees(val) {
        if (typeof (val) == "undefined" || val == "") {
            return "";
        }
        var i = val.indexOf('.');
        var strDu = i < 0 ? val : val.substring(0, i);//获取度
        var strFen = 0;
        var strMiao = 0;
        if (i > 0) {
            var strFen = "0" + val.substring(i);
            strFen = strFen * 60 + "";
            i = strFen.indexOf('.');
            if (i > 0) {
                strMiao = "0" + strFen.substring(i);
                strFen = strFen.substring(0, i);//获取分
                strMiao = strMiao * 60 + "";
                i = strMiao.indexOf('.');
                strMiao = strMiao.substring(0, i + 4);//取到小数点后面三位
                strMiao = parseFloat(strMiao).toFixed(2);//精确小数点后面两位
            }
        }
        return strDu + "°" + strFen + "'" + strMiao;
    }
    var gisData = {};
    var MouseHeight =  function (viewer) {
        var canvas = viewer.scene.canvas;
        var handler = new Cesium.ScreenSpaceEventHandler(canvas);
        handler.setInputAction(function(movement){
            var cartesian = G.PH.getCurrentMousePosition(viewer,movement.position)
            if(cartesian){
                var start = cartesian; 
                var end =  cartesian; 
                // 插值
                var count = 1; 
                var positions = []; 
                for (var i = 0; i <= count; i++) { 
                    positions.push(Cesium.Cartesian3.lerp(start , end , i / count, new Cesium.Cartesian3())); 
                } 
                viewer.scene.clampToHeightMostDetailed(positions).then(function (clampedCartesians) { 
                    // 每个点的高度 
                    var height = []; 
                    for (var i = 0; i < count; ++i) { 
                        height.push(Cesium.Cartographic.fromCartesian(clampedCartesians[i]).height); 
                    } 
                    // console.log(height)
                    gisData.terrain_height = height[0].toFixed(3)
                    var format = `<div style="float: left;min-width: 0px;margin-left: 45px;margin-right: 0;"><span class="loader-14"> </span></div>
                    <span style="margin-left: 18px;text-align: right;width: 32px;" id="percentage-text" aria-labelledby="percentage-text-tooltip-text"> 100% </span>
                    <div  id="terrain_height">高程:{}米</div><div id="terrain_y">维:{}</div><div id="terrain_x">经:{}</div>`;
                    format += ' <div id="height">相机:{}米</div><div id="degrees_">{}"N {}"E</div>';
                    _template(format, gisData);
                });

                
            } 
            // var e = event || win.event;
          
        },Cesium.ScreenSpaceEventType.LEFT_CLICK)

    }

    //添加鼠标位置控件
    BOLT.MousePositionBox = function(viewer, containerid, crs) {
        MouseHeight(viewer)
        $("#" + containerid).prepend('<div id="MouseControl"  class="gis-bar" ></div>');
        $("#MouseControl").css({
            "right": "0px",
            "bottom": "0",
            "background": "#ffffff00"
        });
        
        
        var format = `<div style="float: left;min-width: 0px;margin-left: 45px;margin-right: 0;"><span id="loader" class="loader-x"> </span></div>
        <span style="margin-left: 8px;text-align: right;width: 32px;" id="percentage-text" aria-labelledby="percentage-text-tooltip-text"> 100% </span>
        <div  id="terrain_height">高程:{}米</div><div id="terrain_y">维:{}</div><div id="terrain_x">经:{}</div>`;
        format += ' <div id="camera_height">相机:{}米</div><div id="degrees_">{}"N {}"E</div>';
        $("#MouseControl").html(format);

        function setXYZ2Data(cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            gisData.z = cartographic.height.toFixed(1);
            var jd = Cesium.Math.toDegrees(cartographic.longitude);
            var wd = Cesium.Math.toDegrees(cartographic.latitude);
            //和地图一致的原坐标
            var fixedLen = 6;
            gisData.x = jd.toFixed(fixedLen);
            gisData.y = wd.toFixed(fixedLen);
        }
        gisData.terrain_height = '右键地图获取'
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function () {
                var e = event || win.event;
                var ray = viewer.camera.getPickRay( {x: e.clientX, y: e.clientY});
                var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                // var cartesian = VMSDS.positionHandler.getCurrentMousePosition(viewer.scene, {x: e.clientX, y: e.clientY});
                if (cartesian) {
                    setXYZ2Data(cartesian);
                    gisData.height = viewer.camera.positionCartographic.height.toFixed(1);
                    gisData.heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(0);
                    gisData.pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(0);

                    gisData.degrees_y = ToDegrees(gisData.y)
                    gisData.degrees_x = ToDegrees(gisData.x)
                    _template(format, gisData);
                }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        
        //监控地图加载
        var helper = new Cesium.EventHelper();
        var count = 0;var Wrong_number = 0
        helper.add(viewer.scene.globe.tileLoadProgressEvent, function (e) {
            $("#loader").removeClass("loader-x")
            $("#loader").addClass("loader-14")
            if(e > count){
                count = e
            }
            if(Wrong_number++ > 2){
                Wrong_number = 0
                $("#percentage-text").html((100 - G.PH.GetPercent(e,count).toFixed(0)) + "%")
            }
            // console.log('每次加载地图服务矢量切片都会进入这个回调', e);

            
            if (e== 0) {
                $("#percentage-text").html((100 - G.PH.GetPercent(e,count).toFixed(0)) + "%")
                count = 0
                $("#loader").removeClass("loader-14")
                $("#loader").addClass("loader-x")
                // console.log("矢量切片加载完成时的回调");
            }
        });

    }

    function _template(str, data) {
        // degrees_x: "120°4'13.90"
        // degrees_y: "30°13'20.92"
        // heading: "22"
        // height: "1836.9"
        // pitch: "-35"
        // terrain_height: "右键地图获取"
        // x: "120.070527"
        // y: "30.222477"
        // z: "291.8"

        $("#terrain_height").html("高程:"+data.terrain_height+"米");
        $("#terrain_y").html("维:"+data.y+"");
        $("#terrain_x").html("经:"+data.x+"");
        $("#camera_height").html("相机:"+data.z+"米");
        $("#degrees_").html(''+data.degrees_x+'"N '+data.degrees_y+'"E');
    }

    //获取当前相机视角
    BOLT.getCameraView = function(viewer) {
        //格式化数字 小数位数
        function formatNum(num, digits) {
            return Number(num.toFixed(digits || 0));
        }

        var camera = viewer.camera;
        var position = camera.positionCartographic;
        var cv = {};
        cv.y = formatNum(Cesium.Math.toDegrees(position.latitude), 6);
        cv.x = formatNum(Cesium.Math.toDegrees(position.longitude), 6);
        cv.z = formatNum(position.height, 2);
        cv.h = formatNum(camera.heading,2);
        cv.p = formatNum(camera.pitch,10);
        cv.r = formatNum(camera.roll,2);

        return cv;
    }

    //取点击坐标小工具
    BOLT.GetMousePsition = function(viewer,e) {
        viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(function (click) {
            try {
                var cartographic = Cesium.Cartographic.fromCartesian(viewer.scene.pickPosition(click.position));
                var lng = Cesium.Math.toDegrees(cartographic.longitude);
                var tab = viewer.scene.pick(click.position);//选取当前的entity
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                var height = cartographic.height;//模型高度
                var mapPosition = { x: lng, y: lat, z: height }
                var cartesian = viewer.scene.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
             
                var idcode = '';
                if(tab != null){
                    if(tab.primitive != null){
                        idcode = tab.primitive.id;
                        if(tab.primitive.id != null && tab.primitive.id.id != null){
                            idcode = tab.primitive.id.id;
                        }
                    
                    }else if(tab.id != null){
                        idcode = tab.id;
                    }

                }
                // console.log(tab)
                var modelType;
                if(tab != null && tab.primitive != null && tab.primitive.modelMatrix != null){
                    modelType = 'scene';
                }
                else 
                if(tab instanceof Cesium.Cesium3DTileset)
                {
                    modelType = 'tileset';
                }
                else if(tab instanceof Cesium.ImageryLayer)
                {
                    modelType = 'imageryLayer';
                }else{
                    modelType = 'entity';
                }
                if(tab == null){modelType = '';}
                    
                    
                click.name = "二维坐标（屏幕）";
                mapPosition.name = "经纬度";
                cartesian.name = "笛卡尔直角坐标 笛卡尔3";
                var wsc = {
                    screen : click.position,
                    warpWeft:mapPosition,
                    descartes:cartesian,
                    id: idcode == undefined ? "" : idcode,
                    modelType:modelType
                }
                if(e)
                    e(wsc);

            } catch (error) {
                console.log(error)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    //添加鹰眼控件
    BOLT.addOverview = function(container,father) {
        $("#" + container).html('<div class="overview-div"><div class="overview-close"></div><div id="eye" class="overview-map"></div></div>');
        $(".overview-div").append('<div class="overview-narrow"></div>');
        $(".overview-div").append('<div class="overview-enlarge"></div>');
        //1.创建双球
        var viewer = new Cesium.Viewer('eye',{
            fullscreenButton: false,
            orderIndependentTranslucency: false,
            contextOptions: {
                webgl: {
                    alpha: true,
                }
            },
        })

        viewer.scene.globe.depthTestAgainstTerrain = true;
        //开启hdr
        viewer.scene.highDynamicRange = true;

        viewer.scene.globe.enableLighting = true;
        //移除默认的bing影像图层
        viewer.imageryLayers.removeAll();
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date("2019/10/04 06:00:00"));

        //是否关闭大气效果
        viewer.scene.globe.showGroundAtmosphere = true;

        // VMSDS.effect.AtmosphericEffects(viewer);
        $(".overview-div").animate({width:'90%'});
        $(".overview-div").animate({height:'74%'});
        $("#eye").animate({width:'94%'});
        $("#eye").animate({height:'85%'});

        $(".overview-close").click(function () {
            $(".overview-div").animate({opacity:0},100,"linear",function(){
                $(".overview-div").remove();
            });
        })
        $(".overview-narrow").click(function () {
            $(".overview-div").animate({height:'20%'},100,"linear",function(){
            });
            $(".overview-div").animate({width:'21%'},100,"linear",function(){
                $(".overview-narrow").css('display','none');
                $(".overview-enlarge").css('display','block');
            });
        })
        $(".overview-enlarge").click(function () {
            $(".overview-div").animate({height:'85%'},100,"linear",function(){
            });
            $(".overview-div").animate({width:'94%'},100,"linear",function(){
                $(".overview-narrow").css('display','block');
                $(".overview-enlarge").css('display','none');
            });
        })
        viewer.scene.sun.show = false; //在Cesium1.6(不确定)之后的版本会显示太阳和月亮，不关闭会影响展示
        viewer.scene.moon.show = false;
        viewer.scene.skyBox.show = false;//关闭天空盒，否则会显示天空颜色
        viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0);


        //2.设置鹰眼图中球属性
        let control = viewer.scene.screenSpaceCameraController;
        control.enableRotate = true;
        control.enableTranslate = true;
        control.enableZoom = true;
        control.enableTilt = true;
        control.enableLook = false;

        $('.cesium-viewer-toolbar').hide();
        $('.cesium-viewer-animationContainer').hide();
        $('.cesium-viewer-timelineContainer').hide();
        $('.cesium-viewer-bottom').hide();
        
        let syncViewer = function () {
            viewer.camera.flyTo({
                destination: _changeViewerHeight(viewer,father.camera.position),
                orientation: {
                    heading: father.camera.heading,
                    pitch: father.camera.pitch,
                    roll: father.camera.roll
                },
                duration: 0.0
            });
        };
        if(father){
            //3. 同步
            father.entities.add({
                position: Cesium.Cartesian3.fromDegrees(0, 0),
                label: {
                    text: new Cesium.CallbackProperty(function () {
                        syncViewer();
                        return "";
                    }, true)
                }
            });
        }
        function _changeViewerHeight(viewer,position) {
            var positions = new Array();
            positions.push(position);
            var formatPos = viewer.positionHandler.formatPositon(position);
            var addedHeight = 1000;
            if (formatPos.z > 200) {
                addedHeight = 2000;
            } else if (formatPos.z > 1000) {
                addedHeight = formatPos.z * 2;
            }
            var positions_ = viewer.positionHandler.addPositionsHeight(positions, addedHeight);
            return positions_[0];
        }
        return viewer;
    }
   
})(window);
