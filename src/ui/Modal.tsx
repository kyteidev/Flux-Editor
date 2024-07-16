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

import { JSX } from "solid-js";

interface Props {
  width: number;
  height: number;
  class: string;
  children: JSX.Element;
}

const Modal = (props: Props) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: "0",
        left: "0",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "background-color": `rgba(0, 0, 0, 0.45)`,
        "z-index": "999",
      }}
    >
      <div
        class={`${props.class} rounded`}
        style={{
          width: `${props.width}%`,
          height: `${props.height}%`,
          "z-index": "1000",
          padding: "1rem",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default Modal;
