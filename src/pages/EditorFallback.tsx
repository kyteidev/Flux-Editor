import { FluxLogo } from "../components/Icons/FluxLogo";

const EditorFallback = () => {
  return (
    <div class="flex min-h-full min-w-full select-none items-center justify-center space-x-10 bg-base-200">
      <div style={{ width: "12rem", height: "auto", opacity: "0.8" }}>
        <FluxLogo color="base-100" />
      </div>
    </div>
  );
};

export default EditorFallback;
