import Loading from "./Loading";

interface Props {
  width: number;
  height: number;
  action: () => void;
  text: string;
  loading?: boolean;
}

const Button = (props: Props) => {
  return (
    <button
      class={`rounded-xl bg-primary transition duration-300 ease-in-out hover:bg-primary-hover active:scale-95`}
      style={{ width: `${props.width}px`, height: `${props.height}px` }}
      onClick={props.action}
    >
      <div
        class="flex items-center justify-center p-2 text-content"
        style={{ width: `${props.width}px`, height: `${props.height}px` }}
      >
        {props.loading || false ? (
          <Loading />
        ) : (
          props.text
        )}
      </div>
    </button>
  );
};

export default Button;
