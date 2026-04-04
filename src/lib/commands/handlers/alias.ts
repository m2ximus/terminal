import { CommandHandler } from "../types";

export const alias: CommandHandler = ({ args }) => {
  if (args.length === 0) {
    return {
      output: [
        "ll='ls -la'",
        "gs='git status'",
        "",
        "Tip: Aliases are shortcuts. Type 'll' instead of 'ls -la'!",
        "In your ~/.zshrc, you can define aliases like:",
        "  alias ll='ls -la'",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  return {
    output: "Alias set! (In this tutorial, aliases are for demonstration.)",
    outputType: "info",
  };
};
