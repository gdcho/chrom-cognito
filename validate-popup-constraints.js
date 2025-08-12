#!/usr/bin/env node

/**
 * Popup Constraints Validation Script
 * Validates that the popup meets browser extension requirements
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PopupConstraintsValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passes = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);

    switch (type) {
      case "error":
        this.errors.push(message);
        break;
      case "warning":
        this.warnings.push(message);
        break;
      case "pass":
        this.passes.push(message);
        break;
    }
  }

  // Validate manifest.json popup configuration
  validateManifest() {
    this.log("Validating manifest.json...", "info");

    try {
      const manifestPath = path.join(__dirname, "dist", "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

      // Check popup configuration
      if (manifest.action && manifest.action.default_popup) {
        this.log(`Popup path: ${manifest.action.default_popup}`, "pass");

        // Verify popup file exists
        const popupPath = path.join(
          __dirname,
          "dist",
          manifest.action.default_popup,
        );
        if (fs.existsSync(popupPath)) {
          this.log("Popup HTML file exists", "pass");
        } else {
          this.log("Popup HTML file not found", "error");
        }
      } else {
        this.log("No popup configuration found in manifest", "error");
      }

      // Check manifest version
      if (manifest.manifest_version === 3) {
        this.log("Using Manifest V3", "pass");
      } else {
        this.log(
          `Using Manifest V${manifest.manifest_version} (V3 recommended)`,
          "warning",
        );
      }

      // Check required permissions
      const requiredPermissions = ["tabs", "storage"];
      const hasPermissions = requiredPermissions.every(
        (perm) => manifest.permissions && manifest.permissions.includes(perm),
      );

      if (hasPermissions) {
        this.log("Required permissions present", "pass");
      } else {
        this.log("Missing required permissions", "error");
      }
    } catch (error) {
      this.log(`Error reading manifest: ${error.message}`, "error");
    }
  }

  // Validate popup HTML structure
  validatePopupHTML() {
    this.log("Validating popup HTML...", "info");

    try {
      const htmlPath = path.join(
        __dirname,
        "dist",
        "src",
        "popup",
        "index.html",
      );
      const html = fs.readFileSync(htmlPath, "utf8");

      // Check for required elements
      if (html.includes('<div id="root">')) {
        this.log("Root div element present", "pass");
      } else {
        this.log("Root div element missing", "error");
      }

      // Check for CSS link
      if (html.includes(".css")) {
        this.log("CSS stylesheet linked", "pass");
      } else {
        this.log("CSS stylesheet not linked", "error");
      }

      // Check for JavaScript module
      if (html.includes("popup.js") || html.includes('type="module"')) {
        this.log("JavaScript module loaded", "pass");
      } else {
        this.log("JavaScript module not loaded", "error");
      }

      // Check HTML structure
      if (html.includes("<!DOCTYPE html>")) {
        this.log("Valid HTML5 doctype", "pass");
      } else {
        this.log("Missing or invalid doctype", "warning");
      }

      if (html.includes('<meta charset="UTF-8"')) {
        this.log("UTF-8 charset specified", "pass");
      } else {
        this.log("UTF-8 charset not specified", "warning");
      }
    } catch (error) {
      this.log(`Error reading popup HTML: ${error.message}`, "error");
    }
  }

  // Validate CSS constraints
  validateCSS() {
    this.log("Validating CSS constraints...", "info");

    try {
      const cssFiles = fs
        .readdirSync(path.join(__dirname, "dist", "assets"))
        .filter((file) => file.endsWith(".css"));

      if (cssFiles.length === 0) {
        this.log("No CSS files found", "error");
        return;
      }

      const cssPath = path.join(__dirname, "dist", "assets", cssFiles[0]);
      const css = fs.readFileSync(cssPath, "utf8");

      // Check for popup width constraint
      if (
        css.includes("--popup-width:320px") ||
        css.includes("--popup-width: 320px")
      ) {
        this.log("Popup width constraint (320px) defined", "pass");
      } else {
        this.log("Popup width constraint not found", "error");
      }

      // Check for max height constraint
      if (
        css.includes("--popup-max-height:600px") ||
        css.includes("--popup-max-height: 600px")
      ) {
        this.log("Popup max height constraint (600px) defined", "pass");
      } else {
        this.log("Popup max height constraint not found", "error");
      }

      // Check for responsive media queries
      if (css.includes("@media (max-width: 320px)")) {
        this.log("Small screen media query present", "pass");
      } else {
        this.log("Small screen media query missing", "warning");
      }

      if (css.includes("@media (max-height: 400px)")) {
        this.log("Short screen media query present", "pass");
      } else {
        this.log("Short screen media query missing", "warning");
      }

      // Check for overflow handling
      if (css.includes("overflow-y:auto") || css.includes("overflow-y: auto")) {
        this.log("Overflow handling configured", "pass");
      } else {
        this.log("Overflow handling not configured", "warning");
      }

      // Check for scrollbar styling
      if (
        css.includes("scrollbar-width") ||
        css.includes("::-webkit-scrollbar")
      ) {
        this.log("Custom scrollbar styling present", "pass");
      } else {
        this.log("Custom scrollbar styling missing", "warning");
      }

      // Check for dark theme colors
      if (css.includes("#1a1a1a") || css.includes("26, 26, 26")) {
        this.log("Dark theme colors present", "pass");
      } else {
        this.log("Dark theme colors not detected", "warning");
      }
    } catch (error) {
      this.log(`Error reading CSS: ${error.message}`, "error");
    }
  }

  // Validate JavaScript bundle
  validateJavaScript() {
    this.log("Validating JavaScript bundle...", "info");

    try {
      const jsFiles = fs
        .readdirSync(path.join(__dirname, "dist", "chunks"))
        .filter((file) => file.includes("popup") && file.endsWith(".js"));

      if (jsFiles.length === 0) {
        this.log("No popup JavaScript files found", "error");
        return;
      }

      const jsPath = path.join(__dirname, "dist", "chunks", jsFiles[0]);
      const jsStats = fs.statSync(jsPath);

      // Check bundle size (should be reasonable for extension)
      const bundleSizeKB = Math.round(jsStats.size / 1024);
      if (bundleSizeKB < 500) {
        this.log(
          `JavaScript bundle size: ${bundleSizeKB}KB (reasonable)`,
          "pass",
        );
      } else if (bundleSizeKB < 1000) {
        this.log(
          `JavaScript bundle size: ${bundleSizeKB}KB (large but acceptable)`,
          "warning",
        );
      } else {
        this.log(
          `JavaScript bundle size: ${bundleSizeKB}KB (too large)`,
          "error",
        );
      }

      // Check if bundle exists and is readable
      const js = fs.readFileSync(jsPath, "utf8");
      if (js.length > 0) {
        this.log("JavaScript bundle is not empty", "pass");
      } else {
        this.log("JavaScript bundle is empty", "error");
      }
    } catch (error) {
      this.log(`Error reading JavaScript: ${error.message}`, "error");
    }
  }

  // Validate file structure
  validateFileStructure() {
    this.log("Validating file structure...", "info");

    const requiredFiles = [
      "dist/manifest.json",
      "dist/src/popup/index.html",
      "dist/background.js",
    ];

    const requiredDirs = ["dist/assets", "dist/chunks", "dist/icons"];

    requiredFiles.forEach((file) => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        this.log(`Required file exists: ${file}`, "pass");
      } else {
        this.log(`Required file missing: ${file}`, "error");
      }
    });

    requiredDirs.forEach((dir) => {
      const dirPath = path.join(__dirname, dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.log(`Required directory exists: ${dir}`, "pass");
      } else {
        this.log(`Required directory missing: ${dir}`, "error");
      }
    });
  }

  // Run all validations
  async runAllValidations() {
    this.log("Starting popup constraints validation...", "info");
    this.log("=".repeat(60), "info");

    this.validateFileStructure();
    this.validateManifest();
    this.validatePopupHTML();
    this.validateCSS();
    this.validateJavaScript();

    this.log("=".repeat(60), "info");
    this.log(`Validation complete:`, "info");
    this.log(`✅ Passes: ${this.passes.length}`, "info");
    this.log(`⚠️  Warnings: ${this.warnings.length}`, "info");
    this.log(`❌ Errors: ${this.errors.length}`, "info");

    if (this.errors.length === 0) {
      this.log("All critical validations passed! 🎉", "info");
      return true;
    } else {
      this.log(
        "Some validations failed. Please review the errors above.",
        "info",
      );
      return false;
    }
  }

  // Generate validation report
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        passes: this.passes.length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        success: this.errors.length === 0,
      },
      details: {
        passes: this.passes,
        warnings: this.warnings,
        errors: this.errors,
      },
    };
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new PopupConstraintsValidator();
  validator.runAllValidations().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export default PopupConstraintsValidator;
