#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import clear from "clear";
import { execSync } from "child_process";

// Clear console
clear();

console.log(chalk.cyan.bold("Welcome to the Boring Business Card Generator!"));
console.log(
  chalk.gray(
    "Answer the following questions to create and publish your personalized business card CLI.\n"
  )
);

// Verify inquirer is loaded
if (!inquirer.createPromptModule) {
  console.error(
    chalk.red.bold(
      "Error: Failed to load inquirer module. Please run `npm install` to ensure dependencies are installed."
    )
  );
  process.exit(1);
}

// Define prompts for user details
const userQuestions = [
  {
    type: "input",
    name: "fullName",
    message: "What is your full name?",
    validate: (input) => (input.trim() ? true : "Full name is required."),
  },
  {
    type: "input",
    name: "handle",
    message: "What is your common social media handle (e.g., @username)?",
    validate: (input) => (input.trim() ? true : "Handle is required."),
  },
  {
    type: "input",
    name: "jobProfile",
    message: "What is your current job profile? (e.g., Software Developer)",
    validate: (input) => (input.trim() ? true : "Job profile is required."),
  },
  {
    type: "input",
    name: "github",
    message:
      "What is your GitHub profile URL or username? (Optional, press Enter to skip)",
    default: "",
    filter: (input) => {
      if (!input.trim()) return "";
      if (/^https?:\/\//.test(input)) return input;
      return `https://github.com/${input}`;
    },
  },
  {
    type: "input",
    name: "linkedin",
    message:
      "What is your LinkedIn profile URL or username? (e.g., https://linkedin.com/in/username or username, press Enter to skip)",
    default: "",
    validate: (input) => {
      if (!input.trim()) return true;
      if (/^[a-zA-Z0-9_-]+$/.test(input)) return true;
      if (
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(input)
      )
        return true;
      return "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username) or username.";
    },
    filter: (input) => {
      if (!input.trim()) return "";
      if (/^https?:\/\//.test(input)) return input;
      return `https://linkedin.com/in/${input}`;
    },
  },
  {
    type: "input",
    name: "portfolio",
    message:
      "What is your portfolio website URL? (Optional, e.g., example.com or https://example.com, press Enter to skip)",
    default: "",
    validate: (input) => {
      if (!input.trim()) return true;
      const trimmed = input.trim();
      if (
        /^[a-zA-Z0-9][a-zA-Z0-9-.]+\.[a-zA-Z]{2,}$/.test(trimmed) ||
        /^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-.]+\.[a-zA-Z]{2,}/.test(trimmed)
      ) {
        return true;
      }
      return "Please enter a valid hostname (e.g., example.com) or URL (e.g., https://example.com).";
    },
    filter: (input) => {
      if (!input.trim()) return "";
      const trimmed = input.trim();
      if (/^https?:\/\//.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    },
  },
  {
    type: "input",
    name: "certifications",
    message:
      "List any certifications (e.g., AWS Certified Developer, none if none)",
    default: "none",
  },
  {
    type: "input",
    name: "tagline",
    message: "What is your tagline? (Optional, press Enter to skip)",
    default: "",
  },
  {
    type: "input",
    name: "email",
    message: "What is your email address?",
    validate: (input) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
        ? true
        : "Please enter a valid email.",
  },
  {
    type: "input",
    name: "packageName",
    message:
      "What should be the npm package name for your card? (e.g., your handle without @ or @scope/name for scoped packages)",
    validate: (input) => {
      if (!input.trim()) return "Package name must be non-empty.";
      if (/[A-Z]/.test(input)) return "Package name must be lowercase.";
      if (!/^[a-z][a-z0-9-]*$/.test(input.replace(/^@[^/]+\//, ""))) {
        return "Package name must start with a letter and contain only lowercase letters, numbers, or hyphens.";
      }
      return true;
    },
  },
];

// Define prompts for npm credentials
const npmQuestions = [
  {
    type: "input",
    name: "npmUsername",
    message: "Enter your npm username:",
    validate: (input) => (input.trim() ? true : "Username is required."),
  },
  {
    type: "password",
    name: "npmPassword",
    message: "Enter your npm password:",
    mask: "*",
    validate: (input) => (input.trim() ? true : "Password is required."),
  },
  {
    type: "input",
    name: "npmEmail",
    message: "Enter your npm email address:",
    validate: (input) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
        ? true
        : "Please enter a valid email.",
  },
  {
    type: "input",
    name: "npm2FACode",
    message:
      "Enter your npm two-factor authentication code (if enabled, press Enter to skip):",
    default: "",
  },
];

// Define prompt for publish-time 2FA OTP
const publish2FAQuestion = [
  {
    type: "input",
    name: "publish2FACode",
    message: "Enter your npm two-factor authentication code for publishing:",
    validate: (input) =>
      input.trim()
        ? true
        : "2FA code is required for publishing with 2FA enabled.",
  },
];

// Function to extract LinkedIn messaging ID from URL
const getLinkedInMessageId = (linkedinUrl) => {
  if (!linkedinUrl) return "";
  const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/]+)/);
  return match ? match[1] : "";
};

// Generate card.js content
const generateCardJs = ({
  fullName,
  handle,
  jobProfile,
  github,
  linkedin,
  portfolio,
  certifications,
  tagline,
  email,
  packageName,
}) => {
  const linkedinMessage = getLinkedInMessageId(linkedin);
  return `#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";
import open from "open";
import clear from "clear";

// Clear console for clean presentation
clear();

// Cache prompt module for reuse
const prompt = inquirer.createPromptModule();

// Define interactive questions
const questions = [
  {
    type: "list",
    name: "action",
    message: chalk.cyan("What would you like to do?"),
    choices: [
      {
        name: \`Send me an \${chalk.cyan.bold("email")} 📧\`,
        value: async () => {
          try {
            await open("mailto:${email}");
            console.log(chalk.green("\\nEmail client opened. Looking forward to your message!\\n"));
          } catch (error) {
            console.error(chalk.red("\\nFailed to open email client: " + error.message + "\\n"));
          }
        },
      },
      ${
        linkedinMessage
          ? `
      {
        name: \`Message me on \${chalk.blue.bold("LinkedIn")} 💬\`,
        value: async () => {
          try {
            await open("https://www.linkedin.com/messaging/thread/new/?recipient=${linkedinMessage}");
            console.log(chalk.green("\\nLinkedIn messaging opened. Let's connect!\\n"));
          } catch (error) {
            console.error(chalk.red("\\nFailed to open LinkedIn messaging: " + error.message + "\\n"));
          }
        },
      },
      `
          : ""
      }
      ${
        portfolio
          ? `
      {
        name: \`Visit my \${chalk.green.bold("portfolio")} 🌐\`,
        value: async () => {
          try {
            await open("${portfolio}");
            console.log(chalk.green("\\nPortfolio opened. Explore my work!\\n"));
          } catch (error) {
            console.error(chalk.red("\\nFailed to open portfolio: " + error.message + "\\n"));
          }
        },
      },
      `
          : ""
      }
      ${
        github
          ? `
      {
        name: \`Check my \${chalk.blue.bold("GitHub")} 💻\`,
        value: async () => {
          try {
            await open("${github}");
            console.log(chalk.green("\\nGitHub opened. See my projects!\\n"));
          } catch (error) {
            console.error(chalk.red("\\nFailed to open GitHub: " + error.message + "\\n"));
          }
        },
      },
      `
          : ""
      }
      {
        name: "Exit",
        value: () => {
          console.log(chalk.white("\\nThanks for stopping by!\\n"));
        },
      },
    ],
  },
];

