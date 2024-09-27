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

import { setHideFB, hideFB, setHideTerm, hideTerm } from "../../../App";
import ButtonIcon from "../../../ui/ButtonIcon";
import { IconFileBrowser, IconSearch, IconTerminal } from "../../Icons/Icons";
import { toggleSearch } from "../../Search/Search";

const ModuleToggle = () => {
  return (
    <div class="flex space-x-1">
      <ButtonIcon
        size="18px"
        icon={<IconFileBrowser />}
        action={() => setHideFB(!hideFB())}
      />
      <ButtonIcon
        size="18px"
        icon={<IconTerminal />}
        action={() => setHideTerm(!hideTerm())}
      />
      <ButtonIcon
        size="18px"
        icon={<IconSearch />}
        action={() => toggleSearch()}
      />
    </div>
  );
};

export default ModuleToggle;
