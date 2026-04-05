import { CommandHandler } from "../types";

export const npm: CommandHandler = ({ fs, args }) => {
  if (args.length === 0) {
    return {
      output: [
        "npm - Node Package Manager",
        "",
        "Usage: npm <command>",
        "",
        "Common commands:",
        "  npm init          Create a package.json",
        "  npm install       Install dependencies",
        "  npm start         Run the start script",
        "  npm run <script>  Run a custom script",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  if (args[0] === "init" || (args[0] === "init" && args.includes("-y"))) {
    const path = fs.resolvePath("package.json");
    fs.createFile(
      path,
      JSON.stringify(
        {
          name: "my-project",
          version: "1.0.0",
          description: "",
          main: "index.js",
          scripts: { start: "node index.js", test: 'echo "No tests yet"' },
        },
        null,
        2,
      ) + "\n",
    );
    return {
      output: "Wrote to package.json\n\npackage.json created successfully!",
      outputType: "success",
    };
  }

  if (args[0] === "install" || args[0] === "i") {
    const nmPath = fs.resolvePath("node_modules");
    if (!fs.exists(nmPath)) {
      fs.createDirectory(nmPath);
    }
    const lockPath = fs.resolvePath("package-lock.json");
    fs.createFile(lockPath, '{"lockfileVersion": 3}\n');
    return {
      output: [
        "added 127 packages in 3s",
        "",
        "14 packages are looking for funding",
        "  run `npm fund` for details",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  return {
    output: `npm ${args.join(" ")} - command simulated`,
    outputType: "info",
  };
};

export const npx: CommandHandler = ({ fs, args }) => {
  if (args.length === 0) {
    return { output: "npx: missing command", outputType: "stderr" };
  }

  if (args[0] === "create-next-app" || args[0] === "create-next-app@latest") {
    const appName = args[1] || "my-app";
    const appPath = fs.resolvePath(appName);

    fs.createDirectory(appPath);
    fs.createDirectory(appPath + "/src");
    fs.createDirectory(appPath + "/src/app");
    fs.createDirectory(appPath + "/public");
    fs.createFile(
      appPath + "/package.json",
      JSON.stringify({ name: appName, version: "0.1.0", private: true }, null, 2) + "\n",
    );
    fs.createFile(
      appPath + "/src/app/page.tsx",
      "export default function Home() {\n  return <h1>Hello World</h1>;\n}\n",
    );
    fs.createFile(
      appPath + "/src/app/layout.tsx",
      "export default function RootLayout({ children }) {\n  return <html><body>{children}</body></html>;\n}\n",
    );
    fs.createFile(appPath + "/README.md", `# ${appName}\n\nThis is a Next.js project.\n`);

    return {
      output: [
        `Creating a new Next.js app in ./${appName}`,
        "",
        "Using npm.",
        "",
        "Installing dependencies:",
        "- react",
        "- react-dom",
        "- next",
        "",
        `Success! Created ${appName}`,
        `  cd ${appName}`,
        "  npm run dev",
      ].join("\n"),
      outputType: "success",
    };
  }

  return {
    output: `npx ${args.join(" ")} - command simulated`,
    outputType: "info",
  };
};