// Define professional boxen styling
const options = {
  padding: 1,
  margin: 1,
  borderStyle: "double",
  borderColor: "cyan",
  backgroundColor: "black",
  title: chalk.bold.cyan("${fullName}'s Business Card"),
  titleAlignment: "center",
};

// Data object with user details
const data = {
  name: chalk.bold.white("${fullName}"),
  handle: chalk.bold.gray("${handle}"),
  work: chalk.white("${jobProfile}"),
  ${
    github
      ? `github: chalk.gray("https://github.com/") + chalk.white.bold("${github
          .split("/")
          .pop()}"),`
      : ""
  }
  ${
    linkedin
      ? `linkedin: chalk.gray("https://linkedin.com/in/") + chalk.white.bold("${linkedin
          .split("/")
          .pop()}"),`
      : ""
  }
  ${portfolio ? `portfolio: chalk.cyan.bold("${portfolio}"),` : ""}
  ${
    certifications !== "none"
      ? `certification: chalk.white("${certifications}"),`
      : ""
  }
  npx: chalk.redBright("npx") + " " + chalk.white.bold("${packageName.replace(
    /^@[^/]+\//,
    ""
  )}"),
  labelWork: chalk.white.bold("Work:          "),
  ${github ? `labelGitHub: chalk.white.bold("GitHub:        "),` : ""}
  ${linkedin ? `labelLinkedIn: chalk.white.bold("LinkedIn:      "),` : ""}
  ${portfolio ? `labelPortfolio: chalk.white.bold("Portfolio:     "),` : ""}
  ${
    certifications !== "none"
      ? `labelCertification: chalk.white.bold("Certification: "),`
      : ""
  }
  labelCard: chalk.white.bold("Card:          "),
};

