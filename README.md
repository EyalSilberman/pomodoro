# Pomodoro Chrome Extension

A feature-rich Pomodoro Timer Chrome extension that helps you stay productive using the Pomodoro Technique. Track your work sessions, take structured breaks, and analyze your productivity patterns.

![Pomodoro Timer Screenshot](assets/screenshot.png)

## Features

### Core Functionality
- 🕒 25-minute work sessions
- ⏸️ Pause/Resume capability
- 🔄 5-minute break intervals
- 📊 Session tracking and statistics
- 🔔 Visual notifications
- ⚡ Automatic session transitions

### User Interface
- 🎯 Clean, minimal popup interface
- 📱 Badge timer countdown on extension icon
- 🚦 Color-coded sessions (green for work, red for break)
- 👁️ Easy-to-read timer display

### Break Management
- 🆕 Dedicated break tab with countdown
- 🎨 Red-themed break interface
- 🔄 Auto-closing break tab
- ⚙️ Configurable auto-restart option

### Analytics & Logging
- 📊 Google Sheets integration for session logging
- 📈 Real-time data export to your personal spreadsheet
- 🔐 Private and secure - data stays in your Google account
- 📅 Comprehensive session tracking with timestamps

## Installation

### From Chrome Web Store - TBD
1. ~~Visit the Chrome Web Store (link coming soon)~~
2. ~~Click "Add to Chrome"~~
3. ~~Confirm the installation~~

### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/Gerontologytech/pomodoro.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the extension directory

## Google Sheets Integration Setup

### How to Set Up Google Sheets Integration

Follow these steps to connect the extension to your personal Google Sheet. This process gives you full control over your data and script.

**Part A: Create and Deploy the Google Apps Script**

1. **Go to Google Apps Script**: Open [script.google.com](https://script.google.com) and click **New project**.
2. **Paste the Code**: Delete the default `function myFunction() {...}` and paste the entire contents of the `Code.gs` file from this repository.
3. **Configure the Script**:
   * Change the value of `SECRET_KEY` to a unique, private password of your choice.
   * Find the ID of your Google Sheet. It's in the URL: `.../spreadsheets/d/THIS_IS_THE_ID/edit`. Paste this ID as the value for `SHEET_ID`.
4. **Save the Project**: Click the floppy disk icon (Save project) and give it a name like "Pomodoro Timer Logger".
5. **Deploy as a Web App**:
   * Click the blue **Deploy** button in the top-right corner and select **New deployment**.
   * Click the gear icon next to "Select type" and choose **Web app**.
   * For "Execute as", select **Me**.
   * For "Who has access", select **Anyone**. *(This is safe because we are using a `SECRET_KEY`)*.
   * Click **Deploy**.
6. **Authorize Permissions**:
   * A popup will appear asking for authorization. Click **Authorize access**.
   * Choose your Google Account.
   * You may see a "Google hasn't verified this app" screen. This is normal. Click **Advanced**, then click **Go to [Your Script Name] (unsafe)**.
   * On the final screen, review the permissions (it will ask to access your spreadsheets) and click **Allow**.
7. **Copy the Web App URL**: After deploying, a new popup will show your **Web app URL**. Copy this URL. You will need it for the extension.

**Part B: Configure the Chrome Extension**

1. Open the Chrome Extension popup.
2. Paste the **Web App URL** you just copied into the "Google Sheets Web App URL" input field.
3. Enter the same **Secret Key** you created in the script into the "Secret Key" input field.
4. Click **Save Settings**. You are now ready to log your time!

## Usage

1. **Starting a Session**
   - Click the extension icon
   - Press "Start" to begin a 25-minute work session
   - The timer will be visible in both the popup and extension icon

2. **During Breaks**
   - A new tab will automatically open when break time starts
   - The break tab will close automatically after 5 minutes
   - If auto-restart is enabled, a new work session will begin

3. **Session Logging**
   - Sessions are automatically logged to your Google Sheet when completed
   - Both completed and incomplete sessions are tracked
   - Data includes: Date, Start Time, End Time, Session Type, Duration, Completion Status

4. **Customization**
   - Toggle auto-restart functionality
   - Configure Google Sheets integration in the popup

## Project Structure

```
pomodoro-chrome-extension/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── break.html
├── break.js
├── Code.gs              # Google Apps Script for users
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── assets/
│   ├── screenshot.png
└── README.md
```

## Development

Want to contribute? Great! Here's how:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## Troubleshooting

- **Timer not showing in icon?** Make sure you have the latest Chrome version
- **Break tab not opening?** Check if pop-ups are allowed for the extension
- **Stats not saving?** Verify that storage permission is granted

## License

MIT License

Copyright (c) [2025] [Eyal Silberman]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

See [Contributing Guidelines](CONTRIBUTING.md) for more information.

## Acknowledgments

- Inspired by the Pomodoro Technique by Francesco Cirillo
- Icon designs created with care for optimal visibility
- Built with modern Chrome Extension APIs

## Future Plans

- [ ] Customizable work/break durations
- [ ] Sound notifications
- [ ] Dark mode support
- [ ] Task labeling
- [ ] Integration with productivity tools
- [ ] Mobile sync support

## Contact

Eyal Silberman - eyal.silberman@gmail.com

Project Link: [https://github.com/EyalSilberman/pomodoro.git](https://github.com/EyalSilberman/pomodoro.git)