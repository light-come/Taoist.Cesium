import * as Cesium from "cesium";


export {
    Effect
    ,Spread
    ,DynamicLine
    ,SolidWall
    ,AtmosphericEffects
    ,bright
    ,runshineAnalysis
    ,Aura
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


    static bright:Function      
    static Effect:Function
    static Spread:Function
    static DynamicLine:Function
    static SolidWall:Function
    static AtmosphericEffects:Function
    static runshineAnalysis:Function
    static Aura:Function
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

 /**
 * 全局发光
 */
const bright = Taoist.bright = (viewer: Cesium.Viewer) =>{
    
    var viewModel = {
        show: true,
        glowOnly: false,
        contrast: 128,
        brightness: 0.1,
        delta: 1.2,
        sigma: 4.78,
        stepSize: 3.0
    };

   
    var bloom = viewer.scene.postProcessStages.bloom;
    bloom.enabled = Boolean(viewModel.show);
    bloom.uniforms.glowOnly = Boolean(viewModel.glowOnly);
    bloom.uniforms.contrast = Number(viewModel.contrast);
    bloom.uniforms.brightness = Number(viewModel.brightness);
    bloom.uniforms.delta = Number(viewModel.delta);
    bloom.uniforms.sigma = Number(viewModel.sigma);
    bloom.uniforms.stepSize = Number(viewModel.stepSize);
}
 /**
 * 日照分析
 */
const runshineAnalysis= Taoist.runshineAnalysis =() =>{
    var stopTime: any = null;

    function stratPlay(viewer: Cesium.Viewer) {
        var shadowMap = viewer.shadowMap;
        shadowMap.maximumDistance = 10000.0;
        shadowMap.size = 10000.0;
        // shadowMap.softShadows = true

        if (viewer.clock.shouldAnimate = !0, stopTime)
            viewer.clock.currentTime = stopTime;
        else {
            var e = new Date().getFullYear() +"-"+ new Date().getMonth()+"-"+ new Date().getDate(),
            t = new Date(e),
            i = "10",
            a = "18",
            r = new Date(new Date(t).setHours(Number(i))),
            o = new Date(new Date(t).setHours(Number(a)));
            viewer.scene.globe.enableLighting = !0,
            viewer.shadows = !0,
            viewer.clock.startTime = Cesium.JulianDate.fromDate(r),
            viewer.clock.currentTime = Cesium.JulianDate.fromDate(r),
            viewer.clock.stopTime = Cesium.JulianDate.fromDate(o),
            viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP,
            viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
            viewer.clock.multiplier = 1
        }
    }
    function stopPlay(viewer: Cesium.Viewer) {
        stopTime = viewer.clock.currentTime,
            viewer.clock.shouldAnimate = !1;
        var shadowMap = viewer.shadowMap;
        shadowMap.maximumDistance = 10000.0;
        shadowMap.size = 2048;
        shadowMap.softShadows = false
        viewer.shadows = false;
    }
    function setvisible(viewer: Cesium.Viewer,value: string) {
        switch (value) {
            case 'play':
                stratPlay(viewer);
                break;
            case 'stop':
                stopPlay(viewer);
                break;
        }
    }
    return setvisible
}
/**
 * 大气特效
 */
const  AtmosphericEffects= Taoist.AtmosphericEffects = (viewer: Cesium.Viewer)  => {

      var scene = viewer.scene;
      var globe = scene.globe;
      globe.enableLighting = true;

      globe.lightingFadeOutDistance = 10000000;
      globe.lightingFadeInDistance = 20000000;
      globe.nightFadeOutDistance = 10000000;
      globe.nightFadeInDistance = 2.7e+7;
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      



        var viewModel = {
            show: true,
            intensity: 2.0,
            distortion: 10.0,
            dispersion: 0.4,
            haloWidth: 0.4,
            dirtAmount: 0.4,
        };
        var lensFlare = viewer.scene.postProcessStages.add(
            Cesium.PostProcessStageLibrary.createLensFlareStage()
        );
        function updatePostProcess() {
            lensFlare.enabled = Boolean(viewModel.show);
            lensFlare.uniforms.intensity = Number(viewModel.intensity);
            lensFlare.uniforms.distortion = Number(viewModel.distortion);
            lensFlare.uniforms.ghostDispersal = Number(viewModel.dispersion);
            lensFlare.uniforms.haloWidth = Number(viewModel.haloWidth);
            lensFlare.uniforms.dirtAmount = Number(viewModel.dirtAmount);
            lensFlare.uniforms.earthRadius = Cesium.Ellipsoid.WGS84.maximumRadius;
        }
        updatePostProcess();
}

 /**
 * 着色器天气 雨雪雾
 * @param {*} viewer 
 */
class Effect {
    viewer :Cesium.Viewer
    visibility
    color
    _show
    type
    Stage: Cesium.PostProcessStage | Cesium.PostProcessStageComposite
    constructor(viewer: any, options: { visibility?: any; color?: any; show?: any; type?: any; }) {
        if (!viewer) throw new Error('no viewer object!');
        options = options || {};
        this.viewer = viewer
        this.visibility = Cesium.defaultValue(options.visibility, 0.1);
        this.color = Cesium.defaultValue(options.color,new Cesium.Color(0.8, 0.8, 0.8, 0.5));
        this._show = Cesium.defaultValue(options.show, !0);
        this.type = options.type;
        this.init();
    }

    init() {
        var fragmentShader;
        switch (this.type) {
            case 'y':
                fragmentShader = this.yShaders();
                break;
            case 'x':
                fragmentShader = this.xShaders();
                break;
            case 'w':
                fragmentShader = this.wShaders();
                break;
            default:
                fragmentShader = this.yShaders();
                break;
        }
        this.Stage = new Cesium.PostProcessStage({
            name: Number(Math.random().toString().substr(3,length) + Date.now()).toString(36),
            fragmentShader:fragmentShader,
            uniforms: {
                visibility: () => {
                    return this.visibility;
                },
                fogColor: () => {
                    return this.color;
                }
            }
        });
        this.viewer.scene.postProcessStages.add(this.Stage);
    }

    destroy() {
        if (!this.viewer || !this.Stage) return;
        this.viewer.scene.postProcessStages.remove(this.Stage);
        this.Stage.destroy();
        delete this.visibility;
        delete this.color;
    }

    show(visible: any) {
        this._show =  Cesium.defaultValue(visible, !0);
        this.Stage.enabled = this._show;
    }

    wShaders() {
        return "uniform sampler2D colorTexture;\n\
         uniform sampler2D depthTexture;\n\
         uniform float visibility;\n\
         uniform vec4 fogColor;\n\
         varying vec2 v_textureCoordinates; \n\
         void main(void) \n\
         { \n\
            vec4 origcolor = texture2D(colorTexture, v_textureCoordinates); \n\
            float depth = czm_readDepth(depthTexture, v_textureCoordinates); \n\
            vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates); \n\
            float f = visibility * (depthcolor.r - 0.3) / 0.2; \n\
            if (f < 0.0) f = 0.0; \n\
            else if (f > 1.0) f = 1.0; \n\
            gl_FragColor = mix(origcolor, fogColor, f); \n\
         }\n";
    }
    xShaders() {
        return "uniform sampler2D colorTexture;\n\
        varying vec2 v_textureCoordinates;\n\
    \n\
        float snow(vec2 uv,float scale)\n\
        {\n\
            float time = czm_frameNumber / 60.0;\n\
            float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
            uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
            uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
            p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
            k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
            return k*w;\n\
        }\n\
    \n\
        void main(void){\n\
            vec2 resolution = czm_viewport.zw;\n\
            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
            vec3 finalColor=vec3(0);\n\
            float c = 0.0;\n\
            c+=snow(uv,30.)*.0;\n\
            c+=snow(uv,20.)*.0;\n\
            c+=snow(uv,15.)*.0;\n\
            c+=snow(uv,10.);\n\
            c+=snow(uv,8.);\n\
        c+=snow(uv,6.);\n\
            c+=snow(uv,5.);\n\
            finalColor=(vec3(c)); \n\
            gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
    \n\
        }\n\
    ";
    }
    
    yShaders() {
        return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
            \n\
                float hash(float x){\n\
                    return fract(sin(x*133.3)*13.13);\n\
            }\n\
            \n\
            void main(void){\n\
            \n\
                float time = czm_frameNumber / 60.0;\n\
            vec2 resolution = czm_viewport.zw;\n\
            \n\
            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
            vec3 c=vec3(.6,.7,.8);\n\
            \n\
            float a=-.4;\n\
            float si=sin(a),co=cos(a);\n\
            uv*=mat2(co,-si,si,co);\n\
            uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
            \n\
            float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
            float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
            c*=v*b; \n\
            \n\
            gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
            }\n\
        ";
    }
}
/**
 * 电子围栏
 * @param {*} type 
 */
