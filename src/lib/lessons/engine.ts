import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { Level, Task, TaskValidation } from "@/lib/tracks/types";

export interface ValidationResult {
  passed: boolean;
  message?: string;
  showHint: boolean;
}

export class LessonEngine {
  private level: Level;
  private _currentTaskIndex: number;
  private _failedAttempts: number;

  constructor(level: Level) {
    this.level = level;
    this._currentTaskIndex = 0;
    this._failedAttempts = 0;
  }

  get currentTask(): Task | null {
    return this.level.tasks[this._currentTaskIndex] ?? null;
  }

  get currentTaskIndex(): number {
    return this._currentTaskIndex;
  }

  get isComplete(): boolean {
    return this._currentTaskIndex >= this.level.tasks.length;
  }

  get progress(): { current: number; total: number } {
    return {
      current: Math.min(this._currentTaskIndex + 1, this.level.tasks.length),
      total: this.level.tasks.length,
    };
  }

  get failedAttempts(): number {
    return this._failedAttempts;
  }

  setTaskIndex(index: number): void {
    this._currentTaskIndex = index;
    this._failedAttempts = 0;
  }

  validate(
    command: string,
    args: string[],
    flags: Record<string, boolean>,
    fs: VirtualFS,
  ): ValidationResult {
    const task = this.currentTask;
    if (!task) return { passed: false, showHint: false };

    const passed = checkValidation(task.validation, command, args, flags, fs);

    if (passed) {
      this._currentTaskIndex++;
      this._failedAttempts = 0;
      return {
        passed: true,
        message: getSuccessMessage(),
        showHint: false,
      };
    }

    this._failedAttempts++;
    return {
      passed: false,
      showHint: this._failedAttempts >= 2 && !!task.hint,
    };
  }

  reset(): void {
    this._currentTaskIndex = 0;
    this._failedAttempts = 0;
  }
}

function checkValidation(
  v: TaskValidation,
  command: string,
  args: string[],
  flags: Record<string, boolean>,
  fs: VirtualFS,
): boolean {
  switch (v.type) {
    case "command":
      if (command !== v.command) return false;
      if (v.argsContain) {
        const fullArgs = Object.keys(flags)
          .map((f) => (f.length === 1 ? `-${f}` : `--${f}`))
          .concat(args);
        return v.argsContain.every((a) => fullArgs.some((fa) => fa.includes(a)));
      }
      return true;

    case "fs_exists":
      return fs.exists(fs.resolvePath(v.path));

    case "fs_not_exists":
      return !fs.exists(fs.resolvePath(v.path));

    case "cwd_equals":
      return fs.cwd === fs.resolvePath(v.path) || fs.cwd === v.path;

    case "file_contains": {
      try {
        const content = fs.readFile(fs.resolvePath(v.path));
        return content.includes(v.content);
      } catch {
        return false;
      }
    }

    case "command_or_fs":
      if (command === v.command) {
        if (v.argsContain) {
          const fullArgs = Object.keys(flags)
            .map((f) => (f.length === 1 ? `-${f}` : `--${f}`))
            .concat(args);
          if (!v.argsContain.every((a) => fullArgs.some((fa) => fa.includes(a)))) {
            return false;
          }
        }
        return true;
      }
      if (v.fsCheck) return v.fsCheck(fs);
      return false;

    case "custom":
      return v.check(fs, command, args);

    default:
      return false;
  }
}

const SUCCESS_MESSAGES = [
  "Nice work!",
  "Nailed it!",
  "Perfect!",
  "You got it!",
  "Excellent!",
  "Well done!",
  "Great job!",
  "That's right!",
];

function getSuccessMessage(): string {
  return SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
}
