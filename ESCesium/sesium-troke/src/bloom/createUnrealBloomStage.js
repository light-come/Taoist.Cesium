import { parseDefines } from './parseDefines';
import  * as Cesium  from 'cesium';
const _shadersLuminosityHighPass = "\n\
    uniform sampler2D colorTexture;\n\
    uniform vec3 defaultColor;\n\
    uniform float defaultOpacity;\n\
    uniform float luminosityThreshold;\n\
    uniform float smoothWidth;\n\
    \n\
    varying vec2 v_textureCoordinates;\n\
    void main() {\n\
    	vec4 texel = texture2D( colorTexture, v_textureCoordinates );\n\
        \n\
       #ifdef CZM_SELECTED_FEATURE\n\
           if (!czm_selected()) {\n\
               texel = vec4(0.);\n\
           }\n\
       #endif\n\
       \n\
    	vec3 luma = vec3( 0.299, 0.587, 0.114 );\n\
    	float v = dot( texel.xyz, luma );\n\
    	vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );\n\
    	float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );\n\
    	gl_FragColor = mix( outputColor, texel, alpha );\n\
    }\n\
    " ;
function createLuminosityHighPass(name) {

    const _Cesium = Cesium;

    var highPass = new _Cesium.PostProcessStage({
        name: name + "_bright",
        fragmentShader: _shadersLuminosityHighPass,
        uniforms: {
            luminosityThreshold: 0.0,
            smoothWidth: 0.01,
            defaultColor: new _Cesium.Color.fromRgba(0x000000),
            defaultOpacity: 1

        },
    });

    return highPass;
}

const _shadersSeparableBlur = "\n\
varying vec2 v_textureCoordinates;\n\
uniform sampler2D colorTexture;\n\
uniform vec2 colorTextureDimensions;\n\
uniform vec2 texSize;\n\
uniform vec2 direction;\n\
\n\
float gaussianPdf(in float x, in float sigma) {\n\
    return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\n\
}\n\
void main() {\n\
    \n\
    vec2 invSize = 1.0 / colorTextureDimensions;\n\
    float fSigma = float(SIGMA);\n\
    float weightSum = gaussianPdf(0.0, fSigma);\n\
    vec3 diffuseSum = texture2D( colorTexture, v_textureCoordinates).rgb * weightSum;\n\
    for( int i = 1; i < KERNEL_RADIUS; i ++ ) {\n\
        float x = float(i);\n\
        float w = gaussianPdf(x, fSigma);\n\
        vec2 uvOffset = direction * invSize * x;\n\
        vec3 sample1 = texture2D( colorTexture, v_textureCoordinates + uvOffset).rgb;\n\
        vec3 sample2 = texture2D( colorTexture, v_textureCoordinates - uvOffset).rgb;\n\
        diffuseSum += (sample1 + sample2) * w;\n\
        weightSum += 2.0 * w;\n\
    }\n\
    gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\
}";
function createSeparableBlur(name, kernelRadius, textureScale) {

    const { Cartesian2, PostProcessStage,PostProcessStageComposite, PostProcessStageSampleMode } = Cesium;

    let blurDirectionX = new Cartesian2(1.0, 0.0);
    let blurDirectionY = new Cartesian2(0.0, 1.0);

    let separableBlurShader = {
        defines: {
            "KERNEL_RADIUS": kernelRadius,
            "SIGMA": kernelRadius
        },
        fragmentShader: _shadersSeparableBlur
    };
    parseDefines(separableBlurShader);

    let blurX = new PostProcessStage({
        name: name + "_x_direction",
        fragmentShader: separableBlurShader.fragmentShader,
        textureScale: textureScale,
        forcePowerOfTwo: true,
        uniforms: {
            "direction": blurDirectionX
        },
        sampleMode: PostProcessStageSampleMode.LINEAR
    });

    let blurY = new PostProcessStage({
        name: name + "_y_direction",
        fragmentShader: separableBlurShader.fragmentShader,
        textureScale: textureScale,
        forcePowerOfTwo: true,
        uniforms: {
            "direction": blurDirectionY
        },
        sampleMode: PostProcessStageSampleMode.LINEAR
    });

    let separableBlur = new PostProcessStageComposite({
        name: name,
        stages: [blurX, blurY],
        inputPreviousStageTexture: true
    });
    return separableBlur;
}

const _shadersUnrealBloomComposite = "\n\
varying vec2 v_textureCoordinates;\n\
uniform sampler2D blurTexture1;\n\
uniform sampler2D blurTexture2;\n\
uniform sampler2D blurTexture3;\n\
uniform sampler2D blurTexture4;\n\
uniform sampler2D blurTexture5;\n\
uniform sampler2D colorTexture;\n\
uniform float bloomStrength;\n\
uniform float bloomRadius;\n\
uniform float bloomFactors[NUM_MIPS];\n\
uniform vec3 bloomTintColors[NUM_MIPS];\n\
uniform float selectedBloomFactor;\n\
uniform bool glowOnly;\n\
\n\
float lerpBloomFactor(const in float factor) { \n\
    float mirrorFactor = 1.2 - factor;\n\
    return mix(factor, mirrorFactor, bloomRadius);\n\
}\n\
\n\
void main() {\n\
    \n\
    vec4 color=texture2D(colorTexture, v_textureCoordinates);\n\
    vec4 bloomColor= bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.) * texture2D(blurTexture1, v_textureCoordinates) + \
                                     lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.) * texture2D(blurTexture2, v_textureCoordinates) + \
                                     lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.) * texture2D(blurTexture3, v_textureCoordinates) + \
                                     lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.) * texture2D(blurTexture4, v_textureCoordinates) + \
                                     lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.) * texture2D(blurTexture5, v_textureCoordinates) );\n\
    \n\
    #ifdef CZM_SELECTED_FEATURE\n\
        if (czm_selected()) {\n\
            gl_FragColor =glowOnly?bloomColor*selectedBloomFactor: color+ bloomColor*selectedBloomFactor;\n\
            return;\n\
        }\n\
    #endif\n\
    \n\
    gl_FragColor =glowOnly?bloomColor: bloomColor+color;\n\
}";