const SolidWall = Taoist.SolidWall = (viewer: Cesium.Viewer,type: any,list: any[])  => {
   var _Cesium = (Cesium as any)
   switch (type) {
       case '呼吸':
           var alp = 1;
           var num = 0;
           //绘制墙
           viewer.entities.add({
               name: "动态立体墙",
               wall:{
                   show:true,
                   positions:_Cesium.Cartesian3.fromDegreesArrayHeights(list),
                   material: new _Cesium.ImageMaterialProperty({
                       image:_Cesium.buildModuleUrl(
                           "../../core/images/waterNormals.png"
                       ),
                       transparent:true,
                       color:new _Cesium.CallbackProperty(function () {
                           if ((num % 2) === 0){
                               alp -=0.005;
                           }else {
                               alp +=0.005;
                           }
   
                           if (alp <= 0.3){
                               num++;
                           }else if (alp >= 1){
                               num++;
                           }
                           return  _Cesium.Color.WHITE.withAlpha(alp)
                           //entity的颜色透明 并不影响材质，并且 entity也会透明
                       },false)
                   })
               }
           });

           break;
       case '着色器1':
           /*
           流动纹理线
           color 颜色
           duration 持续时间 毫秒
           */
           function PolylineTrailLinkMaterialProperty(color: any, duration: any) {
               this._definitionChanged = new _Cesium.Event();
               this._color = undefined;
               this._colorSubscription = undefined;
               this.color = color;
               this.duration = duration;
               this._time = (new Date()).getTime();
           }
           Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
               isConstant: {
                   get: function () {
                       return false;
                   }
               },
               definitionChanged: {
                   get: function () {
                       return this._definitionChanged;
                   }
               },
               color: _Cesium.createPropertyDescriptor('color')
           });
           PolylineTrailLinkMaterialProperty.prototype.getType = function () {
               return 'PolylineTrailLink';
           }
           PolylineTrailLinkMaterialProperty.prototype.getValue = function (time: any, result: { color?: any; image?: any; time?: any; }) {
               if (!_Cesium.defined(result)) {
                   result = {};
               }
               result.color = _Cesium.Property.getValueOrClonedDefault(this._color, time, _Cesium.Color.WHITE, result.color);
               result.image = _Cesium.Material.PolylineTrailLinkImage;
               result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
               return result;
           }
           PolylineTrailLinkMaterialProperty.prototype.equals = function (other: { _color: any; }) {
               return this === other ||
                   (other instanceof PolylineTrailLinkMaterialProperty &&
                       (Cesium.Property as any).equals(this._color, other._color))
           }
           _Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
           _Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
           _Cesium.Material.PolylineTrailLinkImage = _Cesium.buildModuleUrl(
               "../../core/images/colors.png"
           ),
           _Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
           {\n\
               czm_material material = czm_getDefaultMaterial(materialInput);\n\
               vec2 st = materialInput.st;\n\
               vec4 colorImage = texture2D(image, vec2(fract(-(st.t + time)), st.t));\n\
               material.alpha = colorImage.a * color.a;\n\
               material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
               return material;\n\
           }";
           _Cesium.Material.Source = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
           {\n\
               czm_material material = czm_getDefaultMaterial(materialInput);\n\
               vec2 st = materialInput.st;\n\
               vec4 colorImage = texture2D(image, vec2(fract(-(st.t + time)), st.t));\n\
               material.alpha = colorImage.a * color.a;\n\
               material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
               return material;\n\
           }"
           _Cesium.Material._materialCache.addMaterial(_Cesium.Material.PolylineTrailLinkType, {
               fabric: {
                   type: _Cesium.Material.PolylineTrailLinkType,
                   uniforms: {
                       color: new _Cesium.Color(1.0, 0.0, 0.0, 0.5),
                       image: _Cesium.Material.PolylineTrailLinkImage,
                       time: 0
                   },
                   source: _Cesium.Material.PolylineTrailLinkSource
               },
               translucent: function () {
                   return true;
               }
           });

           viewer.entities.add({
               name: "动态立体墙",
               wall: {
                   positions: _Cesium.Cartesian3.fromDegreesArray(list),
                   maximumHeights: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
                   minimumHeights: [0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                   material: new _Cesium.PolylineTrailLinkMaterialProperty(_Cesium.Color.fromCssColorString('#ff0f00').withAlpha(1), 3000)
               }
           })
           break;
       default:
           break;
   }
}
/**
 * 动态线
 */
