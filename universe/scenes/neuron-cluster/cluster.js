export function create(scene, THREE) {
    const group = new THREE.Group();
    for(let i=0; i<3; i++) {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), new THREE.MeshBasicMaterial({color: 0x00ffcc, wireframe: true}));
        m.position.set(Math.random()*4, Math.random()*4, Math.random()*4);
        group.add(m);
    }
    return { root: group, update: (t) => { group.rotation.x = t * 0.2; } };
}
