import { invoke } from "@tauri-apps/api";

let requestId = 1;

export const send_request = async () => {
  const params = {
    capabilities: {},
  };
  const response = await invoke("ls_send_request", {
    id: requestId.toString(),
    method: "initialize",
    params: params,
  });
  console.log(await response);

  requestId += 1;
};