const DynamicLine= Taoist.DynamicLine = (viewer: Cesium.Viewer,list: number[])  => {
    var _Cesium = (Cesium as any)
     /*
    流动纹理线
    color 颜色
    duration 持续时间 毫秒
    */
    function PolylineTrailLinkMaterialProperty(color: any, duration: any) {
        this._definitionChanged = new _Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = (new Date()).getTime();
    }
    Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: _Cesium.createPropertyDescriptor('color')
    });
    PolylineTrailLinkMaterialProperty.prototype.getType = function () {
        return 'PolylineTrailLink';
    }
    PolylineTrailLinkMaterialProperty.prototype.getValue = function (time: any, result: { color?: any; image?: any; time?: any; }) {
        if (!_Cesium.defined(result)) {
            result = {};
        }
        result.color = _Cesium.Property.getValueOrClonedDefault(this._color, time, _Cesium.Color.WHITE, result.color);
        result.image = _Cesium.Material.PolylineTrailLinkImage;
        result.time = ((((new Date()).getTime() - this._time) % this.duration) / this.duration) / 2;
        return result;
    }
    PolylineTrailLinkMaterialProperty.prototype.equals = function (other: { _color: any; }) {
        return this === other ||
            (other instanceof PolylineTrailLinkMaterialProperty &&
                (Cesium.Property as any).equals(this._color, other._color))
    }
    _Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
    _Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
    _Cesium.Material.PolylineTrailLinkImage =  _Cesium.buildModuleUrl("../../core/images/line.png");
    _Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                {\n\
                                                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                    vec2 st = materialInput.st;\n\
                                                    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                    material.alpha = colorImage.a * color.a;\n\
                                                    material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                    return material;\n\
                                                }";
    _Cesium.Material._materialCache.addMaterial(_Cesium.Material.PolylineTrailLinkType, {
        fabric: {
            type: _Cesium.Material.PolylineTrailLinkType,
            uniforms: {
                color: new _Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: _Cesium.Material.PolylineTrailLinkImage,
                time: 0
            },
            source: _Cesium.Material.PolylineTrailLinkSource
        },
        translucent: function () {
            return true;
        }
    });

    var entities = viewer.entities.add({
        name: "动态立体墙",
        polyline: {
            positions: _Cesium.Cartesian3.fromDegreesArray(
                list
            ),
            zIndex: 2,
            clampToGround : true,
            width: 5,
            // maximumHeights: [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600],
            // minimumHeights: [43.9, 49.4, 38.7, 40, 54, 51, 66.7, 44.6, 41.2, 31.2, 50.1, 53.8, 46.9, 43.9],
            material: new _Cesium.PolylineTrailLinkMaterialProperty(_Cesium.Color.fromCssColorString('#0000FF'), 3000)
        }
    })

    return entities
}
/**
 * 动态波纹
 */
