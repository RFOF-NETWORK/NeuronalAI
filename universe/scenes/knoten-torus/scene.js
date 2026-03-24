export function create(scene, THREE) {
    const geo = new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
    const knot = new THREE.Mesh(geo, mat);
    return {
        root: knot,
        update: (t) => {
            knot.position.y = Math.sin(t) * 3;
            knot.rotation.z = t * 0.5;
        }
    };
}
