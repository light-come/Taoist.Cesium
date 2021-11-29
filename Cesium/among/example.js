"use strict";
/**
 * Visualization map spatial data service R&D
 * @author Oran
 * @version 1.1
 * @time 2021/3/26
 */
(function (window) {
  class among {
    constructor(viewer, options) {
        this.viewer = viewer
        this.Rotate = G.Rotate(viewer)
    }

   
    //#region example拓展方法
    //抛出全部方法
    findProperties(obj,...arg){
        function getProperty(new_obj){
    
        if(new_obj.__proto__ === null){ //说明该对象已经是最顶层的对象
            return [];
        }
    
        let properties = Object.getOwnPropertyNames(new_obj);
    
        let arr = [];  
        
        arg.forEach((v)=>{
        
            const newValue = properties.filter((property)=>{
                return property.startsWith(v);
            })
        
            if(newValue.length>0){
                arr = arr.concat(newValue);
            }
        
        })
    
        return [...arr,...getProperty(new_obj.__proto__)];
    
        }
    
        return getProperty(obj);   
    
    
    }
    //模型加载提示
    InterceptionAndmonitoring(){
        
        var open = window.XMLHttpRequest.prototype.open,  
        send = window.XMLHttpRequest.prototype.send;

        function openReplacement(method, url, async, user, password) {  
            this._url = url;
            return open.apply(this, arguments);
        }

        function sendReplacement(data) {  
            if(this.onreadystatechange) {
                this._onreadystatechange = this.onreadystatechange;
            }
            
            // console.log('Request sent',  );
            if(this._url.indexOf("bin") != -1 || this._url.indexOf("gltf") != -1 || this._url.indexOf("glb") != -1){
                $.toast({
                    heading: '文件加载中',
                    text: "文件可能较大，请耐心等待",
                    position: 'top-center',
                    stack: false
                })
            }
            


            this.onreadystatechange = onReadyStateChangeReplacement;
            return send.apply(this, arguments);
        }

        function onReadyStateChangeReplacement() {  
        
            // console.log('Ready state changed to: ', this.readyState);
            
            if( this.readyState == 4)
                if(this._url.indexOf("bin") != -1 || this._url.indexOf("gltf") != -1 || this._url.indexOf("glb") != -1){
                    // $.toast({
                    //     heading: '文件加载',
                    //     text: "加载完成："+this._url,
                    //     position: 'bottom-right',
                    //     stack: false
                    // })
                    $.toast({
                        heading: '加载完成',
                        // text: "加载完成："+this._url,
                        showHideTransition: 'slide',
                        position: 'top-center',
                        icon: 'success'
                    })
                }

                


            if(this._onreadystatechange) {
                return this._onreadystatechange.apply(this, arguments);
            }
        }

        window.XMLHttpRequest.prototype.open = openReplacement;  
        window.XMLHttpRequest.prototype.send = sendReplacement;
    }
    //释放方法
    release(){
    
        VMSDS.core.findProperties( VMSDS.core, '').forEach(mod => {
            if(mod.indexOf("Release") != -1)
            {
                var e = eval("VMSDS.core." + mod);
                e(window.VMSDS.GIS)
            }
        });
        
    }
    //#endregion
    //停止动画效果
    _AnimationStop(){
        var _this = this
        let viewer = _this.viewer;
        VMSDS.Rotate.ExectionState = true
        clearTimeout(this.AnimationTimeout)
        _this.Rotate({x: 120.08282174969413, y: 30.22744857087588, z: 1261.42944196579117},viewer)
    }
    //底部鼠标控件设置侧边
    _MouseBottomBox(value){
        var width = value.width
        $("#MouseControl").css({"width":width})
    }
    //加载球体动画及内置地形
    _BackgroundAnimation(){
        var _this = this
        let viewer = _this.viewer;
        //加载杭州高程地形
        var provider = new Cesium.CesiumTerrainProvider({
          url: 'http://192.168.2.15:802/HangzhouAltitude/data/',
          requestWaterMask : true,//开启法向量
          requestVertexNormals : true//开启水面特效
        });
        viewer.terrainProvider = provider;
       

   
        G.Go(viewer,{
          h: 5.06,
          p:  -0.5236597761,
          r: 0,
          x: 120.086621,
          y: 30.226242,
          z: 1486.31,
          duration : 0
        });
        this.AnimationTimeout = setTimeout(() => {
            _this.Rotate({x: 120.08282174969413, y: 30.22744857087588, z: 1261.42944196579117},viewer)
        }, 4000);
        var viewModel = {
            gradient: false,
            band1Position: 800.0,
            band2Position: 300.0,
            band3Position: 1000.0,
            bandThickness: 10.0,
            bandTransparency: 0.5,
            backgroundTransparency: 1,
        };

        setTimeout(() => {
            var i = 1;
           var timer = setInterval(() => {
                i -= 0.01
                viewModel = {
                    gradient: false,
                    band1Position: 800.0,
                    band2Position: 300.0,
                    band3Position: 1000.0,
                    bandThickness: 10.0,
                    bandTransparency: 0.5,
                    backgroundTransparency: i,
                };
                updateMaterial();
                if(i <= 0.2){
                    clearInterval(timer)
                }
            }, 100);
           
        }, 4000 * 3);
        // Cesium.knockout.track(viewModel);
        // var toolbar = document.getElementById("toolbar");
        // Cesium.knockout.applyBindings(viewModel, toolbar);
        // for (var name in viewModel) {
        //     if (viewModel.hasOwnProperty(name)) {
        //         Cesium.knockout
        //         .getObservable(viewModel, name)
        //         .subscribe(updateMaterial);
        //     }
        // }

        function updateMaterial() {
            var gradient = Boolean(viewModel.gradient);
            var band1Position = Number(viewModel.band1Position);
            var band2Position = Number(viewModel.band2Position);
            var band3Position = Number(viewModel.band3Position);
            var bandThickness = Number(viewModel.bandThickness);
            var bandTransparency = Number(viewModel.bandTransparency);
            var backgroundTransparency = Number(viewModel.backgroundTransparency);
            
            var layers = [];
            var backgroundLayer = {
                entries: [
                {
                    height: 10.0,
                    color: new Cesium.Color(0.0, 0.0, 0.2, backgroundTransparency),
                },
                {
                    height: 300.0,
                    color: new Cesium.Color(1.0, 1.0, 1.0, backgroundTransparency),
                },
                {
                    height: 2000.0,
                    color: new Cesium.Color(1.0, 0.0, 0.0, backgroundTransparency),
                },
                ],
                extendDownwards: true,
                extendUpwards: true,
            };
            layers.push(backgroundLayer);
            
            var gridStartHeight = 50.0;
            var gridEndHeight = 2000.0;
            var gridCount = 50;
            for (var i = 0; i < gridCount; i++) {
                var lerper = i / (gridCount - 1);
                var heightBelow = Cesium.Math.lerp(
                gridStartHeight,
                gridEndHeight,
                lerper
                );
                var heightAbove = heightBelow + 10.0;
                var alpha =
                Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency;
                layers.push({
                entries: [
                    {
                    height: heightBelow,
                    color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                    },
                    {
                    height: heightAbove,
                    color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                    },
                ],
                });
            }
            
            var antialias = Math.min(10.0, bandThickness * 0.1);
            
            if (!gradient) {
                var band1 = {
                entries: [
                    {
                    height: band1Position - bandThickness * 0.5 - antialias,
                    color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                    },
                    {
                    height: band1Position - bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                    },
                    {
                    height: band1Position + bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                    },
                    {
                    height: band1Position + bandThickness * 0.5 + antialias,
                    color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                    },
                ],
                };
            
                var band2 = {
                entries: [
                    {
                    height: band2Position - bandThickness * 0.5 - antialias,
                    color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                    },
                    {
                    height: band2Position - bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                    },
                    {
                    height: band2Position + bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                    },
                    {
                    height: band2Position + bandThickness * 0.5 + antialias,
                    color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                    },
                ],
                };
            
                var band3 = {
                entries: [
                    {
                    height: band3Position - bandThickness * 0.5 - antialias,
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                    },
                    {
                    height: band3Position - bandThickness * 0.5,
                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                    },
                    {
                    height: band3Position + bandThickness * 0.5,
                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                    },
                    {
                    height: band3Position + bandThickness * 0.5 + antialias,
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                    },
                ],
                };
            
                layers.push(band1);
                layers.push(band2);
                layers.push(band3);
            } else {
                var combinedBand = {
                entries: [
                    {
                    height: band1Position - bandThickness * 0.5,
                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                    },
                    {
                    height: band2Position,
                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                    },
                    {
                    height: band3Position + bandThickness * 0.5,
                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                    },
                ],
                };
            
                layers.push(combinedBand);
            }
            
            var material = Cesium.createElevationBandMaterial({
                scene: viewer.scene,
                layers: layers,
            });
            viewer.scene.globe.material = material;
        }
        updateMaterial();
    }
    //鼠标事件控件
    _PositionBox(){
      let viewer = this.viewer;
      G.BOLT.MousePositionBox(viewer,'mapbody')
    }
  }

  window.mousePosition = function (ev) {
    if (ev.pageX || ev.pageY) {
      //firefox、chrome等浏览器
      return { x: ev.pageX, y: ev.pageY };
    }
    return {
      // IE浏览器
      x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
      y: ev.clientY + document.body.scrollTop - document.body.clientTop,
    };
  };

  G.gear = among;
})(window);
