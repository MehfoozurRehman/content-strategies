"use client";

import React from "react";
import dynamic from "next/dynamic";
import { appColors } from "@/lib/theme";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function CustomSelect({
  id,
  value,
  onChange,
  disabled = false,
  title,
  className = "",
  options = [],
  isMulti = false,
  placeholder = "Select...",
  required = false,
  errorMessage,
  isClearable = true,
  ...props
}) {
  // Handle value normalization consistently
  const normalizedValue = React.useMemo(() => {
    if (isMulti) {
      // Handle both array of values and array of objects
      const values = Array.isArray(value) ? value : [];
      return options.filter(option => 
        values.some(val => 
          typeof val === 'object' ? val.value === option.value : val === option.value
        )
      );
    }
    // Handle both object and primitive value
    return options.find(option => 
      typeof value === 'object' ? option.value === value?.value : option.value === value
    ) || null;
  }, [value, options, isMulti]);

  // Consistent change handler
  const handleChange = (selected) => {
    if (isMulti) {
      onChange(selected ? selected.map(option => option.value) : []);
    } else {
      onChange(selected ? selected.value : null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <label 
          htmlFor={id} 
          className="block text-sm font-bold mb-1" 
          style={{ color: appColors.textColor }}
        >
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Select
        id={id}
        value={normalizedValue}
        onChange={handleChange}
        options={options}
        isMulti={isMulti}
        isDisabled={disabled}
        isClearable={isClearable}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={{
          control: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused 
              ? appColors.hoverColor 
              : appColors.primaryColor,
            borderColor: state.isFocused 
              ? appColors.borderColor 
              : appColors.borderColor,
            borderRadius: '6px',
            minHeight: '42px',
            '&:hover': {
              borderColor: appColors.borderColor,
            },
            boxShadow: 'none',
            color: appColors.textColor,
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: appColors.primaryColor,
            color: appColors.textColor,
            zIndex: 9999,
          }),
          menuList: (provided) => ({
            ...provided,
            backgroundColor: appColors.primaryColor,
            color: appColors.textColor,
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? appColors.hoverColor
              : state.isFocused
                ? appColors.hoverColor
                : appColors.primaryColor,
            color: appColors.textColor,
            '&:active': {
              backgroundColor: appColors.hoverColor,
            },
          }),
          singleValue: (provided) => ({
            ...provided,
            color: appColors.textColor,
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: appColors.hoverColor,
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: appColors.textColor,
          }),
          placeholder: (provided) => ({
            ...provided,
            color: '#aaa',
          }),
          input: (provided) => ({
            ...provided,
            color: appColors.textColor,
          }),
        }}
        {...props}
      />

      {errorMessage && (
        <p className="mt-1 text-sm text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}