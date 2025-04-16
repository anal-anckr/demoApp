// This file is loaded as a script tag in index.html
// Having it as a plain JS file bypasses the TypeScript compiler and module resolution issues
(function () {
  try {
    // Try multiple approaches to load zone.js
    require("zone.js");
    console.log("Zone.js loaded via require");
  } catch (e) {
    try {
      // If that fails, try loading from node_modules directly
      document.write(
        '<script src="node_modules/zone.js/bundles/zone.umd.js"></script>'
      );
      console.log("Zone.js loaded via script tag");
    } catch (e2) {
      console.error("Failed to load zone.js:", e2);
    }
  }
})();
