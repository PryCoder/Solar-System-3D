    // Fallback texture URLs in case primary ones fail
    const fallbackTextures = {
      sun: "./textures/sun.jpg",
      mercury: "./textures/2k_mercury.jpg",
      venus: "./textures/v.jpg",
      earth: "./textures/e.jpg",
      earthBump: "./textures/e.jpg",
      mars: "./textures/m.jpg",
      jupiter: "./textures/ju.jpg",
      saturn: "./textures/s.jpg",
      saturnRing: "./textures/2k_saturn_ring_alpha.png",
      uranus: "./textures/u.jpg",
      uranusRing: "./textures/2k_saturn_ring_alpha.png",
      neptune: "./textures/n.jpg"
    };

    const planetData = [
      { name:"Mercury", radius:2439.7, distance:57.9, orbitPeriod:88, rotationPeriod:1407.6, color:0xaaaaaa,
        texture:"./textures/2k_mercury.jpg",
        fallbackTexture: fallbackTextures.mercury, tilt:0.034, orbitalInclination: 7.0 },
      { name:"Venus", radius:6051.8, distance:108.2, orbitPeriod:224.7, rotationPeriod:5832.5, color:0xeccc9a,
        texture:"./textures/v.jpg",
        fallbackTexture: fallbackTextures.venus, tilt:177.4, orbitalInclination: 3.4 },
      { name:"Earth", radius:6371, distance:149.6, orbitPeriod:365.2, rotationPeriod:23.9, color:0x2a56d0,
        texture:"./textures/e.jpg",
        fallbackTexture: fallbackTextures.earth,
        bumpMap:"./textures/e.jpg",
        bumpFallback: fallbackTextures.earthBump,
        atmosphere:true, tilt:23.4, orbitalInclination: 0.0 },
      { name:"Mars", radius:3389.5 * 1.5, distance:227.9, orbitPeriod:687, rotationPeriod:24.6, color:0xd94f2a,
        texture:"./textures/m.jpg",
        fallbackTexture: fallbackTextures.mars, tilt:25.2, orbitalInclination: 1.85 },
      { name:"Jupiter", radius:69911, distance:778.6, orbitPeriod:4331, rotationPeriod:9.9, color:0xd2b48c,
        texture:"./textures/ju.jpg",
        fallbackTexture: fallbackTextures.jupiter, tilt:3.1, orbitalInclination: 1.3 },
      { name:"Saturn", radius:58232, distance:1433.5, orbitPeriod:10747, rotationPeriod:10.7, color:0xf4e2b3,
        texture:"./textures/s.jpg",
        fallbackTexture: fallbackTextures.saturn,
        rings:true, ringTexture:"./textures/2k_saturn_ring_alpha.png",
        ringFallback: fallbackTextures.saturnRing, tilt:26.7, orbitalInclination: 2.48 },
      { name:"Uranus", radius:25362, distance:2872.5, orbitPeriod:30589, rotationPeriod:17.2, color:0xadd8e6,
        texture:"./textures/u.jpg",
        fallbackTexture: fallbackTextures.uranus,
        rings:true, ringTexture:"./textures/2k_saturn_ring_alpha.png",
        ringFallback: fallbackTextures.uranusRing, tilt:97.8, orbitalInclination: 0.77 },
      { name:"Neptune", radius:24622, distance:4495.1, orbitPeriod:59800, rotationPeriod:16.1, color:0x4169e1,
        texture:"./textures/n.jpg",
        fallbackTexture: fallbackTextures.neptune, tilt:28.3, orbitalInclination: 1.77 }
    ];

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100000);
    camera.position.set(0, 2000, 15000);
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#webgl"), 
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.sortObjects = false;
    // renderer.setClearColor(0x000000, 1);

    // TEMPORARY TEST CUBE
    const testGeometry = new THREE.BoxGeometry(100, 100, 100);
    const testMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 0, 0); // At the center of the scene
    scene.add(testCube);
    // END TEMPORARY TEST CUBE

    // Controls and lighting
       // Controls and lighting
       const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.2)); // Reduced ambient light intensity for more contrast
    const sunLight = new THREE.DirectionalLight(0xffe0b0, 6); // Warmer sun color and slightly increased intensity
    sunLight.position.set(5000, 5000, 5000); // Position the light far away
    sunLight.target.position.set(0, 0, 0); // Target the center of the scene (where the sun is)
    sunLight.castShadow = true; // Enable shadow casting for the sun light
    // Adjust shadow camera to encompass the solar system
    sunLight.shadow.camera.left = -150000;
    sunLight.shadow.camera.right = 150000;
    sunLight.shadow.camera.top = 150000;
    sunLight.shadow.camera.bottom = -150000;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 300000; // Set appropriate far clipping plane for shadows
    sunLight.shadow.mapSize.width = 2048; // default is 512
    sunLight.shadow.mapSize.height = 2048; // default is 512
    sunLight.shadow.bias = -0.0001; // Reduce shadow acne
    scene.add(sunLight);
    scene.add(sunLight.target);

    // Global scaling for orbital distances

    // Global scaling for orbital distances
    const orbitalDistanceScale = 100.0;
    const SIMULATION_SPEED_FACTOR = (2 * Math.PI) / 10; // Adjust this value to control overall simulation speed (e.g., Earth orbits in ~60 real seconds)

    // Texture loading with fallbacks
    const textureLoader = new THREE.TextureLoader();
    let texturesLoaded = 0;
    let totalTextures = 0;

    function updateLoading() {
      texturesLoaded++;
      const loadingElement = document.getElementById("loading");
      const progress = Math.round((texturesLoaded/totalTextures)*100);
      loadingElement.textContent = `Loading... ${progress}%`;
      
      if(texturesLoaded >= totalTextures) {
        setTimeout(() => {
          loadingElement.style.opacity = '0';
          setTimeout(() => {
            loadingElement.style.display = 'none';
            animate();
          }, 300);
        }, 500);
      }
    }

    // Procedurally generated star background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 200000; // Increased spread for stars
      const y = (Math.random() - 0.5) * 200000;
      const z = (Math.random() - 0.5) * 200000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Count total textures first
    totalTextures += 1; // Sun texture
    
    // Count planet textures
    planetData.forEach(planet => {
      totalTextures++; // Main texture
      if(planet.bumpMap) totalTextures++;
      if(planet.rings) totalTextures++;
    });

    // Create sun
    const sunSize = 500;
    const sunMaterial = new THREE.MeshBasicMaterial({
      color:0xffd700
    });
    
    const loadTexture = (url, fallbackUrl, material, propertyName, defaultValue = null) => {
      textureLoader.load(url,
        texture => {
          material[propertyName] = texture;
          material.needsUpdate = true;
          updateLoading();
        },
        undefined, // onProgress callback
        () => { // onError callback for primary texture
          console.warn(`Failed to load primary texture: ${url}. Trying fallback: ${fallbackUrl}`);
          textureLoader.load(fallbackUrl,
            fallbackTexture => {
              material[propertyName] = fallbackTexture;
              material.needsUpdate = true;
              updateLoading();
            },
            undefined, // onProgress callback for fallback
            () => { // onError callback for fallback texture
              console.error(`Failed to load fallback texture: ${fallbackUrl}. Using default material color for ${propertyName}.`);
              material[propertyName] = defaultValue; // Set to null or a default value
              material.needsUpdate = true;
              updateLoading();
            }
          );
        }
      );
    };
    
    loadTexture(
      "https://www.solarsystemscope.com/textures/download/2k_sun.jpg",
      fallbackTextures.sun,
      sunMaterial,
      'map'
    );
    
    const sun = new THREE.Mesh(new THREE.SphereGeometry(sunSize,64,64), sunMaterial);
    sun.castShadow = true;
    sun.receiveShadow = true;
    sun.add(new THREE.Mesh(new THREE.SphereGeometry(sunSize*1.2,64,64), new THREE.MeshBasicMaterial({
      color:0xff6600, transparent:true, opacity:0.3, blending:THREE.AdditiveBlending, side:THREE.BackSide
    })));
    scene.add(sun);

    // Create planets
    const planets = planetData.map(p=>({ 
      ...p, size: p.radius * 0.005,
      dist: p.distance * orbitalDistanceScale * 0.1,
      speed:(1/p.orbitPeriod)*SIMULATION_SPEED_FACTOR, rotationSpeed:(1/p.rotationPeriod)*0.1,
      orbitalInclinationRad: p.orbitalInclination * (Math.PI / 180)
    }));
    const planetMeshes = [], orbitStates = [], planetLabels = [];
    
    planets.forEach((p,i)=>{
      // Create label
      const label = document.createElement("div");
      label.className = "planet-label"; label.textContent = p.name;
      document.body.appendChild(label); planetLabels.push(label);

      // Create orbit path
      const orbitPoints = [];
      for(let j=0; j<=64; j++) {
        const a=(j/64)*Math.PI*2;
        orbitPoints.push(Math.cos(a)*p.dist, 0, Math.sin(a)*p.dist);
      }
      const orbitGeo = new THREE.BufferGeometry();
      orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints,3));
      
      const orbitLine = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({color:0x444444, transparent:true, opacity:0.3}));
      
      // Create a group for each planet system to apply orbital inclination
      const planetSystem = new THREE.Group();
      planetSystem.rotation.x = p.orbitalInclinationRad; // Apply orbital inclination
      planetSystem.add(orbitLine); // Add orbit line to the system group

      // Create planet
      const mat = new THREE.MeshPhongMaterial({
        color: p.color,
        side: THREE.DoubleSide,
        map: null,         // Explicitly initialize to null
        bumpMap: null,     // Explicitly initialize to null
        shininess: 10 // Added shininess for Phong material
      });
      
      // Load main texture with fallback
      loadTexture(p.texture, p.fallbackTexture, mat, 'map');
      
      // Load bump map if exists
      if(p.bumpMap) {
        loadTexture(p.bumpMap, p.bumpFallback, mat, 'bumpMap');
        mat.bumpScale = p.size * 0.05;
      }
      
      // Removed specular map related code as MeshStandardMaterial does not use it directly
      
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size,64,64), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const a = Math.random()*Math.PI*2;
      mesh.position.set(Math.cos(a)*p.dist, 0, Math.sin(a)*p.dist);
      mesh.rotation.z = p.tilt*(Math.PI/180);
      
      if(p.atmosphere) {
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(p.size*1.1,64,64),
          new THREE.MeshPhongMaterial({
            color:0x66aaff,
            transparent:true,
            opacity:0.3,
            blending:THREE.AdditiveBlending,
            side:THREE.BackSide,
            specular:0x111111,
            shininess:5
          })
        );
        mesh.add(atmosphere);
      }
      
      if(p.rings) {
        // Create a separate material for the rings
        const ringsMaterial = new THREE.MeshBasicMaterial({
          color: p.color, // Fallback color if texture fails
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          map: null // Explicitly initialize map for rings
        });

        loadTexture(p.ringTexture, p.ringFallback, ringsMaterial, 'map', null);
          
        const rings = new THREE.Mesh(
          new THREE.RingGeometry(p.size*1.5,p.size*2.5,64),
          ringsMaterial
        );
        rings.rotation.x = Math.PI/2;
        rings.rotation.z = p.tilt*(Math.PI/180);
        mesh.add(rings);
      }
      
      // Add planet mesh to the planet system group
      planetSystem.add(mesh);
      scene.add(planetSystem); // Add the system group to the scene
      
      // Store the mesh and its parent group for animation
      planetMeshes.push(mesh);
      orbitStates.push({
        angle: a,
        speed: p.speed,
        rotation: 0,
        rotationSpeed: p.rotationSpeed,
        planetSystem: planetSystem
      });

      // Add control slider
      const labelEl = document.createElement("label");
      labelEl.innerHTML = `${p.name}: <input type="range" min="0" max="0.1" step="0.001" value="${p.speed}" data-index="${i}" class="speed-slider"><span id="speedValue${i}" style="margin-left: 10px;">${p.speed.toFixed(4)}</span>`;
      document.getElementById("controls").appendChild(labelEl);
    });

    // UI Events
    document.getElementById("controls").addEventListener("input", e=>{
      if(e.target.dataset.index) {
        const index = e.target.dataset.index;
        const newSpeed = parseFloat(e.target.value);
        orbitStates[index].speed = newSpeed;
        document.getElementById(`speedValue${index}`).textContent = newSpeed.toFixed(4);
      }
    });
    
    let paused = false;
    document.getElementById("pauseBtn").onclick = ()=>{
      paused = !paused;
      document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
    };
    
    const uiPanel = document.getElementById("ui");
    const toggleUiBtn = document.getElementById("toggleUiBtn");

    // Event listener for the new toggle UI button
    toggleUiBtn.addEventListener("click", () => {
      uiPanel.classList.toggle("show-ui");
    });

    const themeToggleBtn = document.getElementById("themeToggle");
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      if (document.body.classList.contains("light-theme")) {
        themeToggleBtn.textContent = "Dark Theme";
      } else {
        themeToggleBtn.textContent = "Light Theme";
      }
    });

    // Planet interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredPlanet = null;
    let focusedPlanet = null;
    const tooltip = document.getElementById("tooltip");

    window.addEventListener("mousemove", e=>{
      mouse.x = (e.clientX/window.innerWidth)*2-1;
      mouse.y = -(e.clientY/window.innerHeight)*2+1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes);
      
      if(intersects.length>0) {
        const idx = planetMeshes.indexOf(intersects[0].object);
        if(idx !== -1 && idx !== hoveredPlanet) {
          hoveredPlanet = idx;
          const planetInfo = planets[idx];
          tooltip.innerHTML = `
            <b>${planetInfo.name}</b><br>
            Radius: ${planetInfo.radius.toLocaleString()} km<br>
            Distance from Sun: ${planetInfo.distance.toLocaleString()} million km<br>
            Orbital Period: ${planetInfo.orbitPeriod} Earth days<br>
            Rotation Period: ${planetInfo.rotationPeriod} Earth hours
          `;
          tooltip.style.left = `${e.clientX+10}px`;
          tooltip.style.top = `${e.clientY+10}px`;
          tooltip.style.opacity = 1;
        }
      } else if(hoveredPlanet !== null) {
        hoveredPlanet = null;
        tooltip.style.opacity = 0;
      }
    });

    window.addEventListener("click", ()=>{
      if(hoveredPlanet !== null) {
        focusedPlanet = hoveredPlanet;
        controls.enabled = false; // Disable orbit controls when focusing on a planet
        const planet = planetMeshes[hoveredPlanet];
        // Calculate a position directly above the planet, at a reasonable distance
        const offsetDistance = planet.geometry.parameters.radius * 1.5; // Further reduced factor for desired distance to show more of the planet
        const desiredCameraPosition = planet.position.clone().add(new THREE.Vector3(0, offsetDistance, 0)); // Directly above
        
        animateCamera(camera.position.clone(), desiredCameraPosition, () => controls.target.copy(new THREE.Vector3(0,0,0)));
      } else if(focusedPlanet !== null) {
        focusedPlanet = null;
        controls.enabled = true; // Re-enable orbit controls
        animateCamera(camera.position.clone(), new THREE.Vector3(0, 2000, 15000), () => controls.target.set(0,0,0)); // Return to default view
      }
    });

    function animateCamera(startPos, endPos, onUpdate) {
      const startTime = Date.now();
      const duration = 1000;
      
      const animate = ()=>{
        const elapsed = Date.now()-startTime;
        const progress = Math.min(elapsed/duration,1);
        const ease = progress<0.5 ? 2*progress*progress : 1-Math.pow(-2*progress+2,2)/2;
        camera.position.lerpVectors(startPos, endPos, ease);
        onUpdate();
        if(progress<1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      if(!paused) {
        orbitStates.forEach((o,i)=>{
          o.angle += o.speed;
          o.rotation += o.rotationSpeed;
          const p = planets[i];
          const m = planetMeshes[i];
          
          // Update planet position relative to its orbital plane (system group)
          m.position.set(Math.cos(o.angle)*p.dist, 0, Math.sin(o.angle)*p.dist);
          m.rotation.y = o.rotation;
        });
        sun.rotation.y += 0.002;
      }
      
      // Camera follow focused planet and face sun
      if (focusedPlanet !== null) {
        const targetPlanet = planetMeshes[focusedPlanet];
        // Ensure the camera is positioned relative to the orbital plane of the planet
        const offsetDistance = targetPlanet.geometry.parameters.radius * 2; // Further adjusted factor for desired distance to show more of the planet
        // Get the world position of the planet
        const planetWorldPosition = new THREE.Vector3();
        targetPlanet.getWorldPosition(planetWorldPosition);

        // Calculate desired camera position relative to the planet's world position, looking towards the sun
        const desiredCameraPosition = planetWorldPosition.clone().add(new THREE.Vector3(0, offsetDistance, 0)); // Directly above
        
        camera.position.lerp(desiredCameraPosition, 0.1); // Smoothly move camera
        controls.target.copy(new THREE.Vector3(0,0,0)); // Always look at the sun
      } else {
        controls.target.set(0,0,0); // Default look at sun if not focused
      }
      
      planetMeshes.forEach((m,i)=>{
        const pos = m.position.clone();
        m.parent.localToWorld(pos); // Convert local position to world position
        pos.project(camera);

        const label = planetLabels[i];
        label.style.left = `${(pos.x*0.5+0.5)*window.innerWidth}px`;
        label.style.top = `${(-(pos.y*0.5)+0.5)*window.innerHeight}px`;
        label.style.opacity = m.position.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3()))>0 ? 1 : 0;
      });
      
      controls.update();
      renderer.render(scene, camera);
    }

    window.addEventListener("resize", ()=>{
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    updateLoading();
  