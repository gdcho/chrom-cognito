# Privacy Policy for Chromcognito

**Last updated: September 1, 2025**

## Overview

Chromcognito is a Chrome extension designed to open, route, and manage tabs in Incognito mode with rules, shortcuts, and auto-cleanups. This privacy policy explains how we handle data in our extension.

## Data Collection

**We do not collect any user data.** Chromcognito operates entirely locally on your device and does not:

- Collect personally identifiable information
- Track your browsing history beyond recently closed incognito tabs
- Monitor your web activity beyond detecting modifier clicks on links
- Access website content beyond link URLs for incognito redirection
- Transmit any data to external servers
- Store any personal information

## Data Usage

The extension only stores user preferences locally in your browser, including:

- Auto-incognito URL rules and patterns
- Keyboard shortcut enable/disable settings
- Modifier click enable/disable settings
- History management preferences
- Recently closed incognito tab URLs and titles (for restoration purposes)

This data remains on your device and is never transmitted elsewhere.

## Permissions

### activeTab Permission

Used to access the currently active tab when the extension popup is opened. This allows us to determine if video speed controls should be enabled and inject our content script only when needed.

### storage Permission

Used to save and retrieve user preferences locally in your browser. This enables the extension to remember your customizations across browser sessions.

### Host Permissions (https://_/_ and http://_/_)

Required to detect modifier key clicks on links across all websites. The extension only monitors link clicks with Alt+Shift combination and does not read or collect any other website content.

## Third-Party Data Sharing

We do not sell, transfer, or share any user data with third parties. The extension operates entirely offline and does not communicate with external servers.

## Data Security

Since no data is collected or transmitted, there are no data security concerns. All user preferences are stored locally using Chrome's secure storage API.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.

## Contact

If you have questions about this privacy policy, please contact us through our GitHub repository: https://github.com/gdcho/chrom-cognito

## Compliance

This extension complies with Chrome Web Store Developer Program Policies and does not engage in any prohibited data collection or usage practices.
