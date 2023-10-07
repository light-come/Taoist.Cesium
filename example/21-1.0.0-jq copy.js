(function () {
  $.fn.JazzyJoint = function (options) {
    let defaultOptions = {
      positions: [0.0, 0.0, 0.0, 0.0],
      html: `
      `,
    };
    if (options) defaultOptions = options;

    let boxMoveTo;
    let originMoveTo;

    try {
      boxMoveTo = { x: defaultOptions.positions[2], y: defaultOptions.positions[3] };
      originMoveTo = { x: defaultOptions.positions[0], y: defaultOptions.positions[1] };
    } catch (error) {
      console.error("传入数据坐标格式不正确！", error);
      return false;
    }

    // 默认样式
    let defaultStyles = {
      container: {
        position: "relative",
      },
      jazzy: {
        position: "absolute",
        "pointer-events": "none",
        // "z-index": `${$.fn.JazzyJoint.collect.length + 1}`,
        width: "100%",
        height: "100%",
      },
      jazzyPoint: {
        width: "10px",
        height: "10px",
        "background-color": "red",
        position: "absolute",
      },
      svg: {
        position: "absolute",
      },
      line: {
        stroke: "black",
        "stroke-width": "2",
      },
      coor: {
        width: "10px",
        height: "10px",
        overflow: "hidden",
        cursor: "se-resize",
        position: "absolute",
        right: "0",
        bottom: "0",
      },
      infoBox: {
        "pointer-events": "auto",
        display: "block",
        position: "absolute",
        right: "0px",
        left: typeof boxMoveTo.x === "string" ? boxMoveTo.x : boxMoveTo.x + "px",
        top: typeof boxMoveTo.y === "string" ? boxMoveTo.y : boxMoveTo.y + "px",
        width: "40%",
        "max-width": "480px",
        background: "rgba(38, 38, 38, 0.95)",
        color: "#edffff",
        border: "1px solid #444",
        "border-right": "none",
        "border-top-left-radius": "7px",
        "border-bottom-left-radius": "7px",
        "box-shadow": "0 0 10px 1px #000",
        transform: "translate(100%, 0)",
        visibility: "hidden",
        opacity: "0",
        transition: "visibility 0s 0.2s, opacity 0.2s ease-in, transform 0.2s ease-in",
        height: "30%",
        overflow: "hidden",
        cursor: "move",
      },
      infoBoxVisible: {
        transform: "translate(0, 0)",
        visibility: "visible",
        opacity: "1",
        transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
      },
      InfoBoxTitle: {
        display: "block",
        height: "20px",
        padding: "5px 30px 5px 25px",
        background: "rgba(84, 84, 84, 1)",
        "border-top-left-radius": "7px",
        "text-align": "center",
        "text-overflow": "ellipsis",
        "white-space": "nowrap",
        overflow: "hidden",
        "box-sizing": "content-box",
        display: "none",
      },
      infoBoxCamera: {
        display: "block",
        position: "absolute",
        top: "4px",
        left: "4px",
        width: "22px",
        height: "22px",
        background: "transparent",
        "border-color": "transparent",
        "border-radius": "3px",
        padding: "0 5px",
        margin: "0",
      },
      InfoBoxClose: {
        display: "block",
        position: "absolute",
        top: "5px",
        right: "5px",
        height: "20px",
        background: "transparent",
        border: "none",
        "border-radius": "2px",
        "font-weight": "bold",
        "font-size": "16px",
        padding: "0 5px",
        margin: "0",
        color: "#edffff",
      },
      infoBoxDiv: {
        "-webkit-box-pack": "center",
        "-ms-flex-pack": "center",
        "-webkit-box-align": "center",
        "-ms-flex-align": "center",
        "align-items": "center",
        background: "rgba(33,33,33,.9)",
        display: "-webkit-box",
        display: "-ms-flexbox",
        display: "flex",
        height: "100%",
        "justify-content": "center",
        left: "0",
        top: "0",
        overflow: "hidden",
        position: "absolute",
        bottom: "0",
        width: "100%",
        "z-index": "-1",
      },
      infoBoxButton: {
        display: "inline-block",
        position: "relative",
        background: "#303336",
        border: "1px solid #444",
        color: "#edffff",
        fill: "#edffff",
        "border-radius": "4px",
        padding: "5px 12px",
        margin: "2px 3px",
        cursor: "pointer",
        overflow: "hidden",
        "-moz-user-select": "none",
        "-webkit-user-select": "none",
        "-ms-user-select": "none",
        "user-select": "none",
      },
    };

    // return this.each(function () {
    let index = $.fn.JazzyJoint.collect.length + 1;
    // 获取容器元素
    let $container = $(this);

    let styles = $.extend(true, defaultStyles);

    let html = `
        <div name="Jazzy${$.fn.JazzyJoint.collect.length + 1}" style="${getStyleString(styles.jazzy)}">
          <div name="JazzyPoint" style="${getStyleString(styles.jazzyPoint)}"></div>
          <div name="JazzyPoint" style="${getStyleString(styles.jazzyPoint)}"></div>
          <svg name="line" style="${getStyleString(styles.svg)}">
            <line x1="0" y1="0" x2="0%" y2="0%" style="${getStyleString(styles.line)}"/>
          </svg>
          <canvas name="canvas" style="position: absolute;"></canvas>
        </div>
      `;

    let div = `
      <div name="JazzyBox" style="${getStyleString(styles.infoBox)} ${getStyleString(styles.infoBoxVisible)}">
        <div style="${getStyleString(styles.InfoBoxTitle)}" data-bind="text: titleText">AGI</div>
        <button type="button" style="${getStyleString(styles.infoBoxButton)}${getStyleString(styles.infoBoxCamera)}" title="Focus camera on object"></button>
        <button type="button" style="${getStyleString(styles.InfoBoxClose)}" onclick='document.querySelector("[name=\\"Jazzy${index}\\"]")?.remove();'>×</button>
        <div style="${getStyleString(styles.infoBoxDiv)}">
          ${defaultOptions.html}
        </div>
        <div name="coor" style="${getStyleString(styles.coor)}"></div>
      </div>
      `;

    $container.append(html);
    let jazzy = domByName(`Jazzy${index}`);
    jazzy.append(div);
    $.fn.JazzyJoint.collect.push(jazzy);
    let jazzyBox = $(jazzy).children(`[name="JazzyBox"]`);
    let jazzyCanvas = $(jazzy).children(`[name="canvas"]`);

    // 设置元素可拖动
    drag.draggable(jazzyBox[0], jazzy);
    // 设置元素可拖动放大
    drag.dragresize(jazzyBox[0], jazzy);

    // 初始化连线位置
    drag.updateLine(jazzy, originMoveTo);
    // 初始化三角形
    let p = drag.triangle.count($(jazzy).children(`[name="JazzyPoint"]`));
    // 定义三个点的坐标
    let x1 = p[0];
    let y1 = p[1];
    let x2 = p[2];
    let y2 = p[3];
    let x3 = p[4];
    let y3 = p[5];
    drag.triangle.drawTriangle(jazzyCanvas[0], x1, y1, x2, y2, x3, y3);

    jazzy.click(JazzyClick);
    jazzy.on("mousedown", function (e) {
      JazzyMousedown(e, jazzy, $container);
    });

    var data = { jazzy };
    var extension = {
      updateLine: function (cartesian2) {
        return drag.updateLine(jazzy, cartesian2);
      },
      controller: function () {
        return $.fn.JazzyJoint.collect;
      },
      remove: function () {
        return jazzy.fadeOut(function () {
          $(this).remove();
        });
      },
      hide: function () {
        return jazzy.fadeOut();
      },
      show: function () {
        return jazzy.fadeIn();
      },
      css: function (style) {
        if (style) jazzyBox.css(style);
      },
      jazzyBox: function () {
        return jazzyBox[0];
      },
      refresh: function () {
        drag.updateLine(jazzy);
      },
      cartesian2: { x: 0, y: 0 },
    };

    Object.assign(data, extension);

    return data;
    // });

    function JazzyMousedown(event, jazzy, container) {
      $(container).children(":last").after(jazzy);
    }
    function JazzyClick(event) {
      var clickedElement = event.target;
    }
    function domByName(name) {
      return $(`[name="${name}"]`);
    }
    function getStyleString(styleObject) {
      var styleString = "";
      for (var property in styleObject) {
        if (styleObject.hasOwnProperty(property)) {
          styleString += `${property}: ${styleObject[property]}; `;
        }
      }
      return styleString;
    }
  };

  const drag = {
    /**
     * 设置元素可拖动
     */
    draggable: function (document, jazzy) {
      var dragDiv = document;
      // 用于保存鼠标按下时鼠标位置与div左上角的偏移量
      var offsetX = 0;
      var offsetY = 0;

      // 鼠标按下时触发的函数
      function mouseDownHandler(e) {
        e = e || window.event;
        e.preventDefault();

        // 获取鼠标相对于div左上角的偏移量
        offsetX = e.clientX - dragDiv.offsetLeft;
        offsetY = e.clientY - dragDiv.offsetTop;

        // 当鼠标移动时触发mousemove事件
        document.addEventListener("mousemove", mouseMoveHandler);
        // 当鼠标松开时触发mouseup事件
        document.addEventListener("mouseup", mouseUpAndOutHandler);
        // 当鼠标离开时触发mouseout事件
        document.addEventListener("mouseout", mouseUpAndOutHandler);
      }

      // 鼠标移动时触发的函数
      function mouseMoveHandler(e) {
        e = e || window.event;
        e.preventDefault();
        drag.updateLine(jazzy);
        drag.updateTriangle(jazzy);
        // 计算div新的位置
        var x = e.clientX - offsetX;
        var y = e.clientY - offsetY;

        // 获取浏览器窗口的宽度和高度
        var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取div的宽度和高度
        var divWidth = dragDiv.offsetWidth;
        var divHeight = dragDiv.offsetHeight;

        // 限制div的位置不超出浏览器的宽高范围
        if (x < 0) {
          x = 0;
        }
        if (y < 0) {
          y = 0;
        }
        if (x + divWidth > windowWidth) {
          x = windowWidth - divWidth;
        }
        if (y + divHeight > windowHeight) {
          y = windowHeight - divHeight;
        }
        // 设置div的新位置
        dragDiv.style.left = x + "px";
        dragDiv.style.top = y + "px";
      }

      // 鼠标松开时触发的函数
      function mouseUpAndOutHandler(e) {
        e = e || window.event;

        // 移除mousemove和mouseup事件的监听器
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpAndOutHandler);
        document.removeEventListener("mouseout", mouseUpAndOutHandler);
      }

      // 给div绑定mousedown事件处理函数
      dragDiv.addEventListener("mousedown", mouseDownHandler);
    },
    /**
     * 设置元素可拖拽放大
     */
    dragresize: function (document, jazzy) {
      let jazzyBox = $(jazzy).children(`[name="JazzyBox"]`)[0];
      let coor = $(jazzy).children(`[name="JazzyBox"]`).children(`[name="coor"]`)[0];
      $(document)
        .mousemove(function (e) {
          if (!!this.move) {
            var posix = !document.move_target ? { x: 0, y: 0 } : document.move_target.posix,
              callback = document.call_down || function () {};

            callback.call(this, e, posix);
          }
        })
        .mouseup(function (e) {
          if (!!this.move) {
            var callback = document.call_up || function () {};
            callback.call(this, e);
            $.extend(this, {
              move: false,
              move_target: null,
              call_down: false,
              call_up: false,
            });
          }
        });
      // return;
      var $box = $(jazzyBox).mousedown(function (e) {
        var offset = $(this).offset();

        this.posix = { x: e.pageX - offset.left, y: e.pageY - offset.top };
        $.extend(document, { move: true, move_target: this });
      });

      $(coor).on("mouseover", function (e) {
        $(coor).on("mousedown", function (e) {
          var posix = {
            w: $box.width(),
            h: $box.height(),
            x: e.pageX,
            y: e.pageY,
          };

          $.extend(document, {
            move: true,
            call_down: function (e) {
              drag.updateLine(jazzy);
              $box.css({
                width: Math.max(30, e.pageX - posix.x + posix.w),
                height: Math.max(30, e.pageY - posix.y + posix.h),
                "max-width": "1000px",
              });
            },
          });
          return false;
        });
      });

      $(coor).on("mouseout", function () {
        $.extend(document, {
          move: true,
          call_down: function (e) {},
        });
      });
    },
    /**
     * 更新连线位置和形状的函数
     * @param {*} jazzy
     * @param {*} position1
     * @param {*} position2
     */
    updateLine: function (jazzy, cartesian2) {
      // console.log(jazzy)
      if (!cartesian2) cartesian2 = jazzy.cartesian2;
      else jazzy.cartesian2 = cartesian2;
      try {
        let jazzyPoint = $(jazzy).children(`[name="JazzyPoint"]`);
        let jazzyLine = $(jazzy).children(`[name="line"]`);
        let jazzyBox = $(jazzy).children(`[name="JazzyBox"]`);

        const div1 = jazzyPoint[0];
        const div2 = jazzyPoint[1];
        const svg = jazzyLine[0];

        const dragContainer = jazzyBox[0];
        const rect = dragContainer.getBoundingClientRect();

        var x1 = cartesian2.x;
        var y1 = cartesian2.y;
        var x2 = rect.left + window.pageXOffset + dragContainer?.offsetWidth / 2;
        var y2 = rect.top + window.pageYOffset + dragContainer?.offsetHeight / 2;

        div1.style.left = x1.toFixed(4) + "px";
        div1.style.top = y1.toFixed(4) + "px";

        div2.style.left = x2.toFixed(4) + "px";
        div2.style.top = y2.toFixed(4) + "px";

        var top = Math.min(y1, y2);
        var left = Math.min(x1, x2);
        var width = Math.abs(x1 - x2);
        var height = Math.abs(y1 - y2);
        svg.setAttribute("style", "position: absolute;top:" + top.toFixed(4) + "px; left:" + left.toFixed(4) + "px; width:" + width.toFixed(4) + "px; height:" + height.toFixed(4) + "px");
        const line = svg.getElementsByTagName("line")[0];
        if (x2 < x1 && y2 < y1) {
          // console.log("點 在 模型 的左上方");
          line.setAttribute("x2", "0");
          line.setAttribute("y1", "100%");

          line.setAttribute("x1", "100%");
          line.setAttribute("y2", "0");
        }
        if (x2 < x1 && y2 > y1) {
          // console.log("點 在 模型 的左下方");
          line.setAttribute("x2", "0");
          line.setAttribute("y1", "0");

          line.setAttribute("x1", "100%");
          line.setAttribute("y2", "100%");
        }
        if (x2 > x1 && y2 < y1) {
          // console.log("點 在 模型 的右上方");
          line.setAttribute("x2", "100%");
          line.setAttribute("y1", "100%");

          line.setAttribute("x1", "0");
          line.setAttribute("y2", "0");
        }
        if (x2 > x1 && y2 > y1) {
          // console.log("點 在 模型 的右下方");
          line.setAttribute("x2", "100%");
          line.setAttribute("y1", "0");

          line.setAttribute("x1", "0");
          line.setAttribute("y2", "100%");
        }
      } catch (error) {
        console.log(error);
        return false;
      }

      return true;
    },
    updateTriangle: function (jazzy) {
      let jazzyCanvas = $(jazzy).children(`[name="canvas"]`);
      let p = drag.triangle.count($(jazzy).children(`[name="JazzyPoint"]`));
      // 定义三个点的坐标
      let x1 = p[0];
      let y1 = p[1];
      let x2 = p[2];
      let y2 = p[3];
      let x3 = p[4];
      let y3 = p[5];
      drag.triangle.updatePoints(jazzyCanvas[0], x1, y1, x2, y2, x3, y3);
    },
    triangle: {
      radius: 50, // 直径的一半
      count: function (divList) {
        // 获取第一个匹配到的div元素
        const centerPoint = divList[0];

        // 获取第二个匹配到的div元素
        const offsetPoint = divList[1];

        // 获取点a和点b的元素
        var pointA = centerPoint;
        var pointB = offsetPoint;

        // 计算角度
        var angle = Math.atan2(pointA.offsetTop - pointB.offsetTop, pointA.offsetLeft - pointB.offsetLeft);

        // 计算三个偏移点的坐标
        var pointA_x = pointB.offsetLeft + this.radius * Math.cos(angle + Math.PI / 2);
        var pointA_y = pointB.offsetTop + this.radius * Math.sin(angle + Math.PI / 2);

        var pointB_x = pointB.offsetLeft + this.radius * Math.cos(angle - Math.PI / 2);
        var pointB_y = pointB.offsetTop + this.radius * Math.sin(angle - Math.PI / 2);
        // 创建三个偏移点的元素并添加到HTML中

        // var point1 = document.createElement("div");
        // point1.className = "point";
        // point1.style.left = pointA_x + "px";
        // point1.style.top = pointA_y + "px";

        // var point2 = document.createElement("div");
        // point2.className = "point";
        // point2.style.left = pointB_x + "px";
        // point2.style.top = pointB_y + "px";

        // document.body.appendChild(point1);
        // document.body.appendChild(point2);
        return [pointA.offsetLeft, pointA.offsetTop, pointA_x, pointA_y, pointB_x, pointB_y];
      },
      drawTriangle: function (canvas, x1, y1, x2, y2, x3, y3) {
        var context = canvas.getContext("2d");

        canvas.width = x3 + this.radius * 2; // 设置新的宽度
        canvas.height = y3 + this.radius; // 设置新的高度
        console.log({ x1, y1, x2, y2, x3, y3 });
        context.clearRect(0, 0, canvas.width, canvas.height); // 清空画布

        // 移动画笔到第一个点
        context.moveTo(x1, y1);

        // 依次连接三个点
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);

        // 将画笔返回到第一个点，完成三角形闭合
        context.lineTo(x1, y1);

        // 绘制三角形边框线条
        context.stroke();

        // 设置填充颜色
        context.fillStyle = "blue";

        // 填充三角形
        context.fill();

        return context;
      },
      updatePoints: function (canvas, newX1, newY1, newX2, newY2, newX3, newY3) {
        this.drawTriangle(canvas, newX1, newY1, newX2, newY2, newX3, newY3); // 重新绘制并刷新Canvas
      },
    },
  };
  $.fn.JazzyJoint.collect = [];
})(jQuery);
