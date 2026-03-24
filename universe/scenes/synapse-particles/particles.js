export function create(scene, THREE) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for(let i=0; i<50; i++) {
        const p = new THREE.Mesh(geo, mat);
        p.position.set(Math.random()*20-10, Math.random()*20-10, Math.random()*20-10);
        group.add(p);
    }
    return { root: group, update: (t) => { group.rotation.y = t * 0.05; } };
}
