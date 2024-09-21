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

import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

interface Props {
  width?: string;
  height?: string;
  action: () => void;
  text: string;
  disabled?: boolean;
  colorBg?: boolean;
  class?: string;
  icon?: JSX.Element;
}

// sets brightness to 90% to fix buttons being brighter than normal
const Button = (props: Props) => {
  return (
    <button
      class={`${props.colorBg ? `bg-base-100 hover:bg-base-100-hover` : `bg-accent ${props.disabled ? "cursor-not-allowed brightness-200" : "cursor-pointer hover:bg-accent-hover"}`} ${!props.width && `w-fit ${props.icon ? "pr-[5px]" : "px-2"}`} ${props.class && props.class} hover:text-content-main inline-flex items-center justify-center rounded py-1 text-center text-content brightness-90 active:brightness-110`}
      style={{
        width: `${props.width && props.width}`,
        height: `${props.height && props.height}`,
      }}
      onClick={props.action}
    >
      {props.icon}
      {props.text}
    </button>
  );
};

export default Button;