export default function createUnrealBloomStage(name, kernelSizeArray) {

    const { PostProcessStageComposite, Cartesian3, PostProcessStage, Color } = Cesium;

    name = name || 'unreal_bloom';
    let nMips = 5;
    if (!kernelSizeArray) {
        kernelSizeArray = [3, 5, 7, 9, 11];
    }

    let highPass = createLuminosityHighPass(name);

    let separableBlurStages = [highPass];

    let textureScale = 0.5;
    for (var i = 0; i < nMips; i++) {
        let separableBlurStage = createSeparableBlur(
            name + '_blur_' + i, kernelSizeArray[i], textureScale);
        separableBlurStages.push(separableBlurStage);
        textureScale = textureScale / 2;
    }

    let blurComposite = new PostProcessStageComposite({
        name: name + "_blur_composite",
        stages: separableBlurStages,
        inputPreviousStageTexture: true
    });

    let generateCompositeShader = {

        defines: {
            "NUM_MIPS": nMips
        },

        uniforms: {
            "blurTexture1": separableBlurStages[0].name,
            "blurTexture2": separableBlurStages[1].name,
            "blurTexture3": separableBlurStages[2].name,
            "blurTexture4": separableBlurStages[3].name,
            "blurTexture5": separableBlurStages[4].name,
            // "dirtTexture": { value: null },
            "bloomStrength": 1.0,
            "bloomFactors": [1.0, 0.8, 0.6, 0.4, 0.2],
            "bloomTintColors": [
                new Cartesian3(1, 1, 1),
                new Cartesian3(1, 1, 1),
                new Cartesian3(1, 1, 1),
                new Cartesian3(1, 1, 1),
                new Cartesian3(1, 1, 1)
            ],
            "bloomRadius": 0.1,
            glowOnly: false,
            selectedBloomFactor: 0.1
        },

        fragmentShader: _shadersUnrealBloomComposite
    };
    parseDefines(generateCompositeShader);
    let generateComposite = new PostProcessStage({
        name: name + "_generate_composite",
        fragmentShader: generateCompositeShader.fragmentShader,
        uniforms: generateCompositeShader.uniforms
    })

    let uniforms = {};
    let bloomTintColor = Color.fromBytes(255, 255, 255, 255);
    let bloomFactor = 1;
    Object.defineProperties(uniforms, {
        threshold: {
            get() {
                return highPass.uniforms.luminosityThreshold
            },
            set(val) {
                highPass.uniforms.luminosityThreshold = val
            }
        },
        smoothWidth: {
            get() {
                return highPass.uniforms.smoothWidth
            },
            set(val) {
                highPass.uniforms.smoothWidth = val
            }
        },
        strength: {
            get() {
                return generateComposite.uniforms.bloomStrength
            },
            set(val) {
                generateComposite.uniforms.bloomStrength = val
            }
        },
        radius: {
            get() {
                return generateComposite.uniforms.bloomRadius
            },
            set(val) {
                generateComposite.uniforms.bloomRadius = val
            }
        },
        bloomFactors: {
            get() {
                return generateComposite.uniforms.bloomFactors
            },
            set(val) {
                if (val) {
                    generateComposite.uniforms.bloomFactors = val
                }
            }
        },
        bloomFactor: {
            get() { return bloomFactor; },
            set(val) {
                if (typeof val != 'number' || !val) return
                bloomFactor = val;
                let step = bloomFactor / nMips;
                for (let i = 0; i < nMips; i++) {
                    this.bloomFactors[i] = bloomFactor - step * i;
                }
            }
        },
        bloomTintColors: {
            get() {
                return generateComposite.uniforms.bloomTintColors
            },
            set(val) {
                if (val) {
                    generateComposite.uniforms.bloomTintColors = val
                }
            }
        },
        bloomTintColor: {
            get() {
                return bloomTintColor
            },
            set(val) {
                if (!val) return;

                const Color = Cesium.Color;
                if (typeof val == 'number') {
                    bloomTintColor = Color.fromRgba(val);

                } else if (typeof val == 'string') {
                    bloomTintColor = Color.fromCssColorString(val);

                } else if (val.isColor) {
                    bloomTintColor.red = val.r;
                    bloomTintColor.green = val.g;
                    bloomTintColor.blue = val.b;

                }
                else if (val instanceof Color) {
                    bloomTintColor = val;

                } else {
                    Color.clone(val, bloomTintColor)
                }

                generateComposite.uniforms.bloomTintColors.forEach((color) => {
                    color.x = bloomTintColor.red;
                    color.y = bloomTintColor.green;
                    color.z = bloomTintColor.blue;
                })
            }
        },
        glowOnly: {
            get() {
                return generateComposite.uniforms.glowOnly
            },
            set(val) {
                generateComposite.uniforms.glowOnly = !!val;
            }
        },
        selectedBloomFactor: {
            get() {
                return generateComposite.uniforms.selectedBloomFactor
            },
            set(val) {
                if (typeof val != 'number' || !val) return;
                generateComposite.uniforms.selectedBloomFactor = val;
            }
        }
    });

    let composite = new PostProcessStageComposite({
        name: name,
        stages: [blurComposite, generateComposite],
        inputPreviousStageTexture: false,
        uniforms: uniforms
    });
    return composite;
}