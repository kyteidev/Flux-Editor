/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Component } from "solid-js";

interface Props {
  size: string;
  rounding: number;
  icon: Component;
  action: () => void;
}

const ButtonIcon = (props: Props) => {
  return (
    <button
      class={`rounded-xl bg-primary p-2 transition duration-300 ease-in-out hover:bg-primary-hover active:scale-95`}
      style={{
        width: `${props.size}`,
        height: `${props.size}`,
        "border-radius": `${props.rounding}px`,
      }}
      onClick={props.action}
    >
      <div class="flex items-center justify-center">
        <props.icon />
      </div>
    </button>
  );
};

export default ButtonIcon;
