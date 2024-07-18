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
      class={`bg-primary hover:bg-primary-hover rounded p-2 active:brightness-125`}
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
