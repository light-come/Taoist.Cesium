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
}