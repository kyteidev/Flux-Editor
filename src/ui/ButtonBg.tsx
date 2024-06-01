interface Props {
  width: string;
  height: string;
  action: () => void;
  text: string;
}

const ButtonBg = (props: Props) => {
  return (
    <button
      class={`rounded-xl bg-base-100 p-2 transition duration-300 ease-in-out hover:bg-content hover:bg-opacity-20 active:scale-95`}
      style={{ width: `${props.width}`, height: `${props.height}` }}
      onClick={props.action}
    >
      <div class="flex items-center justify-center text-content">
        {props.text}
      </div>
    </button>
  );
};

export default ButtonBg;
