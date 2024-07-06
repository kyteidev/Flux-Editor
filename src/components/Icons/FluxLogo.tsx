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

// The following logo is licensed under Creative Commons Attribution-NonCommercial-ShareAlike License.
export const FluxLogo = (props: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1"
      width="100%"
      height="100%"
      viewBox="0,0,81.04428,81.89681"
    >
      <g transform="translate(-199.47786,-139.05159)">
        <g
          data-paper-data='{"isPaintingLayer":true}'
          fill={`var(--${props.color})`}
          fill-rule="nonzero"
          stroke="none"
          stroke-width="0"
          stroke-linecap="butt"
          stroke-linejoin="miter"
          stroke-miterlimit="10"
          stroke-dasharray=""
          stroke-dashoffset="0"
          style="mix-blend-mode: normal"
        >
          <path d="M255.75988,182.09764c-21.44534,28.38539 0.94471,48.40686 -30.33886,34.12328c-25.36188,-16.20974 -34.26406,-53.68054 -17.05605,-68.18525c15.91386,-13.41386 45.15976,-12.0033 64.18526,5.55604c19.18804,17.70936 -0.20238,10.80695 -16.79035,28.50593z" />
        </g>
      </g>
    </svg>
  );
};
