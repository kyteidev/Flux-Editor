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

import { JSX, Show, children, createSignal, onMount } from "solid-js";
import { info } from "@tauri-apps/plugin-log";

interface Props {
  children: JSX.Element;
  vertical?: boolean;
  grow?: boolean;
  size: number;
  firstMinSize?: number;
  secondMinSize?: number;
  canFirstHide?: boolean;
  canSecondHide?: boolean;
  swapPriority?: boolean;
  hideFirst?: boolean;
  hideSecond?: boolean;
}

const [fixHeight, setFixHeight] = createSignal(0);

export const fixEditorHeight = (firstTab: boolean) => {
  if (firstTab) {
    setFixHeight(64); // editor tabs: 36px, breadcrumbs: 28px
  } else {
    setFixHeight(0);
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
  const [firstHeight, setFirstHeight] = createSignal(0);

  const [canUnhide, setCanUnhide] = createSignal(true);

  onMount(() => setFirstHeight(props.size));

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

    // cursor movement method: smoother movement but possibly unreliable
    /*
    let movementX = e.movementX;
    let movementY = e.movementY;

    // Invert the movement direction if `secondMain` is true
    if (props.swapPriority) {
      movementX = -movementX;
      movementY = -movementY;
    }

    const newWidth = firstWidth() + movementX;
    const newHeight = firstHeight() + movementY;
    */

    // cursor position method: reliable but less smooth
    let cursorOffsetX;
    let cursorOffsetY;

    if (props.swapPriority) {
      cursorOffsetX = windowWidth - e.clientX - firstWidth();
      cursorOffsetY = windowHeight - e.clientY - 26 - firstHeight();
    } else {
      cursorOffsetX = e.clientX - firstWidth();
      cursorOffsetY = e.clientY - firstHeight();
    }

    const newWidth = firstWidth() + cursorOffsetX;
    const newHeight = firstHeight() + cursorOffsetY;

    if (props.vertical) {
      const cursorOffsetY: number = props.swapPriority
        ? Math.abs(e.clientY - (windowHeight - firstHeight()))
        : Math.abs(e.clientY - firstHeight()); // gets absolute value to avoid checking for negative numbers

      if (props.firstMinSize && newHeight <= props.firstMinSize) {
        // if first pane should be hidden
        if (cursorOffsetY >= 80 && props.canFirstHide) {
          setCanUnhide(false);
          if (!props.swapPriority) {
            setFirstHeight(0); // hides first pane
          } else {
            setFirstHeight(2); // for some reason first pane height will be 100% when swapped panes
          }
        } else if (canUnhide()) {
          setFirstHeight(props.firstMinSize);
        }
      } else if (
        props.secondMinSize &&
        newHeight >= windowHeight - props.secondMinSize // if second pane should be hidden
      ) {
        if (cursorOffsetY >= 80 && props.canSecondHide) {
          setCanUnhide(false);
          setFirstHeight(windowHeight - 2 - 30); // sets first height to window height, minus height of splitter and title bar
        } else if (canUnhide()) {
          setFirstHeight(windowHeight - props.secondMinSize);
        }
      } else {
        setFirstHeight(newHeight);
      }
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
          setFirstWidth(windowWidth - 2);
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
      if ((firstHeight() === 0 || firstHeight() === 2) && props.firstMinSize) {
        setFirstHeight(props.firstMinSize);
        info("First pane unhidden");
      } else if (firstHeight() === windowHeight - 32 && props.secondMinSize) {
        setFirstHeight(windowHeight - props.secondMinSize);
        info("Second pane unhidden");
      }
    } else {
      if (firstWidth() === 0 && props.firstMinSize) {
        setFirstWidth(props.firstMinSize);
        info("First pane unhidden");
      } else if (firstWidth() === windowWidth - 2 && props.secondMinSize) {
        setFirstWidth(windowWidth - props.secondMinSize);
        info("Second pane unhidden");
      }
    }
  };

  return (
    <div
      class={`${isDragging() ? `${props.vertical ? "cursor-row-resize" : "cursor-col-resize"}` : ""} ${props.grow && "flex-grow"} ${props.vertical && "flex-col"} relative flex max-h-full min-h-full max-w-full`}
      onmouseup={handleMouseUp} // these events are located in parent element to continue dragging when mouse leaves splitter
      onmouseleave={handleMouseUp}
      onmousemove={handleMouseMove}
    >
      {optionalChild()}
      <Show when={!props.hideFirst}>
        <div
          class={`${props.swapPriority && "flex flex-grow"} relative`}
          style={{
            width: `${props.swapPriority ? `calc(100vw - ${firstWidth()})` : `${props.vertical ? "100%" : `${firstWidth()}px`}`}`,
            "min-width": `${!props.swapPriority ? "" : `${props.vertical ? "100%" : `${firstWidth()}px`}`}`,
            height: `${props.swapPriority ? `${props.hideSecond ? `calc(100vh - 54px - ${fixHeight()}px)` : `calc(100vh - 54px - ${firstHeight()}px - ${fixHeight()}px)`}` : `${props.vertical ? `${firstHeight()}px` : "100%"}`}`,
            "min-height": `${props.swapPriority ? "" : `${props.vertical ? `${firstHeight()}px` : `calc(100vh - 3.25rem - 2px)`}`}`,
            "max-width": `${!props.swapPriority ? "" : `${!props.vertical && `calc(100vw - ${firstWidth()}px - 2px)`}`}`,
            "max-height": `${!props.swapPriority ? `${props.vertical ? `calc(100vh - 56px - ${firstHeight()}px - ${fixHeight()}px)` : `calc(100vh - 3.25rem - 2px)`}` : `${props.vertical && `${props.hideSecond ? `calc(100vh - 54px - ${fixHeight()}px)` : `calc(100vh - ${firstHeight()}px - 2px)`}`}`}`,
          }}
        >
          {firstChild()}
        </div>
      </Show>
      <Show when={secondChild() && !props.hideFirst}>
        <div
          id="splitter"
          class={`${props.vertical ? "h-[2px] min-h-[2px] w-full cursor-row-resize" : "w-[2px] min-w-[2px] cursor-col-resize"} ${isDragging() ? "bg-accent" : "bg-base-100"} z-50 hover:bg-accent`}
          style={{
            height: `${props.vertical && `calc(100vh - 3.25rem - 2px)`}`,
          }}
          onmousedown={handleMouseDown}
          onclick={handleUnhide}
        />
      </Show>
      <Show when={!props.hideSecond}>
        <div
          class={`${props.swapPriority ? "" : "flex flex-grow"} relative`}
          style={{
            width: `${props.swapPriority ? `${props.vertical ? "100%" : `${firstWidth()}px`}` : `${props.hideFirst ? "100%" : `calc(100vw - ${firstWidth()})`}`}`,
            "max-width": `${props.swapPriority ? "" : `${!props.vertical && `${props.hideFirst ? "100%" : `calc(100vw - ${firstWidth()}px - 2px)`}`}`}`,
            height: `${props.swapPriority ? `${props.vertical ? `${firstHeight()}px` : "100%"}` : `calc(100vh - ${firstHeight()})`}`,
            "max-height": `${props.swapPriority ? "" : `${props.vertical && `calc(100vh - ${firstHeight()}px - 56px)`}`}`,
            "min-width": `${!props.swapPriority ? "" : `${props.vertical ? "100%" : `${firstWidth()}px`}`}`,
            "min-height": `${!props.swapPriority ? "" : `${props.vertical ? `${firstHeight()}px` : "100%"}`}`,
          }}
        >
          {secondChild()} {/* second child takes up rest of space */}
        </div>
      </Show>
    </div>
  );
};

export default SplitPane;
