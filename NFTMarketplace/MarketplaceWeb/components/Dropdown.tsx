import { useState } from "react";
import { Collection } from "../models/Collection";

type DropdownProps<T> = {
  items: T[];
  selected: T;
  itemKey: (item: T) => string;
  selectedTitle: (item: T) => string;
  setSelected: (item: T) => void;
}

export const Dropdown = <T extends unknown>(
  { items, selected, itemKey, setSelected, selectedTitle }: DropdownProps<T>
): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);

  const itemSelected = (item: T) => {
    setOpen(false);
    setSelected(item);
  }

  const button = (onClick: () => void, title: string): JSX.Element => {
    return (
      <button onClick={onClick}
        className='bg-gray-300 hover:bg-gray-400 text-secondary font-bold py-1 px-2 rounded'>
        {title}
      </button>
    );
  }

  if (open) {
    return (
      <ul>
        {
          items.map((val, index) => {
            return (
              <li key={itemKey(val)} className='py-1'>
                {button(() => { itemSelected(val) }, selectedTitle(val))}
              </li>
            );
          })
        }
      </ul>
    );
  } else {
    const title = selected != null ? selectedTitle(selected) : 'Collection';
    return (button(() => { setOpen(true) }, title));
  }
}