# Chromcognito

A Chrome extension for opening, routing, and managing tabs in Incognito mode with rules, shortcuts, and auto-cleanups.

## Features

- **Auto-Incognito Rules**: Automatically redirect specific websites to incognito mode based on URL patterns
- **Keyboard Shortcuts**: Quick access to transfer current tab, matching tabs, or all tabs to incognito
- **Modifier Click Support**: Alt+Shift+Click any link to open it in incognito mode
- **Recently Closed Tracking**: View and reopen recently closed incognito tabs
- **History Management**: Optionally remove transferred tabs from regular browsing history
- **Context Menu Integration**: Right-click options to open links or pages in incognito

### Manual Installation (Development)

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder

## Usage

1. **Auto-Incognito**: Add URL patterns in settings to automatically redirect matching sites to incognito
2. **Manual Transfer**: Use keyboard shortcuts (Alt+Shift+I/M/A) to transfer tabs to incognito
3. **Modifier Clicks**: Hold Alt+Shift and click any link to open it in incognito mode
4. **Recently Closed**: View and reopen recently closed incognito tabs from the popup
5. **Settings**: Configure rules, shortcuts, and history management options

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
- **Local storage only**: All preferences and recently closed tabs are stored locally in your browser
- **No external communication**: The extension works entirely offline
- **Minimal permissions**: Only requests necessary permissions for tab management and incognito functionality

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
