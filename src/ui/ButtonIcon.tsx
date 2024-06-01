import { Component } from "solid-js";

interface Props {
  size: string;
  rounding: number;
  icon: Component;
  action: () => void;
}

const ButtonIcon = (props: Props) => {
  return (
    <button
      class={`rounded-xl bg-primary p-2 transition duration-300 ease-in-out hover:bg-primary-hover active:scale-95`}
      style={{
        width: `${props.size}`,
        height: `${props.size}`,
        "border-radius": `${props.rounding}px`,
      }}
      onClick={props.action}
    >
      <div class="flex items-center justify-center">
        <props.icon />
      </div>
    </button>
  );
};

export default ButtonIcon;
