interface Props {
  width: string;
  height: string;
  placeholder: string;
  value: string;
  onChange: (event: Event) => void;
}

const Input = (props: Props) => {
    const handleInput = (e: any) => {
      props.onChange(e.target.value);
    };

  return (
    <input
      type="text"
      class="rounded-xl border-none bg-base-100 focus:bg-base-100-hover p-2 pl-4 text-content transition duration-300 ease-in-out hover:bg-base-100-hover"
      style={{
        width: props.width,
        height: props.height,
      }}
      placeholder={props.placeholder}
      value={props.value}
      autocomplete="off"
      autocorrect="off"
      onchange={handleInput}
    />
  );
};

export default Input
