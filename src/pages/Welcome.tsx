import { useNavigate } from "@solidjs/router";
import icon from "../assets/narvik-logo.svg";
import { LogicalSize, appWindow } from "@tauri-apps/api/window";

function Welcome() {
  const navigate = useNavigate();

  const openEditor = () => {
    const path = `/editor`;
    appWindow.setSize(new LogicalSize(1280, 800));
    navigate(path);
  };

  return (
    <div class="h-screen bg-base-100">
      <div data-tauri-drag-region class="w-full h-12" />
      <div class="flex justify-center space-x-10">
        <img
          src={icon}
          alt="icon"
          width="200vh"
          height="120vh"
          class="flex justify-center"
          draggable="false"
        />
        <h1 class="text-9xl" style={{ position: "relative", top: "5vh" }}>
          narvik
        </h1>
      </div>
      <div class="w-full h-100" style={{ position: "relative", top: "50px" }}>
        <div class="flex justify-center space-x-20">
          <div>
            <button
              class="btn btn-primary btn-circle"
              style={{ width: "100px", height: "100px" }}
              onClick={openEditor}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="64"
                viewBox="0 -960 960 960"
                width="64"
              >
                <path
                  class="fill-primary-content"
                  d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
                />
              </svg>{" "}
            </button>
            <p class="text-center relative top-2">New...</p>
          </div>
          <div>
            <button
              class="btn btn-primary btn-circle"
              style={{ width: "100px", height: "100px" }}
              onClick={openEditor}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="64"
                viewBox="0 -960 960 960"
                width="64"
              >
                <path
                  class="fill-primary-content"
                  d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z"
                />
              </svg>{" "}
            </button>
            <p class="text-center relative top-2">Open...</p>
          </div>
          <div>
            <button
              class="btn btn-primary btn-circle"
              style={{ width: "100px", height: "100px" }}
              onClick={openEditor}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="64"
                viewBox="0 -960 960 960"
                width="64"
              >
                <path
                  class="fill-primary-content"
                  d="M120-120q-33 0-56.5-23.5T40-200v-520h80v520h680v80H120Zm160-160q-33 0-56.5-23.5T200-360v-440q0-33 23.5-56.5T280-880h200l80 80h280q33 0 56.5 23.5T920-720v360q0 33-23.5 56.5T840-280H280Zm0-80h560v-360H527l-80-80H280v440Zm0 0v-440 440Z"
                />
              </svg>{" "}
            </button>
            <p class="text-center relative top-2">Clone...</p>
          </div>
        </div>
      </div>
      <div class="absolute top-4 right-4 ml-0">
        <button class="hover:opacity-70" onClick={() => appWindow.close()}>
          <div class="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="36px"
              viewBox="0 -960 960 960"
              width="36px"
              fill="#e8eaed"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Welcome;
