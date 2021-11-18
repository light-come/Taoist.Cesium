(function(window) {
    var jQuery = function(selector) {
        // 返回一个构造函数
        return new jQuery.fn.init(selector)
    }
    jQuery.fn = {
        css: function(key, value) {
            //业务逻辑代码
        },
        html: function(value) {
            //业务逻辑代码
        }
    }
    // 定义构造函数
    var init = jQuery.fn.init = function(selector) {
        var slice = Array.prototype.slice
        // 把类数组转换成数组
        var dom = slice.call(document.querySelectorAll(selector))
        var i, len = dom ? dom.length : 0
        for (i = 0; i < len; i++) {
            this[i] = dom[i]
        }
        this.length = len
        this.selector = selector || ''
    }
    // 使用构造函数的原型扩张css和html方法
    init.prototype = jQuery.fn
    window.$ = jQuery
})(window)
