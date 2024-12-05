import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    antialias: true, // Enable antialiasing for smoother visuals
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Apply ACES tone mapping and exposure for HDR effect
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .5; // Adjust for brightness
renderer.outputEncoding = THREE.sRGBEncoding;

camera.position.set(30, 30, 30);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.autoRotate = false;
controls.enableZoom = true;

// Load textures using TextureLoader
const textureLoader = new THREE.TextureLoader();

// Load Sun texture
const sunTexture = textureLoader.load("planets/sun.jpg");

// Load HDRI for background
const rgbeLoader = new RGBELoader();
rgbeLoader.load("planets/space.hdr", (hdri) => {
    hdri.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = hdri;
    scene.environment = hdri;
});

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(7, 64, 64); // Higher segments for smoother appearance
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    emissive: new THREE.Color(0xffcc00),
    emissiveIntensity: 1.2,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add sunlight for realistic lighting
const sunlight = new THREE.PointLight(0xffffff, 1000, 200);
sunlight.position.set(0, 0, 0);
sunlight.castShadow = true;
scene.add(sunlight);

const planetData = [
    { 
        name: "Mercury", 
        radius: 2, 
        distance: 19.5, 
        texture: "planets/mercury.jpg", 
        speed: 0.01, 
        desc: "Mercury is the closest planet to the Sun. It has extreme temperature fluctuations due to its lack of atmosphere. Despite its small size, Mercury has a dense core made of iron.", 
        link: "https://en.wikipedia.org/wiki/Mercury_(planet)"
    },
    { 
        name: "Venus", 
        radius: 3, 
        distance: 36, 
        texture: "planets/venus.jpg", 
        speed: 0.005, 
        desc: "Venus is Earth's twin in size and structure but has a thick, toxic atmosphere. Its surface is incredibly hot, with temperatures high enough to melt lead. It is often called the 'Morning Star' or 'Evening Star'.", 
        link: "https://en.wikipedia.org/wiki/Venus"
    },
    { 
        name: "Earth", 
        radius: 4, 
        distance: 50,
        texture: "planets/earth.jpg", 
        speed: 0.0025, 
        desc: "Earth is the only known planet to support life. It has a breathable atmosphere, liquid water, and a diverse range of ecosystems. Earth has one natural satellite, the Moon.", 
        link: "https://en.wikipedia.org/wiki/Earth"
    },
    { 
        name: "Mars", 
        radius: 3, 
        distance: 76,
        texture: "planets/mars.jpeg", 
        speed: 0.002, 
        desc: "Mars, often called the 'Red Planet', has a thin atmosphere primarily made of carbon dioxide. It features the tallest volcano and the deepest, longest valley in the solar system.", 
        link: "https://en.wikipedia.org/wiki/Mars"
    },
    { 
        name: "Jupiter", 
        radius: 5, 
        distance: 260, 
        texture: "planets/jupiter.jpg", 
        speed: 0.0015, 
        desc: "Jupiter is the largest planet in our solar system, known for its Great Red Spot, a massive storm. It has over 79 moons and is a gas giant with no solid surface.", 
        link: "https://en.wikipedia.org/wiki/Jupiter"
    },
    { 
        name: "Saturn", 
        radius: 5, 
        distance: 479, 
        texture: "planets/saturn.jpg", 
        speed: 0.0012, 
        desc: "Saturn is famous for its stunning ring system. It's a gas giant, primarily composed of hydrogen and helium. Saturn has 82 moons, with Titan being the largest and second-largest moon in the solar system.", 
        link: "https://en.wikipedia.org/wiki/Saturn"
    },
    { 
        name: "Uranus", 
        radius: 5, 
        distance: 961, 
        texture: "planets/uranus.jpg", 
        speed: 0.0011, 
        desc: "Uranus is an ice giant with a distinct blue-green color due to methane in its atmosphere. It has an unusual rotation, rotating on its side compared to other planets.", 
        link: "https://en.wikipedia.org/wiki/Uranus"
    },
    { 
        name: "Neptune", 
        radius: 4, 
        distance: 1502.5, 
        texture: "planets/neptune.jpg", 
        speed: 0.001, 
        desc: "Neptune, the farthest planet from the Sun, is known for its deep blue color and strong winds. It has a similar composition to Uranus and is often classified as an ice giant.", 
        link: "https://en.wikipedia.org/wiki/Neptune"
    }
];





// Create planets with name and other properties
const planets = planetData.map((data) => {
    const texture = textureLoader.load(data.texture);
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        metalness: 0.5,
    });

    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    // Store all the relevant data in userData
    planet.userData = {
        name: data.name,  // Store name
        distance: data.distance,
        speed: data.speed,
        angle: Math.random() * Math.PI * 2,
        desc: data.desc,  // Store description
        link: data.link,  // Store the link
        orbitalRing: null,
    };

    return planet;
});


// Add Earth's moon
const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
const moonMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 1,
    metalness: 0.5,
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

