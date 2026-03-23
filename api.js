const api = (function() {
    let schema = null;
    let config = null;

    return {
        async init(cfg, sch) {
            config = cfg;
            schema = sch;
        },

        validate(data, section) {
            const rules = schema.definitions[section];
            if (!rules) return true;
            return rules.required.every(field => data.hasOwnProperty(field));
        },

        save(key, value) {
            if (config.features.useLocalStorage) {
                localStorage.setItem(`prai_${key}`, JSON.stringify(value));
            }
        },

        load(key) {
            if (config.features.useLocalStorage) {
                const data = localStorage.getItem(`prai_${key}`);
                return data ? JSON.parse(data) : null;
            }
            return null;
        },

        getGraph() {
            let data = this.load('graph');
            if (!data) {
                data = {
                    nodes: [{ id: "n1", label: "Core Neuron", position: {x:0,y:0,z:0} }],
                    links: []
                };
                this.save('graph', data);
            }
            return data;
        },

        addNode(nodeData) {
            if (!this.validate(nodeData, 'node')) return false;
            const graph = this.getGraph();
            graph.nodes.push(nodeData);
            this.save('graph', graph);
            return true;
        }
    };
})();
