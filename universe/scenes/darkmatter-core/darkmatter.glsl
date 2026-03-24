precision mediump float;
uniform float u_time;
varying vec2 v_uv;
void main() {
    vec2 p = v_uv * 2.0 - 1.0;
    float d = length(p);
    vec3 color = vec3(0.0, 1.0, 0.8) * (0.2 / d) * (0.5 + 0.5 * sin(u_time));
    gl_FragColor = vec4(color, 1.0);
}
