/* ==========================================================
   app.js - PRAI System: Deterministischer WebGL Orbital Core
   ========================================================== */

const praiApp = (function() {
    let config, schema, graph;
    let gl, program;
    let mvMatrix, pMatrix;
    let totalTime = 0;
    
    // WebGL Buffer für die Geometrie
    let sphereBuffers = {};
    let orbitalBuffers = {};

    // Interne Registry für Szenen-Objekte im Orbit
    const activeOrbitals = [];

    // --- 1. MATRIX MATHEMATIK (Deterministisch) ---
    const M4 = {
        identity: () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
        perspective: (fov, aspect, near, far) => {
            const f = 1.0 / Math.tan(fov / 2);
            return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)/(near-far),-1, 0,0,(2*far*near)/(near-far),0]);
        },
        translate: (m, x, y, z) => {
            const out = new Float32Array(m);
            out[12] = m[0]*x + m[4]*y + m[8]*z + m[12];
            out[13] = m[1]*x + m[5]*y + m[9]*z + m[13];
            out[14] = m[2]*x + m[6]*y + m[10]*z + m[14];
            out[15] = m[3]*x + m[7]*y + m[11]*z + m[15];
            return out;
        },
        rotateY: (m, angle) => {
            const out = new Float32Array(m);
            const c = Math.cos(angle), s = Math.sin(angle);
            out[0]=m[0]*c-m[8]*s; out[2]=m[0]*s+m[8]*c;
            out[4]=m[4]*c-m[12]*s; out[6]=m[4]*s+m[12]*c;
            return out;
        }
    };

    // --- 2. GEOMETRIE & WEBGL SETUP ---
    function createSphereGeometry(radius, latBands, lonBands) {
        const positions = [], indices = [];
        for (let lat = 0; lat <= latBands; lat++) {
            const theta = lat * Math.PI / latBands;
            const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
            for (let lon = 0; lon <= lonBands; lon++) {
                const phi = lon * 2 * Math.PI / lonBands;
                positions.push(radius * Math.cos(phi) * sinTheta, radius * cosTheta, radius * Math.sin(phi) * sinTheta);
            }
        }
        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < lonBands; lon++) {
                const first = (lat * (lonBands + 1)) + lon;
                const second = first + lonBands + 1;
                indices.push(first, second, first + 1, second, second + 1, first + 1);
            }
        }
        return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
    }

    function initGL(canvas) {
        gl = canvas.getContext('webgl');
        if (!gl) return console.error("WebGL Fail");
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    function initShaders() {
        const vsSource = `attribute vec3 aPos; uniform mat4 uMV; uniform mat4 uP; void main() { gl_Position = uP * uMV * vec4(aPos, 1.0); gl_PointSize = 5.0; }`;
        const fsSource = `precision mediump float; uniform vec4 uCol; void main() { gl_FragColor = uCol; }`;
        const compile = (type, src) => {
            const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
        };
        program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSource));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSource));
        gl.linkProgram(program); gl.useProgram(program);
        program.aPos = gl.getAttribLocation(program, "aPos");
        gl.enableVertexAttribArray(program.aPos);
        program.uP = gl.getUniformLocation(program, "uP");
        program.uMV = gl.getUniformLocation(program, "uMV");
        program.uCol = gl.getUniformLocation(program, "uCol");
    }

    function initBuffers() {
        const sData = createSphereGeometry(10, 20, 20);
        sphereBuffers.pos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.pos);
        gl.bufferData(gl.ARRAY_BUFFER, sData.positions, gl.STATIC_DRAW);
        sphereBuffers.idx = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffers.idx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sData.indices, gl.STATIC_DRAW);
        sphereBuffers.count = sData.indices.length;

        const oData = new Float32Array([-0.2,-0.2,0, 0.2,-0.2,0, 0.2,0.2,0, -0.2,0.2,0]);
        orbitalBuffers.pos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, orbitalBuffers.pos);
        gl.bufferData(gl.ARRAY_BUFFER, oData, gl.STATIC_DRAW);
    }

    // --- 3. RENDER LOOP ---
    function drawScene() {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        pMatrix = M4.perspective(Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mvMatrix = M4.translate(M4.identity(), 0, 0, -30);
        mvMatrix = M4.rotateY(mvMatrix, totalTime * 0.1);

        // Sphäre zeichnen
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.pos);
        gl.vertexAttribPointer(program.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffers.idx);
        gl.uniformMatrix4fv(program.uP, false, pMatrix);
        gl.uniformMatrix4fv(program.uMV, false, mvMatrix);
        gl.uniform4f(program.uCol, 0.0, 1.0, 0.8, 0.15);
        gl.drawElements(gl.LINES, sphereBuffers.count, gl.UNSIGNED_SHORT, 0);

        // Orbitale zeichnen
        activeOrbitals.forEach(scene => {
            let orbitalMV = M4.translate(mvMatrix, Math.cos(scene.angle) * scene.radius, Math.sin(scene.angle * 0.5) * 2, Math.sin(scene.angle) * scene.radius);
            gl.bindBuffer(gl.ARRAY_BUFFER, orbitalBuffers.pos);
            gl.vertexAttribPointer(program.aPos, 3, gl.FLOAT, false, 0, 0);
            gl.uniformMatrix4fv(program.uMV, false, orbitalMV);
            gl.uniform4f(program.uCol, scene.color[0], scene.color[1], scene.color[2], 0.8);
            gl.drawArrays(gl.LINE_LOOP, 0, 4);
            scene.angle += scene.speed;
        });
    }

    function animate() {
        totalTime += 0.01;
        drawScene();
        requestAnimationFrame(animate);
    }

    // --- 4. ÖFFENTLICHE API (UI & Steuerung) ---
    return {
        async init() {
            const cfgReq = await fetch('config.json'); config = await cfgReq.json();
            const schReq = await fetch('schema.json'); schema = await schReq.json();
            await api.init(config, schema);
            graph = api.getGraph();

            this.renderUI();

            if (config.features.use3DUniverse) {
                const canvas = document.createElement('canvas');
                canvas.width = window.innerWidth; canvas.height = window.innerHeight;
                document.getElementById('canvas-container').appendChild(canvas);
                initGL(canvas); initShaders(); initBuffers();
                
                // Initiale Szenen
                this.registerOrbital("DarkmatterCore", 0, 0, [0, 1, 0.8]);
                this.registerOrbital("HolographicEarth", 7, 0.005, [0, 0.5, 1]);
                
                animate();
            }
        },

        renderUI() {
            const list = document.getElementById('node-list');
            if(!list) return;
            list.innerHTML = '';
            graph.nodes.forEach(n => {
                const div = document.createElement('div');
                div.className = 'node-item';
                div.innerText = n.label;
                div.onclick = () => this.showDetails(n);
                list.appendChild(div);
            });
        },

        registerOrbital(name, radius, speed, colorRGB) {
            activeOrbitals.push({ name, radius, speed, angle: Math.random()*Math.PI*2, color: colorRGB });
        },

        createNewNode() {
            const id = 'n' + Date.now();
            const newNode = { id, label: `PRAI_${id.slice(-4)}`, position: { x: Math.random()*10, y: Math.random()*10, z: 0 } };
            if (api.addNode(newNode)) {
                graph = api.getGraph();
                this.renderUI();
                // Füge ein neues visuelles Objekt im Orbit hinzu (Gelb für neue Neuronen)
                this.registerOrbital(newNode.label, 4 + Math.random()*5, 0.01, [1, 1, 0]);
            }
        },

        showDetails(node) {
            const panel = document.getElementById('info-panel');
            const content = document.getElementById('details-content');
            if(panel) {
                panel.style.display = 'block';
                content.innerHTML = `<pre>${JSON.stringify(node, null, 2)}</pre>`;
            }
        }
    };
})();
