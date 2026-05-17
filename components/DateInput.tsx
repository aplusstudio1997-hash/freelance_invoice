"use client";

import FlatpickrInput from "./FlatpickrInput";

interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}

export default function DateInput({
  value,
  onChange,
  className,
  placeholder,
}: Props) {
  return (
    <FlatpickrInput
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
    />
  );
}
