import { JSX } from "solid-js";

interface Props {
  children: JSX.Element;
  vertical?: boolean;
}

function SplitPane(props: Props) {
  return (
    <div class={`flex flex-grow ${props.vertical ? "flex-col" : ""}`}>
      {props.children}
    </div>
  );
}

export default SplitPane;
