/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { JSX } from "solid-js";

interface Props {
  children: JSX.Element;
  vertical?: boolean;
  grow?: boolean;
  width?: number;
}

function SplitPane(props: Props) {
  return (
    <div
      class={`flex ${props.grow ? "flex-grow" : ""} ${props.vertical ? "flex-col" : ""} relative max-h-full`}
    >
      {props.children}
    </div>
  );
}

export default SplitPane;
