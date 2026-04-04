import { ParsedCommand } from "./types";

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Handle pipes: split on unquoted |
  const pipeSegments = splitOnPipe(trimmed);

  let pipedCmd: ParsedCommand | undefined;
  // Parse right-to-left so we can chain .pipe
  for (let i = pipeSegments.length - 1; i >= 0; i--) {
    const parsed = parseSingleCommand(pipeSegments[i].trim(), trimmed);
    if (parsed) {
      parsed.pipe = pipedCmd;
      pipedCmd = parsed;
    }
  }

  return pipedCmd ?? null;
}

function parseSingleCommand(segment: string, raw: string): ParsedCommand | null {
  // Handle redirects
  let redirect: ParsedCommand["redirect"];
  let cmdPart = segment;

  const appendMatch = cmdPart.match(/^(.+?)>>(.+)$/);
  const writeMatch = cmdPart.match(/^(.+?)>(.+)$/);

  if (appendMatch) {
    cmdPart = appendMatch[1].trim();
    redirect = { type: ">>", target: appendMatch[2].trim() };
  } else if (writeMatch) {
    cmdPart = writeMatch[1].trim();
    redirect = { type: ">", target: writeMatch[2].trim() };
  }

  const tokens = tokenize(cmdPart);
  if (tokens.length === 0) return null;

  const command = tokens[0];
  const restTokens = tokens.slice(1);
  const args: string[] = [];
  const flags: Record<string, boolean> = {};

  for (const token of restTokens) {
    if (token.startsWith("--")) {
      flags[token.slice(2)] = true;
    } else if (token.startsWith("-") && token.length > 1 && !token.match(/^\d/)) {
      // Split combined flags: -la -> l, a
      for (const ch of token.slice(1)) {
        flags[ch] = true;
      }
    } else {
      args.push(token);
    }
  }

  return { raw, command, args, flags, redirect };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if (ch === " " && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current) tokens.push(current);
  return tokens;
}

function splitOnPipe(input: string): string[] {
  const segments: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (ch === "|" && !inSingle && !inDouble) {
      segments.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  segments.push(current);
  return segments;
}
