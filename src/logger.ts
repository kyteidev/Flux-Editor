/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

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
