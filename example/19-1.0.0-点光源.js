var script = ['<!-- 初始化三维库 --><script type="text/javascript" src="/lib/index.js" libpath="../" include="Taoist"></script>'];
script.forEach(element => {
  document.writeln(element);
});
window.onload = () => {
  (function () {
    //example方法
    const _ = (params, options, _viewer) => {
      _viewer = _viewer ?? this.viewer;
      window.Gear_X = new Gear(_viewer);
      if (_viewer instanceof Cesium.Viewer) return Gear_X[params](options);
    };
    init();
    function init() {
      //初始化地球0
      if (G.U.webglReport()) {
        //判断浏览器是否支持WebGL
        G.create3D(
          {
            id: "mapBox",
            showGroundAtmosphere: true,
            debug: false,
            success: function (_viewer) {
              var viewer = (window.viewer = _viewer);

              // _viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
              // _viewer.scene.globe.show = false; //隐藏球体
              // _viewer.scene.highDynamicRange = true;
              _viewer.scene.globe.baseColor = new Cesium.Color.fromCssColorString("#fff");
              // // _viewer.scene.sun.show = false; //在Cesium1.6(不确定)之后的版本会显示太阳和月亮,不关闭会影响展示
              // _viewer.scene.moon.show = false;
              // _viewer.scene.skyBox.show = false; //关闭天空盒,否则会显示天空颜色
              //  _viewer.scene.backgroundColor = new Cesium.Color.fromCssColorString("#fff");

              // G.BaseLayer(viewer, {
              //   name: "影像底图",
              //   type: "mapbox", //www_google sl_geoq
              //   layer: "satellite",
              //   // crs: '4326',
              //   brightness: 0,
              // }); //添加底图

              G.sTime(_viewer);
              G.C.getPosition(viewer, function (p) {
                console.log(p); //取点击坐标小工具
              });

              G.Go(viewer, {
                h: 3.24,
                p: -1.5273722968,
                r: 0,
                x: 120.796327,
                y: 30.317624,
                z: 11.61,
                duration: 0,
              });
              // setInterval(() => {
              //   console.log(G.C.getCameraView(_viewer));
              // }, 3000);
              // //日照
              // _("example_runshineAnalysis");
              //定义的位置
              var pointLightPos = Cesium.Cartesian3.fromDegrees(120.79631485728412, 30.317349846366948, 130.0);
              // 加载需要渲染的3D模型
              var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(pointLightPos);
              var model = viewer.scene.primitives.add(
                Cesium.Model.fromGltf({
                  url: "/assets/model/spacex-launch-pad-complex-max/spacex-launch-pad-complex-max.glb",
                  modelMatrix: modelMatrix,
                  scale: 0.06 / 2,
                })
              );

              // PointLight(viewer);
              Water(viewer);
            },
          },
          Cesium
        );
      } else {
        alert("浏览器不支持WebGL,需更换浏览器");
      }
    }
    function Water(viewer) {
      var waterc = [120.79636964123185, 30.317664587774903, 10, 120.79636905770843, 30.317563426318564, 10, 120.79628126769532, 30.31757598688383, 10, 120.79629438396299, 30.317673725756453, 10];

      // var waterSurface = viewer.scene.primitives.add(
      //   new Cesium.Primitive({
      //     geometryInstances: new Cesium.GeometryInstance({
      //       geometry: new Cesium.PolygonGeometry({
      //         polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(waterc)),
      //         vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      //         height: 18,
      //       }),
      //       modelMatrix: Cesium.Matrix4.IDENTITY,
      //       attributes: {
      //         color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.3, 0.4, 0.8)),
      //       },
      //     }),
      //     appearance: new Cesium.MaterialAppearance({
      //       material: new Cesium.Material({
      //         fabric: {
      //           type: "Water",
      //         },
      //       }),
      //     }),
      //   })
      // );

      const waterShader = `
     
      #version 300 es

      precision highp float;
      
      in vec3 v_positionEC;
      in vec3 v_normalEC;
      in vec3 v_viewDirEC;
      
      uniform vec4 baseWaterColor;
      uniform vec4 blendColor;
      uniform sampler2D specularMap;
      uniform sampler2D normalMap;
      uniform sampler2D reflectionMap;
      uniform sampler2D refractionMap;
      uniform sampler2D ambientOcclusionMap;
      
      uniform float frequency;
      uniform float animationSpeed;
      uniform float amplitude;
      uniform float specularIntensity;
      uniform float shininess;
      uniform float reflectionStrength;
      uniform float refractionStrength;
      uniform float refractionDistortion;
      uniform float diffuseIntensity;
      uniform float fresnelBias;
      uniform float fresnelPower;
      uniform float foamIntensity;
      uniform float foamCoverage;
      uniform float coastalIntensity;
      uniform float waterDepth;
      
      out vec4 FragColor;
      
      void main()
      {
          vec4 baseColor = baseWaterColor;
      
          // 计算视角方向和与相机的距离
          vec3 viewDir = normalize(v_viewDirEC);
          float distance = length(v_positionEC);
      
          // 向水面添加泡沫
          vec2 foamUV = vec2(v_positionEC.xz / frequency + animationSpeed * float(czm_frameNumber), 0.0);
          float foam = texture(normalMap, foamUV).r * foamIntensity;
          foam = smoothstep(foamCoverage - 0.02, foamCoverage, foam);
          foam *= smoothstep(waterDepth - 1.0, waterDepth, v_positionEC.y);
      
          // 计算反射向量
          vec3 reflectionVec = reflect(viewDir, normalize(v_normalEC));
      
          // 计算菲涅耳项
          float fresnelTerm = fresnelBias + fresnelPower * pow(1.0 - dot(viewDir, v_normalEC), 5.0);
      
          // 计算反射颜色
          vec4 reflectionColor = texture(reflectionMap, vec3(reflectionVec.x, -reflectionVec.yz)).rgba;
          reflectionColor.rgb *= reflectionStrength;
          reflectionColor.rgb *= fresnelTerm;
      
          // 计算折射颜色
          vec4 refractionColor = texture(refractionMap, vec2(v_positionEC.xz / frequency)).rgba;
          refractionColor.rgb *= refractionStrength;
          refractionColor = mix(baseColor, refractionColor, refractionDistortion);
      
          // 计算漫反射颜色
          vec4 diffuseColor = texture(normalMap, vec2(v_positionEC.xz / frequency)).rgba;
          diffuseColor.rgb *= diffuseIntensity;
          diffuseColor.rgb *= blendColor.rgb;
      
          // 计算高光颜色
          vec4 specularColor = texture(specularMap, vec2(v_positionEC.xz / frequency)).rgba;
          specularColor.rgb *= specularIntensity;
          specularColor.rgb *= blendColor.rgb;
      
          // 计算环境遮挡
          vec4 ambientOcclusion = texture(ambientOcclusionMap, vec2(v_positionEC.xz / frequency)).rgba;
      
          // 计算最终的水色
          vec3 finalColor = mix(baseColor.rgb, diffuseColor.rgb, blendColor.a);
          finalColor += specularColor.rgb;
          finalColor += reflectionColor.rgb;
          finalColor += refractionColor.rgb;
          finalColor *= foam;
          finalColor *= ambientOcclusion.rgb;
          finalColor = vec4(finalColor.rgb * finalColor.a + blend.rgb * (1.0 - finalColor.a), 1.0);
      
          // 添加海岸线效果
          float coastalFactor = smoothstep(waterDepth - 5.0, waterDepth - 1.0, v_positionEC.y);
          finalColor = mix(finalColor, blendColor.rgb, coastalFactor * coastalIntensity);
          fragColor = vec4(finalColor.rgb, 1.0);
      } `;
      // 在CesiumJS中根据以下参数生成着色器来实现具有最终、海岸、折射+深度颜色、反射+扭曲、漫反射+环境光和法线的水面
      //  - `baseWaterColor`：基础水面颜色。
      //  - `blendColor`：混合颜色。
      //  - `specularMap`：高光纹理。
      //  - `normalMap`：法线贴图。
      //  - `frequency`：纹理重复频率。
      //  - `animationSpeed`：水面动画速度。
      //  - `amplitude`：水面波幅。
      //  - `specularIntensity`：高光强度。
      //  - `shininess`：高光亮度。
      //  - `reflectionStrength`：反射强度。
      //  - `refractionStrength`：折射强度。
      //  - `refractionDistortion`：折射扭曲度。
      //  - `ambientOcclusionMap`：环境遮挡贴图。
      //  - `diffuseIntensity`：漫反射强度。
      //  - `fresnelBias`：菲涅耳偏差。
      //  - `fresnelPower`：菲涅耳功率。
      //  - `foamIntensity`：水面泡沫强度。
      //  - `foamCoverage`：泡沫覆盖率。
      //  - `coastalIntensity`：海岸线强度。
      //  - `waterDepth`：水深。

      // 定义一个 Material 对象
      var waterMaterial = new Cesium.Material({
        fabric: {
          type: "waterMaterial",
          uniforms: {
            // 在这里设置 uniform 变量的值
            baseWaterColor: new Cesium.Color(0.1, 0.2, 0.3, 1.0),
            blendColor: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
            specularMap: "/assets/images/textures/foam_shore.png",
            normalMap: "/assets/images/textures/water_normal.png",
            frequency: 1000.0,
            animationSpeed: 0.01,
            amplitude: 10.0,
            specularIntensity: 0.5,
            shininess: 5.0,
            reflectionStrength: 0.8,
            refractionStrength: 0.2,
            refractionDistortion: 0.03,
            ambientOcclusionMap: "/assets/images/textures/foam.png",
            diffuseIntensity: 0.6,
            fresnelBias: 0.4,
            fresnelPower: 2.0,
            foamIntensity: 0.5,
            foamCoverage: 0.8,
            coastalIntensity: 0.5,
            waterDepth: 50.0,
          },
          source: waterShader,
        },
      });
      console.log(waterMaterial);
      // 创建一个水面 Primitive
      var waterPrimitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(waterc)),
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            height: 1,
          }),
          modelMatrix: Cesium.Matrix4.IDENTITY,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.3, 0.4, 0.8)),
          },
          id: "water",
        }),
        translucent: false,
        // appearance: new Cesium.MaterialAppearance({
        //   material: new Cesium.Material({
        //     fabric: {
        //       type: "Water",
        //     },
        //   }),
        // }),
        appearance: new Cesium.MaterialAppearance({
          material: waterMaterial,
        }),
      });

      // 将 Primitive 添加到场景中
      viewer.scene.primitives.add(waterPrimitive);
    }
    function PointLight(viewer) {
      // return;
      // 编写着色器代码,实现点光源的效果
      var pointLightShader = {
        vertexShader: `

      attribute vec3 position;

      attribute vec3 normal;

      uniform mat4 modelViewMatrix;

      uniform mat4 projectionMatrix;

      varying vec3 v_normal;

      void main() {

          v_normal = normal;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      }

  `,

        fragmentShader: `

      precision mediump float;

      uniform vec3 lightPosition;

      uniform vec3 lightColor;

      varying vec3 v_normal;

      void main() {

          vec3 N = normalize(v_normal);

          vec3 L = normalize(lightPosition - gl_FragCoord.xyz);

          float lambertTerm = dot(N, L);

          gl_FragColor = vec4(lightColor * lambertTerm, 1.0);

      }

  `,
      };
      // 在渲染循环中使用着色器进行渲染
      viewer.scene.postRender.addEventListener(function () {
        // var modelViewMatrix = viewer.camera.viewMatrix.multiplyRight(modelMatrix);

        var viewMatrix = viewer.camera.viewMatrix;
        var modelMatrix = model.modelMatrix;
        var resultMatrix = new Cesium.Matrix4();
        var modelViewMatrix = Cesium.Matrix4.multiply(viewMatrix, modelMatrix, resultMatrix);
        console.log(viewer.camera.viewMatrix, modelMatrix);

        var projectionMatrix = viewer.camera.frustum.projectionMatrix;

        var lightPosition = Cesium.Cartesian3.fromDegrees(120.79631485728412, 30.317349846366948, 5.0); // 定义点光源的位置

        var mod = viewer.entities.add({
          position: lightPosition,
          clampToGround: true,
          point: {
            pixelSize: 10, //大小
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.RED, //边框颜色
            outlineWidth: 3, //宽 边框
            disableDepthTestDistance: Number.POSITIVE_INFINITY, //防止被遮挡
          },
        });

        var lightColor = new Cesium.Color(1.0, 1.0, 1.0); // 定义点光源的颜色
        return;
        viewer.scene.primitives.add(
          new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
              geometry: model.geometry,
              modelMatrix: modelMatrix,
            }),

            appearance: new Cesium.Appearance({
              material: new Cesium.Material({
                fabric: {
                  type: "Custom",

                  uniforms: {
                    lightPosition: lightPosition,

                    lightColor: lightColor,
                  },

                  source: pointLightShader,
                },
              }),
            }),

            modelMatrix: modelMatrix,

            viewMatrix: modelViewMatrix,

            projectionMatrix: projectionMatrix,

            cull: false,
          })
        );
      });
    }

    //********** */
  })();
};