// Function to create orbital rings around a planet
function createOrbitalRing(planet, ringColor = 0xffffff) {
    const ringGeometry = new THREE.RingGeometry(planet.userData.distance - 0.3, planet.userData.distance + 0.3, 128);  // Thinner ring
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,  // Custom color for the orbital ring
        side: THREE.DoubleSide,  // Render both sides of the ring
        opacity: 0.5,  // Optional: make the ring semi-transparent
        transparent: true,
    });
    const orbitalRing = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Rotate the ring to make it horizontal
    orbitalRing.rotation.x = Math.PI / 2;  // Horizontal alignment

    scene.add(orbitalRing);
    return orbitalRing;
}

// Create orbital rings for each planet with customizable colors
planetData.forEach((data, index) => {
    const ringColor = new THREE.Color(0xffffff); 
    const orbitalRing = createOrbitalRing(planets[index], ringColor);  // Create orbital ring for the planet with the custom color
    planets[index].userData.orbitalRing = orbitalRing;  // Save orbital ring to planet's data
});

// Post-processing pipeline
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// UnrealBloomPass for bloom effect
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // Bloom strength
    0.4, // Bloom radius
    0 // Bloom threshold
);

composer.addPass(bloomPass);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
    raycaster.setFromCamera(mouse, camera);

    // Get the intersected objects in the scene
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        // Display planet info in the info tab without changing the color
        showPlanetInfo(object.userData);
    }
}


// Show planet info in the info tab
function showPlanetInfo(planet) {
    const infoTab = document.getElementById('info-tab');
    const nameElement = document.getElementById('name');
    const descElement = document.getElementById('desc');
    const learnButton = document.getElementById('learn');

    // Ensure planet has necessary data
    nameElement.textContent = planet.name || "Unknown";  // Provide a default value if missing
    descElement.textContent = planet.desc || "No description available.";  // Default description
    learnButton.onclick = () => window.open(planet.link || "#", '_blank');  // Ensure a default link if missing

    // Show the info tab
    infoTab.style.transform = 'translate(0%)';
}


// Add event listeners for mousemove and mousedown
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);



// Handle window resize
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Keyboard state
let orbitalRingsVisible = true;
let postProcessingEnabled = true;

const ringsAudio = new Audio("res\rings.mp3")

// Event listener for keypresses
window.addEventListener("keydown", (event) => {
    if (event.key === "r" || event.key === "R") {
		ringsAudio.play()
		
        // Toggle rings visibility
        orbitalRingsVisible = !orbitalRingsVisible;
        planets.forEach((planet) => {
            if (planet.userData.orbitalRing) {
                planet.userData.orbitalRing.visible = orbitalRingsVisible;
            }
        });
    }

    if (event.key === "p" || event.key === "P") {
        // Toggle post-processing
        postProcessingEnabled = !postProcessingEnabled;
        if (postProcessingEnabled) {
            composer.addPass(bloomPass);
        } else {
            composer.removePass(bloomPass);
        }
    }
});

// Declare necessary variables globally
const Namemouse = new THREE.Vector2();  // Declare the mouse position
const nameRaycaster = new THREE.Raycaster();  // Raycaster for detecting planets
const planetNameElement = document.getElementById("planet-name");

// Function to handle mouse movement and check for planet hover
function nameOnmousemove(event) {
    // Normalize mouse coordinates to [-1, 1] range
    Namemouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    Namemouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster with camera and mouse position
    nameRaycaster.setFromCamera(Namemouse, camera);

    // Get the intersected objects (assuming `planets` is an array of planet objects)
    const intersects = nameRaycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const planet = intersects[0].object;  // Get the intersected planet
        showPlanetName(planet.userData.name, event.clientX, event.clientY);  // Show the name at mouse position
    } else {
        hidePlanetName();  // Hide if no planet is intersected
    }
}

// Function to show planet name near the mouse cursor
function showPlanetName(name, mouseX, mouseY) {
    planetNameElement.textContent = name;  // Update the name in the div
    planetNameElement.style.left = `${mouseX + 15}px`;  // Position the name near the cursor
    planetNameElement.style.top = `${mouseY + 15}px`;
    planetNameElement.style.display = "block";  // Make it visible
}

// Function to hide planet name
function hidePlanetName() {
    planetNameElement.style.display = "none";  // Hide the name when not hovering over a planet
}

// Add mousemove listener to track the mouse position
window.addEventListener("mousemove", nameOnmousemove, false);


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate planets
    planets.forEach((planet) => {
        planet.userData.angle += planet.userData.speed;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
    });

    // Rotate moon around Earth
    const earth = planets[2];
    moon.position.x = Math.cos(earth.userData.angle * 2) * 5 + earth.position.x;
    moon.position.z = Math.sin(earth.userData.angle * 2) * 5 + earth.position.z;

    // Update controls and render with post-processing
    controls.update();
    composer.render();
}

animate();
