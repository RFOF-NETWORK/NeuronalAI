export function create(scene, THREE) {
    const geo = new THREE.IcosahedronGeometry(2, 4);
    const mat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc, 
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const core = new THREE.Mesh(geo, mat);
    return {
        root: core,
        update: (t) => {
            core.rotation.y = t * 0.3;
            core.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
        }
    };
}
