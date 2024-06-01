import { useNavigate } from "@solidjs/router";
import icon from "../assets/narvik-logo.svg";
import { LogicalSize, appWindow } from "@tauri-apps/api/window";
import { IconClone, IconClose, IconNew, IconOpen } from "../utils/Icons";
import ButtonIcon from "../ui/ButtonIcon";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import Input from "../ui/Input";
import ButtonBg from "../ui/ButtonBg";
import { dialog } from "@tauri-apps/api";
import { createSignal } from "solid-js";

const Welcome = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = createSignal<string>("File");
  const [dirPath, setDirPath] = createSignal<string>("");
  const [name, setName] = createSignal<string>("");

  const openDir = () => {
    dialog.open({ directory: true, multiple: false }).then((path) => {
      if (path) {
        setDirPath(path.toString() + "/");
      }
    });
    console.log(dirPath());
  };

  const openEditor = (action: string) => {
    if (action === "new") {
      if (name() === "") {
        console.log(selectedType());
        dialog.message(
          "Please enter a valid " +
            selectedType().toLocaleLowerCase() +
            " name.",
          { title: "Error", type: "error" },
        );
      } else if (dirPath() === "") {
        dialog.message("Please select a valid directory.", {
          title: "Error",
          type: "error",
        });
      } else {
        const path = "/editor";
        appWindow.setSize(new LogicalSize(1280, 800));
        navigate(path + "?path=" + dirPath() + "&name=" + name());
      }
    } else if (action === "open") {
      if (dirPath() != "") {
        const path = "/editor";
        appWindow.setSize(new LogicalSize(1280, 800));
        navigate(path + "?path=" + dirPath());
      }
    }
  };

  return (
    <div class="h-screen bg-base-200">
      {/* draggable region */}
      <div data-tauri-drag-region class="h-12 w-full" />
      {/* logo and title */}
      <div class="relative top-[5vh] flex items-center justify-center space-x-10">
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
        <Modal width={60} height={60} bgColor="bg-base-200">
          <div class="flex-col space-y-4">
            <div class="flex items-center space-x-3">
              <p class="text-xl text-content">New </p>
              <Dropdown
                items={["File", "Project", "Workspace"]}
                placeholder="File"
                width="135px"
                height="40px"
                selectedItem={setSelectedType}
              ></Dropdown>
            </div>
            <div class="flex items-center space-x-3">
              <p class="text-xl text-content">Name</p>
              <Input
                width="100%"
                height="40px"
                placeholder="e.g. helloworld"
                value=""
                onChange={setName}
              />
            </div>
            <div class="flex items-center space-x-3">
              <p class="text-xl text-content">Directory</p>
              <Input
                width="100%"
                height="40px"
                placeholder="e.g. /users/me/"
                value={dirPath()}
                onChange={setDirPath}
              />
              <ButtonBg
                text="Browse"
                width="calc(80px + 2em)"
                height="40px"
                action={openDir}
              />
            </div>
          </div>
          <div
            class="flex space-x-[12px]"
            style={{
              position: "absolute",
              bottom: `calc(20% + 1.5em)`,
              right: `calc(20% + 1.5em)`,
            }}
          >
            <ButtonBg
              text="Cancel"
              width="80px"
              height="40px"
              action={() => {
                const modal = document.getElementById(
                  "modal-new",
                ) as HTMLDialogElement;
                if (modal) {
                  modal.close();
                }
              }}
            />
            <Button
              text="Create"
              width={80}
              height={40}
              action={() => openEditor("new")}
            />
          </div>
        </Modal>
      </dialog>
      {/* buttons */}
      <div class="h-100 relative top-[15vh] w-full">
        <div class="flex justify-center space-x-20">
          {/* New button */}
          <div>
            <ButtonIcon
              size="100px"
              rounding={50}
              icon={IconNew}
              action={() => {
                const modal = document.getElementById(
                  "modal-new",
                ) as HTMLDialogElement;
                if (modal) {
                  modal.showModal();
                }
              }}
            />
            <p class="relative top-2 text-center text-content">New...</p>
          </div>
          {/* Open button */}
          <div>
            <ButtonIcon
              size="100px"
              rounding={50}
              icon={IconOpen}
              action={() => {
                openDir();
                openEditor("open");
              }}
            />
            <p class="relative top-2 text-center text-content">Open...</p>
          </div>
          {/* Clone button */}
          <div>
            <ButtonIcon
              size="100px"
              rounding={50}
              icon={IconClone}
              action={() => {
                
              }}
            />
            <p class="relative top-2 text-center text-content">Clone...</p>
          </div>
        </div>
      </div>
      <div class="absolute right-4 top-4 ml-0">
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
};

export default Welcome;
