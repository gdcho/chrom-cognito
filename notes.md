# Chrome Web Store Privacy Section Notes

## Single Purpose Description

**Character count: 201/1000**

Chromcognito is a Chrome extension designed to open, route, and manage tabs in Incognito mode with rules, shortcuts, and auto-cleanups. This privacy policy explains how we handle data in our extension.

## Permission Justifications

### tabs Permission

**Character count: 413/1000**

Used to access the currently active tab when the extension popup is opened. This allows us to read the current page's URL to determine if it matches incognito rules, and to transfer the current tab to incognito mode when requested. Without this permission, we cannot detect the current page context or provide the tab management functionality that is the core purpose of the extension.

### storage Permission

**Character count: 151/1000**

Used to save and retrieve user preferences locally in your browser. This enables the extension to remember your customizations across browser sessions.

### history Permission

**Character count: 498/1000**

Used to remove browsing history entries when users transfer tabs to incognito mode. This permission is only used when the user has enabled the "Remove from normal history when transferring to incognito" setting. The extension removes the history entry for the specific URL that was transferred to incognito, helping users maintain privacy by not leaving traces in their regular browsing history.

### contextMenus Permission

**Character count: 456/1000**

Used to add context menu options for opening links and pages in incognito mode. This permission allows users to right-click on links or pages and select "Open link in Incognito" or "Open this page in Incognito" from the context menu. This provides an alternative way to access incognito functionality beyond keyboard shortcuts and modifier clicks.

### alarms Permission

**Character count: 0/1000**

This permission is not used by the extension. It may be listed in the manifest but is not actively utilized in the current version of ChromCognito.

### Host Permission

**Character count: 498/1000**

The host permissions (`https://*/*` and `http://*/*`) are necessary for the extension to detect link clicks with modifier keys across all websites. These permissions allow ChromCognito to work on any website where users want to open links in incognito mode using Alt+Shift+Click. The extension only monitors link clicks with specific modifier combinations and does not collect, read, or transmit any website content or user data beyond what's necessary for incognito tab management functionality.

## Remote Code Usage

**Status: No, I am not using Remote code**

**Justification: 156/1000**

The extension does not use any remote JavaScript or WebAssembly code. All code is included in the extension package and runs locally within the browser. No external scripts, modules, or code are loaded from remote servers.

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

**Character count: 58/2048**

https://github.com/gdcho/chromcognito/blob/main/privacy.md

## Key Points for Review

- Extension has a narrow, single purpose (incognito tab management)
- All permissions have proper justifications
- No data collection or transmission
- All user preferences stored locally
- Privacy policy URL provided
- Compliant with Chrome Web Store policies

## Summary of Completed Fields

✅ **Single Purpose Description**: 201/1000 characters
✅ **tabs Permission**: 413/1000 characters
✅ **storage Permission**: 151/1000 characters
✅ **history Permission**: 498/1000 characters
✅ **contextMenus Permission**: 456/1000 characters
✅ **alarms Permission**: 0/1000 characters (not used)
✅ **Host Permission**: 498/1000 characters
✅ **Remote Code Justification**: 156/1000 characters
✅ **Privacy Policy URL**: 58/2048 characters
✅ **Data Collection**: All categories marked as "No"
✅ **Privacy Certifications**: All three certifications marked
