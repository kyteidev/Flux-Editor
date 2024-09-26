import { createSignal, onMount } from "solid-js";
import Button from "../../ui/Button";
import Dropdown from "../../ui/Dropdown";
import Input from "../../ui/Input";
import Modal from "../../ui/Modal";
import { dialog, fs } from "@tauri-apps/api";
import { cloneRepo, getRepoPath } from "../../utils/git";
import { error, warn } from "tauri-plugin-log-api";
import { loadEditor } from "../../App";
import {
  checkDirPathValidity,
  homeDir,
  joinPath,
  pathSep,
} from "../../utils/path";

const Startup = () => {
  const [isCloning, setIsCloning] = createSignal<boolean>(false);
  const [cloneUrl, setCloneUrl] = createSignal("");
  const [closeModal, setCloseModal] = createSignal(false);
  const [selectedType, setSelectedType] = createSignal<string>("File");
  // used as directory path for new open, and clone functions
  const [dirPath, setDirPath] = createSignal<string>("");
  const [name, setName] = createSignal<string>("");

  const [homeDirPath, setHomeDirPath] = createSignal("");

  onMount(async () => {
    setHomeDirPath(await homeDir());
    setDirPath(homeDirPath());
  });

  const resetValues = () => {
    setSelectedType("File");
    setDirPath(homeDirPath());
    setName("");
  };

  const openDir = async (notNew?: boolean) => {
    dialog.open({ directory: true, multiple: false }).then((path) => {
      if (path) {
        setDirPath(path.toString() + pathSep());
      } else {
        return;
      }

      if (notNew) {
        beforeLoad("open");
      }
    });
  };

  const clone = async () => {
    if (cloneUrl() != "" && dirPath() != "") {
      setIsCloning(true);
      const result = await cloneRepo(cloneUrl(), dirPath());
      setIsCloning(false);
      if (result === "") {
        beforeLoad("clone");
      } else {
        dialog.message(result, {
          title: "Failed to clone repository",
          type: "error",
        });
      }
    } else if (cloneUrl() === "") {
      dialog.message("Please enter a valid URL.", {
        title: "Failed to clone repository",
        type: "error",
      });
      warn("Invalid URL provided for cloning");
    } else {
      dialog.message("Please enter a valid location.", {
        title: "Failed to clone repository",
        type: "error",
      });
      warn("Invalid location provided for cloning");
    }
  };

  const beforeLoad = async (action: string) => {
    switch (action) {
      case "new":
        if (name() === "") {
          dialog.message(
            "Please enter a valid " +
              selectedType().toLocaleLowerCase() +
              " name.",
            { title: "Error", type: "error" },
          );
          warn("Invalid " + selectedType().toLocaleLowerCase() + " name");
        } else if (
          dirPath() === "" ||
          checkDirPathValidity(dirPath()) === false
        ) {
          dialog.message("Please select a valid location.", {
            title: "Error",
            type: "error",
          });
          warn("Invalid location");
        } else {
          switch (selectedType()) {
            case "File":
              if (await fs.exists(joinPath(dirPath() + name()))) {
                dialog.message("File already exists.", {
                  title: "Error",
                  type: "error",
                });
                warn("File " + name() + " already exists in " + dirPath());
                return;
              }
              fs.writeFile(joinPath(dirPath(), name()), "").catch((e) => {
                error("Failed to create file " + name() + ": " + e);
              });
              loadEditor(joinPath(dirPath(), name()), true, name());
              break;
            case "Project":
              if (await fs.exists(joinPath(dirPath(), name()))) {
                dialog.message("Directory already exists.", {
                  title: "Error",
                  type: "error",
                });
                warn("Directory " + name() + " already exists in " + dirPath());
              } else {
                const projectPath = joinPath(dirPath(), name());

                await fs.createDir(projectPath);
                loadEditor(projectPath);
              }
          }
        }
        break;
      case "open":
        if (dirPath() != "") {
          loadEditor(dirPath());
        }
        break;
      case "clone":
        if (dirPath() != "") {
          loadEditor(getRepoPath());
        }
        break;
    }
  };

  return (
    <div class="flex flex-col space-y-2 px-2 pb-1 text-content">
      <dialog id="modal-new">
        <Modal
          width={60}
          height={60}
          class={`${closeModal() ? "dialog-close" : ""}`}
        >
          <div class="flex-col space-y-4">
            <div class="flex items-center space-x-2">
              <p>Type: </p>
              <Dropdown
                items={["File", "Project"]}
                placeholder="File"
                width="110px"
                height="35px"
                selectedItem={setSelectedType}
              ></Dropdown>
            </div>
            <div class="flex items-center space-x-2">
              <p>Name: </p>
              <Input
                width="100%"
                height="35px"
                value=""
                placeholder="Required"
                onChange={setName}
              />
            </div>
            <div class="flex items-center space-x-2">
              <p>Location: </p>
              <Input
                width="100%"
                height="35px"
                value={dirPath()}
                placeholder="Required"
                onChange={setDirPath}
              />
              <Button
                colorBg={true}
                text="Browse"
                height="35px"
                action={() => {
                  openDir(false);
                }}
              />
            </div>
          </div>
          <div
            class="flex space-x-2"
            style={{
              position: "absolute",
              bottom: `calc(20% + 1em)`,
              right: `calc(20% + 1em)`,
            }}
          >
            <Button
              colorBg={true}
              text="Cancel"
              width="66px"
              height="35px"
              action={() => {
                const modal = document.getElementById(
                  "modal-new",
                ) as HTMLDialogElement;

                setCloseModal(true);
                setTimeout(() => {
                  if (modal) {
                    modal.close();
                  }
                  setCloseModal(false);
                  resetValues();
                }, 100);
              }}
            />
            <Button
              width="66px"
              height="35px"
              text="Create"
              action={() => {
                beforeLoad("new");
              }}
            />
          </div>
        </Modal>
      </dialog>
      <dialog id="modal-clone">
        <Modal
          width={60}
          height={35}
          class={`${closeModal() ? "dialog-close" : ""}`}
        >
          <div class="flex-col space-y-4">
            <div class="flex items-center space-x-2">
              <p>URL: </p>
              <Input
                width="100%"
                height="35px"
                value=""
                placeholder="Required"
                onChange={setCloneUrl}
              />
            </div>
            <div class="flex items-center space-x-2">
              <p>Location: </p>
              <Input
                width="100%"
                height="35px"
                value={dirPath()}
                placeholder="Required"
                onChange={setDirPath}
              />
              <Button
                colorBg={true}
                text="Browse"
                height="35px"
                action={() => {
                  openDir(false);
                }}
              />
            </div>
          </div>
          <div
            class="flex space-x-2"
            style={{
              position: "absolute",
              bottom: `calc(32.5% + 1em)`,
              right: `calc(20% + 1em)`,
            }}
          >
            <Button
              width="66px"
              height="35px"
              colorBg={true}
              text="Cancel"
              action={() => {
                const modal = document.getElementById(
                  "modal-clone",
                ) as HTMLDialogElement;
                setCloseModal(true);
                setTimeout(() => {
                  if (modal) {
                    modal.close();
                  }
                  setCloseModal(false);
                  resetValues();
                }, 100);
              }}
            />
            <Button
              width="66px"
              height="35px"
              text="Clone"
              disabled={isCloning()}
              action={clone}
            />
          </div>
        </Modal>
      </dialog>
      <Button
        width="100%"
        text="New"
        action={() => {
          const modal = document.getElementById(
            "modal-new",
          ) as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
        }}
      />
      <Button width="100%" text="Open" action={openDir} />
      <Button
        width="100%"
        text="Clone"
        action={() => {
          const modal = document.getElementById(
            "modal-clone",
          ) as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
        }}
      />
    </div>
  );
};

export default Startup;