// Cache formatted strings to reduce runtime concatenation
const newline = "\\n";
const heading = \`\${data.name} / \${data.handle}\`;
const working = \`\${data.labelWork}\${data.work}\`;
${github ? `const githubing = \`\${data.labelGitHub}\${data.github}\`;` : ""}
${
  linkedin
    ? `const linkedining = \`\${data.labelLinkedIn}\${data.linkedin}\`;`
    : ""
}
${
  portfolio
    ? `const porting = \`\${data.labelPortfolio}\${data.portfolio}\`;`
    : ""
}
${
  certifications !== "none"
    ? `const certing = \`\${data.labelCertification}\${data.certification}\`;`
    : ""
}
const carding = \`\${data.labelCard}\${data.npx}\`;
${
  tagline
    ? `const tagline = chalk.italic.white("${tagline}");`
    : `const tagline = "";`
}

// Build output with aligned formatting
const output = [
  heading,
  newline,
  working,
  ${github ? "githubing," : ""}
  ${linkedin ? "linkedining," : ""}
  ${portfolio ? "porting," : ""}
  ${certifications !== "none" ? "certing," : ""}
  newline,
  carding,
  ${tagline ? "newline, tagline," : ""}
].filter(Boolean).join(newline);

// Display card
console.log(boxen(output, options));

// Display tip for interactivity
console.log(
  chalk.gray(\`Tip: \${chalk.cyan("cmd/ctrl + click")} on links to open them\`)
);

// Execute prompt
prompt(questions).then(({ action }) => action());
`;
};

