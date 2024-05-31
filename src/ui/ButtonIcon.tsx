import { Component } from "solid-js";

interface Props {
  size: string;
  rounding: number;
  icon: Component;
  action: () => void;
}

function ButtonIcon(props: Props) {
  return (
    <button
      class={`p-2 transition ease-in-out rounded-xl bg-primary hover:bg-primary-hover active:scale-95 duration-300`}
      style={{ width: `${props.size}`, height: `${props.size}`, "border-radius": `${props.rounding}px` }}
      onClick={props.action}
    >
      <div class="flex justify-center items-center">
        <props.icon />
      </div>
    </button>
  );
}

export default ButtonIcon;
