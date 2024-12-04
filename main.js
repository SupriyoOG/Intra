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
        if (progress >= 100) {
            clearInterval(interval); // Stop progress updates
            loader.style.animation = "fadeOut 1s forwards"; // Fade out loader

            setTimeout(() => {
                loader.style.display = "none"; // Hide loader
                mainContent.style.display = "block"; // Show main content
            }, 1000); // Matches fadeOut duration
        }
    }, 100); // Update every 100ms
});