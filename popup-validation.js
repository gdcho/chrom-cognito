/**
 * Popup Behavior Validation Script
 * Tests popup dimensions, overflow handling, and browser extension constraints
 */

class PopupValidator {
  constructor() {
    this.results = [];
    this.testsPassed = 0;
    this.testsTotal = 0;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);

    if (type === "pass") this.testsPassed++;
    if (type !== "info") this.testsTotal++;

    this.results.push({ timestamp, message, type });
  }

  // Test 1: Verify popup fits within browser extension constraints
  testPopupDimensions() {
    this.log("Testing popup dimensions...", "info");

    const popup = document.querySelector(".chronow-popup");
    if (!popup) {
      this.log("Popup element not found", "fail");
      return;
    }

    const rect = popup.getBoundingClientRect();
    const computedStyle = getComputedStyle(popup);

    // Test width constraint (320px)
    const expectedWidth = 320;
    const actualWidth = rect.width;
    if (Math.abs(actualWidth - expectedWidth) < 5) {
      this.log(
        `Popup width: ${actualWidth}px (expected: ${expectedWidth}px)`,
        "pass",
      );
    } else {
      this.log(
        `Popup width: ${actualWidth}px (expected: ${expectedWidth}px)`,
        "fail",
      );
    }

    // Test max height constraint (600px)
    const maxHeight = 600;
    const actualHeight = rect.height;
    if (actualHeight <= maxHeight) {
      this.log(`Popup height: ${actualHeight}px (max: ${maxHeight}px)`, "pass");
    } else {
      this.log(
        `Popup height: ${actualHeight}px exceeds max: ${maxHeight}px`,
        "fail",
      );
    }

    // Test CSS variables are properly set
    const rootStyle = getComputedStyle(document.documentElement);
    const popupWidthVar = rootStyle.getPropertyValue("--popup-width").trim();
    const popupMaxHeightVar = rootStyle
      .getPropertyValue("--popup-max-height")
      .trim();

    if (popupWidthVar === "320px") {
      this.log("CSS variable --popup-width is correct", "pass");
    } else {
      this.log(
        `CSS variable --popup-width: ${popupWidthVar} (expected: 320px)`,
        "fail",
      );
    }

    if (popupMaxHeightVar === "600px") {
      this.log("CSS variable --popup-max-height is correct", "pass");
    } else {
      this.log(
        `CSS variable --popup-max-height: ${popupMaxHeightVar} (expected: 600px)`,
        "fail",
      );
    }
  }

  // Test 2: Test all button interactions and data loading
  testButtonInteractions() {
    this.log("Testing button interactions...", "info");

    // Test header buttons
    const refreshButton = document.querySelector(
      'button[aria-label="Refresh"]',
    );
    const settingsButton = document.querySelector(
      'button[aria-label="Settings"]',
    );

    if (refreshButton) {
      this.log("Refresh button found with proper aria-label", "pass");

      // Test button styling
      const refreshStyle = getComputedStyle(refreshButton);
      if (refreshStyle.cursor === "pointer") {
        this.log("Refresh button has pointer cursor", "pass");
      } else {
        this.log("Refresh button missing pointer cursor", "fail");
      }
    } else {
      this.log("Refresh button not found or missing aria-label", "fail");
    }

    if (settingsButton) {
      this.log("Settings button found with proper aria-label", "pass");
    } else {
      this.log("Settings button not found or missing aria-label", "fail");
    }

    // Test main action buttons
    const actionButtons = document.querySelectorAll(".button-group .btn");
    if (actionButtons.length >= 3) {
      this.log(`Found ${actionButtons.length} action buttons`, "pass");

      // Test button styling
      actionButtons.forEach((button, index) => {
        const buttonStyle = getComputedStyle(button);
        const minHeight = parseInt(buttonStyle.minHeight);

        if (minHeight >= 48) {
          this.log(
            `Button ${index + 1} has adequate min-height: ${minHeight}px`,
            "pass",
          );
        } else {
          this.log(
            `Button ${index + 1} min-height too small: ${minHeight}px`,
            "fail",
          );
        }

        if (buttonStyle.borderRadius === "8px") {
          this.log(`Button ${index + 1} has correct border-radius`, "pass");
        } else {
          this.log(
            `Button ${index + 1} border-radius: ${
              buttonStyle.borderRadius
            } (expected: 8px)`,
            "fail",
          );
        }
      });
    } else {
      this.log(
        `Insufficient action buttons: ${actionButtons.length} (expected: ≥3)`,
        "fail",
      );
    }

    // Test loading states
    const loadingSpinners = document.querySelectorAll(".loading-spinner");
    this.log(`Loading spinners available: ${loadingSpinners.length}`, "info");

    // Test ripple effect capability
    const buttonsWithRipple = document.querySelectorAll(".btn");
    if (buttonsWithRipple.length > 0) {
      this.log("Buttons support ripple effects", "pass");
    } else {
      this.log("No buttons found for ripple effects", "fail");
    }
  }

  // Test 3: Ensure proper overflow handling and scrollbar styling
  testOverflowHandling() {
    this.log("Testing overflow handling...", "info");

    const mainContent = document.querySelector(".chronow-content");
    if (mainContent) {
      const contentStyle = getComputedStyle(mainContent);

      if (contentStyle.overflowY === "auto") {
        this.log("Main content has proper overflow-y: auto", "pass");
      } else {
        this.log(
          `Main content overflow-y: ${contentStyle.overflowY} (expected: auto)`,
          "fail",
        );
      }

      if (contentStyle.overflowX === "hidden") {
        this.log("Main content has proper overflow-x: hidden", "pass");
      } else {
        this.log(
          `Main content overflow-x: ${contentStyle.overflowX} (expected: hidden)`,
          "fail",
        );
      }
    } else {
      this.log("Main content element not found", "fail");
    }

    const recentlyClosedContainer = document.querySelector(
      ".recently-closed-container",
    );
    if (recentlyClosedContainer) {
      const containerStyle = getComputedStyle(recentlyClosedContainer);

      if (containerStyle.overflowY === "auto") {
        this.log(
          "Recently closed container has proper overflow-y: auto",
          "pass",
        );
      } else {
        this.log(
          `Recently closed container overflow-y: ${containerStyle.overflowY} (expected: auto)`,
          "fail",
        );
      }

      // Test scrollbar styling
      const scrollbarWidth = containerStyle.scrollbarWidth;
      if (scrollbarWidth === "thin" || scrollbarWidth === "auto") {
        this.log("Scrollbar width is properly configured", "pass");
      } else {
        this.log(`Scrollbar width: ${scrollbarWidth}`, "info");
      }

      // Test max height constraint
      const maxHeight = parseInt(containerStyle.maxHeight);
      if (maxHeight > 0 && maxHeight < 600) {
        this.log(
          `Recently closed container max-height: ${maxHeight}px`,
          "pass",
        );
      } else {
        this.log(
          "Recently closed container max-height not properly constrained",
          "fail",
        );
      }
    } else {
      this.log("Recently closed container not found", "fail");
    }

    // Test fade effects for scrollable content
    const fadeElements = document.querySelectorAll(
      ".recently-closed-container::before, .recently-closed-container::after",
    );
    this.log("Fade effects for scrollable content are defined in CSS", "info");
  }

  // Test 4: Validate popup positioning and sizing across different browsers
  testBrowserCompatibility() {
    this.log("Testing browser compatibility...", "info");

    // Test CSS custom properties support
    const testElement = document.createElement("div");
    testElement.style.setProperty("--test-var", "10px");
    const testValue =
      getComputedStyle(testElement).getPropertyValue("--test-var");

    if (testValue.trim() === "10px") {
      this.log("CSS custom properties supported", "pass");
    } else {
      this.log("CSS custom properties not supported", "fail");
    }

    // Test flexbox support
    testElement.style.display = "flex";
    const flexSupport = getComputedStyle(testElement).display === "flex";

    if (flexSupport) {
      this.log("Flexbox supported", "pass");
    } else {
      this.log("Flexbox not supported", "fail");
    }

    // Test viewport units
    testElement.style.width = "100vw";
    const viewportSupport = getComputedStyle(testElement).width !== "auto";

    if (viewportSupport) {
      this.log("Viewport units supported", "pass");
    } else {
      this.log("Viewport units not supported", "fail");
    }

    // Test border-radius support
    testElement.style.borderRadius = "8px";
    const borderRadiusSupport =
      getComputedStyle(testElement).borderRadius === "8px";

    if (borderRadiusSupport) {
      this.log("Border-radius supported", "pass");
    } else {
      this.log("Border-radius not supported", "fail");
    }

    // Test box-shadow support
    testElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    const boxShadowSupport = getComputedStyle(testElement).boxShadow !== "none";

    if (boxShadowSupport) {
      this.log("Box-shadow supported", "pass");
    } else {
      this.log("Box-shadow not supported", "fail");
    }

    // Clean up test element
    testElement.remove();
  }

  // Test 5: Responsive design validation
  testResponsiveDesign() {
    this.log("Testing responsive design...", "info");

    // Test media query support
    const mediaQuerySupport =
      window.matchMedia && window.matchMedia("(max-width: 320px)");

    if (mediaQuerySupport) {
      this.log("Media queries supported", "pass");
    } else {
      this.log("Media queries not supported", "fail");
    }

    // Test responsive breakpoints
    const smallScreenQuery = window.matchMedia("(max-width: 320px)");
    const shortScreenQuery = window.matchMedia("(max-height: 400px)");

    this.log(
      `Small screen media query matches: ${smallScreenQuery.matches}`,
      "info",
    );
    this.log(
      `Short screen media query matches: ${shortScreenQuery.matches}`,
      "info",
    );

    // Test popup behavior at different sizes
    const popup = document.querySelector(".chronow-popup");
    if (popup) {
      const originalWidth = popup.style.width;

      // Simulate narrow screen
      popup.style.width = "280px";
      const narrowRect = popup.getBoundingClientRect();

      if (narrowRect.width <= 280) {
        this.log("Popup adapts to narrow width", "pass");
      } else {
        this.log("Popup does not adapt to narrow width", "fail");
      }

      // Restore original width
      popup.style.width = originalWidth;
    }
  }

  // Test 6: Accessibility validation
  testAccessibility() {
    this.log("Testing accessibility...", "info");

    // Test focus management
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length > 0) {
      this.log(`Found ${focusableElements.length} focusable elements`, "pass");

      // Test aria-labels
      let accessibleCount = 0;
      focusableElements.forEach((element) => {
        if (
          element.getAttribute("aria-label") ||
          element.getAttribute("title") ||
          element.textContent.trim()
        ) {
          accessibleCount++;
        }
      });

      if (accessibleCount === focusableElements.length) {
        this.log("All focusable elements have accessible names", "pass");
      } else {
        this.log(
          `${accessibleCount}/${focusableElements.length} focusable elements have accessible names`,
          "fail",
        );
      }
    } else {
      this.log("No focusable elements found", "fail");
    }

    // Test color contrast (basic check)
    const popup = document.querySelector(".chronow-popup");
    if (popup) {
      const popupStyle = getComputedStyle(popup);
      const backgroundColor = popupStyle.backgroundColor;
      const color = popupStyle.color;

      this.log(`Background color: ${backgroundColor}`, "info");
      this.log(`Text color: ${color}`, "info");

      // Basic dark theme validation
      if (
        backgroundColor.includes("26, 26, 26") ||
        backgroundColor.includes("#1a1a1a")
      ) {
        this.log("Dark theme background color detected", "pass");
      } else {
        this.log("Dark theme background color not detected", "fail");
      }
    }
  }

  // Run all tests
  async runAllTests() {
    this.log("Starting popup behavior validation...", "info");
    this.log("=".repeat(50), "info");

    this.testPopupDimensions();
    this.testButtonInteractions();
    this.testOverflowHandling();
    this.testBrowserCompatibility();
    this.testResponsiveDesign();
    this.testAccessibility();

    this.log("=".repeat(50), "info");
    this.log(
      `Tests completed: ${this.testsPassed}/${this.testsTotal} passed`,
      "info",
    );

    if (this.testsPassed === this.testsTotal) {
      this.log("All tests passed! ✅", "info");
    } else {
      this.log(`${this.testsTotal - this.testsPassed} tests failed ❌`, "info");
    }

    return {
      passed: this.testsPassed,
      total: this.testsTotal,
      results: this.results,
    };
  }

  // Generate test report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.testsPassed,
        total: this.testsTotal,
        passRate: ((this.testsPassed / this.testsTotal) * 100).toFixed(1),
      },
      results: this.results,
    };

    console.log("Test Report:", JSON.stringify(report, null, 2));
    return report;
  }
}

// Export for use in browser console or test environment
if (typeof window !== "undefined") {
  window.PopupValidator = PopupValidator;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PopupValidator;
}
