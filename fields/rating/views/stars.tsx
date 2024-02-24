import React from "react";

export type InterfaceProps = {
  maxRating: number;
  value: number | null;
  icon: string;
  onChange?: (value: number | null) => void;
  autoFocus?: boolean;
};

export default function View(props: InterfaceProps) {
  return (
    <div>
      <div>
        <label>
          <input
            autoFocus={props.autoFocus}
            type="radio"
            disabled={props.onChange === undefined}
            checked={props.value === 0}
            onChange={() => {
              props.onChange?.(0);
            }}
          />
          0 Stars
        </label>
      </div>
      {Array.from({
        length: props.maxRating,
      }).map((_, i) => {
        const star = i + 1;
        return (
          <div>
            <label key={star}>
              <input
                type="radio"
                checked={props.value === star}
                disabled={props.onChange === undefined}
                onChange={() => {
                  props.onChange?.(star);
                }}
              />
              {props.value !== null && props.value >= star
                ? icons[props.icon].full
                : icons[props.icon].empty}
              {star} Star{star === 1 ? "" : "s"}
            </label>
          </div>
        );
      })}
      <div>
        <label>
          <input
            type="radio"
            checked={props.value === null}
            disabled={props.onChange === undefined}
            onChange={() => {
              props.onChange?.(null);
            }}
          />
          No selection
        </label>
      </div>
    </div>
  );
}

const icons = {
  star: {
    empty: (
      <svg width="22" height="21" viewBox="0 0 44 42" xmlns="http://www.w3.org/2000/svg">
        <path
          stroke="#BBB"
          strokeWidth="2"
          fill="#FFF"
          d="M22 30.972L10.244 39.18l4.175-13.717-11.44-8.643 14.335-.27L22 3l4.686 13.55 14.335.27-11.44 8.643 4.175 13.717z"
        />
      </svg>
    ),
    full: (
      <svg width="22" height="21" viewBox="0 0 44 42" xmlns="http://www.w3.org/2000/svg">
        <path
          stroke="#ED5910"
          strokeWidth="2"
          fill="#F8E71C"
          d="M22 30.972L10.244 39.18l4.175-13.717-11.44-8.643 14.335-.27L22 3l4.686 13.55 14.335.27-11.44 8.643 4.175 13.717z"
        />
      </svg>
    ),
  },
  hex: {
    empty: (
      <svg
        fill="#000000"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="21"
        viewBox="0 0 485.688 485.688"
      >
        <g>
          <g>
            <path
              d="M364.269,453.155H121.416L0,242.844L121.416,32.533h242.853l121.419,210.312L364.269,453.155z M131.905,434.997h221.878
        l110.939-192.152L353.783,50.691H131.905L20.966,242.844L131.905,434.997z"
            />
          </g>
        </g>
      </svg>
    ),
    full: (
      <svg
        fill="#F8E71C"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="21"
        viewBox="0 0 485.688 485.688"
      >
        <g>
          <g>
            <path
              d="M364.269,453.155H121.416L0,242.844L121.416,32.533h242.853l121.419,210.312L364.269,453.155z M131.905,434.997h221.878
      l110.939-192.152L353.783,50.691H131.905L20.966,242.844L131.905,434.997z"
            />
          </g>
        </g>
      </svg>
    ),
  },
};