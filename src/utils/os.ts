import { platform } from "@tauri-apps/api/os";

export async function getOS(): Promise<string> {
  const osName = (await platform()).toString();
  return osName;
}
