import { useNavigate } from "@solidjs/router";
import icon from "../assets/narvik-logo.svg";
import { LogicalSize, appWindow } from "@tauri-apps/api/window";
import { IconClone, IconClose, IconNew, IconOpen } from "../utils/Icons";
import ButtonIcon from "../ui/ButtonIcon";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import ButtonTransparent from "../ui/ButtonTransparent";
import Dropdown from "../ui/Dropdown";

function Welcome() {
  const navigate = useNavigate();

  const openEditor = () => {
    const path = `/editor`;
    appWindow.setSize(new LogicalSize(1280, 800));
    navigate(path);
  };

  return (
    <div class="h-screen bg-base-200">
      {/* draggable region */}
      <div data-tauri-drag-region class="w-full h-12" />
      {/* logo and title */}
      <div class="flex justify-center items-center space-x-10 relative top-[5vh]">
        <img
          src={icon}
          alt="icon"
          width="200vh"
          height="120vh"
          draggable="false"
        />
        <h1 class="text-9xl text-content">narvik</h1>
      </div>
      {/* pop-ups */}
      <dialog id="modal-new">
        <Modal width={80} height={80} bgColor="bg-base-200">
          <div>
            <div class="flex space-x-3 items-center">
              <p class="text-xl text-content text-bottom">New </p>
              <Dropdown
                items={["File", "Project", "Workspace"]}
                width="150px"
                height="40px"
              ></Dropdown>
            </div>
          </div>
          <div
            class="flex space-x-[12px]"
            style={{
              position: "absolute",
              bottom: `calc(10% + 1rem)`,
              right: `calc(10% + 1rem)`,
            }}
            tabIndex={-1}
          >
            <ButtonTransparent
              text="Cancel"
              width={80}
              height={40}
              action={() => {
                const modal = document.getElementById(
                  "modal-new"
                ) as HTMLDialogElement;
                if (modal) {
                  modal.close();
                }
              }}
            />
            <Button text="Create" width={80} height={40} action={openEditor} />
          </div>
        </Modal>
      </dialog>
      {/* buttons */}
      <div class="w-full h-100 relative top-[15vh]">
        <div class="flex justify-center space-x-20">
          {/* New button */}
          <div>
            <ButtonIcon
              size="100px"
              rounding={50}
              icon={IconNew}
              action={() => {
                const modal = document.getElementById(
                  "modal-new"
                ) as HTMLDialogElement;
                if (modal) {
                  modal.showModal();
                }
              }}
            />
            <p class="text-center text-content relative top-2">New...</p>
          </div>
          {/* Open button */}
          <div>
            <ButtonIcon
              size="100px"
              rounding={50}
              icon={IconOpen}
              action={() => {
                const modal = document.getElementById(
                  "modal-open"
                ) as HTMLDialogElement;
                if (modal) {
                  modal.showModal();
                }
              }}
            />
            <p class="text-center text-content relative top-2">Open...</p>
          </div>
          {/* Clone button */}
          <div>
            <ButtonIcon
              size="100px"
              rounding={50}
              icon={IconClone}
              action={openEditor}
            />
            <p class="text-center text-content relative top-2">Clone...</p>
          </div>
        </div>
      </div>
      <div class="absolute top-4 right-4 ml-0">
        <button
          class="transition ease-in-out hover:opacity-70"
          onClick={() => appWindow.close()}
        >
          <div class="flex justify-center">
            <IconClose />
          </div>
        </button>
      </div>
    </div>
  );
}

export default Welcome;
