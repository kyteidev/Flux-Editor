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
import { cloneRepo, getRepoPath } from "../utils/git/clone.ts";
import { checkDirValidity } from "../utils/checkDir.ts";

const Welcome = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = createSignal<string>("File");
  // used as directory path for new open, and clone functions
  const [dirPath, setDirPath] = createSignal<string>("");
  const [name, setName] = createSignal<string>("");

  const [isCloning, setIsCloning] = createSignal<boolean>(false);

  const openDir = () => {
    dialog.open({ directory: true, multiple: false }).then((path) => {
      if (path) {
        setDirPath(path.toString() + "/");
      }
    });
  };

  const clone = async () => {
    if (dirPath() != "") {
      try {
        setIsCloning(true);
        await cloneRepo(dirPath());
        setIsCloning(false);
        openEditor("clone");
      } catch (error) {
        dialog.message(`${error}`, {
          title: "Failed to clone repository",
          type: "error",
        });
        console.error(`Error cloning repository: ${error}`);
      }
    } else {
      dialog.message("Please enter a valid URL.", {
        title: "Failed to clone repository",
        type: "error",
      });
    }
  };

  const openEditor = (action: string) => {
    const editorPath = "/editor";
    if (action === "new") {
      if (name() === "") {
        console.log(selectedType());
        dialog.message(
          "Please enter a valid " +
            selectedType().toLocaleLowerCase() +
            " name.",
          { title: "Error", type: "error" },
        );
      } else if (dirPath() === "" || checkDirValidity(dirPath()) === false) {
        dialog.message("Please select a valid directory.", {
          title: "Error",
          type: "error",
        });
      } else {
        appWindow.setSize(new LogicalSize(1280, 800));
        navigate(editorPath + "?path=" + dirPath() + "&name=" + name());
      }
    } else if (action === "open") {
      if (dirPath() != "") {
        appWindow.setSize(new LogicalSize(1280, 800));
        navigate(editorPath + "?path=" + dirPath());
      }
    } else if (action === "clone") {
      if (dirPath() != "") {
        appWindow.setSize(new LogicalSize(1280, 800));
        navigate(editorPath + "?path=" + getRepoPath());
      }
    }
  };

  return (
    <div class="h-screen select-none bg-base-200">
      {/* draggable region */}
      <div data-tauri-drag-region class="h-12 w-full" />
      {/* logo and title */}
      <div class="relative top-[5vh] flex items-center justify-center space-x-10">
        <img
          src={icon}
          alt="icon"
          draggable="false"
          style={{ width: "200px", height: "auto" }}
        />
        <h1 class="text-9xl text-content">narvik</h1>
      </div>
      {/* new-modal */}
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
      {/* clone-modal */}
      <dialog id="modal-clone">
        <Modal width={60} height={35} bgColor="bg-base-200">
          <div class="flex-col space-y-3">
            <div class="flex items-center space-x-3">
              <p class="inline-block text-xl text-content">URL</p>
              <Input
                width="100%"
                height="40px"
                placeholder="e.g. https://github.com/narvikdev/narvik.git"
                value=""
                onChange={setDirPath}
              />
            </div>
          </div>
          <div
            class="flex space-x-[12px]"
            style={{
              position: "absolute",
              bottom: `calc(32.5% + 1.5em)`,
              right: `calc(20% + 1.5em)`,
            }}
          >
            <ButtonBg
              text="Cancel"
              width="80px"
              height="40px"
              action={() => {
                const modal = document.getElementById(
                  "modal-clone",
                ) as HTMLDialogElement;
                if (modal) {
                  modal.close();
                }
              }}
            />
            <Button
              text="Clone"
              width={80}
              height={40}
              loading={isCloning()}
              action={clone}
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
                const modal = document.getElementById(
                  "modal-clone",
                ) as HTMLDialogElement;
                if (modal) {
                  modal.showModal();
                }
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
