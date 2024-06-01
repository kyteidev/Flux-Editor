interface Props {
  width: number;
  height: number;
  action: () => void;
  text: string;
}

const Button = (props: Props) => {
  return (
    <button
      class={`rounded-xl bg-primary p-2 transition duration-300 ease-in-out hover:bg-primary-hover active:scale-95`}
      style={{ width: `${props.width}px`, height: `${props.height}px` }}
      onClick={props.action}
    >
      <div class="flex items-center justify-center text-content">
        {props.text}
      </div>
    </button>
  );
};

export default Button;
