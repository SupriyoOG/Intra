// Wait for the page to load completely
window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");
    const mainContent = document.querySelector("main");
    const loadingBar = document.querySelector(".loading-bar");

    // Simulate dynamic loading progress
    let progress = 0;

    const interval = setInterval(() => {
        // Increment progress based on the document's ready state
        if (document.readyState === "interactive") {
            progress += 10; // Partial load
        } else if (document.readyState === "complete") {
            progress += 20; // Full load
        }

        // Update the width of the loading bar
        loadingBar.style.width = `${progress}%`;

        // Once fully loaded
        if (progress === 200) {
            clearInterval(interval); // Stop progress updates
            loader.style.animation = "fadeOut 1s forwards"; // Fade out loader

            setTimeout(() => {
                loader.style.display = "none"; // Hide loader
                mainContent.style.display = "block"; // Show main content
            }, 1000); // Matches fadeOut duration
        }
    }, 100); // Update every 100ms
});




// Check device hardware capabilities
const checkHardware = () => {
    const platform = navigator.platform;
    const cores = navigator.hardwareConcurrency;
    const deviceMemory = navigator.deviceMemory || "unknown"; // Available RAM in GB, or unknown
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0; // Touch screen device check
    const lowPowerMode = navigator.lowBattery || false; // Battery status (can be false if not available)

    // 1. Check if the device has at least 4 CPU threads
    if (cores < 4) {
        alert("Device has less than 4 CPU threads. Performance might be limited on resource-intensive tasks.");
    }

    // 2. Check if device is Android or Linux-based (mobile warning)
    if (platform.includes("Linux") && platform.includes("aarch64")) {
        alert("Android or ARM64 device detected! Performance may vary based on device capabilities.");
    }

    // 3. Check if the device has limited RAM (less than 4GB)
    if (deviceMemory !== "unknown" && deviceMemory < 4) {
        alert(`Device has limited RAM (${deviceMemory} GB). This may affect performance for large tasks.`);
    }

    // 4. Check if the device supports touch (mobile/tablet detection)
    if (isTouchDevice) {
        console.log("Touchscreen device detected.");
    }

    // 5. Check for low power mode (on mobile devices or laptops with low battery)
    if (lowPowerMode) {
        alert("Device is in low power mode. Performance may be reduced.");
    }

    // 6. Check the webpage's RAM usage (simple approach using performance.memory)
    if (window.performance && performance.memory) {
        const usedJSHeap = performance.memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        if (usedJSHeap > 1024) { // If over 1 GB of memory used
            alert(`Webpage's RAM usage is high: ${usedJSHeap.toFixed(2)} MB. This could impact performance.`);
        }
    }

    // Log the system information for debugging
    console.log("Device Info: ");
    console.log(`Platform: ${platform}`);
    console.log(`CPU Threads: ${cores}`);
    console.log(`RAM: ${deviceMemory} GB`);
    console.log(`Touch Supported: ${isTouchDevice}`);
    console.log(`Low Power Mode: ${lowPowerMode ? "Yes" : "No"}`);
};

// Run the hardware check when the page loads
checkHardware();