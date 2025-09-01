# Chrome Web Store Privacy Section Notes

## Single Purpose Description

**Character count: 604/1000**

Chromcognito is a single-purpose Chrome extension designed to open, route, and manage tabs in Incognito mode with rules, shortcuts, and auto-cleanups. The extension allows users to automatically redirect specific websites to incognito mode based on URL patterns, manually transfer tabs using keyboard shortcuts or modifier clicks, and manage recently closed incognito tabs. This single purpose is narrow and focused solely on enhancing privacy and incognito tab management, making it easy for users to maintain privacy while browsing specific websites or content types.

## Permission Justifications

### activeTab Permission

**Character count: 413/1000**

The `activeTab` permission is required to access the currently active tab when the extension popup is opened. This allows us to read the current page's URL to determine if it matches incognito rules, and to transfer the current tab to incognito mode when requested. Without this permission, we cannot detect the current page context or provide the tab management functionality that is the core purpose of the extension.

### storage Permission

**Character count: 495/1000**

The `storage` permission is essential for saving and retrieving user preferences and settings. This includes auto-incognito URL rules, keyboard shortcut configurations, modifier click settings, and history management options. The storage permission enables the extension to remember user choices across browser sessions and devices, providing a consistent and personalized experience. Without this permission, users would lose their customizations every time they restart their browser.

### Host Permission

**Character count: 498/1000**

The host permissions (`https://*/*` and `http://*/*`) are necessary for the extension to detect link clicks with modifier keys across all websites. These permissions allow Chromcognito to work on any website where users want to open links in incognito mode using Alt+Shift+Click. The extension only monitors link clicks with specific modifier combinations and does not collect, read, or transmit any website content or user data beyond what's necessary for incognito tab management functionality.

## Remote Code Usage

**Status: No remote code used**

The extension does not use any remote JavaScript or WebAssembly code. All code is included in the extension package.

## Data Collection

**Status: No user data collected**

The extension does not collect any of the following:

- ❌ Personally identifiable information
- ❌ Health information
- ❌ Financial and payment information
- ❌ Authentication information
- ❌ Personal communications
- ❌ Location data
- ❌ Web history
- ❌ User activity
- ❌ Website content

## Privacy Policy Certifications

✅ I do not sell or transfer user data to third parties, outside of the approved use cases
✅ I do not use or transfer user data for purposes that are unrelated to my item's single purpose  
✅ I do not use or transfer user data to determine creditworthiness or for lending purposes

## Privacy Policy URL

https://github.com/gdcho/chromcognito/blob/main/privacy.md

## Key Points for Review

- Extension has a narrow, single purpose (video speed control)
- Minimal permissions requested with clear justifications
- No data collection or transmission
- All user preferences stored locally
- Compliant with Chrome Web Store policies
- Privacy policy clearly states no data collection