// Generate package.json content
const generatePackageJson = ({ packageName, fullName }) => ({
  name: packageName,
  version: "1.0.0",
  description: `Professional business card for ${fullName}`,
  main: "card.js",
  type: "module",
  bin: {
    [packageName.replace(/^@[^/]+\//, "")]: "card.js",
  },
  scripts: {
    start: "node card.js",
    test: 'echo "Error: no test specified" && exit 1',
    prepublishOnly: "node card.js",
  },
  repository: {
    type: "git",
    url: "git+https://github.com/USERNAME/REPO.git",
  },
  files: ["card.js", "package.json", "README.md", "LICENSE"],
  keywords: [packageName, "businesscard", "npxcard", "npmcard", "developer"],
  author: fullName,
  license: "MIT",
  dependencies: {
    boxen: "^7.1.1",
    chalk: "^5.3.0",
    clear: "^0.1.0",
    inquirer: "^9.2.12",
    open: "^10.1.0",
  },
});

// Generate README.md content
const generateReadme = ({
  fullName,
  handle,
  jobProfile,
  github,
  linkedin,
  portfolio,
  certifications,
  tagline,
  email,
  packageName,
}) => {
  const linkedinMessage = getLinkedInMessageId(linkedin);
  // Normalize portfolio URL for README
  const normalizedPortfolio =
    portfolio && !/^https?:\/\//.test(portfolio)
      ? `https://${portfolio}`
      : portfolio;
  return `
# ${fullName}'s Business Card CLI

![Node.js](https://img.shields.io/badge/Node.js-v22.5.1-green) ![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-1.0.0-blue)

A professional CLI-based business card for ${fullName} (${handle}), showcasing my skills and contact information. Run it with \`npx ${packageName}\` to explore my portfolio, GitHub, LinkedIn, or send me a message.

## About Me
- **Name**: ${fullName} (${handle})
- **Status**: ${jobProfile}
${certifications !== "none" ? `- **Certification**: ${certifications}` : ""}
${tagline ? `- **Tagline**: ${tagline}` : ""}
- **Links**:
  ${normalizedPortfolio ? `- [Portfolio](${normalizedPortfolio})` : ""}
  ${github ? `- [GitHub](${github})` : ""}
  ${linkedin ? `- [LinkedIn](${linkedin})` : ""}
  - Email: ${email}

## Features
- Interactive CLI interface with options to:
  - Send an email 📧
  ${linkedinMessage ? "- Message me on LinkedIn 💬" : ""}
  ${normalizedPortfolio ? "- Visit my portfolio 🌐" : ""}
  ${github ? "- Check my GitHub 💻" : ""}
  - Exit
- Professional styling with a double-bordered, cyan-themed card on a black background
- Optimized for performance with cached strings and async operations

## Installation
Run the card directly via npm:
\`\`\`bash
npx ${packageName}
\`\`\`

### Local Setup
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/USERNAME/REPO.git
   cd REPO
   \`\`\`
2. Ensure Node.js v22.5.1 is installed.
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Run the card:
   \`\`\`bash
   npm start
   \`\`\`

## Dependencies
- \`boxen@7.1.1\`: Renders the card with a styled box
- \`chalk@5.3.0\`: Adds color and formatting to text
- \`inquirer@9.2.12\`: Provides interactive CLI prompts
- \`open@10.1.0\`: Opens links in the default browser or email client
- \`clear@0.1.0\`: Clears the console for a clean display

## Development
To contribute or modify the card:
1. Fork and clone the repository.
2. Install dependencies with \`npm install\`.
3. Edit \`card.js\` (uses ESM with \`"type": "module"\`).
4. Test changes with \`npm start\`.
5. Submit a pull request to [USERNAME/REPO](https://github.com/USERNAME/REPO).

## Publishing
To publish an updated version to npm:
\`\`\`bash
npm publish
\`\`\`
Ensure you have npm publishing rights for the \`${packageName}\` package.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
Connect with me:
- Email: [${email}](mailto:${email})
${linkedin ? `- LinkedIn: [${linkedin.split("/").pop()}](${linkedin})` : ""}
${
  normalizedPortfolio
    ? `- Portfolio: [${normalizedPortfolio}](${normalizedPortfolio})`
    : ""
}
${github ? `- GitHub: [${github.split("/").pop()}](${github})` : ""}

Run \`npx ${packageName}\` to interact with my card and explore my work!
`;
};

// Generate LICENSE content
const generateLicense = ({ fullName }) => `
MIT License

Copyright (c) 2025 ${fullName}

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
`;

// Function to authenticate with npm
async function authenticateNpm(
  { npmUsername, npmPassword, npmEmail, npm2FACode },
  prompt,
  maxRetries = 2
) {
  let attempts = 0;
  while (attempts <= maxRetries) {
    try {
      console.log(
        chalk.yellow("Close all browsers to avoid authentication errors.")
      );
      // Create temporary .npmrc file
      const npmrcPath = path.join(process.cwd(), ".npmrc");
      const npmrcContent = `
        //registry.npmjs.org/:_authToken=\${process.env.NPM_TOKEN}
        email=${npmEmail}
      `;
      await fs.writeFile(npmrcPath, npmrcContent);

      // Attempt npm login
      const loginCommand = `npm login --registry=https://registry.npmjs.org/`;
      const loginInput = `${npmUsername}\n${npmPassword}\n${npmEmail}${
        npm2FACode ? `\n${npm2FACode}` : ""
      }\n`;
      execSync(loginCommand, { input: loginInput, stdio: "inherit" });

      // Read auth token from .npmrc
      const globalNpmrcPath = path.join(
        process.env.USERPROFILE || process.env.HOME,
        ".npmrc"
      );
      let token = "";
      if (await fs.pathExists(globalNpmrcPath)) {
        const npmrcContent = await fs.readFile(globalNpmrcPath, "utf8");
        const tokenMatch = npmrcContent.match(
          /\/\/registry\.npmjs\.org\/:_authToken=(.+)/
        );
        if (tokenMatch) token = tokenMatch[1];
      }

      // Store token in project .npmrc
      await fs.writeFile(
        npmrcPath,
        `//registry.npmjs.org/:_authToken=${token}\nemail=${npmEmail}`
      );

      console.log(chalk.green.bold("Successfully authenticated with npm!"));
      return { success: true, npmrcPath, token };
    } catch (error) {
      attempts++;
      console.error(
        chalk.red.bold(`Authentication attempt ${attempts} failed: `),
        error.message
      );
      if (attempts > maxRetries) {
        console.log(chalk.yellow("Maximum authentication attempts reached."));
        return { success: false };
      }
      console.log(chalk.cyan("Retrying authentication..."));
      const retryAnswers = await prompt([
        {
          type: "input",
          name: "npm2FACode",
          message:
            "Enter a new npm two-factor authentication code (if enabled, press Enter to skip):",
          default: "",
        },
      ]);
      npm2FACode = retryAnswers.npm2FACode;
    }
  }
  return { success: false };
}

// Function to publish the package with retry on name conflict
async function publishPackage({ outputDir, userAnswers, prompt, npmAnswers }) {
  let currentPackageName = userAnswers.packageName;
  let attemptCount = 0;
  const maxAttempts = 3;
  const maxNpxRetries = 2;

  while (attemptCount < maxAttempts) {
    let npmrcPath;
    try {
      // Test local execution
      console.log(
        chalk.cyan(`Testing local execution of ${currentPackageName}...`)
      );
      execSync("node card.js", { cwd: outputDir, stdio: "inherit" });

      // Clear npm cache
      console.log(chalk.cyan("Clearing npm cache before publishing..."));
      execSync("npm cache clean --force", { stdio: "inherit" });

      // Ensure authentication for publishing
      const authResult = await authenticateNpm(npmAnswers, prompt);
      if (!authResult.success) {
        throw new Error("Failed to authenticate for publishing");
      }
      npmrcPath = authResult.npmrcPath;

      // Prompt for 2FA OTP for publishing if 2FA was used
      let publish2FACode = "";
      if (npmAnswers.npm2FACode) {
        const publishAnswers = await prompt(publish2FAQuestion);
        publish2FACode = publishAnswers.publish2FACode;
      }

      // Publish package
      console.log(chalk.cyan(`Publishing ${currentPackageName} to npm...`));
      const publishCommand = currentPackageName.startsWith("@")
        ? `npm publish --access=public${
            publish2FACode ? ` --otp=${publish2FACode}` : ""
          }`
        : `npm publish${publish2FACode ? ` --otp=${publish2FACode}` : ""}`;
      execSync(publishCommand, { cwd: outputDir, stdio: "inherit" });

      // Wait for registry propagation
      console.log(chalk.cyan("Waiting for package to propagate..."));
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Test npx execution with retries
      let npxSuccess = false;
      for (let retry = 0; retry <= maxNpxRetries; retry++) {
        try {
          console.log(
            chalk.cyan(
              `Testing npx execution of ${currentPackageName} (attempt ${
                retry + 1
              }/${maxNpxRetries + 1})...`
            )
          );
          execSync(`npx ${currentPackageName}`, { stdio: "inherit" });
          npxSuccess = true;
          break;
        } catch (npxError) {
          console.warn(
            chalk.yellow(
              `npx test failed (attempt ${retry + 1}): ${npxError.message}`
            )
          );
          if (retry < maxNpxRetries) {
            console.log(chalk.cyan("Retrying after delay..."));
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }

      if (!npxSuccess) {
        throw new Error("npx test failed after retries");
      }

      console.log(
        chalk.green.bold(
          `\nSuccess! Your business card is published as ${currentPackageName}!`
        )
      );
      console.log(
        chalk.cyan(`Run it anywhere with: npx ${currentPackageName}`)
      );
      console.log(
        chalk.gray(
          "Note: Update the repository URL in package.json and push to your GitHub repository for future updates."
        )
      );
      return true;
    } catch (error) {
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("403") ||
        errorMessage.includes("ENEEDAUTH") ||
        errorMessage.includes("cannot publish") ||
        errorMessage.includes("Package name too")
      ) {
        console.error(
          chalk.red.bold(`Error publishing '${currentPackageName}': `),
          errorMessage
        );
        attemptCount++;
        if (attemptCount >= maxAttempts) {
          console.log(
            chalk.yellow(
              `Maximum attempts (${maxAttempts}) reached. You can publish manually later.`
            )
          );
          break;
        }
        console.log(
          chalk.cyan(
            `Please choose a different package name (e.g., @${userAnswers.handle.replace(
              /^@/,
              ""
            )}/${currentPackageName
              .split("/")
              .pop()} or ${currentPackageName}-card).`
          )
        );
        const { newPackageName } = await prompt([
          {
            type: "input",
            name: "newPackageName",
            message:
              "Enter a new package name (or press Enter to skip publishing):",
            validate: (input) => {
              if (!input.trim()) return true;
              if (/[A-Z]/.test(input)) return "Package name must be lowercase.";
              if (!/^[a-z][a-z0-9-]*$/.test(input.replace(/^@[^/]+\//, ""))) {
                return "Package name must start with a letter and contain only lowercase letters, numbers, or hyphens.";
              }
              return true;
            },
            default: `@${userAnswers.handle.replace(
              /^@/,
              ""
            )}/${currentPackageName.split("/").pop()}`,
          },
        ]);
        if (!newPackageName) {
          console.log(chalk.yellow("Publishing skipped."));
          break;
        }
        currentPackageName = newPackageName;
        userAnswers.packageName = currentPackageName;
        await fs.writeFile(
          path.join(outputDir, "package.json"),
          JSON.stringify(generatePackageJson(userAnswers), null, 2)
        );
        await fs.writeFile(
          path.join(outputDir, "card.js"),
          generateCardJs(userAnswers)
        );
        await fs.writeFile(
          path.join(outputDir, "README.md"),
          generateReadme(userAnswers)
        );
      } else {
        console.error(chalk.red.bold("Publishing failed: "), errorMessage);
        break;
      }
    } finally {
      // Clean up .npmrc
      if (npmrcPath && (await fs.pathExists(npmrcPath))) {
        await fs.remove(npmrcPath);
      }
    }
  }
  console.log(chalk.yellow("You can try publishing manually by running:"));
  console.log(chalk.yellow(`  cd ${outputDir}`));
  console.log(chalk.yellow("  npm install"));
  console.log(chalk.yellow("  npm login"));
  console.log(
    chalk.yellow(
      `  npm publish${
        currentPackageName.startsWith("@") ? " --access=public" : ""
      }`
    )
  );
  console.log(
    chalk.gray(
      "Note: Update the repository URL in package.json before publishing."
    )
  );
  return false;
}

// Main function to run the CLI
async function run() {
  try {
    const prompt = inquirer.createPromptModule();

    // Collect user details
    const userAnswers = await prompt(userQuestions);
    const { fullName } = userAnswers;
    const outputDir = path.join(process.cwd(), userAnswers.packageName);

    // Create project directory
    await fs.ensureDir(outputDir);

    // Write generated files
    await fs.writeFile(
      path.join(outputDir, "card.js"),
      generateCardJs(userAnswers)
    );
    await fs.writeFile(
      path.join(outputDir, "package.json"),
      JSON.stringify(generatePackageJson(userAnswers), null, 2)
    );
    await fs.writeFile(
      path.join(outputDir, "README.md"),
      generateReadme(userAnswers)
    );
    await fs.writeFile(
      path.join(outputDir, "LICENSE"),
      generateLicense({ fullName })
    );

    // Set executable permissions for card.js
    await fs.chmod(path.join(outputDir, "card.js"), 0o755);

    console.log(
      chalk.green.bold(`\nBusiness card CLI generated in ${outputDir}\n`)
    );

    // Collect npm credentials
    console.log(chalk.cyan.bold("Now, let's publish your card to npm."));
    console.log(
      chalk.gray(
        "Please provide your npm credentials. Create an account at https://www.npmjs.org if you don't have one.\n"
      )
    );
    console.log(
      chalk.yellow(
        "Close all browsers before proceeding to avoid authentication errors."
      )
    );
    const npmAnswers = await prompt(npmQuestions);

    // Attempt to publish
    await publishPackage({ outputDir, userAnswers, prompt, npmAnswers });
  } catch (error) {
    console.error(
      chalk.red.bold("Error generating business card: "),
      error.message
    );
    console.log(
      chalk.yellow("Please ensure Node.js v22.5.1 is installed and try again.")
    );
  }
}

run();
