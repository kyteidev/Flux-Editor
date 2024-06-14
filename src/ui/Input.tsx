/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

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
      class="rounded-xl border-none bg-base-100 p-2 pl-4 text-content transition duration-300 ease-in-out hover:bg-base-100-hover focus:bg-base-100-hover"
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

export default Input;
