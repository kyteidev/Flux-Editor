/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>.
*/

import { JSX, Show, children, createSignal, onMount } from "solid-js";

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

const [firstHeight, setFirstHeight] = createSignal(0);

export const fixEditorHeight = (firstTab: boolean) => {
  if (firstTab) {
    setFirstHeight(firstHeight() - 40);
  } else {
    setFirstHeight(firstHeight() + 40);
  }
};

const SplitPane = (props: Props) => {
  let windowWidth: number;
  let windowHeight: number;

  // [start] SOURCE: https://www.answeroverflow.com/m/1094940238150897664
  const firstChild = () => children(() => props.children).toArray()[0];
  const secondChild = () => children(() => props.children).toArray()[1];
  const optionalChild = () => children(() => props.children).toArray()[2]; // configured for editor tabs
  // [end]

  const [isDragging, setIsDragging] = createSignal(false);
  const [firstWidth, setFirstWidth] = createSignal(props.size);

  const [canUnhide, setCanUnhide] = createSignal(true);

  onMount(() => setFirstHeight(props.size));

  // TODO: scale second child when window is resized.
  /*
  let secondHeight: number;

  appWindow.listen("tauri://resize", () => {
    setTimeout(() => {
      setFirstHeight(window.innerHeight - 43 - secondHeight);
      console.log("hi");
    }, 10);
  });
  */

  const handleMouseDown = () => {
    setIsDragging(true);
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setCanUnhide(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;

    const movementX = e.movementX;
    const movementY = e.movementY;

    const newWidth = firstWidth() + movementX;
    const newHeight = firstHeight() + movementY;

    // FIXME: Hidden children becomes visible when resizing window to reveal them.

    if (props.vertical) {
      const cursorOffsetY: number = Math.abs(e.clientY - firstHeight()); // gets absolute value to avoid checking for negative numbers

      if (props.firstMinSize && newHeight <= props.firstMinSize) {
        // if first pane should be hidden
        if (cursorOffsetY >= 80 && props.canFirstHide) {
          setCanUnhide(false);
          setFirstHeight(0); // hides first pane
        } else if (canUnhide()) {
          setFirstHeight(props.firstMinSize);
        }
      } else if (
        props.secondMinSize &&
        newHeight >= windowHeight - props.secondMinSize // if second pane should be hidden
      ) {
        if (cursorOffsetY >= 80 && props.canSecondHide) {
          setCanUnhide(false);
          setFirstHeight(windowHeight - 3 - 40); // sets first height to window height, minus height of splitter
        } else if (canUnhide()) {
          setFirstHeight(windowHeight - props.secondMinSize);
        }
      } else {
        setFirstHeight(newHeight);
      }

      //secondHeight = window.innerHeight - firstHeight() - 43;
    } else {
      const cursorOffsetX: number = Math.abs(e.clientX - firstWidth()); // gets absolute value to avoid checking for negative numbers

      if (props.firstMinSize && newWidth <= props.firstMinSize) {
        // same as above, but for horizontal split panes

        if (cursorOffsetX >= 80 && props.canFirstHide) {
          setCanUnhide(false);
          setFirstWidth(0);
        } else if (canUnhide()) {
          setFirstWidth(props.firstMinSize);
        }
      } else if (
        props.secondMinSize &&
        newWidth >= windowWidth - props.secondMinSize
      ) {
        if (cursorOffsetX >= 80 && props.canSecondHide) {
          setCanUnhide(false);
          setFirstWidth(windowWidth - 3);
        } else if (canUnhide()) {
          setFirstWidth(windowWidth - props.secondMinSize);
        }
      } else {
        setFirstWidth(newWidth);
      }
    }
  };

  const handleUnhide = () => {
    // unhides split pane when splitter is clicked
    if (props.vertical) {
      if (firstHeight() === 0 && props.firstMinSize) {
        setFirstHeight(props.firstMinSize);
      } else if (firstHeight() === windowHeight - 43 && props.secondMinSize) {
        setFirstHeight(windowHeight - props.secondMinSize);
      }
    } else {
      if (firstWidth() === 0 && props.firstMinSize) {
        setFirstWidth(props.firstMinSize);
      } else if (firstWidth() === windowWidth - 3 && props.secondMinSize) {
        setFirstWidth(windowWidth - props.secondMinSize);
      }
    }
  };

  return (
    <div
      class={`flex ${props.grow && "flex-grow"} ${props.vertical && "flex-col"} relative max-h-full min-h-full max-w-full`}
      onmouseup={handleMouseUp} // these events are located in parent element to continue dragging when mouse leaves splitter
      onmouseleave={handleMouseUp}
      onmousemove={handleMouseMove}
    >
      {optionalChild()}
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
          class={`${props.vertical ? "h-[5px] min-h-[5px] w-full cursor-row-resize border-y-[2px]" : "w-[5px] min-w-[5px] cursor-col-resize border-x-[2px]"} ${isDragging() ? "border-accent bg-accent" : "border-base-200 bg-content"} z-50 transition duration-300 ease-in-out hover:border-accent hover:bg-accent`}
          style={{ height: `${props.vertical ?? `calc(100vh - 40px)`}` }}
          onmousedown={handleMouseDown}
          onclick={handleUnhide}
        />
      </Show>
      <div
        class="flex flex-grow"
        style={{
          width: `calc(100vw - ${firstWidth()})`,
          "max-width": `${!props.vertical && `calc(100vw - ${firstWidth()}px - 5px)`}`,
          height: `calc(100vh - ${firstHeight()})`,
          "max-height": `${props.vertical && `calc(100vh - ${firstHeight()}px - 5px)`}`,
        }}
      >
        {secondChild()} {/* second child takes up rest of space */}
      </div>
    </div>
  );
};

export default SplitPane;