const Spread = Taoist.Spread = (viewer: Cesium.Viewer,options: { x: any; y: any; size: number; })  =>{
    const DynamicCircle = `
        uniform sampler2D colorTexture;    //颜色纹理
        uniform sampler2D depthTexture;    //深度纹理
        varying vec2 v_textureCoordinates; //纹理坐标
        uniform vec4 u_scanCenterEC;       //扫描中心
        uniform vec3 u_scanPlaneNormalEC;  //扫描平面法向量
        uniform float u_radius;            //扫描半径
        uniform vec4 u_scanColor;          //扫描颜色

        // 根据二维向量和深度值 计算距离camera的向量
        vec4 toEye(in vec2 uv, in float depth) {
            vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
            // 看看源码中关于此函数的解释是，cesium系统自动生成的4*4的反投影变换矩阵
            // 从clip坐标转为眼睛坐标，clip坐标是指顶点着色器的坐标系统gl_position输出的
            vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
            posInCamera = posInCamera / posInCamera.w; //将视角坐标除深度分量
            return posInCamera;
        }

        // 点在平面上的投影，输入参数为 平面法向量，平面起始点，测试点
        vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point) {
            // 计算测试点与平面起始点的向量
            vec3 v01 = point - planeOrigin;
            // 平面法向量与 测试点与平面上的点 点积  点积的几何意义，b在a上的投影长度，
            // 即v01在平面法向量上的长度
            float d = dot(planeNormal, v01);
            // planeNormal * d 即为v01在平面法向量上的投影向量
            // 根据三角形向量相加为0的原则 即可得点在平面上的投影
            return (point - planeNormal * d);
        }

        // 获取深度值，根据纹理坐标获取深度值
        float getDepth(in vec4 depth) {
            float z_window = czm_unpackDepth(depth);  //源码解释将一个vec4向量还原到0，1内的一个数
            z_window = czm_reverseLogDepth(z_window); // czm_reverseLogDepth解开深度
            float n_range = czm_depthRange.near;      //
            float f_range = czm_depthRange.far;
            return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
        }

        void main() {
            gl_FragColor = texture2D(colorTexture, v_textureCoordinates);          //片元颜色
            float depth = getDepth(texture2D(depthTexture, v_textureCoordinates)); //根据纹理获取深度值
            vec4 viewPos = toEye(v_textureCoordinates, depth);                     //根据纹理坐标和深度值获取视点坐标
            // 点在平面上的投影，平面法向量，平面中心，视点坐标
            vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
            // 计算投影坐标到视点中心的距离
            float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
            // 如果在扫描半径内，则重新赋值片元颜色
            if (dis < u_radius) {
                // 计算与扫描中心的距离并归一化
                float f = dis / u_radius;
                // 原博客如下，实际上可简化为上式子
                // float f = 1.0 -abs(u_radius - dis) / u_radius;
                // 四次方
                f = pow(f, 2.0);
                // mix(x, y, a): x, y的线性混叠， x(1-a)  y*a;,
                // 效果解释：在越接近扫描中心时，f越小，则片元的颜色越接近原来的，相反则越红
                gl_FragColor = mix(gl_FragColor, u_scanColor, f);
            }
        }
        `

    function createDynamicCircleStage(viewer: any, Cesium: typeof import("cesium"), cartographicCenter: Cesium.Cartographic, maxRadius: number, scanColor: Cesium.Color, duration: number) {
        // 中心点
        var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

        // 中心点垂直高度上升500m的坐标点，目的是为了计算平面的法向量
        var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

        // 当前时间
        var _time = (new Date()).getTime();

        // 转换成相机参考系后的中心点，上升高度后的中心点以及平面法向量
        var _scratchCartesian4Center = new Cesium.Cartesian4();
        var _scratchCartesian4Center1 = new Cesium.Cartesian4();
        var _scratchCartesian3Normal = new Cesium.Cartesian3();

        // 自定义PostProcessStage
        var dynamicCircle = new Cesium.PostProcessStage({
            fragmentShader: DynamicCircle,
            uniforms: {
                // 将中心点坐标转化到相机参考系
                u_scanCenterEC: function () {
                    return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                },
                // 计算相机参考系下的平面法向量
                u_scanPlaneNormalEC: function () {
                    var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                    return _scratchCartesian3Normal;
                },
                // 动态半径
                u_radius: function () {
                    return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
                },
                u_scanColor: scanColor
            }
        });
        return dynamicCircle;
    }
    var lng = options.x
    var lat = options.y
    var cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(lng), Cesium.Math.toRadians(lat), 0)
    var scanColor = new Cesium.Color(1.0, 0.0, 0.0, 1)
    // 创建自定义的 PostProcessStage
    var dynamicCircle = createDynamicCircleStage(viewer, Cesium, cartographicCenter, options.size == null ? 15 :  options.size, scanColor, 4000)
    // 添加进场景
    viewer.scene.postProcessStages.add(dynamicCircle)

    return dynamicCircle
}
/**
 * 白模自定义动效
 */
