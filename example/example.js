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
      this.DynamicDraw = null;

      this.Rain = null; //雨
      this.Snow = null; //雪
      this.Fog = null; //雾

      //html气泡
      this.MovePromptList = [];
      //html事件泛光
      this.event_spreadList = [];
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
      VMSDS.core.findProperties(VMSDS.core, "").forEach(mod => {
        if (mod.indexOf("Release") != -1) {
          var e = eval("VMSDS.core." + mod);
          e(this.viewer);
        }
      });
    }
    //保持链接
    holdLink(e) {
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
    //更新指引内容
    setText(params, title) {
      if (title) this.setTitle(title);
      let doc = document.getElementsByClassName("notes")[0];
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
      travelscope.innerHTML = params.title;
      let dom = document.createElement("div");
      dom.setAttribute("class", "notes");
      dom.innerHTML = params.text + "<br>";
      travelscope.appendChild(dom);
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
      $('#htmlOverlay').hide(); //漫游气泡

      var setvisible = VMSDS.effect.runshineAnalysis();
      setvisible(viewer, 'stop'); //stop

      viewer.building.forEach((e) => {
        var em = VMSDS.core.QueryModel_Scene(viewer, e.id);
        var defaultStyle = new Cesium.Cesium3DTileStyle({
          color: "color('white', 1)",
        });

        if (Cesium.defined(em)) {
          em.style = defaultStyle;
        }
      });

      $('.overview-close').click();

      /**
       * 视角释放
       */
      viewer.scene.postUpdate.removeEventListener(viewer.IntelligentRoaming_VisualEvent);
      viewer.trackedEntity = undefined;
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      /**
       * 销毁路径 及 人物模型
       */
      var mods = VMSDS.core.QueryModel_Entities_x(viewer, {
        type: 'IntelligentRoaming',
      });
      if (mods.length >= 1) {
        VMSDS.core.RemoveEntities(viewer, mods);
      }
      /**
       * 销毁路径 及 人物模型
       */
      var mods = VMSDS.core.QueryModel_Entities_x(viewer, {
        type: 'IntelligentRoamingV2',
      });
      if (mods.length >= 1) {
        VMSDS.core.RemoveEntities(viewer, mods);
      }

      viewer.dataSources.removeAll();
      /**
       * 初始化时间及还原时间速率
       */
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
      viewer.clock.multiplier = 1;
      viewer.clock.worldSpeedCache = viewer.clock.multiplier;
      var tileset = VMSDS.core.QueryModel_Scene(viewer, '56c3c6913322484a892c2b9113918d97');
      if (!Cesium.defined(tileset)) {
        return;
      }
      tileset.initialTilesLoaded.removeEventListener(viewer.GroundRoaming_EventListener);
      viewer.scene.postRender.removeEventListener(viewer.GroundRoaming_Start_EventListener);
    }
    //视角
    IntelligentRoaming_Visual(value, _entity) {
      const viewer = this.viewer;

      viewer.scene.postUpdate.removeEventListener(VMSDS.GIS.IntelligentRoaming_VisualEvent);
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      viewer.trackedEntity = undefined;
      function get_entity(viewer) {
        for (let index = 0; index < viewer.dataSources._dataSources.length; index++) {
          const element = viewer.dataSources._dataSources[index];
          if (!Cesium.defined(element.entities._entities._array)) {
            return;
          }

          for (let i = 0; i < element.entities._entities._array.length; i++) {
            const e = element.entities._entities._array[i];
            if (e.type == "IntelligentRoaming") {
              return e;
            }
          }
        }
      }

      var entity = get_entity(viewer);
      if (_entity != null) {
        entity = _entity;
      }
      if (entity == null) {
        entity = VMSDS.core.QueryModel_Entities_x(this.viewer, {
          type: "IntelligentRoamingV2",
        })[0];
      }
      if (entity == null) {
        return;
      }
      var visual = value.visual ?? {
        type: 2,
        zoomTo: false,
      }; //视角 0是无绑定 1是第一人称 3是第三人称 2是跟随

      VMSDS.GIS.IntelligentRoaming_VisualEvent = function (scene, time) {
        if (!Cesium.defined(entity.position)) {
          return;
        }

        var position = entity.position.getValue(time);
        var camera = viewer.camera;
        switch (visual.type) {
          case 3:
            camera.position = new Cesium.Cartesian3(-5, -0, value.visual.height == null ? 10.435945991426706 : value.visual.height);
            camera.direction = new Cesium.Cartesian3(0.3987584249598806, 0.009354600409072824, value.visual.direction == null ? Cesium.Math.toRadians(-65) : Cesium.Math.toRadians(value.visual.direction));
            camera.up = new Cesium.Cartesian3(0.916756064443912, 0.021506470654472087, 0.39886813613686706);
            camera.right = new Cesium.Cartesian3(0.02345286397916243, -0.9997249437576193, -2.908438299226157);
            break;
          case 2:
            //绑定方式
            viewer.trackedEntity = entity;
            break;
          case 1:
            camera.position = new Cesium.Cartesian3(0, 0.0, 1.5); //位置一是前后视距
            camera.direction = new Cesium.Cartesian3(1.0, 0.0, Cesium.Math.toRadians(0));
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
        viewer.scene.postUpdate.addEventListener(this.viewer.IntelligentRoaming_VisualEvent);
      }

      if (visual.type == 2) {
        viewer.zoomTo(entity, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-100), Cesium.Math.toRadians(-65), 20));
      }
    }
    //跳转点位
    JumpTimePoint(value) {
      var viewer = this.viewer;
      if (!Cesium.defined(viewer.PatrolPoint) || !Cesium.defined(value)) {
        return;
      }
      var PatrolIndex = viewer.PatrolIndex == null ? 0 : viewer.PatrolIndex;
      var PatrolPoint = viewer.PatrolPoint;
      var start_time;
      switch (value.type) {
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
    IntelligentRoaming_Speed(value) {
      const viewer = this.viewer;
      viewer.clock.multiplier = value.multiplier;
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

      var eagle_original = [];
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

      var uri = "http://192.168.2.17:8077/%E4%BA%BA%E7%89%A9%E7%8E%AF%E6%A8%A1%E5%9E%8B/%E4%BA%BA%E7%89%A9/%E7%99%BD%E8%86%9C%E8%A1%8C%E8%B5%B0/scene.gltf";
      var _options = { positions: FR_CURVE };
      _options.url = uri;
      _options.scale = 0.01;

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
      viewer.scene.postRender.addEventListener(
        (viewer.IntelligentRoaming_EventListener = function (scene, time) {
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
        })
      );

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

  window.Gear = gear;
})(window);
