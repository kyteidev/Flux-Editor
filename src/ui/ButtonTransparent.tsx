interface Props {
    width: number;
    height: number;
    action: () => void;
    text: string;
  }
  
  function ButtonTransparent(props: Props) {
    return (
      <button
        class={`p-2 transition ease-in-out rounded-xl bg-content bg-opacity-0 hover:bg-opacity-20 active:scale-95 duration-300`}
        style={{ width: `${props.width}px`, height: `${props.height}px` }}
        onClick={props.action}
        tabIndex={-1}
      >
        <div class="text-content flex justify-center items-center">{props.text}</div>
      </button>
    );
  }
  
  export default ButtonTransparent;
  