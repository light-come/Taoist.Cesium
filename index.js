  
var script = [' <script type="text/javascript" src="/example/example.js"></script>'
//编辑器资源
,'<link rel=stylesheet href="/lib/plugins/codemirror-5.14.2/doc/docs.css">'
,'<link rel="stylesheet" href="/lib/plugins/codemirror-5.14.2/lib/codemirror.css">'
,'<link rel="stylesheet" href="/lib/plugins/codemirror-5.14.2/addon/hint/show-hint.css">'
,'<script src="/lib/plugins/codemirror-5.14.2/lib/codemirror.js"></script>'
,'<script src="/lib/plugins/codemirror-5.14.2/addon/hint/show-hint.js"></script>'
,'<script src="/lib/plugins/codemirror-5.14.2/addon/hint/javascript-hint.js"></script>'
,'<script src="/lib/plugins/codemirror-5.14.2/mode/javascript/javascript.js"></script>'
,'<script src="/lib/plugins/codemirror-5.14.2/mode/markdown/markdown.js"></script>'

];
script.forEach(element => {
  document.writeln(element);
});
const uri = './example/'
const version = "1.0.0"
let array = [
  {name:"你好地球"},
  {name:"建筑模型"},
  {name:"球体自转"},
  {name:"添加底图"},
  {name:"加载GLTF或GLB模型"},
  {name:"登月动画"},
  {name:"模型销毁"},
  {name:"人物巡逻"},
  {name:"区域范围"},
  {name:"场景透明"},
  {name:"模型运动"},
  {name:"绘制"},
  {name:"测量"}, 
  {name:"内置控件"}, 
  {name:"天气模拟"}, 
  {name:"带你去爬山"},
  {name:"旋转控件"},
]
for (let index = 0; index < array.length; index++) {
  array[index]["uri"] =  uri+(index+1) + "-"  + version + "-" + encodeURI(array[index].name)
  array[index]["url"] =  array[index]["uri"] +".html"
}
console.log(array)
/**
 * 初始化编辑器
 */
function init_editor(value) {
  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    extraKeys: {"Ctrl-Space": "autocomplete"},
    mode: {name: "javascript", globalVars: true}
  });
  editor.setValue(value)
  return  editor
}
/**
 * Get请求
 * @param {*} url 请求地址
 * @param {*} event 回调方法
 * @param {*} textType 返回类型
 */
const Get = (url,event,textType) => {
    var request=new XMLHttpRequest();
    var method = "GET";
    var TextType = textType ?? "JSON"
    request.open(method,url);
    request.send(null);
    request.onreadystatechange = function(){
      if (request.readyState==4&&(request.status==200 || request.status==304))
      {
        if(event)
        {
          let data = request.responseText
          switch (TextType) {
            case "JSON":
              data = eval('(' + data + ')')
              break;
            default:
              break;
          }
          event(data);
        }
      }
    }
}

function init(e) {
  
  //编译器对象初始化
  Get("index.js",function (data) {
    // document.getElementById("code").innerHTML = data;
    _editor = init_editor(data)
    if(e)e()//最后一个get防止异步变量无法同步
  },"text")
  array.forEach(element => {
      let dom =  document.createElement("a")
      dom.setAttribute("href", "#" + element.url);
      dom.setAttribute("style", " margin: 10px; ");
     
      dom.innerHTML = (element.name);
      let p = document.createElement("p")
      p.setAttribute("style", " display:inline; ");
    
      p.appendChild(dom)
      dom.onclick = function () {
        var by = document.getElementById('core_content')
        if(by)by.setAttribute("src",this.href.split("#")[1])
        const href = this.href.split("#")[1]

        //修改编辑器框内容
        if(_editor){
          for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if( element.url === (href) ){
              Get(( array[index]["uri"] + '.js' ),function (data) {
                _editor.setValue(data)
              },"text")
            }
          }
         
        }
      
        
      }
      // document.body.appendChild( p );
      document.getElementsByClassName( "navigation" )[0].appendChild( p );
  });


}
function test(){
    
  //Frame 对象
  const FrameObj = document.getElementById('core_content');
 
  //监听message事件
  window.addEventListener("message",function (e) {
    if (e !== undefined) 
        console.log( '接收', e.data);
  }, false);

  //规定发送格式
  const data = {
    event : "方法名称",
    options: "内容:hello world :)"
  }

  //执行函数
  function implement(params,value) {
    if(value != null) params.options = value;
    FrameObj.contentWindow.postMessage(params, '*');
  }
  //发送器
  window.onload = function(){
    FrameObj.contentWindow.postMessage(data, '*');
  }


  /////////////////////////////////////////////////////////////////行参

  //定位相机
  const positioning_camera = {
    event : "example_positioning_camera",
    options:'3FD815955E4811ECA56200163E0132C0'
  } 

}

window.onload = () => {
  //初始化全局变量
  window._editor = undefined

  //初始化交互信息
  init(function () {
    //保持链接
    new Gear()["holdLink"](function (uri) {
      if(uri)
      var by = document.getElementById('core_content')
      if(by)by.setAttribute("src",uri)//+'?'+new Date().getTime()
      //修改编辑器框内容
      if(_editor){
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          if( element.url === (uri) ){
            Get(( array[index]["uri"] + '.js' ),function (data) {
              _editor.setValue(data)
            },"text")
          }
        }
      }

    })
  });

}