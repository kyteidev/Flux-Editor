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
