# Chrome Web Store Privacy Section Notes

## Single Purpose Description

**Character count: 604/1000**

Chromcognito is a single-purpose Chrome extension designed to provide instant video playback speed control. The extension allows users to temporarily speed up video content on any website by holding down a customizable hotkey, with visual feedback showing the current speed. When the hotkey is released, the video returns to normal playback speed. This single purpose is narrow and focused solely on enhancing video viewing experience through temporary speed control, making it easy for users to save time while watching educational content, tutorials, or any video that benefits from accelerated playback.

## Permission Justifications

### activeTab Permission

**Character count: 413/1000**

The `activeTab` permission is required to access the currently active tab when the extension popup is opened. This allows us to read the current page's URL to determine if video speed controls should be enabled, and to inject our content script only when needed. Without this permission, we cannot detect the current page context or provide the video speed functionality that is the core purpose of the extension.

### storage Permission

**Character count: 495/1000**

The `storage` permission is essential for saving and retrieving user preferences and settings. This includes hotkey configurations, speed multiplier preferences, visual indicator settings, and platform-specific enable/disable options. The storage permission enables the extension to remember user choices across browser sessions and devices, providing a consistent and personalized experience. Without this permission, users would lose their customizations every time they restart their browser.

### Host Permission

**Character count: 498/1000**

The host permissions (`https://*/*` and `http://*/*`) are necessary for the extension to detect and control video players across various websites. These permissions allow Chromcognito to work on different video platforms including YouTube, Netflix, Vimeo, educational platforms, and any website with HTML5 video content. The extension only accesses video elements and does not collect, read, or transmit any website content or user data beyond what's necessary for video speed control functionality.

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
