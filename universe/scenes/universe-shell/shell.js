export function create(scene, THREE) {
    // Eine riesige Sphäre, die von INNEN sichtbar ist
    const geometry = new THREE.SphereGeometry(50, 64, 64);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide // Wichtig: Sichtbar von innen!
    });
    
    const shell = new THREE.Mesh(geometry, material);
    
    // Ein kleiner pulsierender Core in der Mitte dieser Sphäre
    const coreGeo = new THREE.IcosahedronGeometry(1, 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    shell.add(core);

    return {
        root: shell,
        update: (time) => {
            shell.rotation.y = time * 0.05;
            core.rotation.x = time * 0.5;
            core.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
        }
    };
}
