import { JSX } from "solid-js";

interface Props {
  children: JSX.Element;
  vertical?: boolean;
  grow?: boolean;
  width?: number;
}

function SplitPane(props: Props) {
  return (
    <div
      class={`flex ${props.grow ? "flex-grow" : ""} ${props.vertical ? "flex-col" : ""} relative max-h-full`}
      style={{ width: `${props.width}px` }}
    >
      {props.children}
    </div>
  );
}

export default SplitPane;
