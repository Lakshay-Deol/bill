"use client";

import React, { useEffect, useRef } from "react";

const VS_SOURCE = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FS_SOURCE = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 4; i++) {
        f += w * snoise(p);
        p *= 2.05;
        w *= 0.5;
    }
    return f;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse.xy / u_resolution.xy;
    if (mouse.x <= 0.0 && mouse.y <= 0.0) {
        mouse = vec2(0.5, 0.5);
    }
    float t = u_time * 0.18;
    vec2 q = vec2(fbm(uv * 1.6 + vec2(t * 0.25, t * 0.12)),
                  fbm(uv * 1.6 + vec2(-t * 0.20, t * 0.22)));
    vec2 r = vec2(fbm(uv * 2.0 + 2.2 * q + vec2(mouse.x * 0.6, mouse.y * 0.6) + vec2(1.7, 9.2) + t * 0.15),
                  fbm(uv * 2.0 + 2.2 * q + vec2(-mouse.y * 0.6, mouse.x * 0.6) + vec2(8.3, 2.8) + t * 0.12));
    float f = fbm(uv * 1.4 + 2.2 * r + t * 0.10);
    
    vec3 c1 = vec3(0.05, 0.04, 0.10);  // Deep celestial void
    vec3 c2 = vec3(0.72, 0.28, 0.98);  // Electric violet / lilac neon (#af50ff)
    vec3 c3 = vec3(0.98, 0.44, 0.32);  // Radiant warm sunset flame (#fc5a36)
    vec4 lime = vec4(0.80, 0.95, 0.19, 1.0); // Neon acid lime accent (#cbf230)
    vec3 c5 = vec3(0.14, 0.26, 0.72);  // Deep ultramarine indigo undertone
    
    vec3 col = mix(c1, c2, clamp(f * 1.35, 0.0, 1.0));
    col = mix(col, c3, clamp(length(q) * 0.9, 0.0, 1.0));
    col = mix(col, lime.rgb, clamp(pow(length(r.x), 2.2) * 0.85, 0.0, 1.0));
    col = mix(col, c5, clamp(pow(r.y, 2.0) * 0.7, 0.0, 1.0));
    col = pow(col, vec3(0.94));
    
    vec2 vig = uv * (1.0 - uv.yx);
    float vignette = vig.x * vig.y * 15.0;
    vignette = clamp(pow(vignette, 0.18), 0.70, 1.0);
    gl_FragColor = vec4(col * vignette, 1.0);
}`;

export function FluidShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function syncSize() {
      if (!canvas) return;
      const w = window.innerWidth || 1280;
      const h = window.innerHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();
    window.addEventListener("resize", syncSize);

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false });
    if (!gl) return;

    function createShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, VS_SOURCE));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, FS_SOURCE));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = canvas.height - event.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    function render(t: number) {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    }

    // Render initial frame; if reduced motion is disabled, loop
    render(0);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("mousemove", handleMouseMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas id="shader-canvas-ANIMATION_19" ref={canvasRef} className="w-full h-full block opacity-85" />
      <div className="absolute inset-0 bg-[#09090b]/50 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.65)_60%,rgba(7,7,9,0.92)_100%)] pointer-events-none" />
    </div>
  );
}
