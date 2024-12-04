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
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Set the background color of the scene to black (space)
scene.background = new THREE.Color(0x111111);

camera.position.set(30, 30, 30);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .1;
controls.autoRotate= false;
controls.enableZoom =true;

// Load textures using TextureLoader
const textureLoader = new THREE.TextureLoader();

// Load Sun texture
const sunTexture = textureLoader.load(
	"planets/sun.jpg", // Use the sun texture from your directory
	(texture) => {
		console.log("Sun texture loaded:", texture);
	},
	undefined,
	(error) => {
		console.error("Error loading sun texture:", error);
	}
);

// Load HDRI for background (space.jpg)
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
	"planets/space.hdri", // Replace with your HDRI image path
	(hdri) => {
		hdri.mapping = THREE.EquirectangularReflectionMapping;
		scene.background = hdri;
		scene.environment = hdri;
	}
);

// Create the Sun (large sphere with texture and subtle emission)
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
	map: sunTexture, // The Sun's texture
	emissive: 0xffcc00, // Bright emissive color to simulate glow
	emissiveIntensity: 1.0, // Increase intensity for more bloom effect
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const sunlight = new THREE.PointLight(0xffffff, 100, 100);
sunlight.position.set(0, 0, 0);
scene.add(sunlight);

const helper = new THREE.PointLightHelper(sunlight, 10, sunlight.color);
// scene.add(helper);

// Planet data and creation (rough surfaces)
const planetData = [
	{
		name: "Mercury",
		radius: 2,
		distance: 10,
		texture: "planets/mercury.jpg",
		speed: 0.01,
	},
	{
		name: "Venus",
		radius: 3,
		distance: 20,
		texture: "planets/venus.jpg",
		speed: 0.005,
	},
	{
		name: "Earth",
		radius: 4,
		distance: 30,
		texture: "planets/earth.jpg",
		speed: 0.0025,
	},
	{
		name: "Mars",
		radius: 3,
		distance: 40,
		texture: "planets/mars.jpeg", // Adjusted to use mars.jpeg
		speed: 0.002,
	},
	{
		name: "Jupiter",
		radius: 7,
		distance: 50,
		texture: "planets/jupiter.jpg",
		speed: 0.0015,
	},
	{
		name: "Saturn",
		radius: 6,
		distance: 60,
		texture: "planets/saturn.jpg",
		speed: 0.0012,
	},
	{
		name: "Uranus",
		radius: 5,
		distance: 70,
		texture: "planets/uranus.jpg",
		speed: 0.0011,
	},
	{
		name: "Neptune",
		radius: 4,
		distance: 80,
		texture: "planets/neptune.jpg",
		speed: 0.001,
	},
];

// Create planets and apply textures (rough surfaces)
const planets = planetData.map((data) => {
	// Load the planet texture
	const texture = textureLoader.load(
		data.texture,
		(texture) => {
			console.log("Texture loaded:", texture);
		},
		undefined,
		(error) => {
			console.error("Error loading texture:", error);
		}
	);

	const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
	const material = new THREE.MeshStandardMaterial({
		map: texture, // Apply the texture to the material
		roughness: 1, // Make the planets rough
		metalness: 0.5, // Slightly metallic effect
	});

	const planet = new THREE.Mesh(geometry, material);
	scene.add(planet);

	planet.userData = {
		distance: data.distance,
		speed: data.speed,
		angle: Math.random() * Math.PI * 2,
	};

	return planet;
});

// Create Moons (Earth's moon)
const moonGeometry = new THREE.SphereGeometry(1, 16, 16);
const moonMaterial = new THREE.MeshStandardMaterial({
	color: 0xaaaaaa,
	roughness: 1, // Make the moon rough
	metalness: 0.5,
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

// Create the post-processing pipeline (EffectComposer)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Set up UnrealBloomPass for bloom effect
const bloomPass = new UnrealBloomPass(
	new THREE.Vector2(window.innerWidth, window.innerHeight), // Screen size
	2, // Bloom strength
	1, // Bloom radius
	0 // Bloom threshold
);
composer.addPass(bloomPass);


// EVENTS
// =====================================================================================================


// Resize event listener to update renderer and camera aspect ratio on window resize
window.addEventListener("resize", () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	// Rotate planets and update their positions based on speed
	planets.forEach((planet) => {
		planet.userData.angle += planet.userData.speed; // Increase the angle for orbit
		planet.position.x =
			Math.cos(planet.userData.angle) * planet.userData.distance;
		planet.position.z =
			Math.sin(planet.userData.angle) * planet.userData.distance;
	});

	// Rotate the moon around the Earth (planet at index 2)
	const earth = planets[2];
	moon.position.x = Math.cos(earth.userData.angle * 2) * 5 + earth.position.x; // Orbit around Earth
	moon.position.z = Math.sin(earth.userData.angle * 2) * 5 + earth.position.z;

	// Update controls
	controls.update();

	// Render the scene with the composer (post-processing)
	composer.render();
}

animate();
