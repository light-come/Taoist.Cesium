const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');



module.exports = {
    mode: "development", //打包为开发模式
    // 出口对象中，属性为输出的js文件名，属性值为入口文件
    entry:{
      'taoist3D': [
        "./lib/Taoist.core-src.js", 
        "./lib/Taoist.control-src.js",
        "./lib/Taoist.draw-src.js",
        "./lib/Taoist.effect-src.js",
        "./lib/Taoist.measure-src.js",
        "./lib/Taoist.positionHandler-src.js",
        "./lib/Taoist.util-src.js",
        "./example/example.js"

      ],
      // 'main': "./lib/Taoist.core-src.js"
    },
    output:{
        filename: '[name].js',// filename:'Taoist3D.js',
        path: path.resolve(__dirname,'dist'),
    }, 
    
    plugins: [
      new JavaScriptObfuscator({
        "compact": true,
        "controlFlowFlattening": true,
        "controlFlowFlatteningThreshold": 0.75,
        "deadCodeInjection": true,
        "deadCodeInjectionThreshold": 0.4,
        "debugProtection": false,
        "debugProtectionInterval": false,
        "disableConsoleOutput": true,
        "identifierNamesGenerator": "hexadecimal",
        "log": false,
        "renameGlobals": false,
        "rotateStringArray": true,
        "selfDefending": true,
        "stringArray": true,
        "stringArrayEncoding": ["base64"],
        "stringArrayThreshold": 0.75,
        "unicodeEscapeSequence": false,
        rotateUnicodeArray: true
       },[
        //"main.js","taoist3D.js",
      ]),
    ] 
}
