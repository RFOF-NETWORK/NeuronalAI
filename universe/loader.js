const UniverseLoader = {
    async loadAll() {
        const resp = await fetch('universe/config.json');
        const data = await resp.json();
        
        for (const sceneName of data.scenes) {
            try {
                const sceneCfgReq = await fetch(`universe/scenes/${sceneName}/scene.json`);
                const sceneCfg = await sceneCfgReq.json();
                console.log(`Loading Scene: ${sceneCfg.name}`);
                // Dynamischer Import Simulation
                const script = document.createElement('script');
                script.src = `universe/scenes/${sceneName}/${sceneCfg.entry}`;
                document.head.appendChild(script);
            } catch (e) {
                console.error(`Fehler beim Laden von ${sceneName}`, e);
            }
        }
    }
};