const Aura = Taoist.Aura = (viewer:Cesium.Viewer,tileset:any) =>{
  tileset.readyPromise.then((tileset:any) => {
        viewer.scene.primitives.add(tileset);
        let r = tileset.boundingSphere.radius
        if (tileset.boundingSphere.radius > 10000) {
          r = tileset.boundingSphere.radius / 10
        }
        //viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, r))
        tileset.style = new Cesium.Cesium3DTileStyle({
          color: 'vec4(0, 0.2, 1.0,1)'
        })
        // 注入 shader
        tileset.tileVisible.addEventListener((tile:any) => {
          //console.log("tile:",tile);
          var content = tile.content
          var featuresLength = content.featuresLength
          for (var i = 0; i < featuresLength; i += 2) {
            const feature = content.getFeature(i)
            const model = feature.content._model
            //console.log("model",model);
            if (model && model._sourcePrograms && model._rendererResources) {
              Object.keys(model._sourcePrograms).forEach((key) => {
                //console.log("key",key);
                const program = model._sourcePrograms[key]
                const fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader]
                let vPosition = ''
                if (fragmentShader.indexOf(' v_positionEC;') !== -1) {
                  vPosition = 'v_positionEC'
                } else if (fragmentShader.indexOf(' v_pos;') !== -1) {
                  vPosition = 'v_pos'
                }
                const color = `vec4(${feature.color.toString()})`
                // 自定义着色器
                model._rendererResources.sourceShaders[program.fragmentShader] = `
                varying vec3 ${vPosition};// 相机坐标系的模型坐标
                void main(void){
                    /* 渐变效果 */
                    vec4 v_helsing_position = czm_inverseModelView * vec4(${vPosition},1);// 解算出模型坐标
                    float stc_pl = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
                    float stc_sd = v_helsing_position.z / 60.0 + sin(stc_pl) * 0.1;
                    gl_FragColor = ${color};// 基础颜色
                    gl_FragColor *= vec4(stc_sd, stc_sd, stc_sd, 1.0);// 按模型高度进行颜色变暗处理
                    /* 扫描线 */
                    float glowRange = 250.0; // 光环的移动范围(高度)，最高到360米
                    float stc_a13 = fract(czm_frameNumber / 360.0);// 计算当前着色器的时间，帧率/（6*60），即时间放慢6倍
                    float stc_h = clamp(v_helsing_position.z / glowRange, 0.0, 1.0);
                    stc_a13 = abs(stc_a13 - 0.5) * 2.0;
                    float stc_diff = step(0.005, abs(stc_h - stc_a13));// 根据时间来计算颜色差异
                    gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - stc_diff);// 原有颜色加上颜色差异值提高亮度
                }
                `
              })
              // 让系统重新编译着色器
              model._shouldRegenerateShaders = true
            }
          }
        })
  })
      
}