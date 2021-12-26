'use strict';
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

        arg.forEach((v) => {
          const newValue = properties.filter((property) => {
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
    //检测加载
    InterceptionAndmonitoring() {
      var open = window.XMLHttpRequest.prototype.open,
        send = window.XMLHttpRequest.prototype.send;

      function openReplacement(method, url, async, user, password) {
        this._url = url;
        return open.apply(this, arguments);
      }

      function sendReplacement(data) {
        if (this.onreadystatechange) {
          this._onreadystatechange = this.onreadystatechange;
        }

        // console.log('Request sent',  );
        if (this._url.indexOf('bin') != -1 || this._url.indexOf('gltf') != -1 || this._url.indexOf('glb') != -1) {
          console.log({
            heading: '文件加载中',
            text: '文件可能较大，请耐心等待',
            position: 'top-center',
            stack: false,
          })
        }

        this.onreadystatechange = onReadyStateChangeReplacement;
        return send.apply(this, arguments);
      }

      function onReadyStateChangeReplacement() {
        // console.log('Ready state changed to: ', this.readyState);

        if (this.readyState == 4)
          if (this._url.indexOf('bin') != -1 || this._url.indexOf('gltf') != -1 || this._url.indexOf('glb') != -1) {
            console.log({
              heading: '加载完成',
              // text: "加载完成："+this._url,
              showHideTransition: 'slide',
              position: 'top-center',
              icon: 'success',
            });
          }

        if (this._onreadystatechange) {
          return this._onreadystatechange.apply(this, arguments);
        }
      }

      window.XMLHttpRequest.prototype.open = openReplacement;
      window.XMLHttpRequest.prototype.send = sendReplacement;
    }
    //释放方法
    release() {
      VMSDS.core.findProperties(VMSDS.core, '').forEach((mod) => {
        if (mod.indexOf('Release') != -1) {
          var e = eval('VMSDS.core.' + mod);
          e(window.VMSDS.GIS);
        }
      });
    }
    //保持链接
    holdLink(e){
      function getQueryVariable()
      {
        var query = window.location.href;
        var vars = query.split("#");
        if(vars.length > 1){
            return vars[1] == "" ? false :vars[1]
        }
        return false;
      }
     
      hashChangeFire();
      if(getQueryVariable()){
          setTimeout(() => {
              console.log(decodeURI(getQueryVariable()))
          }, 1000);
      }
      if( ("onhashchange" in window) && ((typeof document.documentMode==="undefined") || document.documentMode==8)) {
          // 浏览器支持onhashchange事件
          window.onhashchange = hashChangeFire;  // TODO，对应新的hash执行的操作函数
      } else {
          // 不支持则用定时器检测的办法
          setInterval(function() {
              var ischanged = isHashChanged();  // TODO，检测hash值或其中某一段是否更改的函数
              if(ischanged) {
                  hashChangeFire();  // TODO，对应新的hash执行的操作函数
              }
          }, 150);
      }
      function hashChangeFire(){ 
          var _index = getQueryVariable()
          if(e)e(_index)
      } 
    }
    //更新指引内容
    setText(params,title) {

      if(title)
        this.setTitle(title)
      let doc = document.getElementsByClassName( "notes" )[0]
      if(!title) doc.innerHTML = "操作指引<br>"
   
      for (let index = 0; index < params.length; index++) {
        const element = params[index];
        let dom =  document.createElement("p")
        dom.setAttribute("style", " font-weight: 700; ");
        dom.innerHTML = element.name;
        doc.appendChild( dom );
        doc.innerHTML += element.text+"<br>";
      }

    }
    //更新指引标题
    setTitle(params) {
      let travelscope = document.getElementById( "travelscope" )
      travelscope.innerHTML = params.title
      let dom =  document.createElement("div")
      dom.setAttribute("class", "notes");
      dom.innerHTML = params.text + "<br>"
      travelscope.appendChild( dom );
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
          name: '影像底图',
          type: 'mapbox', //www_google sl_geoq
          layer: 'blue', //satellite
          // crs: '4326',
          brightness: 1,
        });
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

  window.Gear = gear
})(window);
