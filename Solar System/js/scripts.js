// Wait for the page to load completely
window.addEventListener("load", () => {
	const loader = document.querySelector(".loader");
	const mainContent = document.querySelector("main");
	const loadingBar = document.querySelector(".loading-bar");

	let progress = 0;

	const interval = setInterval(() => {
		if (document.readyState === "interactive") progress += 10;
		if (document.readyState === "complete") progress += 20;

		loadingBar.style.width = `${progress}%`;

		if (progress === 200) {
			clearInterval(interval);
			loader.style.animation = "fadeOut 1s forwards";

			setTimeout(() => {
				loader.style.display = "none";
				mainContent.style.display = "block";
			}, 1000);
		}
	}, 100);
});

// Check device hardware capabilities
const checkHardware = () => {
	// Check if the alert has been shown in the current session
	if (sessionStorage.getItem("hardwareAlertShown")) return;

	const {
		platform,
		hardwareConcurrency: cores,
		deviceMemory = "unknown",
	} = navigator;
	const isTouchDevice =
		"ontouchstart" in window || navigator.maxTouchPoints > 0;
	const lowPowerMode = navigator.lowBattery || false;

	if (cores < 2)
		alert("Device has less than 4 CPU threads. Performance might be limited.");
	if (platform.includes("Linux") && platform.includes("aarch64")) {
		alert("Android/ARM64 device detected! Performance may vary.");
	}
	if (deviceMemory !== "unknown" && deviceMemory < 2)
		alert(`Device has limited RAM (${deviceMemory} GB).`);
	if (isTouchDevice) console.log("Touchscreen device detected.");
	if (lowPowerMode)
		alert("Device is in low power mode. Performance may be reduced.");

	if (window.performance && performance.memory) {
		const usedJSHeap = performance.memory.usedJSHeapSize / 1024 / 1024;
		if (usedJSHeap > 1024) // make it like it shows after 100 mb exceed
			alert(`Webpage's RAM usage is high: ${usedJSHeap.toFixed(2)} MB.`);
	}

	console.log(
		`Device Info: Platform: ${platform}, CPU Threads: ${cores}, RAM: ${deviceMemory} GB, Touch Supported: ${isTouchDevice}, Low Power Mode: ${
			lowPowerMode ? "Yes" : "No"
		}`
	);

	// Store that the alert has been shown for the current session
	sessionStorage.setItem("hardwareAlertShown", "true");
};

// Run the hardware check when the page loads
checkHardware();
