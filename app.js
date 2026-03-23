const praiApp = (function() {
    let config, schema, graph;

    // Minimalistischer 3D-Engine Kern (da kein Three.js erlaubt)
    const Engine3D = {
        init() {
            console.log("3D Engine gestartet...");
            const container = document.getElementById('canvas-container');
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d'); // Fallback auf High-Performance 2D-Glow-Graph
            
            this.render(ctx);
        },
        render(ctx) {
            const loop = () => {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.strokeStyle = '#00ffcc';
                ctx.fillStyle = '#00ffcc';
                
                graph.nodes.forEach(n => {
                    const x = ctx.canvas.width/2 + (n.position?.x || 0);
                    const y = ctx.canvas.height/2 + (n.position?.y || 0);
                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, Math.PI*2);
                    ctx.fill();
                    ctx.fillText(n.label, x + 15, y + 5);
                });
                requestAnimationFrame(loop);
            };
            loop();
        }
    };

    return {
        async init() {
            const cfgReq = await fetch('config.json');
            config = await cfgReq.json();
            const schReq = await fetch('schema.json');
            schema = await schReq.json();

            await api.init(config, schema);
            graph = api.getGraph();

            this.renderUI();
            if (config.features.use3DUniverse) {
                Engine3D.init();
            }
        },

        renderUI() {
            const list = document.getElementById('node-list');
            list.innerHTML = '';
            graph.nodes.forEach(n => {
                const div = document.createElement('div');
                div.className = 'node-item';
                div.innerText = n.label;
                div.onclick = () => this.showDetails(n);
                list.appendChild(div);
            });
        },

        createNewNode() {
            const id = 'n' + Date.now();
            const newNode = {
                id: id,
                label: `Neuron_${id.slice(-4)}`,
                position: { x: Math.random()*200-100, y: Math.random()*200-100, z: 0 }
            };
            if (api.addNode(newNode)) {
                graph = api.getGraph();
                this.renderUI();
            }
        },

        showDetails(node) {
            const panel = document.getElementById('info-panel');
            const content = document.getElementById('details-content');
            panel.style.display = 'block';
            content.innerHTML = `<pre>${JSON.stringify(node, null, 2)}</pre>`;
        }
    };
})();
