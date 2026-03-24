export function create(scene, THREE) {
    const geo = new THREE.CircleGeometry(2, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });
    const portal = new THREE.Mesh(geo, mat);
    portal.position.set(-15, 0, -5);
    return { root: portal, update: (t) => { portal.rotation.y = t; } };
}
