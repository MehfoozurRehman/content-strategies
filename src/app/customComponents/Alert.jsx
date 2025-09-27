'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog'; // ShadCN modal components
import CustomButton from './CustomButton';
import { appColors } from '@/lib/theme';

const Alert = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [buttons, setButtons] = useState([]);
    const [childUI, setChildUI] = useState(null);

    useEffect(() => {
        Alert.instance = {
            show: (title = '', message = '', buttons = [], options = {}) => {
                setIsVisible(true);
                setTitle(title);
                setMessage(message);
                setButtons(buttons);
                setChildUI(options?.child ?? null);
            },
            hide: () => {
                setIsVisible(false);
                setTitle('');
                setMessage('');
                setButtons([]);
                setChildUI(null);
            },
        };

        return () => {
            Alert.instance = null;
        };
    }, []);

    Alert.show = (title, message, buttons, options) => {
        if (Alert.instance) {
            Alert.instance.show(title, message, buttons, options);
        }
    };

    Alert.hide = () => {
        if (Alert.instance) {
            Alert.instance.hide();
        }
    };

    return (
        <Dialog open={isVisible} onOpenChange={() => { }} trapFocus={true} >
            <DialogOverlay className="fixed inset-0 bg-black bg-black flex justify-center items-center" />

            <DialogContent className="z-50 max-w-sm w-full rounded-lg shadow-lg p-4 space-y-6" style={{ backgroundColor: appColors.primaryColor }} >
                {/* Header */}
                {title && (
                    <DialogHeader className="text-lg  border-b font-semibold text-center">
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                )}

                {/* Message & Child UI */}
                {message && <p className="text-center mt-4">{message}</p>}
                {childUI && <div className="w-full">{childUI}</div>}

                {/* Footer (Buttons) */}
                <div className="flex justify-end space-x-3">
                    {buttons.map((button, index) => (
                        <CustomButton
                            key={index}
                            onClick={() => {
                                Alert.hide();
                                button.onPress?.();
                            }}
                            title={button.text}
                            buttonColor={button.primary ? appColors.primaryColor : appColors.secondaryColor}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default Alert;
