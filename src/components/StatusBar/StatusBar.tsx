import Lang from "./components/Lang";

const StatusBar = () => {
  return (
    <div
      class="z-50 w-screen border-t-2 border-base-100 bg-base-200 px-2 text-sm"
      style={{
        "min-height": `calc(1.5rem + 2px)`,
        "max-height": `calc(1.5rem + 2px)`,
      }}
    >
      <div class="float-right ml-auto">
        <Lang />
      </div>
    </div>
  );
};

export default StatusBar;
