/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { JSX } from "solid-js";

interface Props {
  width: number;
  height: number;
  bgColor: string;
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
        class={`${props.bgColor} rounded-xl`}
        style={{
          width: `${props.width}%`,
          height: `${props.height}%`,
          "z-index": "1000",
          padding: "1.5em",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default Modal;
