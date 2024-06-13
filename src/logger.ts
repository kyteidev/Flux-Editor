import path from "path-browserify";
import { fs } from "@tauri-apps/api";
import { appLogDir } from "@tauri-apps/api/path";

const currentTime = new Date();
let logFileName: string;

export const initLogger = () => {
  logFileName = `Narvik-${currentTime.getFullYear()}-${currentTime.getMonth() + 1}-${currentTime.getDate()}-${currentTime.getDay()} ${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.log`;
};

export const logger = async (error: boolean, file: string, message: string) => {
  const appLogDirPath = await appLogDir();

  const logPath = path.join(appLogDirPath, `${logFileName}.log`);

  const timeInfo = `[${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}]`;

  if (await fs.exists(appLogDirPath)) {
    await fs.writeFile(
      logPath,
      `${timeInfo} [${error ? "ERROR" : "LOG"}] - ${file} - ${message}\n`,
    );
  } else {
    await fs.createDir(appLogDirPath);
    await fs.writeFile(
      logPath,
      `${timeInfo} [${error ? "ERROR" : "LOG"}] - ${file} - ${message}\n`,
    );
  }
};
