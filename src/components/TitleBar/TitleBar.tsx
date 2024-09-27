/*
Copyright © 2024 kyteidev.

This file is part of Flux Editor.

Flux Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

Flux Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Flux Editor. If not, see
<https://www.gnu.org/licenses/>.
*/

import Menu from "../Menu/Menu";
import ModuleToggle from "./components/ModuleToggle";

const TitleBar = () => {
  return (
    <header
      data-tauri-drag-region
      class="header flex w-full flex-shrink-0 space-x-2 border-b-2 border-base-100 bg-base-200 p-[5px]"
      style={{
        "min-height": `calc(1.75rem + 2px)`,
        "max-height": `calc(1.75rem + 2px)`,
      }}
    >
      <Menu />
      <ModuleToggle />
    </header>
  );
};

export default TitleBar;
