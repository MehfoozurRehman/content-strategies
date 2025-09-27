'use client';

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Spinner from "./loading";
import AuthGuard from "./customComponents/AuthGurad";
import NavigationMenu from "./customComponents/NavigationMenu";
import Alert from "./customComponents/Alert";
import { ToastContainer } from "react-toastify";
import { appColors } from "@/lib/theme";


export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prevent inspect and dev tools
      const disableDevTools = (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') || 
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
          e.preventDefault();
          alert('For Security Reasons Developer tools are disabled for this site');
        }
      };

      // Prevent right click
      const disableContextMenu = (e) => {
        e.preventDefault();
        alert('For Security Reasons  Developer tools are disabled for this site');
      };

      document.addEventListener('keydown', disableDevTools);
      document.addEventListener('contextmenu', disableContextMenu);

      // Cleanup
      return () => {
        document.removeEventListener('keydown', disableDevTools);
        document.removeEventListener('contextmenu', disableContextMenu);
      };
    }
  }, []);
  return (
    <html lang="en" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
      <head>
        <title>AI Navigator</title>
      </head>
      <body style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }} cz-shortcut-listen="true">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Alert />
            <ToastContainer />
            <AuthGuard>
              <NavigationMenu />
              {children}
            </AuthGuard>
          </>
        )}
      </body>
    </html>
  );
}
