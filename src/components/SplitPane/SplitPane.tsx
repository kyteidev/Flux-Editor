/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { JSX, Show, children, createSignal } from "solid-js";

interface Props {
  children: JSX.Element;
  vertical?: boolean;
  grow?: boolean;
  size: number;
  firstMinSize?: number;
  secondMinSize?: number;
  canFirstHide?: boolean;
  canSecondHide?: boolean;
}

function SplitPane(props: Props) {
  let windowWidth: number;
  let windowHeight: number;

  // [start] SOURCE: https://www.answeroverflow.com/m/1094940238150897664
  const firstChild = () => children(() => props.children).toArray()[0];
  const secondChild = () => children(() => props.children).toArray()[1];
  // [end]

  const [isDragging, setIsDragging] = createSignal(false);
  const [firstWidth, setFirstWidth] = createSignal(props.size);
  const [firstHeight, setFirstHeight] = createSignal(props.size);

  const handleMouseDown = () => {
    setIsDragging(true);
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;

    const movementX = e.movementX;
    const movementY = e.movementY;

    const newWidth = firstWidth() + movementX;
    const newHeight = firstHeight() + movementY;

    // FIXME: Hidden children becomes visible when resizing window to reveal them.

    if (props.vertical) {
      const cursorOffsetY: number = Math.abs(e.clientY - firstHeight());

      if (props.firstMinSize && newHeight <= props.firstMinSize) {
        setFirstHeight(props.firstMinSize);
        if (cursorOffsetY >= 80 && props.canFirstHide) {
          setFirstHeight(0);
        }
      } else if (
        props.secondMinSize &&
        newHeight >= windowHeight - props.secondMinSize
      ) {
        setFirstHeight(windowHeight - props.secondMinSize);
        if (cursorOffsetY >= 80 && props.canSecondHide) {
          setFirstHeight(windowHeight - 3);
        }
      } else {
        setFirstHeight(newHeight);
      }
    } else {
      const cursorOffsetX: number = Math.abs(e.clientX - firstWidth());

      if (props.firstMinSize && newWidth <= props.firstMinSize) {
        setFirstWidth(props.firstMinSize);
        if (cursorOffsetX >= 80 && props.canFirstHide) {
          setFirstWidth(0);
        }
      } else if (
        props.secondMinSize &&
        newWidth >= windowWidth - props.secondMinSize
      ) {
        setFirstWidth(windowWidth - props.secondMinSize);
        if (cursorOffsetX >= 80 && props.canSecondHide) {
          setFirstWidth(windowWidth - 3);
        }
      } else {
        setFirstWidth(newWidth);
      }
    }
  };

  const handleUnhide = () => {
    if (props.vertical) {
      if (firstHeight() === 0 && props.firstMinSize) {
        setFirstHeight(props.firstMinSize);
      } else if (firstHeight() === windowHeight && props.secondMinSize) {
        setFirstHeight(windowHeight - props.secondMinSize);
      }
    } else {
      if (firstWidth() === 0 && props.firstMinSize) {
        setFirstWidth(props.firstMinSize);
      } else if (firstWidth() === windowWidth && props.secondMinSize) {
        setFirstWidth(windowWidth - props.secondMinSize);
      }
    }
  };

  return (
    <div
      class={`flex ${props.grow && "flex-grow"} ${props.vertical && "flex-col"} relative max-h-full min-h-full`}
      onmouseup={handleMouseUp}
      onmouseleave={handleMouseUp}
      onmousemove={handleMouseMove}
    >
      <div
        class="relative"
        style={{
          width: `${props.vertical ? "100%" : `${firstWidth()}px`}`,
          "min-width": `${props.vertical ? "100%" : `${firstWidth()}px`}`,
          height: `${props.vertical ? `${firstHeight()}px` : "100%"}`,
          "min-height": `${props.vertical ? `${firstHeight()}px` : "100%"}`,
        }}
      >
        {firstChild()}
      </div>
      <Show when={secondChild()}>
        <div
          id="splitter"
          class={`${props.vertical ? "h-[3px] min-h-[3px] w-full cursor-row-resize" : "w-[3px] min-w-[3px] cursor-col-resize"} ${isDragging() ? "bg-accent" : "bg-content"} z-50 transition duration-300 ease-in-out hover:bg-accent`}
          style={{ height: `${props.vertical ?? `calc(100vh - 40px)`}` }}
          onmousedown={handleMouseDown}
          onclick={handleUnhide}
        />
      </Show>
      {secondChild()}
    </div>
  );
}

export default SplitPane;
