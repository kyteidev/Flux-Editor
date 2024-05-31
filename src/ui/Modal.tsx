import { JSX } from "solid-js";

interface Props {
  width: number;
  height: number;
  bgColor: string;
  children: JSX.Element;
}

function Modal(props: Props) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: "0",
        left: "0",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "background-color": `rgba(0, 0, 0, 0.45)`,
        "z-index": "999",
      }}
    >
      <div
        class={`${props.bgColor} rounded-xl`}
        style={{
          width: `${props.width}%`,
          height: `${props.height}%`,
          "z-index": "1000",
          "padding-left": "1.5rem",
          "padding-top": "1rem",
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

export default Modal;
