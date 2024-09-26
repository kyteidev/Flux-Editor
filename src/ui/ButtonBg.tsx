/*
Copyright © 2024 The Flux Editor Contributors.

This file is part of Flux Editor.

Flux Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

Flux Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Flux Editor. If not, see
<https://www.gnu.org/licenses/>.
*/

interface Props {
  width: string;
  height: string;
  action: () => void;
  text: string;
}

const ButtonBg = (props: Props) => {
  return (
    <button
      class={`flex items-center justify-center rounded-xl bg-base-100 p-2 transition duration-300 ease-in-out hover:bg-base-100-hover active:scale-95`}
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
