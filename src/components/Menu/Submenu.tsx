/*
Copyright © 2024 kyteidev.

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

// TODO: implement nested submenu support

import { JSX } from "solid-js/jsx-runtime";
import { MenuContainer } from "./Menu";
import { createSignal } from "solid-js";
import { IconExpandRight } from "../Icons/Icons";

const Submenu = (props: {
  children: JSX.Element;
  first?: boolean;
  last?: boolean;
  item: number;
  text: string;
  main?: boolean;
  separator?: boolean;
}) => {
  const [show, setShow] = createSignal(false);
  const [hovering, setHovering] = createSignal(false); // if hovering over child
  return (
    <>
      <div
        class={`menu ${props.first && "rounded-t"} ${props.last && "rounded-b"} ${props.separator && "border-t-[1px] border-base-100-hover"} absolute z-[51] flex h-6 w-32 items-center bg-base-100 px-2 align-middle text-sm text-content-main hover:bg-base-100-hover`}
        style={{ top: `calc(${props.item} * 1.5rem + 0.5rem)` }}
        onMouseOver={() => {
          setShow(true);
        }}
        onMouseLeave={() => {
          setTimeout(() => {
            if (!hovering()) {
              setShow(false);
            }
          }, 20);
        }}
      >
        {props.text}
        <div class="absolute right-0">
          <IconExpandRight />
        </div>
      </div>
      <div
        class={`${show() ? "scale-100" : "scale-0"} absolute z-[51]`}
        style={{
          left: `${props.main ? `calc(8rem + 5px + 0.25rem)` : `calc(8rem + 5px)`}`,
          top: `calc(${props.item} * 1.5rem + 1rem)`,
        }}
      >
        <div
          class="relative top-[-43.5px]"
          onMouseEnter={() => {
            setHovering(true);
          }}
          onMouseLeave={() => {
            setHovering(false);
            setShow(false);
          }}
        >
          <MenuContainer>{props.children}</MenuContainer>
        </div>
      </div>
    </>
  );
};

export default Submenu;
