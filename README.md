# AI Chat Exporter

A Chrome/Edge browser extension to export chat conversations from **ChatGPT**, **Gemini** and **DeepSeek** to **Markdown**, **JSON**, **CSV**, **TXT**, or **PNG Image** format.

## Features

- 🚀 Export chat conversations with one click
- 📝 Support for Markdown, JSON, CSV, TXT, and PNG formats
- 🖼️ Export as styled PNG image for sharing
- 🎯 Floating popup in page center
- 🔒 Privacy-first: All processing happens locally in your browser
- 🎨 Clean and modern dark UI
- ⚡ Direct download - no save dialog popup

## Supported Platforms

| Platform | URL | Status |
|----------|-----|--------|
| ChatGPT | chatgpt.com | ✅ Supported |
| Google Gemini | gemini.google.com | ✅ Supported |
| DeepSeek | chat.deepseek.com | ✅ Supported |

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `ai-chat-exporter` folder
5. The extension icon will appear in your toolbar

## Usage

1. Navigate to [ChatGPT](https://chatgpt.com), [Gemini](https://gemini.google.com) or [DeepSeek](https://chat.deepseek.com)
2. Start or open a conversation
3. Click the AI Chat Exporter icon in your toolbar
4. A popup will appear in the center of the page
5. Select your preferred export format (MD, JSON, TXT, CSV, or Image)
6. The file will be downloaded automatically to your default download folder

## Export Formats

### Markdown (.md)
```markdown
# Chat Export

> Exported by AI Chat Exporter
> Date: 2/28/2025, 10:30:00 AM

---

👤 **You**

Hello, how are you?

---

🤖 **AI**

I'm doing well, thank you for asking!

---
```

### JSON (.json)
```json
{
  "title": "Chat Export",
  "source": "Gemini",
  "exportedAt": "2025-02-28T10:30:00.000Z",
  "messageCount": 2,
  "messages": [
    { "role": "user", "content": "Hello, how are you?" },
    { "role": "assistant", "content": "I'm doing well, thank you for asking!" }
  ]
}
```

### CSV (.csv)
```csv
Index,Role,Content,Timestamp
1,"User","Hello, how are you?","2025-02-28T10:30:00.000Z"
2,"AI","I'm doing well, thank you for asking!","2025-02-28T10:30:01.000Z"
```

### TXT (.txt)
```
AI Chat Export
Exported: 2/28/2025, 10:30:00 AM
============================================================

[USER]

Hello, how are you?

============================================================

[AI]

I'm doing well, thank you for asking!

============================================================
```

### PNG Image (.png)
A beautifully styled image with:
- Dark theme background
- Colored message bubbles (blue for user, green for AI)
- Platform and date info
- Ready for sharing on social media

## Project Structure

```
ai-chat-exporter/
├── manifest.json           # Extension manifest (Manifest V3)
├── content/
│   ├── common.js          # Shared utilities and formatters
│   ├── chatgpt.js         # ChatGPT parser
│   ├── gemini.js          # Gemini parser
│   ├── deepseek.js        # DeepSeek parser
│   └── injected-ui.js     # Floating popup UI
├── background/
│   └── service-worker.js  # Background service
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Technical Details

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Permissions**: activeTab, downloads, storage
- **Content Scripts**: Injected into ChatGPT, Gemini and DeepSeek pages
- **Export Processing**: All done locally in the browser
- **Image Export**: Uses Canvas API with SVG foreignObject

## Known Limitations

- Images within conversations are not exported (text only)
- DeepSeek's dynamic class names may require updates if the site changes
- Very long conversations may take a moment to process
- PNG export uses Canvas API which may have some rendering limitations

## Troubleshooting

### "No messages found" error
- Make sure you have an active conversation open
- Try refreshing the page and clicking the extension again

### Extension not working after site update
- Websites may change their structure. Check for extension updates.

### Image export fails
- Try a shorter conversation
- Refresh the page and try again

## Development

To modify or extend this extension:

1. Make changes to the source files
2. Go to `chrome://extensions`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

---

Made with ❤️ by AI Chat Exporter
