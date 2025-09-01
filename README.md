# Chromcognito

A Chrome extension for instant video playback speed control with customizable hotkeys and visual feedback.

## Features

- **Instant Speed Control**: Hold down a customizable hotkey to temporarily speed up video playback
- **Visual Feedback**: See current playback speed with customizable visual indicators
- **Universal Compatibility**: Works on YouTube, Netflix, Vimeo, and any website with HTML5 video
- **Modifier Click Support**: Click with modifier keys (Ctrl/Cmd/Alt/Shift) for quick speed adjustments
- **Customizable Settings**: Configure hotkeys, speed multipliers, and visual preferences
- **Platform-Specific Controls**: Enable/disable functionality for specific websites

## Installation

### From Chrome Web Store

_Coming soon - extension is currently under review_

### Manual Installation (Development)

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder

## Usage

1. **Basic Speed Control**: Hold your configured hotkey while watching any video to speed it up
2. **Modifier Clicks**: Click on videos with Ctrl/Cmd/Alt/Shift for instant speed boosts
3. **Settings**: Click the extension icon to customize hotkeys, speeds, and visual indicators
4. **Platform Control**: Enable/disable the extension for specific websites in settings

## Development

Built with:

- React + TypeScript
- Vite for fast development and building
- Chrome Extension Manifest V3
- Tailwind CSS for styling

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview built extension

### Project Structure

```
src/
├── background/     # Service worker
├── content/        # Content scripts
├── popup/          # Extension popup UI
├── options/        # Options page
├── components/     # Shared React components
└── types.ts        # TypeScript definitions
```

## Privacy

Chromcognito respects your privacy:

- **No data collection**: We don't collect any personal information
- **Local storage only**: All preferences are stored locally in your browser
- **No external communication**: The extension works entirely offline
- **Minimal permissions**: Only requests necessary permissions for video control

See our full [Privacy Policy](privacy.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

If you encounter issues or have suggestions:

- Open an issue on GitHub
- Check existing issues for solutions
- Provide detailed information about your browser and the website where issues occur
