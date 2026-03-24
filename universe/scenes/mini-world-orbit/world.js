export function create(scene, THREE) {
    const geo = new THREE.SphereGeometry(1, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x0088ff, wireframe: true });
    const world = new THREE.Mesh(geo, mat);
    return {
        root: world,
        update: (t) => {
            world.position.x = Math.cos(t * 0.5) * 12;
            world.position.z = Math.sin(t * 0.5) * 12;
            world.rotation.y = t;
        }
    };
}
