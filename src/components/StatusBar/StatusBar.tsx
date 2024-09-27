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

import GitBranch from "./components/GitBranch";
import Lang from "./components/Lang";
import Update from "./components/Update";

const StatusBar = () => {
  return (
    <div
      class="z-50 w-screen border-t-2 border-base-100 bg-base-200 px-2 py-[2px] text-[12px]"
      style={{
        "min-height": `calc(1.5rem + 2px)`,
        "max-height": `calc(1.5rem + 2px)`,
      }}
    >
      <div class="left float-left me-auto flex space-x-2">
        <GitBranch />
        <Update />
      </div>
      <div class="right float-right ml-auto">
        <Lang />
      </div>
    </div>
  );
};

export default StatusBar;
