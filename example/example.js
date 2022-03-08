"use strict";
/**
 * Visualization map spatial data service R&D
 * @author Oran
 * @version 1.1
 * @time 2021/3/26
 */
(function (window) {
  class gear {
    constructor(viewer) {
      this.viewer = viewer;
      this.DynamicDraw = undefined;

      this.Rain = null; //雨
      this.Snow = null; //雪
      this.Fog = null; //雾
    }

    //#region example
    //抛出全部方法
    findProperties(obj, ...arg) {
      function getProperty(new_obj) {
        if (new_obj.__proto__ === null) {
          //说明该对象已经是最顶层的对象
          return [];
        }

        let properties = Object.getOwnPropertyNames(new_obj);

        let arr = [];

        arg.forEach(v => {
          const newValue = properties.filter(property => {
            return property.startsWith(v);
          });

          if (newValue.length > 0) {
            arr = arr.concat(newValue);
          }
        });

        return [...arr, ...getProperty(new_obj.__proto__)];
      }

      return getProperty(obj);
    }

    //释放方法
    release() {
      this.findProperties(G, "").forEach(model => {
        if (model.indexOf("Release") != -1) {
          var e = eval("G." + model);
          e(this.viewer);
        }
      });
    }
    //保持链接
    Link(e) {
      function getQueryVariable() {
        var query = window.location.href;
        var vars = query.split("#");
        if (vars.length > 1) {
          return vars[1] == "" ? false : vars[1];
        }
        return false;
      }

      hashChangeFire();
      if (getQueryVariable()) {
        setTimeout(() => {
          console.log(decodeURI(getQueryVariable()));
        }, 1000);
      }
      if ("onhashchange" in window && (typeof document.documentMode === "undefined" || document.documentMode == 8)) {
        // 浏览器支持onhashchange事件
        window.onhashchange = hashChangeFire; // TODO，对应新的hash执行的操作函数
      } else {
        // 不支持则用定时器检测的办法
        setInterval(function () {
          var ischanged = isHashChanged(); // TODO，检测hash值或其中某一段是否更改的函数
          if (ischanged) {
            hashChangeFire(); // TODO，对应新的hash执行的操作函数
          }
        }, 150);
      }
      function hashChangeFire() {
        var _index = getQueryVariable();
        if (e) e(_index);
      }
    }

    uuid() {
      var temp_url = URL.createObjectURL(new Blob());
      var uuid = temp_url.toString(); // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
      URL.revokeObjectURL(temp_url);
      return uuid.substr(uuid.lastIndexOf("/") + 1);
    }
    //#endregion

    //#region
    /**
     * 加载底图
     */
    example_addBaseLayer() {
      G.BaseLayer(this.viewer, {
        name: "影像底图",
        type: "mapbox", //www_google sl_geoq
        layer: "blue", //satellite
        // crs: '4326',
        brightness: 1,
      });
    }
    /**
     * 日照
     */
    example_runshineAnalysis() {
      var setvisible = G.E.runshineAnalysis();
      setvisible(this.viewer, "play"); //stop
    }
    /**
     * 定位摄像头
     */
    example_positioning_camera(id) {
      var 摄像头 = G.Query_X(this.viewer, {
        type: "摄像头",
      });

      for (let i = 0; i < 摄像头.length; i++) {
        const element = 摄像头[i];
        var selectedColor = new Cesium.Color(1, 1, 1, 0.95);
        element.color = selectedColor;

        if (element.object.id == id) {
          var selectedColor = Cesium.Color["Blue".toUpperCase()].withAlpha(0.7); //new Cesium.Color(0, 1, 0, 1);
          element.color = selectedColor;

          var camera = new Function("return " + element.object.camera)();

          Object.assign(camera, {
            duration: 3,
            force: true, //强制
          });
          G.Go(this.viewer, camera);
          return true;
        }
      }

      return false;
    }

    //销毁漫游
    IntelligentRoaming_Destroy() {
      const viewer = this.viewer;

      this.viewer.RoamingStatus == false; //解除防冲突
      window.mousePosition = function (ev) {
        //解除防冲突 （移动侦测事件等）
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

      viewer.scene.postRender.removeEventListener(viewer.IntelligentRoaming_EventListener); //接触移动计算事件

      viewer.scene.preRender.removeEventListener(viewer.roamingBubbles);
      $("#htmlOverlay").hide(); //漫游气泡

      $(".overview-close").click();
      /**
       * 视角释放
       */
      viewer.scene.postUpdate.removeEventListener(viewer.IntelligentRoaming_VisualEvent);
      viewer.trackedEntity = undefined;
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      /**
       * 销毁路径 及 人物模型
       */
      var mods = G.Query_X(viewer, {
        type: "IntelligentRoaming",
      });
      if (mods.length >= 1) {
        mods.forEach(element => {
          G.dMod(viewer, element);
        });
      }
      /**
       * 销毁路径 及 人物模型
       */
      var mods = G.Query_X(viewer, {
        type: "IntelligentRoamingV2",
      });
      if (mods.length >= 1) {
        mods.forEach(element => {
          G.dMod(viewer, element);
        });
      }

      viewer.dataSources.removeAll();
      /**
       * 初始化时间及还原时间速率
       */
      // viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
      viewer.clock.multiplier = 1;
      viewer.clock.worldSpeedCache = viewer.clock.multiplier;
    }
    //视角
    IntelligentRoaming_Visual(options) {
      const viewer = this.viewer;

      viewer.scene.postUpdate.removeEventListener(viewer.IntelligentRoaming_VisualEvent);
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      viewer.trackedEntity = undefined;
      var entity = null;

      var array = G.Query_X(viewer, { type: "IntelligentRoaming" });

      for (let index = 0; index < array.length; index++) {
        const element = array[index];

        if (element.id == "Will I still be able to use data roaming after I have NO!") {
          entity = element;
        }
      }
      if (entity == null) {
        return;
      }
      var visual = options.visual ?? {
        type: 2,
        zoomTo: false,
      }; //视角 0是无绑定 1是第一人称 3是第三人称 2是跟随
      //console.log(entity,entity.position);
      viewer.IntelligentRoaming_VisualEvent = function (scene, time) {
        if (!Cesium.defined(entity.position)) {
          return;
        }
        var position = entity.position.getValue(time);
        var camera = viewer.camera;
        switch (visual.type) {
          case 3:
            camera.position = new Cesium.Cartesian3(-5, -0, options.visual.height == null ? 10.435945991426706 : options.visual.height);
            camera.direction = new Cesium.Cartesian3(0.3987584249598806, 0.009354600409072824, options.visual.direction == null ? Cesium.Math.toRadians(-65) : Cesium.Math.toRadians(options.visual.direction));
            camera.up = new Cesium.Cartesian3(0.916756064443912, 0.021506470654472087, 0.39886813613686706);
            camera.right = new Cesium.Cartesian3(0.02345286397916243, -0.9997249437576193, -2.908438299226157);
            break;
          case 2:
            //绑定方式
            viewer.trackedEntity = entity;
            break;
          case 1:
            camera.position = new Cesium.Cartesian3(0, 0.0, options.visual.height ?? 1.5); //位置一是前后视距
            camera.direction = new Cesium.Cartesian3(1.0, 0.0, Cesium.Math.toRadians(options.visual.direction ?? 0));
            camera.up = new Cesium.Cartesian3(0.0, 0.0, 1.0);
            camera.right = new Cesium.Cartesian3(0.0, -1.0, 0.0);
            break;
        }

        if (!Cesium.defined(position)) {
          return;
        }

        var transform;
        if (!Cesium.defined(entity.orientation)) {
          transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        } else {
          var orientation = entity.orientation.getValue(time);
          if (!Cesium.defined(orientation)) {
            return;
          }

          transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation), position);
        }

        // Save camera state
        var offset = Cesium.Cartesian3.clone(camera.position);
        var direction = Cesium.Cartesian3.clone(camera.direction);
        var up = Cesium.Cartesian3.clone(camera.up);

        // Set camera to be in model's reference frame.
        camera.lookAtTransform(transform);

        // Reset the camera state to the saved state so it appears fixed in the model's frame.
        Cesium.Cartesian3.clone(offset, camera.position);
        Cesium.Cartesian3.clone(direction, camera.direction);
        Cesium.Cartesian3.clone(up, camera.up);
        Cesium.Cartesian3.cross(direction, up, camera.right);
      };
      if (visual.type != 0) {
        viewer.scene.postUpdate.addEventListener(viewer.IntelligentRoaming_VisualEvent);
      }

      if (visual.type == 2) {
        viewer.zoomTo(entity, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-100), Cesium.Math.toRadians(-65), 20));
      }
    }
    //跳转点位
    JumpTimePoint(options) {
      var viewer = this.viewer;
      if (!Cesium.defined(viewer.PatrolPoint) || !Cesium.defined(options)) {
        return;
      }
      var PatrolIndex = viewer.PatrolIndex == null ? 0 : viewer.PatrolIndex;
      var PatrolPoint = viewer.PatrolPoint;
      var start_time;
      switch (options.type) {
        case "++":
          if (PatrolIndex >= PatrolPoint.length) {
            PatrolIndex = PatrolPoint.length;
          }
          start_time = PatrolPoint[PatrolIndex].time;
          break;
        case "--":
          if (PatrolIndex - 2 <= 0) {
            PatrolIndex = 0;
          } else {
            PatrolIndex -= 2;
          }
          start_time = PatrolPoint[PatrolIndex].time;
          break;
        default:
          return;
      }

      viewer.PatrolIndex = PatrolIndex;
      // console.log(PatrolIndex)
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(start_time));
    }
    //行走速度控制
    IntelligentRoaming_Speed(options) {
      const viewer = this.viewer;
      viewer.clock.multiplier = options.multiplier;
      viewer.clock.worldSpeedCache = viewer.clock.multiplier;
    }
    //发光线
    IntelligentRoamingDynamicLine(viewer, list) {
      var alp = 1;
      var num = 0;
      viewer.entities.add({
        type: "IntelligentRoaming",
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(list),
          width: 26,
          material: new Cesium.PolylineGlowMaterialProperty({
            //发光线
            glowPower: 0.1,
            color: new Cesium.CallbackProperty(function () {
              if (num % 2 === 0) {
                alp -= 0.005;
              } else {
                alp += 0.005;
              }
              if (alp <= 0.2) {
                num++;
              } else if (alp >= 1) {
                num++;
              }
              return Cesium.Color.ORANGE.withAlpha(alp);
              //entity的颜色透明 并不影响材质，并且 entity也会透明
            }, false),
          }),
          clampToGround: false,
        },
      });
    }
    /**
     * 漫游展示 不带贴地
     */
    example_IntelligentRoaming(options) {
      const viewer = this.viewer;
      const GMDC = new G.M.DrawCurve(Cesium, viewer); //曲线算法

      var _this = this;
      //模型行走数度
      var timer = options.timer ?? 10;
      //算法路径速度
      var FineBezierTimer = options.FineBezierTimer ?? 0.01;
      //当前世界速度 (可整体提高行走速度 必要也可以暂停模型)
      viewer.clock.multiplier = options.multiplier ?? 1;
      //节点停留时间
      var nodeTime = (options.nodeTime ?? 0) * 1000;

      viewer.RoamingStatus == true; //漫游防冲突

      //漫游防冲突
      window.mousePosition = function (ev) {
        return {
          // IE浏览器
          x: 0,
          y: 0,
        };
      };

      //original 原始段落
      var original = [
        //二层
        [
          { type: "", x: 120.2660368451607, y: 30.29511702210979, z: 15.4 },
          { type: "key", x: 120.2660012287198, y: 30.29509367822525, z: 15.4 },
          { type: "", x: 120.26601760723695, y: 30.295109004174265, z: 15.4 },
          { type: "", x: 120.26600421944171, y: 30.295123976116074, z: 15.4 },
          { type: "key", x: 120.26598474223172, y: 30.29511147502895, z: 15.4 },
          { type: "", x: 120.26597116788176, y: 30.29509890590284, z: 15.4 },
          { type: "", x: 120.26598547626028, y: 30.295081841058693, z: 15.4 },
          { type: "", x: 120.26602316551805, y: 30.295071551185533, z: 15.4 },
          {
            type: "key",
            x: 120.26602910251187,
            y: 30.295006325370586,
            z: 15.4,
          },
          { type: "", x: 120.26608257291365, y: 30.294978831184494, z: 15.4 },
          {
            type: "key",
            x: 120.26611025414478,
            y: 30.294946745678732,
            z: 15.4,
          },
          { type: "", x: 120.26608362088439, y: 30.295000616403563, z: 15.4 },
          { type: "", x: 120.26608816936331, y: 30.295012155115316, z: 15.4 },
          { type: "", x: 120.26601236388451, y: 30.295097235271356, z: 15.4 },
          { type: "", x: 120.26603479558496, y: 30.295111720433717, z: 15.4 },
        ],
        [
          {
            type: "",
            x: 120.266022269221,
            y: 30.295136134900925,
            z: 11.1000014434369276388644,
          },
          {
            type: "",
            x: 120.26607018319382,
            y: 30.295081327299428,
            z: 11.1000014522918277737906,
          },
          {
            type: "",
            x: 120.26604852023095,
            y: 30.2950676428003,
            z: 11.1000014360364629356555,
          },
          {
            type: "key",
            x: 120.26603768602007,
            y: 30.29507996370532,
            z: 11.1000014460724111348318,
          },
          {
            type: "key",
            x: 120.26601613675925,
            y: 30.295104473261198,
            z: 11.1000014571288889241222,
          },
          {
            type: "key",
            x: 120.26598897475026,
            y: 30.29513636102342,
            z: 11.1000014442401308659367,
          },
          {
            type: "",
            x: 120.26598795680533,
            y: 30.29513348955743,
            z: 11.1000014459594233138767,
          },
          {
            type: "",
            x: 120.26605761103963,
            y: 30.29505287955241,
            z: 11.1000014367309520687448,
          },
          {
            type: "",
            x: 120.26608223571623,
            y: 30.295060226780475,
            z: 11.1000014425814956846612,
          },
          {
            type: "key",
            x: 120.2661006650281,
            y: 30.29503986421598,
            z: 11.1000014512193919891196,
          },
          {
            type: "",
            x: 120.2661141063551,
            y: 30.295021339847548,
            z: 11.1000014535292593806284,
          },
          {
            type: "",
            x: 120.26608529266133,
            y: 30.29500674663175,
            z: 11.10007251651091028833,
          },
          {
            type: "",
            x: 120.26606572332417,
            y: 30.295029571558842,
            z: 11.10007287600405734316,
          },
          {
            type: "key",
            x: 120.26606747168297,
            y: 30.295030550344567,
            z: 11.1000014557691751467067,
          },
          {
            type: "",
            x: 120.26610605005412,
            y: 30.294994535519393,
            z: 11.1000014526037739964244,
          },
          {
            type: "key",
            x: 120.26612494829978,
            y: 30.29499111847445,
            z: 11.100001444040527395054,
          },
          {
            type: "",
            x: 120.26609058338829,
            y: 30.295006037727852,
            z: 11.1000013942951336988252,
          },
          {
            type: "",
            x: 120.26607630784315,
            y: 30.29499647009417,
            z: 11.1000014540518073845204,
          },
          {
            type: "",
            x: 120.26608717019937,
            y: 30.294982391846986,
            z: 11.1000014484705981329115,
          },
          {
            type: "key",
            x: 120.26607724727543,
            y: 30.294969471963288,
            z: 11.1000014411517284587335,
          },
          {
            type: "",
            x: 120.26605928251793,
            y: 30.294957503186172,
            z: 11.100001443733177466541,
          },
          {
            type: "",
            x: 120.2660859460819,
            y: 30.294927010111763,
            z: 11.1000011201258544629688,
          },
          {
            type: "",
            x: 120.26611342168403,
            y: 30.294944532667103,
            z: 11.100001451793947989792,
          },
          {
            type: "key",
            x: 120.26613009167355,
            y: 30.294924466956676,
            z: 11.100001446309707647593,
          },
          {
            type: "key",
            x: 120.26615225979764,
            y: 30.294899063186456,
            z: 11.100001446183049936821,
          },
          {
            type: "",
            x: 120.26615053616045,
            y: 30.29489760240984,
            z: 11.1000014447240182067516,
          },
          {
            type: "",
            x: 120.26611000397695,
            y: 30.294944603496614,
            z: 11.100001452891374523534,
          },
          {
            type: "",
            x: 120.2660876605073,
            y: 30.294931891787463,
            z: 11.10000027733403533945673,
          },
          {
            type: "",
            x: 120.26608135895242,
            y: 30.294938765246094,
            z: 11.100001456961544059396,
          },
          {
            type: "",
            x: 120.26607530978386,
            y: 30.294936546512613,
            z: 11.1000014563663728472883,
          },
          {
            type: "",
            x: 120.26605323985758,
            y: 30.294963183538275,
            z: 11.1000014373418196769156,
          },
          {
            type: "",
            x: 120.26608951791734,
            y: 30.294984944039047,
            z: 11.100001450022647532125,
          },
          {
            type: "",
            x: 120.26607604800786,
            y: 30.294997948929087,
            z: 11.1000014545020547032244,
          },
          {
            type: "",
            x: 120.26608522263618,
            y: 30.295004134934867,
            z: 11.1000008810355083394509,
          },
          {
            type: "",
            x: 120.26605181406458,
            y: 30.29504428916469,
            z: 11.1000014371428612831822,
          },
          {
            type: "",
            x: 120.26604995577739,
            y: 30.295072962882138,
            z: 11.100001437154182141392,
          },
          {
            type: "",
            x: 120.26609844093275,
            y: 30.295102791271326,
            z: 11.1000014577780946336362,
          },
          {
            type: "",
            x: 120.26604314743311,
            y: 30.2951685598295,
            z: 11.1000014441381413504486,
          },
          {
            type: "",
            x: 120.26612766738874,
            y: 30.295065021249542,
            z: 11.100001435850851906121,
          },
          {
            type: "",
            x: 120.2661764379549,
            y: 30.29498379993212,
            z: 11.100002852251571516899,
          },
          {
            type: "",
            x: 120.26621565603025,
            y: 30.29497139036094,
            z: 11.10000284594853335152,
          },
          {
            type: "",
            x: 120.26623819718812,
            y: 30.294975284723474,
            z: 11.1000028491815370939775,
          },
        ],
        //一层
        [
          {
            type: "",
            x: 120.26624401187938,
            y: 30.294976014312144,
            z: 11.100000726253241282722,
          },
          {
            type: "key",
            x: 120.26630272368395,
            y: 30.294984410845746,
            z: 11.1000028139399571918875,
          },
          {
            type: "key",
            x: 120.26638485776135,
            y: 30.294998672965637,
            z: 11.100002883705341112866,
          },
          {
            type: "",
            x: 120.26638271856714,
            y: 30.29499479312582,
            z: 11.1000028789882130991057,
          },
          {
            type: "",
            x: 120.2662349465476,
            y: 30.294970109185204,
            z: 11.100001436771639213543,
          },
          {
            type: "",
            x: 120.26625533005296,
            y: 30.29489144032667,
            z: 11.1000014448640232880098,
          },
          {
            type: "key",
            x: 120.26629506606672,
            y: 30.2948969055656,
            z: 11.100001440370946221986,
          },
          {
            type: "key",
            x: 120.26634101460905,
            y: 30.294902564299232,
            z: 11.1000014516216843307264,
          },
          {
            type: "key",
            x: 120.26638291522356,
            y: 30.294908558809276,
            z: 11.100001445162622148413,
          },
          {
            type: "key",
            x: 120.26642581298205,
            y: 30.294913919391274,
            z: 11.1000014559971773066277,
          },
          {
            type: "",
            x: 120.26647946296352,
            y: 30.294919102586274,
            z: 11.1000014464497127415318,
          },
          {
            type: "key",
            x: 120.26662803386344,
            y: 30.294968153444398,
            z: 11.1000028056813890417633,
          },
          {
            type: "key",
            x: 120.26668058278597,
            y: 30.294985565154203,
            z: 11.100002847320728799935,
          },
          {
            type: "key",
            x: 120.26672708914933,
            y: 30.295000901230296,
            z: 11.1000028861209285526123,
          },
          {
            type: "",
            x: 120.26672739417022,
            y: 30.295052493448456,
            z: 11.1000014343798542892423,
          },
          {
            type: "",
            x: 120.2667326297424,
            y: 30.295059645007445,
            z: 11.1000014294995362695284,
          },
          {
            type: "",
            x: 120.26671205686331,
            y: 30.29509957860813,
            z: 11.100001454983372322556,
          },
          {
            type: "key",
            x: 120.26665397982279,
            y: 30.295079638982124,
            z: 11.1000028668658034500835,
          },
          {
            type: "",
            x: 120.26666088445742,
            y: 30.295077212387618,
            z: 11.1000028754313990656845,
          },
          {
            type: "",
            x: 120.2667135574029,
            y: 30.295096588988986,
            z: 11.100000726083326676191,
          },
          {
            type: "",
            x: 120.26673677786766,
            y: 30.295045776507692,
            z: 11.1000014377052307027122,
          },
          {
            type: "key",
            x: 120.26666986606729,
            y: 30.29502276393006,
            z: 11.1000014547457532964383,
          },
          {
            type: "",
            x: 120.26662233393985,
            y: 30.294980400337234,
            z: 11.100001444933754236947,
          },
          {
            type: "",
            x: 120.26647470079591,
            y: 30.294928046792265,
            z: 11.100002847563266575573,
          },
          {
            type: "",
            x: 120.2663647697485,
            y: 30.294912391917904,
            z: 11.1000029056665463991234,
          },
          {
            type: "",
            x: 120.26621825135278,
            y: 30.294878477872608,
            z: 11.100002916650944223863,
          },
          {
            type: "",
            x: 120.26643595942,
            y: 30.294383161437686,
            z: 11.100002900220219985142,
          },
          {
            type: "",
            x: 120.26652175016062,
            y: 30.294380358658533,
            z: 11.1000029047720296113746,
          },
          {
            type: "",
            x: 120.26715739969255,
            y: 30.294563838102825,
            z: 11.100005795274724305796,
          },
          {
            type: "",
            x: 120.26723975635218,
            y: 30.294267426513642,
            z: 11.100005789079229434332,
          },
          {
            type: "",
            x: 120.26719789581222,
            y: 30.294229192515644,
            z: 11.10000579635741196325,
          },
          {
            type: "",
            x: 120.26665652453826,
            y: 30.294058158516098,
            z: 11.10000551244890309962,
          },
          {
            type: "",
            x: 120.26666987962854,
            y: 30.294002127280873,
            z: 11.100005638708590732101,
          },
          {
            type: "",
            x: 120.26694794012205,
            y: 30.29408489667982,
            z: 11.1000014563400921978364,
          },
          {
            type: "",
            x: 120.26693165246031,
            y: 30.294116034050518,
            z: 11.1000014410394772669757,
          },
          {
            type: "",
            x: 120.26698591096611,
            y: 30.294148109487594,
            z: 11.1000028444435632580167,
          },
          {
            type: "key",
            x: 120.26707840436494,
            y: 30.29417389201056,
            z: 11.100002911034896751839,
          },
          {
            type: "",
            x: 120.26698436748961,
            y: 30.29414190377488,
            z: 11.1000028397491787088747,
          },
          {
            type: "",
            x: 120.26693533942996,
            y: 30.294113376858405,
            z: 11.100002839484542421034,
          },
          {
            type: "",
            x: 120.26694808184095,
            y: 30.29408378812266,
            z: 11.100002872739522043486,
          },
          {
            type: "",
            x: 120.26690745962028,
            y: 30.29405956955781,
            z: 11.100002907028599302366,
          },
          {
            type: "",
            x: 120.26675257537744,
            y: 30.29402127479989,
            z: 11.1000014412634264311056,
          },
          // ,{type:"",x: 120.26676498437418, y: 30.293842657741877, z: 11.1000014488922158516126}

          { type: "", x: 120.26675305507352, y: 30.293981638363483, z: 11 },
          { type: "", x: 120.26676052736121, y: 30.29390982994101, z: 10.2 },
          { type: "", x: 120.26676490785538, y: 30.293871846100508, z: 9.3 },
          // ,{type:"",x: 120.26676035760649, y: 30.293910173771813, z: 10}
          { type: "key", x: 120.2667528566748, y: 30.293821187698278, z: 9.3 },
          { type: "", x: 120.26675742569896, y: 30.29384505464657, z: 9.3 },
          { type: "", x: 120.26676513816976, y: 30.29385785103921, z: 9.3 },
          { type: "", x: 120.2667488874321, y: 30.294024800260438, z: 11 },
          {
            type: "",
            x: 120.2666689693479,
            y: 30.294000601422688,
            z: 11.100005638495962437556,
          },
          {
            type: "",
            x: 120.26668571749497,
            y: 30.293826030300433,
            z: 11.100005577709465040575,
          },
          {
            type: "",
            x: 120.26652590953324,
            y: 30.293817056737282,
            z: 11.1000014578493263067452,
          },
          {
            type: "key",
            x: 120.26652821545038,
            y: 30.293781875969973,
            z: 11.100001448523886033876,
          },
        ],
        // ,
        // [
        //     {type:"",x: 120.26652179842681, y: 30.29381657194753, z: 11}
        //     ,{type:"",x: 120.26669671947187, y: 30.293828887744496,z: 11}
        //     ,{type:"",x: 120.26669306249717, y: 30.29387670075232, z: 18}
        //     ,{type:"_",x: 120.2667625279891, y: 30.29387216217762, z: 18}
        //     ,{type:"",x: 120.26676676583135, y: 30.293826347866133, z: 18}
        //     ,{type:"",x: 120.26671666690734, y: 30.29381020633981, z: 18}
        //     ,{type:"",x: 120.26657398766946, y: 30.29380391728507, z: 18}
        //     ,{type:"__",x: 120.26657547134509, y: 30.293749584242217, z: 18}
        //     ,{type:"",x: 120.26652867077527, y: 30.293747000088782, z: 18}
        // ]
      ];
      //curve 根据算法生成曲线
      var curve = [];

      for (let index = 0; index < original.length; index++) {
        const elements = original[index];

        const start = original[index][0];
        //设置非计算点位抬头
        var position = Cesium.Cartesian3.fromDegrees(start.x, start.y, start.z);
        position.time = timer; //初始化段落的行走速度
        position.index = index; //设置点位归属的段落
        position.type = start.type; //判断点位类型 (重点点位等)
        curve.push(position); //添加抬头

        // //中间段循环计算曲线
        for (let i = 0; i < elements.length; i++) {
          //两点为线 三点为角 取三点偏移
          const _start = elements[i]; //起始点
          const _horn = elements[i + 1]; //角
          const _end = elements[i + 2]; //结束点
          if (_end == null) {
            //end 结束跳循环
            break;
          }

          //偏移点靠近角 防止曲线过长 40为倍数
          var a = _start.x - _horn.x;
          var b = _start.y - _horn.y;
          var c = _horn.x + (a / 40) * 2;
          var d = _horn.y + (b / 40) * 2;
          //偏移点靠近角 防止曲线过长 40为倍数
          var e = _horn.x - _end.x;
          var f = _horn.y - _end.y;
          var g = _horn.x - (e / 40) * 2;
          var h = _horn.y - (f / 40) * 2;

          //偏移后的点位 不带高度
          var Line = GMDC.fineBezier(Cesium.Cartesian3.fromDegreesArray([c, d, _horn.x, _horn.y, _horn.x, _horn.y, g, h]), 180); //180为弯道点的密度 适当调整可控制转弯速度

          Line[0].time = FineBezierTimer; //曲线行进速度
          Line[0].type = _horn.type; //以中心的类型作为评判

          Line[Line.length - 1].time = timer;
          Line.forEach(element => {
            var point = {};
            var cartographic = Cesium.Cartographic.fromCartesian(element);
            point.x = Cesium.Math.toDegrees(cartographic.longitude);
            point.y = Cesium.Math.toDegrees(cartographic.latitude);
            point.z = _horn.z; //还原点位高度

            var Cartesian3 = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z);
            element.x = Cartesian3.x;
            element.y = Cartesian3.y;
            element.z = Cartesian3.z;
            element.index = index; //设置曲线归属段落

            curve.push(element); //填充中间段
          });
        }
        const end = original[index][original[index].length - 1];
        //设置非计算点位结尾
        var position = Cesium.Cartesian3.fromDegrees(end.x, end.y, end.z);
        position.time = timer; //初始化段落的行走速度
        position.index = index; //设置点位归属的段落
        position.type = end.type; //判断点位类型 (重点点位等)
        curve.push(position); //添加结尾
      }

      //将原始点位的毫秒转时戳
      function getTimeList(Line) {
        var Data = []; //人物漫游时路线数据存储
        var cameraTimer = "04:00:00";
        var mm = timer; //一截路的时长
        for (let index = 0; index < Line.length; index++) {
          if (Cesium.defined(Line[index].time)) {
            mm = Line[index].time;
          }
          const element = Line[index];
          var cartographic = Cesium.Cartographic.fromCartesian(element);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var mapPosition = { x: lng, y: lat, z: cartographic.height };

          Data.push({
            id: "ROAMING_" + index,
            x: mapPosition.x,
            y: mapPosition.y,
            z: mapPosition.z,
            index: element.index,
            type: element.type,
            time: ISODateString(new Date()), //设置漫游起始时间或当前时间
            ss: 20, // 停留的时长
          });
          var hour = cameraTimer.split(":")[0];
          var min = cameraTimer.split(":")[1];
          var sec = cameraTimer.split(":")[2];
          var s = Number(hour * 3600) + Number(min * 60) + Number(sec); //加当前相机时间
          cameraTimer = G.formatTime(s + mm);

          //根据TMG时戳填充时分秒时差
          function ISODateString(d) {
            function pad(n) {
              return n < 10 ? "0" + n : n;
            }
            return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + "T" + cameraTimer + "Z";
          }
        }
        return Data;
      }

      var FR_CURVE = getTimeList(curve);
      // console.log(FR_CURVE)

      var timeStamp = []; //段落节点
      var polyLineArr = new Array(); //线段
      var PatrolPoint = []; //巡视点

      FR_CURVE.forEach(element => {
        if (FR_CURVE.index != element.index) {
          FR_CURVE.index = element.index;
          timeStamp.push(element);
        }

        if (element.type == "key") {
          PatrolPoint.push(element);
        }

        if (!polyLineArr[element.index]) polyLineArr[element.index] = new Array();
        polyLineArr[element.index].push(element.x, element.y, element.z - 0.1);
      });
      polyLineArr.forEach(element => {
        _this.IntelligentRoamingDynamicLine(viewer, element);
      });

      var uri = (WEBGL_DEBUG ?WEBGL_Local:WEBGL_Server) + "/%E4%BA%BA%E7%89%A9%E7%8E%AF%E6%A8%A1%E5%9E%8B/%E4%BA%BA%E7%89%A9/%E7%99%BD%E8%86%9C%E8%A1%8C%E8%B5%B0/scene.gltf";
      var _options = { positions: FR_CURVE };
      _options.url = uri;
      _options.scale = 0.01;
      console.log(FR_CURVE);
      var entity = G.aFR(viewer, _options);
      entity.path = {
        show: true,
        leadTime: 0,
        width: 26,
        resolution: 0.1,
        material: new Cesium.PolylineGlowMaterialProperty({
          //发光线
          glowPower: 0.1,
          color: Cesium.Color.GREEN.withAlpha(1),
        }),
      };
      entity.type = "IntelligentRoaming";

      //处理运动过程
      var _position = entity.position;
      var _point; //🦅眼点位 entity
      app_viewer(function (point) {
        _point = point;
      });

      viewer.PatrolPoint = PatrolPoint;

      var worldSpeedCache = 1;
      var InitialTime = { time: null, lock: false };
      viewer.PatrolIndex = 0;

      viewer.IntelligentRoaming_EventListener = function (scene, time) {
        if (!Cesium.defined(_position)) {
          return;
        }
        if (Cesium.defined(_point)) {
          _point.position = _position.getValue(time);
        }
        // viewer.PatrolIndex
        if (InitialTime.time == null) {
          InitialTime.time = new Date(time.toString()).getTime();
        } //取初始时间
        var Current_stamp = new Date(time.toString()).getTime();
        var Node_stamp = new Date(timeStamp[1].time).getTime();
        if (viewer.PatrolIndex >= PatrolPoint.length) {
          viewer.PatrolIndex--;
        }
        if (Current_stamp >= new Date(PatrolPoint[viewer.PatrolIndex].time.toString()).getTime() - 100) {
          //开始 && !InitialTime.lock

          _this.IntelligentRoaming_Speed({
            multiplier: 0, //当前世界速度 (可整体提高行走速度 必要也可以暂停模型)
          });

          var mapPosition = PatrolPoint[viewer.PatrolIndex];

          var wsc = {
            name: "IntelligentRoaming",
            index: viewer.PatrolIndex,
            position: mapPosition,
            equipment: viewer.PatrolIndex,
          };
          console.log(wsc);
          // console.log(viewer.PatrolIndex,BackReference(viewer.PatrolIndex),'PatrolIndex')

          viewer.PatrolIndex++;
          setTimeout(() => {
            _this.IntelligentRoaming_Speed({
              multiplier: worldSpeedCache, //当前世界速度 (可整体提高行走速度 必要也可以暂停模型)
            });
          }, nodeTime);
        }

        if (viewer.clock.multiplier != 0) {
          worldSpeedCache = viewer.clock.multiplier;
        } //缓存变速

        if (Current_stamp >= InitialTime.time && !InitialTime.lock) {
          //开始
          // console.log("时间重置判断成立",new Date(Current_stamp).format("yyyy-MM-dd hh:mm:ss"))
          InitialTime.lock = true; //起始锁 开启
          timeStamp[timeStamp.length - 1].lock = false; //末尾锁 关闭

          viewer.PatrolIndex = 0; //重点坐标重置
          //如下操作是防止短时间内事件重复
          timeStamp[1].lock = false;
          timeStamp[0].lock = false;
        }
        if (Current_stamp >= new Date(timeStamp[timeStamp.length - 1].time.toString()).getTime() - 200 && !timeStamp[timeStamp.length - 1].lock) {
          console.log("时间事件末尾", new Date(Current_stamp));

          timeStamp[timeStamp.length - 1].lock = true; //末尾锁 开启
          InitialTime.lock = false; //起始锁 关闭

          viewer.PatrolIndex = 0; //重点坐标重置
          //如下操作是防止短时间内事件重复
          timeStamp[1].lock = false;
          timeStamp[0].lock = false;
        }

        if (Current_stamp > Node_stamp && !timeStamp[1].lock) {
          timeStamp[1].lock = true; //锁

          console.log("一楼判断成立");
        }

        if (Current_stamp > new Date(timeStamp[0].time).getTime() && !timeStamp[0].lock) {
          timeStamp[0].lock = true; //锁

          console.log("二楼判断成立");
        }

        if (Current_stamp > new Date(timeStamp[2].time).getTime() && !timeStamp[2].lock) {
          timeStamp[2].lock = true; //锁

          console.log("园外判断成立");
        }
      };
      viewer.scene.postRender.addEventListener(viewer.IntelligentRoaming_EventListener);

      function app_viewer(e) {
        $("#mapBox").append(`<div id="Overview" class="map-container"></div>`);
        var viewer = G.C.addOverview("Overview");
        $(".overview-div").append(`<div class="btn-group mb-2" style="position: absolute;bottom: 10%;left: 42%;z-index: 999;"></div>`);

        viewer.scene.globe.show = false;

        polyLineArr.forEach(element => {
          _this.IntelligentRoamingDynamicLine(viewer, element);
        });

        $(".overview-narrow").click();
        var point = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(0, 0),
          clampToGround: true,
          point: {
            pixelSize: 10, //大小
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.RED, //边框颜色
            outlineWidth: 3, //宽 边框
            disableDepthTestDistance: Number.POSITIVE_INFINITY, //防止被遮挡
          },
        });
        G.Go(viewer, {
          h: 5.98,
          p: -0.4620486427,
          r: 6.28,
          x: 120.267191,
          y: 30.293718,
          z: 79.57,
          duration: 0,
        });

        e(point);
        return viewer;
      }
    }

    //场景透明可视化
    example_TransparentVisualization() {
      var viewer = this.viewer;
      console.log(viewer.scene.primitives);
      for (var i = 0; i < viewer.scene.primitives.length; i++) {
        var defaultStyle = new Cesium.Cesium3DTileStyle({
          color: "color('white', 0.08)",
        });
        viewer.scene.primitives.get(i).style = defaultStyle;
      }

      for (var i = 0; i < viewer.scene.primitives.length; i++) {
        var model = viewer.scene.primitives.get(i);

        var str = decodeURI(model._url);

        var defaultStyle = new Cesium.Cesium3DTileStyle({
          color: "color('white', 1)",
        });
        var shapeType;
        if (str.indexOf("DX") != -1) {
          shapeType = "地面";
        } else if (str.indexOf("SB") != -1) {
          shapeType = "设备";
          model.style = defaultStyle;
        } else if (str.indexOf("JZSW") != -1) {
          shapeType = "室外建筑";
        } else if (str.indexOf("JZ") != -1) {
          shapeType = "建筑";
        } else if (str.indexOf("LH") != -1) {
          shapeType = "绿化";
        } else if (str.indexOf("XP") != -1) {
          shapeType = "其他";
        } else {
          shapeType = str;
        }
        // /DX/11/
        // /DX/16/
        if (str.indexOf("设备") != -1 || str.indexOf("/DX/11/") != -1 || str.indexOf("/DX/16/") != -1) {
          model.style = defaultStyle;
        }

        var pid;
        pid = model.object.pId;
        // 93
        if (pid == "93") {
          var defaultStyle = new Cesium.Cesium3DTileStyle({
            color: "color('white', 1)",
          });
          model.style = defaultStyle;
        }
        if (pid == "94") {
          var defaultStyle = new Cesium.Cesium3DTileStyle({
            color: "color('white', 1)",
          });
          model.style = defaultStyle;
        }
      }
      var handlers = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handlers.setInputAction(function (movement) {
        var model = viewer.scene.pick(movement.position); //选取当前的entity;
        if (model && Cesium.defined(model.tileset)) {
          model = model.tileset;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 区域管理
     */
    example_SolidWall() {
      var viewer = this.viewer;
      var h = 12;
      var list1 = [
        120.26649512835941, 30.29374414661551, 120.26649543330794, 30.29373435364659, 120.26659121649418, 30.29374012851044, 120.26659127096467, 30.29374602370352, 120.26674861551083, 30.29374545764404, 120.2667859606175, 30.293761675747707, 120.26683612190014, 30.29380814348052, 120.2668503352574,
        30.293842973537433, 120.26683250299729, 30.29402856516884, 120.26715209205068, 30.29412066989203, 120.26729769785977, 30.29416529248672, 120.26726220155886, 30.29425529918808, 120.26708458800873, 30.29420493884601, 120.26693660006602, 30.29450472224949, 120.26704374450425, 30.2945440117803,
        120.26651203124506, 30.29566126965019, 120.26571565709546, 30.29532367023434, 120.26575155912856, 30.29517617509935, 120.2657653028634, 30.29512092051673, 120.26600855147657, 30.29485450190342, 120.26612108389021, 30.29472037033357, 120.26619103381731, 30.29456921227994, 120.26616894469564,
        30.29449685092746, 120.26624646827607, 30.29433948382413, 120.26653282382114, 30.29402426966147, 120.26656689185077, 30.29383664556706, 120.26648733804566, 30.29383239476862, 120.26649512835941, 30.29374414661551,
      ];
      var list2 = [
        120.26634948748953, 30.2934520586805, 120.26685378754259, 30.2934328788038, 120.2668468171052, 30.29357227060731, 120.26695590812268, 30.2935857529273, 120.26697830211968, 30.2938939835667, 120.2676362780722, 30.294105590003, 120.2673518783265, 30.2944530670117, 120.26729127795336,
        30.2944576317467, 120.26725457096825, 30.2945648088378, 120.26736999104028, 30.2946079583053, 120.26678099444662, 30.2958558170331, 120.26658332520006, 30.2959518080151, 120.2654969739516, 30.2954673329878, 120.2654457166051, 30.29536507472893, 120.26541463405684, 30.2951939465377,
        120.26590895896172, 30.2946029162696, 120.2661277780969, 30.29412444685539, 120.26625254780102, 30.2941534030346, 120.2662429748076, 30.29404042500041, 120.26614690673469, 30.2939941694895, 120.26619685011835, 30.2934960591569, 120.2663510515659, 30.29350872141157, 120.26634948748953,
        30.2934520586805,
      ];

      var SolidWallList1 = [];
      var SolidWallList2 = [];

      for (let index = 0; index < list1.length; index++) {
        const element = list1[index];
        if (index % 2 == 0 && index != 0) {
          SolidWallList1.push(h);
        }
        SolidWallList1.push(element);
      }
      for (let index = 0; index < list2.length; index++) {
        const element = list2[index];
        if (index % 2 == 0 && index != 0) {
          SolidWallList2.push(h);
        }
        SolidWallList2.push(element);
      }
      SolidWallList1.push(h);
      SolidWallList2.push(h);

      //虚线
      var primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(SolidWallList1),
            width: 2.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
          }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
            color: Cesium.Color.RED, //线条颜色
            gapColor: Cesium.Color.TRANSPARENT, //间隔颜色
            dashLength: 20, //短划线长度
          }),
        }),
      });
      viewer.scene.primitives.add(primitive);

      //虚线
      var primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(SolidWallList2),
            width: 2.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
          }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
            color: Cesium.Color.BLUE, //线条颜色
            gapColor: Cesium.Color.TRANSPARENT, //间隔颜色
            dashLength: 20, //短划线长度
          }),
        }),
      });
      viewer.scene.primitives.add(primitive);

      viewer.entities.add({
        name: "lSelectWay",
        position: Cesium.Cartesian3.fromDegrees(120.26633405804266, 30.294244491108742, 12),
        label: {
          scale: 0.8,
          text: "管理范围线",
          font: "18px sans-serif",
          fillColor: Cesium.Color.fromCssColorString("#fd0000"),
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1, 8000, 0), //缩放
        },
        _isQyPoint: true, //标识下，事件中判断
        tooltip: {
          //html: inthtml,
          anchor: [0, -12],
        },
      });

      viewer.entities.add({
        name: "lSelectWay",
        position: Cesium.Cartesian3.fromDegrees(120.26610507449006, 30.294172674282486, 12),
        label: {
          scale: 0.8,
          text: "保护范围线",
          font: "18px sans-serif",
          fillColor: Cesium.Color.fromCssColorString("#4395ff"),
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1, 8000, 0), //缩放
        },
        _isQyPoint: true, //标识下，事件中判断
        tooltip: {
          //html: inthtml,
          anchor: [0, -12],
        },
      });
    }

    /**
     * 泵体结构点击
     */
    example_PumpStructure() {
      var viewer = this.viewer;

      function mouseMove(ev) {
        if (viewer.RoamingStatus == true) {
          return;
        } //漫游防冲突 对此无效

        ev = ev || window.event;
        var mousePos = window.mousePosition(ev);
        if (mousePos.x == 0 && mousePos.y == 0) {
          return;
        }
        var pick = new Cesium.Cartesian2(mousePos.x, mousePos.y);

        var model = viewer.scene.pick(pick); //选取当前的entity
        if (model && Cesium.defined(model.primitive)) {
          model = model.primitive;
          var shapeType;
          var str = decodeURI(model._url);

          if (str.indexOf("DX") != -1) {
            shapeType = "地面";
          } else if (str.indexOf("SB") != -1) {
            shapeType = "设备";
          } else if (str.indexOf("JZSW") != -1) {
            shapeType = "室外建筑";
          } else if (str.indexOf("JZ") != -1) {
            shapeType = "建筑";
          } else if (str.indexOf("LH") != -1) {
            shapeType = "绿化";
          } else if (str.indexOf("XP") != -1) {
            shapeType = "小品";
          } else {
            shapeType = str;
          }
          if (str.indexOf("设备") != -1) {
            shapeType = "设备";
          }
          for (var i = 0; i < viewer.scene.primitives.length; i++) {
            var _model = viewer.scene.primitives.get(i);
            if (_model._defaultStyle) {
              // console.log(_model)
              _model.style = _model._defaultStyle;
            }
          }

          if (shapeType == "设备") {
            //包含该元素,鼠标变成手势
            model._defaultStyle = new Cesium.Cesium3DTileStyle({
              color: "color('white', 1)",
            });
            var defaultStyle = new Cesium.Cesium3DTileStyle({
              color: "color('#adadad', 0.5)", //方案三 鼠标触发颜色
            });
            model.style = defaultStyle;
            $("canvas").css("cursor", "pointer"); //鼠标箭头换成小手
          } else {
            $("canvas").css("cursor", "default"); //鼠标小手换成箭头
          }
        }
      }
      document.onmousemove = mouseMove;

      function TestURI(model) {
        var str = model._url;
        if (!str) return false;
        var uuid = false;
        //#region 请勿观摩
        if (str.indexOf("/SB/排水系统/泵体1") != -1) {
          uuid = "排水系统-泵体1";
        }
        if (str.indexOf("/SB/排水系统/泵体2") != -1) {
          uuid = "排水系统-泵体2";
        }
        if (str.indexOf("/SB/排水系统/泵体3") != -1) {
          uuid = "排水系统-泵体3";
        }
        if (str.indexOf("/SB/排水系统/泵体4") != -1) {
          uuid = "排水系统-泵体4";
        }
        if (str.indexOf("/SB/排水系统/泵体5") != -1) {
          uuid = "排水系统-泵体5";
        }
        if (str.indexOf("/SB/排水系统/泵体6") != -1) {
          uuid = "排水系统-泵体6";
        }
        if (str.indexOf("/SB/排水系统/泵体7") != -1) {
          uuid = "排水系统-泵体7";
        }
        if (str.indexOf("SB/排水系统/水泵盖顶/右/4/") != -1) {
          uuid = "排水系统-盖顶1";
        }
        if (str.indexOf("SB/排水系统/水泵盖顶/右/3/") != -1) {
          uuid = "排水系统-盖顶2";
        }
        if (str.indexOf("SB/排水系统/水泵盖顶/右/2/") != -1) {
          uuid = "排水系统-盖顶3";
        }
        if (str.indexOf("SB/排水系统/水泵盖顶/右/1/") != -1) {
          uuid = "排水系统-盖顶4";
        }
        if (str.indexOf("SB/排水系统/水泵盖顶/左/5/") != -1) {
          uuid = "排水系统-盖顶5";
        }
        if (str.indexOf("SB/排水系统/水泵盖顶/左/6/") != -1) {
          uuid = "排水系统-盖顶6";
        }
        if (str.indexOf("SB/排水系统/水泵盖顶/左/7/") != -1) {
          uuid = "排水系统-盖顶7";
        }

        model.uuid = uuid;
        if (uuid) return model;
        else return false;
        //#endregion
      }

      var models = [];
      var handlers = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handlers.setInputAction(function (movement) {
        var model = viewer.scene.pick(movement.position); //选取当前的entity;
        if (model && Cesium.defined(model.tileset)) {
          var tileset = model.tileset;
          if (!Cesium.defined(model)) return;

          var str = decodeURI(tileset._url);

          if (str.indexOf("水泵建筑体") != -1) {
            PumpBodyBuilding(1, tileset);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      var handlers = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handlers.setInputAction(function (movement) {
        var model = viewer.scene.pick(movement.position); //选取当前的entity;
        if (model && Cesium.defined(model.tileset)) {
          var tileset = model.tileset;
          models.forEach(e => {
            if (tileset == e) {
              if (tileset._url.indexOf("水泵盖顶") == -1) {
                tileset.show = false;
              }
            }
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      var handlers = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handlers.setInputAction(function (movement) {
        models.forEach(element => {
          element.show = true;
        });
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      var handlers = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handlers.setInputAction(function (movement) {
        var model = viewer.scene.pick(movement.position);
        if (model && Cesium.defined(model.tileset)) {
          var tileset = model.tileset;
          var str = decodeURI(tileset._url);

          if (str.indexOf("SB/排水系统/水泵盖顶") != -1) {
            PumpBodyBuilding(TestURI(tileset).uuid, tileset);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      function PumpBodyBuilding(type, tileset) {
        models = [];
        function set_height(_tileset, height) {
          viewer._cesiumWidget._creditContainer.style.display = "none";
          viewer.scene.globe.depthTestAgainstTerrain = false;
          var boundingSphere = _tileset.boundingSphere;
          var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
          // var height = cartographic.height;//模型高度
          var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
          var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
          var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
          _tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        }
        for (var i = 0; i < viewer.scene.primitives.length; i++) {
          var model = viewer.scene.primitives.get(i);
          var data = TestURI(model);
          if (data) models.push(data);
        }

        var modelsHeight = [];
        if (!tileset.display) modelsHeight[0] = 10.4;
        else modelsHeight[0] = 25;

        if (viewer.PumpStructure_Architecture_Interval) {
          return;
        }
        viewer.PumpStructure_Architecture_Interval = setInterval(function () {
          if (tileset.display) {
            //升高
            modelsHeight[0] = modelsHeight[0] - 0.2;

            if (modelsHeight[0] <= 10.4) {
              clearInterval(viewer.PumpStructure_Architecture_Interval);
              viewer.PumpStructure_Architecture_Interval = false;
              tileset.display = false;
            }
          } else {
            //降低
            modelsHeight[0] = modelsHeight[0] + 0.2;

            if (modelsHeight[0] >= 25) {
              clearInterval(viewer.PumpStructure_Architecture_Interval);
              viewer.PumpStructure_Architecture_Interval = false;
              tileset.display = true;
            }
          }
          set_height(tileset, modelsHeight[0]);
        }, 20);

        // set_height(tileset, 10);
        // console.log(type)
        if (type == 1) {
          // return
          if (!tileset.display) modelsHeight[1] = 9;
          else modelsHeight[1] = 20;

          if (viewer.PumpStructure_Architecture_Interval_1) {
            return;
          }
          viewer.PumpStructure_Architecture_Interval_1 = setInterval(function () {
            if (tileset.display) {
              //升高
              modelsHeight[1] = modelsHeight[1] - 0.2;

              if (modelsHeight[1] <= 10) {
                clearInterval(viewer.PumpStructure_Architecture_Interval_1);
                viewer.PumpStructure_Architecture_Interval_1 = false;
              }
            } else {
              //降低
              modelsHeight[1] = modelsHeight[1] + 0.2;

              if (modelsHeight[1] >= 20) {
                clearInterval(viewer.PumpStructure_Architecture_Interval_1);
                viewer.PumpStructure_Architecture_Interval_1 = false;
              }
            }
            models.forEach(element => {
              var state = false;
              switch (element.uuid) {
                case "排水系统-泵体1":
                case "排水系统-泵体2":
                case "排水系统-泵体3":
                case "排水系统-泵体4":
                  state = true;
                  break;
              }
              if (state) set_height(element, modelsHeight[1]);
            });
          }, 20);

          return;
        }

        if (typeof type == "string") {
          if (!tileset.display) modelsHeight[2] = 9;
          else modelsHeight[2] = 20;

          if (viewer.PumpStructure_Architecture_Interval_x) {
            return;
          }
          viewer.PumpStructure_Architecture_Interval_x = setInterval(function () {
            if (tileset.display) {
              //升高
              modelsHeight[2] = modelsHeight[2] - 0.2;

              if (modelsHeight[2] <= 10) {
                clearInterval(viewer.PumpStructure_Architecture_Interval_x);
                viewer.PumpStructure_Architecture_Interval_x = false;
              }
            } else {
              //降低
              modelsHeight[2] = modelsHeight[2] + 0.2;

              if (modelsHeight[2] >= 20) {
                clearInterval(viewer.PumpStructure_Architecture_Interval_x);
                viewer.PumpStructure_Architecture_Interval_x = false;
              }
            }

            models.forEach(element => {
              var state = false;
              if (type == "排水系统-盖顶1" && element.uuid == "排水系统-泵体1") {
                state = true;
              }
              if (type == "排水系统-盖顶2" && element.uuid == "排水系统-泵体2") {
                state = true;
              }
              if (type == "排水系统-盖顶3" && element.uuid == "排水系统-泵体3") {
                state = true;
              }
              if (type == "排水系统-盖顶4" && element.uuid == "排水系统-泵体4") {
                state = true;
              }
              if (state) set_height(element, modelsHeight[2]);
            });
          }, 20);
        }
      }
    }

    /**
     * 添加杭州高程
     */
    example_altitude() {
      const viewer = this.viewer;
      //加载杭州高程地形
      var provider = new Cesium.CesiumTerrainProvider({
        url: "http://121.40.42.254:8008/%E6%9D%AD%E5%B7%9E-%E9%AB%98%E7%A8%8B/data/",
        requestWaterMask: true, //开启法向量
        requestVertexNormals: true, //开启水面特效
      });
      viewer.terrainProvider = provider;

      G.Go(viewer, {
        h: 4.87,
        p: -0.3651498703,
        r: 6.28,
        x: 120.142494,
        y: 30.272777,
        z: 1144.48,
        duration: 3,
      });

      G.aTiles(viewer, {
        type: "建筑",
        url: "http://121.40.42.254:8008/%E6%9D%AD%E5%B7%9E-%E7%9F%A2%E9%87%8F%E6%A8%A1%E5%9E%8B/tileset.json", //http://127.0.0.1:64158
        flyTo: false,
        heightOffset: 0,
        height: 0,
        style: {
          color: "color('white', 0.6)",
          show: true,
        },
      });
      var viewModel = {
        gradient: false,
        band1Position: 800.0,
        band2Position: 300.0,
        band3Position: 1000.0,
        bandThickness: 10.0,
        bandTransparency: 0.5,
        backgroundTransparency: 1,
      };

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
          var heightBelow = Cesium.Math.lerp(gridStartHeight, gridEndHeight, lerper);
          var heightAbove = heightBelow + 10.0;
          var alpha = Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency;
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

      // setTimeout(() => {
      //   var i = 1;
      //   var timer = setInterval(() => {
      //         i -= 0.01
      //         viewModel = {
      //             gradient: false,
      //             band1Position: 800.0,
      //             band2Position: 300.0,
      //             band3Position: 1000.0,
      //             bandThickness: 10.0,
      //             bandTransparency: 0.5,
      //             backgroundTransparency: i,
      //         };
      //         updateMaterial();
      //         if(i <= 0.2){
      //             clearInterval(timer)
      //         }
      //     }, 100);
      // }, 4000 * 3);
    }

    /**
     * 画点
     */
    example_drawPoint() {
      //刷新指引
      this.setTitle({
        text: "单击鼠标，右键结束画点",
        title: "提示",
      });

      G.drawPoint(this.viewer, function (id) {
        console.log(id);
      });
    }

    /**
     * 初始化绘制类
     */
    initDynamicDraw() {
      this.DynamicDraw = new G.D.DynamicDrawer(this.viewer, {
        id: G.uuid(),
        _style: {
          labelTransparency: 100, //字体透明度
          outlineColor: "#3462d0", //字体边框颜色
          fillColor: "#fff", //字体颜色
          PolylineColor: "#fff",
          PolylineWitch: 3, //线条宽度
          shapeColor: "#fff",
          shapeTransparency: 50, //形状透明度
          borderWitch: 2, //边框宽度
          borderColor: "#3462d0",
          borderTransparency: 80, //边框透明度
        },
      });
    }

    /**
     * 线面⚪
     * @param {*} type 'drawPolyline': //画折线 'drawPolygon': //画多边形 'drawRectangle': //画矩形 'drawCircle': //画圆
     */
    example_DynamicDraw(type) {
      this.initDynamicDraw();
      function _(positions) {
        var p = [];
        positions.forEach(element => {
          var cartographic = Cesium.Cartographic.fromCartesian(element);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var height = cartographic.height; //模型高度
          var mapPosition = { x: lng, y: lat, z: height };

          p.push(mapPosition);
        });
        return p;
      }
      //刷新指引
      this.setTitle({
        text: "单击起始点，移动鼠标至节点，再次单机，右键结束画点",
        title: type,
      });

      switch (type) {
        case "drawPolyline": //画折线
          this.DynamicDraw.drawPolyline(function (positions) {
            console.log(_(positions));
          });
          break;
        case "drawPolygon": //画多边形
          this.DynamicDraw.drawPolygon(function (positions) {
            console.log(_(positions));
          });
          break;
        case "drawRectangle": //画矩形
          this.DynamicDraw.drawRectangle(function (positions) {
            console.log(_(positions));
          });
          break;
        case "drawCircle": //画圆
          this.DynamicDraw.drawCircle(function (positions) {
            console.log(_(positions));
          });
          break;

        default:
          break;
      }
    }

    /**
     * 初始化测算类
     */
    initMeasureDraw() {
      this.DynamicDraw = new G.D.DynamicDrawer(this.viewer, {
        id: G.uuid(),
        type: "测量", //默认为空就是绘制
        _style: {
          backgroundColor: "#000",
          labelTransparency: 80, //字体透明度
          outlineColor: "#fff", //字体边框颜色3462d0
          fillColor: "#fff", //字体颜色
          PolylineColor: "#fff",
          PolylineWitch: 3, //线条宽度
          shapeColor: "#fff",
          shapeTransparency: 50, //形状透明度
          borderWitch: 2, //边框宽度
          borderColor: "#3462d0",
          borderTransparency: 80, //边框透明度
        },
      });
    }

    /**
     * 测长度 面积
     * @param {*} type 'drawPolyline': //测折线 'drawPolygon': //测多边形
     */
    example_measureDraw(type) {
      this.initMeasureDraw();
      switch (type) {
        case "measurePolyline": //测折线
          this.DynamicDraw.drawPolyline(function (positions) {
            console.log(positions);
          });
          break;
        case "measurePolygon": //测多边形
          this.DynamicDraw.drawPolygon(function (positions) {
            console.log(positions);
          });
          break;
        default:
          break;
      }
    }

    //测高
    example_measureLineFlat() {
      G.M.measureHeight(this.viewer);
    }
    //删除测高
    example_deleteAltimetry() {
      G.M.deleteAltimetry(this.viewer);
    }
    //释放编辑
    example_measure_release() {
      this.example_deleteAltimetry();
    }

    //编辑图形
    example_editEntity() {
      if (this.DynamicDraw) this.DynamicDraw.setMode(1);
    }
    //删除图形
    example_deleteEntity() {
      if (this.DynamicDraw) this.DynamicDraw.setMode(2);
    }

    //释放编辑
    example_edit_release() {
      G.entities.Release(this.viewer);
    }

    /**
     * 添加导航控件
     */
    example_addNavigation() {
      G.C.NavigationBox(this.viewer, {
        x: 0,
        y: 0,
        z: 10000,
        heading: 0,
        pitch: 0,
        roll: 0,
      });
    }
    /**
     * 添加鼠标控件
     */
    example_addPositionBox() {
      G.C.MousePositionBox(this.viewer, "mapBox");
    }

    /**
     * 着色器下雪
     */
    example_snowSystem_Shaders() {
      this.Snow =
        this.Snow == null
          ? new G.E.Effect(this.viewer, {
              visibility: 0.2,
              show: false,
              type: "x",
              color: new Cesium.Color.fromCssColorString("#e7e7e7"), //new Cesium.Color(0.8, 0.8, 0.8, 0.3)
            })
          : this.Snow; //雪
      if (!this.Snow._show) this.Snow.show(true);
      else this.Snow.show(false);
      return this.Snow;
    }
    /**
     * 着色器下雨
     */
    example_RainwaterSystem_Shaders() {
      this.Rain =
        this.Rain == null
          ? new G.E.Effect(this.viewer, {
              visibility: 0.2,
              show: false,
              type: "y",
              color: new Cesium.Color.fromCssColorString("#e7e7e7"), //new Cesium.Color(0.8, 0.8, 0.8, 0.3)
            })
          : this.Rain; //雨
      if (!this.Rain._show) this.Rain.show(true);
      else this.Rain.show(false);
      return this.Rain;
    }
    /**
     * 着色器雾
     */
    example_Fogging() {
      this.Fog =
        this.Fog == null
          ? new G.E.Effect(this.viewer, {
              visibility: 0.2,
              show: false,
              type: "w",
              color: new Cesium.Color.fromCssColorString("#e7e7e7"), //new Cesium.Color(0.8, 0.8, 0.8, 0.3)
            })
          : this.Fog; //雾
      if (!this.Fog._show) this.Fog.show(true);
      else this.Fog.show(false);
      return this.Fog;
    }

    /**
     * 漫游探高
     */
    example_IntelligentRoamingV2() {
      const viewer = this.viewer;
      var timer = 10; //模型行走数度

      var FineBezierTimer = 0.01; //算法路径速度

      var multiplier = 0.7; //当前世界速度 (可整体提高行走速度 必要也可以暂停模型)

      var xyList = [
        { x: 120.37063197564044, y: 29.99411991794387, z: -0 },
        { x: 120.36958684743908, y: 29.995376752897222, z: -0 },
        { x: 120.36965864539354, y: 29.995894284404972, z: -0 },
        { x: 120.36998604974082, y: 29.996108457100856, z: -0 },
        { x: 120.37083091258253, y: 29.99547889856467, z: -0 },
        { x: 120.37066343919086, y: 29.99413122161608, z: -0 },
      ];

      var xyFineBezier = [];
      var q = Cesium.Cartesian3.fromDegrees(xyList[0].x, xyList[0].y, 10);
      q.time = timer;
      xyFineBezier.push(q);
      for (let index = 0; index < xyList.length; index++) {
        const element1 = xyList[index];
        const element2 = xyList[index + 1];
        const element3 = xyList[index + 2];
        if (element3 == null) {
          break;
        }
        var a = element1.x - element2.x;
        var b = element1.y - element2.y;
        var c = element2.x + a / 40;
        var d = element2.y + b / 40;

        var e = element2.x - element3.x;
        var f = element2.y - element3.y;
        var g = element2.x - e / 40;
        var h = element2.y - f / 40;

        var dc = new G.M.DrawCurve(Cesium, viewer);
        var line = dc.fineBezier(Cesium.Cartesian3.fromDegreesArray([c, d, element2.x, element2.y, element2.x, element2.y, g, h]), 180); //180为弯道点的密度 适当调整可控制转弯速度

        line[0].time = FineBezierTimer;
        line[line.length - 1].time = timer;
        line.forEach(element => {
          xyFineBezier.push(element);
        });
      }

      xyFineBezier.push(Cesium.Cartesian3.fromDegrees(xyList[xyList.length - 1].x, xyList[xyList.length - 1].y, 10));

      var arr = [];
      var i = 0;
      xyList.forEach(e => {
        arr.push(e.x, e.y);
      });
      var alp = 1;
      var num = 0;
      viewer.entities.add({
        type: "IntelligentRoaming",
        polyline: {
          positions: xyFineBezier, //Cesium.Cartesian3.fromDegreesArray(arr),
          width: 26,
          material: new Cesium.PolylineGlowMaterialProperty({
            //发光线
            glowPower: 0.1,
            color: new Cesium.CallbackProperty(function () {
              if (num % 2 === 0) {
                alp -= 0.005;
              } else {
                alp += 0.005;
              }

              if (alp <= 0.2) {
                num++;
              } else if (alp >= 1) {
                num++;
              }
              return Cesium.Color.ORANGE.withAlpha(alp);
              //entity的颜色透明 并不影响材质，并且 entity也会透明
            }, false),
          }),
          clampToGround: true,
        },
      });

      // 动态线
      // VMSDS.effect.DynamicLine(viewer,arr)

      function getTimeList(xyList) {
        var FlightRoamingData = []; //人物漫游时路线数据存储
        var cameraTimer = "00:00:00";
        var mm = timer; //一截路的时长
        for (let index = 0; index < xyList.length; index++) {
          if (Cesium.defined(xyList[index].time)) {
            mm = xyList[index].time;
          }

          const element = xyList[index];

          FlightRoamingData.push({
            id: "roaming_" + index,
            x: element.x,
            y: element.y,
            z: element.z,
            time: ISODateString(new Date()),
            ss: 20, // 停留的时长
          });
          var hour = cameraTimer.split(":")[0];
          var min = cameraTimer.split(":")[1];
          var sec = cameraTimer.split(":")[2];
          var s = Number(hour * 3600) + Number(min * 60) + Number(sec); //加当前相机时间
          function formatTime(s) {
            var t;
            if (s > -1) {
              var hour = Math.floor(s / 3600);
              var min = Math.floor(s / 60) % 60;
              var sec = s % 60;
              if (hour < 10) {
                t = "0" + hour + ":";
              } else {
                t = hour + ":";
              }

              if (min < 10) {
                t += "0";
              }
              t += min + ":";
              if (sec < 10) {
                t += "0";
              }
              t += sec.toFixed(2);
            }
            return t;
          }
          cameraTimer = formatTime(s + mm);
          function ISODateString(d) {
            function pad(n) {
              return n < 10 ? "0" + n : n;
            }
            return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + "T" + cameraTimer + "Z";
          }
        }
        return FlightRoamingData;
      }

      xyList = Cesium.Cartesian3.fromDegreesArray(arr);
      var FlightRoamingData = getTimeList(xyFineBezier); //xyFineBezier

      var gltf_uri = "http://121.40.42.254:8008/%E4%BA%BA%E7%89%A9%E7%8E%AF%E6%A8%A1%E5%9E%8B/%E4%BA%BA%E7%89%A9/%E7%99%BD%E8%86%9C%E8%A1%8C%E8%B5%B0/scene.gltf";

      var czml = [
        {
          id: "document",
          version: "1.0",
          clock: {
            interval: "2018-07-19T15:18:00Z/2018-07-19T15:18:30Z",
            currentTime: "2018-07-19T15:18:00Z",
            multiplier: 1,
            range: "LOOP_STOP",
            step: "SYSTEM_CLOCK_MULTIPLIER",
          },
        },
        {
          id: "Will I still be able to use data roaming after I have NO!",
          model: {
            gltf: gltf_uri,
            scale: 0.1,
          },
          position: {
            interpolationAlgorithm: "LINEAR",
            forwardExtrapolationType: "HOLD",
            cartesian: [],
          },
          orientation: {
            unitQuaternion: [],
          },
        },
      ];

      czml[1].model.scale = 0.01;

      //添加地形分析及模型行为
      // console.log(Cesium.Transforms.headingPitchRollQuaternion(position, hpr))
      var tileset;

      for (var i = 0; i < viewer.scene.primitives.length; i++) {
        var model = viewer.scene.primitives.get(i);
        if (model.object && model.object.type == "山体") {
          tileset = model;
        }
      }

      var entity = G.aGR(viewer, czmlRoaming(FlightRoamingData, czml), tileset, true);
      if (!entity) return;
      //自动计算模型朝向
      var data = FlightRoamingData;
      var property = new Cesium.SampledPositionProperty();
      for (var i = 0, len = data.length; i < len; i++) {
        var item = data[i];

        var lng = item.x;
        var lat = item.y;
        var hei = item.z;
        var time = item.time;

        var position = null;
        if (lng && lat) position = Cesium.Cartesian3.fromDegrees(lng, lat, hei);

        var juliaDate = null;
        if (time) juliaDate = Cesium.JulianDate.fromIso8601(time);

        if (position && juliaDate) property.addSample(juliaDate, position);
      }

      entity.position = property;
      entity.orientation = new Cesium.VelocityOrientationProperty(property);
      entity.model.silhouetteColor = Cesium.Color.GREEN; //new Cesium.Color( 1.0 ,  0 ,  0 ,  1.0 );
      entity.model.silhouetteSize = 3.0;
      entity.type = "IntelligentRoaming";
      viewer.clock.multiplier = multiplier;
      function czmlRoaming(position, czml) {
        var p = [];
        //    console.log(clock)//Cesium.JulianDate.fromDate(new Date());
        var _start;
        var _stop;
        var property = new Cesium.SampledPositionProperty();
        //debugger;
        for (var i = 0, len = position.length; i < len; i++) {
          var item = position[i];
          var cartographic = Cesium.Cartographic.fromCartesian(item);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var mapPosition = { x: lng, y: lat, z: cartographic.height };
          item.x = mapPosition.x;
          item.y = mapPosition.y;
          item.z = mapPosition.z;

          var lng = Number(item.x.toFixed(6));
          var lat = Number(item.y.toFixed(6));
          var hei = item.z;
          var time = item.time;

          var _position = null;
          if (lng && lat) _position = Cesium.Cartesian3.fromDegrees(lng, lat, hei);

          var juliaDate = null;
          if (time) juliaDate = Cesium.JulianDate.fromIso8601(time);

          if (_position && juliaDate) property.addSample(juliaDate, _position);

          if (i == 0) _start = juliaDate;
          else if (i == len - 1) _stop = juliaDate;
        }
        // console.log(_start.clone().toString())

        /* Use a function for the exact format desired... */
        function ISODateString(d) {
          function pad(n) {
            return n < 10 ? "0" + n : n;
          }
          return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + "Z";
        }

        czml[0].clock.interval = ISODateString(new Date(_start.clone().toString())) + "/" + ISODateString(new Date(_stop.clone().toString()));
        czml[0].clock.startTime = ISODateString(new Date(_start.clone().toString()));
        czml[0].clock.stopTime = ISODateString(new Date(_stop.clone().toString()));
        czml[0].clock.currentTime = ISODateString(new Date(_start.clone().toString()));
        czml[0].clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        czml[0].clock.multiplier = 1.0;

        for (let index = 0; index < position.length; index++) {
          const element = position[index];
          var cartesian = Cesium.Cartesian3.fromDegrees(element.x, element.y, 10);
          p.push(ISODateString(new Date(element.time)), cartesian.x, cartesian.y, cartesian.z);
        }
        //    console.log(p)
        czml[1].position.cartesian = p;
        //    console.log(czml,czml[1].position.cartesian)
        return czml;
      }
    }

    /**
     * 人物漫游
     */
    example_FlyingGame(tileset) {
      var canvas = this.viewer.canvas;
      var _this = this;
      var viewer = this.viewer;

      $("#travelscope").append(`<tbody id="FlyingGame"  class="notes">
        <tr>
            <td>
            单击3D窗口，然后使用键盘更改设置。
            </td>
        </tr>
        <tr>
            <td>航向: <span id="heading">129.0</span>°</td>
        </tr>
        <tr>
            <td>← A/→ D</td>
        </tr>
        <tr>
            <td>俯仰: <span id="pitch">-45.0</span>°</td>
        </tr>
        <tr>
            <td>↑ W/↓ S</td>
        </tr>
        <tr>
            <td>旋转: <span id="roll">0.0</span>°</td>
        </tr>
        <tr>
            <td>← + ↑ 左/ → + ↑右</td>
        </tr>
        <tr>
            <td>速度: <span id="speed">1.0</span>m/s</td>
        </tr>
        </tbody>`);

      canvas.setAttribute("tabindex", "0"); // 第一视角
      canvas.addEventListener("click", function () {
        canvas.focus();
      });
      canvas.focus();

      var scene = viewer.scene;
      var pathPosition = new Cesium.SampledPositionProperty();

      var entityPath = viewer.entities.add({
        position: pathPosition,
        name: "path",
        path: {
          show: false,
          leadTime: 0,
          trailTime: 60,
          width: 10,
          resolution: 1,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            taperPower: 0.3,
            color: Cesium.Color.PALEGOLDENROD,
          }),
        },
      });

      var camera = viewer.camera;
      var controller = scene.screenSpaceCameraController;
      var r = 0;
      var center = new Cesium.Cartesian3();

      var hpRange = new Cesium.HeadingPitchRange(0, 0, 0);
      var speed = 0;
      var deltaRadians = Cesium.Math.toRadians(0.15);
      var hpRoll = new Cesium.HeadingPitchRoll(0, 0, 0); //new Cesium.HeadingPitchRoll();
      var position = Cesium.Cartesian3.fromDegrees(120.80491, 30.302535, 10.0);
      var fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");
      var speedVector = new Cesium.Cartesian3();

      function then(model) {
        // Play and loop all animations at half-speed
        model.activeAnimations.addAll({
          multiplier: 0.5,
          loop: Cesium.ModelAnimationLoop.REPEAT,
        });

        // Zoom to model
        r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
        controller.minimumZoomDistance = r * 0.5;
        Cesium.Matrix4.multiplyByPoint(model.modelMatrix, model.boundingSphere.center, center);
        var heading = Cesium.Math.toRadians(230.0);
        var pitch = Cesium.Math.toRadians(-20.0);
        hpRange.heading = heading;
        hpRange.pitch = pitch;
        hpRange.range = r * 50.0;

        clampToHeight();
      }

      /**
       * 设置第一人称
       */
      function setCamera() {
        if (!viewer.IFV_TYPE) return;

        var options = _this.viewer.IFV_TYPE;
        switch (_this.viewer.IFV_TYPE.visual.type) {
          case 0:
            _this.IntelligentRoaming_Visual({
              visual: {
                type: 0,
                height: 10.4 * 2,
                direction: -35 * 2.5,
              },
            });
            viewer.IntelligentRoaming_VisualEvent = undefined;
            return;
          case 3:
            if (viewer.IntelligentRoaming_VisualEvent) return;
            viewer.IntelligentRoaming_VisualEvent = function (scene, time) {
              var entity = {};
              if (!Cesium.defined(position)) {
                return;
              }

              var camera = viewer.camera;
              // console.log(camera)
              camera.position = new Cesium.Cartesian3(-5, -0, Cesium.Math.toRadians(options.visual.height ?? 10));
              camera.direction = new Cesium.Cartesian3(0.3987584249598806, 0.009354600409072824, Cesium.Math.toRadians(options.visual.direction ?? -65));
              camera.up = new Cesium.Cartesian3(0.916756064443912, 0.021506470654472087, 0.39886813613686706);
              camera.right = new Cesium.Cartesian3(0.02345286397916243, -0.9997249437576193, -2.908438299226157);
              if (!Cesium.defined(position)) {
                console.warn({ position: null });
                return;
              }

              var transform;

              if (!Cesium.defined(entity.orientation)) {
                transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
              } else {
                var orientation = entity.orientation.getValue(time);
                if (!Cesium.defined(orientation)) {
                  console.warn({ orientation: null });
                  return;
                }
                transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation), position);
              }

              var heading = Cesium.Math.toDegrees(hpRoll.heading); //Cesium.Math.toRadians(heading + 180)
              viewer.camera.flyTo({
                //destination: camera.position, //经度、纬度、高度
                orientation: {
                  heading: Cesium.Math.toRadians(heading + 180), //绕垂直于地心的轴旋转
                },
                duration: 0,
              });

              // Save camera state
              var offset = Cesium.Cartesian3.clone(camera.position);
              var direction = Cesium.Cartesian3.clone(camera.direction);
              var up = Cesium.Cartesian3.clone(camera.up);

              // Set camera to be in model's reference frame.
              camera.lookAtTransform(transform);

              // Reset the camera state to the saved state so it appears fixed in the model's frame.
              Cesium.Cartesian3.clone(offset, camera.position);
              Cesium.Cartesian3.clone(direction, camera.direction);
              Cesium.Cartesian3.clone(up, camera.up);
              Cesium.Cartesian3.cross(direction, up, camera.right);
            };
            viewer.scene.postUpdate.addEventListener(viewer.IntelligentRoaming_VisualEvent);

            return;
          case 1:
            viewer.scene.postUpdate.removeEventListener(viewer.IntelligentRoaming_VisualEvent);
            viewer.IntelligentRoaming_VisualEvent = undefined;

            var point = {};
            var cartographic = Cesium.Cartographic.fromCartesian(position);
            point.x = Cesium.Math.toDegrees(cartographic.longitude);
            point.y = Cesium.Math.toDegrees(cartographic.latitude);
            point.z = cartographic.height + 15; //还原点位高度

            var heading = Cesium.Math.toDegrees(hpRoll.heading);

            // console.log(heading)
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z), //经度、纬度、高度
              orientation: {
                heading: Cesium.Math.toRadians(heading + 180), //绕垂直于地心的轴旋转
                pitch: 0, //绕纬度线旋转
                roll: 0, //绕经度线旋转
              },
              duration: 0,
            });

            return;
          default:
            break;
        }
      }
      function clampToHeight() {
        //  var positionProperty = pathPosition;

        var entity = planePrimitive;
        if (Cesium.defined(tileset)) {
          if (scene.clampToHeightSupported) {
            tileset.initialTilesLoaded.addEventListener(start);
          } else {
            window.alert("This browser does not support clampToHeight.");
          }
        } else {
          console.error("tileset.initialTilesLoaded", "绑定失败 请核查模型是否加载完成，或是否被隐藏");
          return false;
        }
        var cache_position;
        function start() {
          viewer.clock.shouldAnimate = true;
          var objectsToExclude = [entity];

          var _eventListener = function () {
            // var position = positionProperty.getValue(viewer.clock.currentTime);

            if (position) {
              if (keyDown_32) {
                position = scene.clampToHeight(position, objectsToExclude); //Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z)
                if (position) cache_position = position;
                else position = cache_position;
              }
              // console.log(position)
            }

            // entity.position = scene.clampToHeight(position, objectsToExclude);
          };
          scene.postRender.addEventListener(_eventListener);
        }
      }

      var planePrimitive = scene.primitives.add(
        Cesium.Model.fromGltf({
          url: (WEBGL_DEBUG ?WEBGL_Local:WEBGL_Server) + "/%E4%BA%BA%E7%89%A9%E7%8E%AF%E6%A8%A1%E5%9E%8B/%E7%8E%AF%E5%A2%83/%E8%B5%B0%E8%B7%AF%E7%9A%84%E9%B8%AD%E5%AD%90/scene.gltf",
          modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(position, hpRoll, Cesium.Ellipsoid.WGS84, fixedFrameTransform),
          minimumPixelSize: 128,
        })
      );

      planePrimitive.type = "IntelligentRoaming";
      planePrimitive.id = "Will I still be able to use data roaming after I have NO!";

      planePrimitive.readyPromise.then(then).otherwise(function (error) {
        console.log(error);
      });
      let keyDown_32 = true;
      document.addEventListener("keydown", function (e) {
        if (e.code == "ShiftLeft" && e.keyCode == 68) {
          // speed up
          speed = 25;
        }
        switch (e.keyCode) {
          case 83: //S
            speed = -10;
            // speed down
            // speed = Math.max(--speed, 1);
            break;
          case 87: //W
            speed = 10;

            break;

          case 68:
            let add = 0;
            let interval_add = setInterval(() => {
              hpRoll.heading += deltaRadians;
              add++;
              if (add == 1 * 10) {
                clearInterval(interval_add);
              }
            }, 10);

            if (hpRoll.heading > Cesium.Math.TWO_PI) {
              hpRoll.heading -= Cesium.Math.TWO_PI;
            }
            break;
          case 65:
            let reduce = 0;
            let interval_reduce = setInterval(() => {
              hpRoll.heading -= deltaRadians;
              reduce++;
              if (reduce == 1 * 10) {
                clearInterval(interval_reduce);
              }
            }, 10);

            if (hpRoll.heading < 0.0) {
              hpRoll.heading += Cesium.Math.TWO_PI;
            }
            break;
          case 32:
            if (keyDown_32) {
              var point = {};
              var cartographic = Cesium.Cartographic.fromCartesian(position);
              point.x = Cesium.Math.toDegrees(cartographic.longitude);
              point.y = Cesium.Math.toDegrees(cartographic.latitude);
              point.z = cartographic.height; //还原点位高度
              console.log(point.z + 15);

              if (!Cesium.interval_z && !Cesium.interval_z_) {
                let z = 0;
                let z_ = 0;
                Cesium.interval_z = setInterval(() => {
                  position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z + z / 10);
                  z += 4;

                  if (z >= 1 * 100) {
                    clearInterval(Cesium.interval_z);
                    Cesium.interval_z = false;
                    console.log(z / 10);
                    z_ = z;
                    Cesium.interval_z_ = setInterval(() => {
                      z_ -= 4;
                      console.log(z_);
                      position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z + z_ / 10);

                      if (z_ <= 0) {
                        clearInterval(Cesium.interval_z_);
                        Cesium.interval_z_ = false;
                        keyDown_32 = true;
                      }
                    }, 10);
                  }
                }, 10);
              }

              keyDown_32 = false;
            }

            break;
          // //模型抬头
          // // turn right
          // hpRoll.roll += deltaRadians;
          // if (hpRoll.roll > Cesium.Math.TWO_PI) {
          // hpRoll.roll -= Cesium.Math.TWO_PI;
          // }

          // //模型低头
          // // turn left
          // // roll left until
          // hpRoll.roll -= deltaRadians;
          // if (hpRoll.roll < 0.0) {
          // hpRoll.roll += Cesium.Math.TWO_PI;
          // }
          default:
        }
        if (e.shiftKey) {
          // speed up
          speed = 25;
        }
      });
      document.addEventListener("keyup", function (e) {
        if (e.code == "ShiftLeft" && e.keyCode == 68) {
          // speed up
          speed = 10;
        }

        switch (e.keyCode) {
          case 83: //S
            speed = 0;
            break;
          case 87: //W
            speed = 0;
            break;

          case 68:
            hpRoll.heading += deltaRadians;
            if (hpRoll.heading > Cesium.Math.TWO_PI) {
              hpRoll.heading -= Cesium.Math.TWO_PI;
            }
            break;
          case 65:
            hpRoll.heading -= deltaRadians;
            if (hpRoll.heading < 0.0) {
              hpRoll.heading += Cesium.Math.TWO_PI;
            }
            break;
        }
      });
      var headingSpan = document.getElementById("heading");
      var pitchSpan = document.getElementById("pitch");
      var rollSpan = document.getElementById("roll");
      var speedSpan = document.getElementById("speed");
      var fromBehind = document.getElementById("fromBehind");

      viewer.scene.preUpdate.addEventListener(function (scene, time) {
        speedVector = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_X, speed / 10, speedVector);

        position = Cesium.Matrix4.multiplyByPoint(
          Cesium.Transforms.headingPitchRollToFixedFrame(
            position,
            new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-180) + Cesium.Math.toRadians(Cesium.Math.toDegrees(hpRoll.heading)), Cesium.Math.toRadians(Cesium.Math.toDegrees(hpRoll.pitch)), Cesium.Math.toRadians(Cesium.Math.toDegrees(hpRoll.roll))),
            Cesium.Ellipsoid.WGS84,
            fixedFrameTransform
          ),
          speedVector,
          position
        );

        // planePrimitive.position = pathPosition
        // planePrimitive.hpRoll = hpRoll

        pathPosition.addSample(Cesium.JulianDate.now(), position);

        Cesium.Transforms.headingPitchRollToFixedFrame(
          position,
          new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(Cesium.Math.toDegrees(hpRoll.heading)), Cesium.Math.toRadians(Cesium.Math.toDegrees(hpRoll.roll)), Cesium.Math.toRadians(Cesium.Math.toDegrees(hpRoll.pitch))),
          Cesium.Ellipsoid.WGS84,
          fixedFrameTransform,
          planePrimitive.modelMatrix
        );

        setCamera();
      });

      viewer.scene.preRender.addEventListener(function (scene, time) {
        headingSpan.innerHTML = Cesium.Math.toDegrees(hpRoll.heading).toFixed(1);
        pitchSpan.innerHTML = Cesium.Math.toDegrees(hpRoll.pitch).toFixed(1);
        rollSpan.innerHTML = Cesium.Math.toDegrees(hpRoll.roll).toFixed(1);
        speedSpan.innerHTML = speed.toFixed(1);
      });
    }
    //视角切换
    IntelligentFlyingGame_Visual(type) {
      this.viewer.IFV_TYPE = type;
    }
    //更新指引内容
    setText(params, title) {
      if (title) this.setTitle(title);
      let doc = document.getElementsByClassName("notes")[0];
      if (doc == null) return;
      if (!title) doc.innerHTML = "操作指引<br>";

      for (let index = 0; index < params.length; index++) {
        const element = params[index];
        let dom = document.createElement("p");
        dom.setAttribute("style", " font-weight: 700; ");
        dom.innerHTML = element.name;
        doc.appendChild(dom);
        doc.innerHTML += element.text + "<br>";
      }
    }

    //更新指引标题
    setTitle(params) {
      let travelscope = document.getElementById("travelscope");
      if (travelscope == null) return;
      travelscope.innerHTML = params.title;
      let dom = document.createElement("div");
      dom.setAttribute("class", "notes");
      dom.innerHTML = params.text + "<br>";
      travelscope.appendChild(dom);
    }

    setCookie = function (name, value) {
      //设置名称为name,值为value的Cookie
      var expdate = new Date(); //初始化时间
      expdate.setTime(expdate.getTime() + 24 * 60 * 60 * 1000); //时间单位毫秒
      document.cookie = name + "=" + value + ";expires=" + expdate.toGMTString() + ";path=/";
    };

    getCookie = function (c_name) {
      //判断document.cookie对象里面是否存有cookie
      if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        //如果document.cookie对象里面有cookie则查找是否有指定的cookie，如果有则返回指定的cookie值，如果没有则返回空字符串
        if (c_start != -1) {
          c_start = c_start + c_name.length + 1;
          var c_end = document.cookie.indexOf(";", c_start);
          if (c_end == -1) c_end = document.cookie.length;
          return unescape(document.cookie.substring(c_start, c_end));
        }
      }
      return "";
    };

    setLS = function (key, value, exp) {
      var curTime = new Date().getTime();
      localStorage.setItem(key, JSON.stringify({ data: value, time: curTime, clear: exp }));
    };

    getLS = function (key) {
      var data = localStorage.getItem(key);
      if (data == null || data == undefined) return null;
      var dataObj = JSON.parse(data);
      if (new Date().getTime() - dataObj.time > dataObj.exp) {
        return undefined;
      } else {
        var dataObjDatatoJson = JSON.parse(dataObj.data);
        return dataObjDatatoJson;
      }
    };

    //#endregion
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
  if (typeof window.Gear === "undefined") {
    window.Gear = gear;
  }
})(window);
