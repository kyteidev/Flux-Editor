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
