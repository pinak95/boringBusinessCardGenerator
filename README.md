# Boring Business Card Generator

![Node.js](https://img.shields.io/badge/Node.js-v22.5.1-green) ![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-1.0.0-blue)

A CLI tool to generate personalized business card CLI packages for npm. By running `npx boring-business-card-generator`, users can answer a series of prompts about their professional details, provide npm credentials, and automatically create and publish a custom npm package. This package, when executed with `npx <your-package-name>`, displays a professional business card in the terminal, styled with a cyan double border and black background, similar to the `pinak95` card.

## How It Works

The `boring-business-card-generator` simplifies the creation of a digital business card that runs as a CLI tool. Here's a detailed breakdown of the process:

1. **Run the Generator**:

   - Execute `npx boring-business-card-generator` in your terminal.
   - The tool clears the terminal and displays a welcome message.

2. **Answer Prompts for Personal Details**:

   - **Full Name**: Your full name (e.g., "Eren Yeager").
   - **Handle**: Your social media handle (e.g., "@attacktitan").
   - **Job Profile**: Your current role or status (e.g., "Software Developer").
   - **GitHub URL**: Your GitHub profile URL (optional, e.g., "https://github.com/attacktitan").
   - **LinkedIn URL**: Your LinkedIn profile URL (optional, e.g., "https://www.linkedin.com/in/attacktitan/"). The messaging ID is automatically extracted from this URL.
   - **Portfolio URL**: Your portfolio website URL (optional, e.g., "https://attacktitan.com").
   - **Certifications**: Any certifications you hold (e.g., "AWS Certified Developer" or "none").
   - **Tagline**: A personal or professional tagline (optional, e.g., "Pinnacle of Speed, Power & Skill").
   - **Email**: Your email address (e.g., "attacktitan00@example.com").
   - **Package Name**: The npm package name for your card (e.g., "attacktitan", must be lowercase).

3. **Provide npm Credentials**:

   - **Username**: Your npm username (create an account at [npmjs.com](https://www.npmjs.com) if needed).
   - **Password**: Your npm password (input is masked for security).
   - **Email**: Your npm account email.
   - **2FA Code**: Your npm two-factor authentication code (optional, if enabled).
   - These credentials are used to authenticate with npm and publish the package.

4. **Package Generation**:

   - The tool creates a directory named after your package (e.g., `attacktitan`) containing:
     - **card.js**: The main CLI script that displays your business card with interactive options (email, LinkedIn messaging, portfolio, GitHub, exit).
     - **package.json**: Configures the package for npm publishing, including dependencies and metadata.
     - **README.md**: Documents the card’s usage, features, and contact details.
     - **LICENSE**: MIT License with your name.
   - The card is styled with a cyan double border, black background, and optimized text alignment.

5. **Authentication and Publishing**:

   - The tool authenticates with npm using your credentials.
   - Installs dependencies (`npm install`) in the generated directory.
   - Publishes the package to npm (`npm publish`).
   - If authentication or publishing fails (e.g., package name taken, invalid credentials), instructions are provided for manual publishing.

6. **Run Your Card**:
   - After publishing, run `npx <your-package-name>` (e.g., `npx attacktitan`) anywhere to display your card.
   - The card shows your details and offers interactive options to open links or exit.

### Example Output

For a user named Eren Yeager with the handle `@attacktitan`, the card might look like this (simulated terminal output):

```
┌─────────────────────────── Eren Yeager's Business Card ───────────────────────────┐
│                                                                                   │
│  Eren Yeager / @attacktitan                                                       │
│                                                                                   │
│  Work:          Software Developer                                                │
│  GitHub:        github.com/attacktitan                                            │
│  LinkedIn:      linkedin.com/in/attacktitan                                       │
│                                                                                   │
│  Card:          npx attacktitan                                                   │
│  Pinnacle of Speed, Power & Skill                                                 │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
Tip: cmd/ctrl + click on links to open them
What would you like to do?
  > Send me an email 📧
    Message me on LinkedIn 💬
    Check my GitHub 💻
    Exit
```

Selecting an option (e.g., "Send me an email") opens the default email client with `mailto:attacktitan00@example.com`.

## Features

- **Interactive CLI**: Collects user details and npm credentials via intuitive prompts.
- **Customizable Card**:
  - Displays only provided details (e.g., skips GitHub if not provided).
  - Supports optional fields for flexibility.
  - Includes a LinkedIn messaging option if a LinkedIn URL is provided.
- **Professional Styling**:
  - Cyan double border with a black background, inspired by the `pinak95` card.
  - Centered title and aligned text for readability.
- **Performance**:
  - Cached strings to reduce runtime concatenation.
  - Async operations for opening links.
- **Generated Package**:
  - ESM-based (`"type": "module"`) for modern JavaScript.
  - Dependencies: `boxen@7.1.0`, `chalk@5.3.0`, `clear@0.1.0`, `inquirer@0.9.1`, `open@10.0.3`.
  - MIT License for open-source compatibility.
- **NPM Integration**:
  - Automates authentication and publishing.
  - Handles errors with clear manual publishing steps.
- **Compatibility**: Runs on Node.js v22.5.1 or later.

## Installation

Run the tool directly via npm:

```bash
npx boring-business-card-generator
```

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/pinak95/boringBusinessCardGenerator.git
   cd boringBusinessCardGenerator
   ```
2. Ensure Node.js v22.5.1 is installed:
   ```bash
   node -v
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the tool:
   ```bash
   npm start
   ```

## Usage

1. **Run the Generator**:
   ```bash
   npx boring-business-card-generator
   ```
2. **Answer Prompts**:
   - Provide your personal details and npm credentials as described above.
3. **Generated Package**:
   - A directory (e.g., `attacktitan`) is created with `card.js`, `package.json`, `README.md`, and `LICENSE`.
4. **Publish**:
   - The tool automatically installs dependencies and publishes to npm.
   - If publishing fails, follow the manual steps:
     ```bash
     cd <your-package-name>
     npm install
     npm login
     npm publish
     ```
5. **Test Your Card**:
   ```bash
   npx <your-package-name>
   ```
6. **Optional: Update Repository**:
   - Update the `repository.url` in the generated `package.json` to your GitHub repository.
   - Push to GitHub for version control:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin <your-repo-url>
     git push -u origin main
     ```

## Dependencies

- `chalk@5.3.0`: Colors and styles terminal output.
- `clear@0.1.0`: Clears the terminal for a clean display.
- `fs-extra@11.2.0`: Handles file operations for package generation.
- `inquirer@9.2.0`: Provides interactive CLI prompts.

## Development

To contribute or modify the tool:

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/pinak95/boringBusinessCardGenerator.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Edit `index.js` (uses ESM with `"type": "module"`).
4. Test changes:
   ```bash
   npm start
   ```
5. Submit a pull request to [pinak95/boringBusinessCardGenerator](https://github.com/pinak95/boringBusinessCardGenerator).

## Publishing

To publish the `boring-business-card-generator` tool to npm:

```bash
npm login
npm publish
```

Ensure you have publishing rights for the `boring-business-card-generator` package.

## Troubleshooting

- **NPM Authentication Issues**:
  - Verify your npm account at [npmjs.com](https://www.npmjs.com).
  - Ensure correct username, password, and email.
  - For 2FA, provide a valid code or disable it temporarily.
- **Publishing Errors**:
  - If the package name is taken, use a unique name (e.g., `@username/card`).
  - For 403 errors, increment the version in `package.json` (e.g., `npm version patch`).
- **Dependencies**:
  - If errors occur, delete `node_modules` and `package-lock.json`, then:
    ```bash
    npm install
    ```
- **Node.js Version**:
  - Confirm Node.js v22.5.1:
    ```bash
    node -v
    ```
- **Logs**:
  - Check `~/.npm/_logs` (Linux/macOS) or `C:\Users\<YourUser>\AppData\Local\npm-cache\_logs` (Windows) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

Created by Pinak Thakar (@pinak95):

- Email: [pinak.thakar95@gmail.com](mailto:ppinak.thakar@example.com)
- LinkedIn: [pinak95](https://linkedin.com/pin/jpinak)
- Portfolio: [pinak95.onrender.com](https://pinak95.onrender.com)
- GitHub: [pinak95](https://github.com/pignak95)

Run `npx boring-business-card-generator` to create your own professional CLI business card!
