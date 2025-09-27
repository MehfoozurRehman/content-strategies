import React from 'react';
import { Input } from '@/components/ui/input';
import { appColors } from '@/lib/theme';

export default function CustomInput({
    id,
    type,
    placeholder,
    value,
    label,
    onChange,
    disabled,
    required = false,
    className,
    errorMessage,
    ...props
}) {
    return (
        <div className='w-full'>
            {label && (
                <label htmlFor={id} className="block text-sm font-bold mb-1" style={{ color: appColors.textColor }}>
                    {label}
                    {required ? (
                        <span
                            className="text-red-500 ml-1"
                            style={{ display: 'inline-block' }}
                            aria-hidden="true"
                        >
                            *
                        </span>
                    ) : null}
                </label>
            )}
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                {...props}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md 
    focus:outline-none focus:ring-1 focus:ring-[#1a1b41] 
    focus:border-gray-300  transition ${className}`}
                style={{

                    backgroundColor: appColors.primaryColor,
                    color: appColors.textColor
                }}
            />
            {/* {required && !value && (
                <p className="mt-1 text-sm text-red-500">
                    {errorMessage || 'This field is required'}
                </p>
            )} */}


        </div>
    );
}
