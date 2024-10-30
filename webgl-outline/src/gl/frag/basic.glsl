#version 300 es

precision mediump float;

in vec2 v_texCoord;
uniform sampler2D textureSampler;
uniform bool premultipleAlpha;

out vec4 fragColor;

void main()
{
    vec4 textureColor=texture(textureSampler,v_texCoord.xy);
    vec4 color=textureColor;
    
    if(premultipleAlpha)
    {
        color.rgb*=color.a;
    }
    
    fragColor=color;
}