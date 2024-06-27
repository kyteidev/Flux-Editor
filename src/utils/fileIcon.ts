import { JSX } from "solid-js";
import * as FI from "../components/Icons/FileIcons";
import { IconGit } from "../components/Icons/Icons";

export const specialFileIcons: { [key: string]: () => JSX.Element } = {
  "tailwind.config.js": FI.Tailwind,
  "vite.config.js": FI.Vite,
  "vite.config.ts": FI.Vite,
  readme: FI.Readme,
  "readme.md": FI.Readme,
  license: FI.License,
  "license.md": FI.License,
  "package.json": FI.NodeJS,
  "package-lock.json": FI.NodeJS,
  "next.config.js": FI.NextJS,
  "next.config.ts": FI.NextJS,
};

export const fileIcons: { [key: string]: () => JSX.Element } = {
  // TODO: Add more efficient icon lookup and icons

  // code langs
  ".md": FI.Markdown,
  ".ts": FI.Typescript,
  ".js": FI.Javascript,
  ".rs": FI.Rust,
  ".py": FI.Python,
  ".html": FI.HTML,
  ".css": FI.CSS,
  ".scss": FI.SASS,
  ".sass": FI.SASS,
  ".cs": FI.CSharp,
  ".kt": FI.Kotlin,
  ".cpp": FI.CPlusPlus,
  ".svelte": FI.Svelte,
  ".php": FI.PHP,
  ".go": FI.Golang,
  ".swift": FI.Swift,
  ".java": FI.Java,
  ".sh": FI.Terminal,
  ".bat": FI.Terminal,
  ".c": FI.C,
  ".vue": FI.Vue,
  ".h": FI.CPPHeader,
  ".tsx": FI.React,
  ".jsx": FI.React,
  ".bf": FI.Brainfuck,

  // config files
  ".json": FI.Config,
  ".yaml": FI.Config,
  ".toml": FI.Config,

  // images
  ".png": FI.Image,
  ".jpg": FI.Image,
  ".jpeg": FI.Image,
  ".heic": FI.Image,
  ".gif": FI.Image,
  ".webp": FI.Image,
  ".svg": FI.SVG,

  // videos
  ".mov": FI.Video,
  ".mp4": FI.Video,
  ".avi": FI.Video,
  ".webm": FI.Video,
  ".flv": FI.Video,
  ".mkv": FI.Video,

  // other assets
  ".zip": FI.Zip,
  ".rar": FI.Zip,
  ".gitignore": IconGit,
  ".ttf": FI.Font,
  ".otf": FI.Font,
  ".woff": FI.Font,
  ".woff2": FI.Font,
  ".icns": FI.Icon,
  ".ico": FI.Icon,
  ".txt": FI.Text,
  ".rtf": FI.Text,
  ".pdf": FI.Text,
};
