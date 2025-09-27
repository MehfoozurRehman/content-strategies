"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const tokenExpiry = localStorage.getItem("tokenExpiry");
        
        // Check if token exists and hasn't expired
        const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);
        
        // Define paths that don't require authentication
        const isExcludedPath =
          pathname.endsWith("/") ||
          pathname.endsWith("/login") ||
          pathname.endsWith("/forgot-password") ||
          pathname.endsWith("/reset-password") ||
          pathname.endsWith("/sign-up");

        // If token is expired, clear storage and redirect to login
        if (token && isTokenExpired) {
          console.log("Token expired, redirecting to login");
          localStorage.clear();
          router.push("/login");
          return;
        }

        // If no valid token and trying to access protected route
        if (!token && !isExcludedPath) {
          router.push("/login");
          return;
        }

        // If we have a token, verify it with Supabase
        if (token) {
          const { data, error } = await supabase.auth.getUser(token);
          
          if (error) {
            // console.error("Auth error:", error);
            
            // If it's a token expiration error, try to refresh
            if (error.message.includes("expired") || error.status === 401) {
              const refreshToken = localStorage.getItem("refreshToken");
              
              if (refreshToken) {
                try {
                  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                    refresh_token: refreshToken
                  });
                  
                  if (refreshError) throw refreshError;
                  
                  if (refreshData.session) {
                    // Update tokens in localStorage
                    localStorage.setItem("token", refreshData.session.access_token);
                    localStorage.setItem("refreshToken", refreshData.session.refresh_token);
                    localStorage.setItem("tokenExpiry", (new Date().getTime() + refreshData.session.expires_in * 1000).toString());
                    
                    // Continue with the request
                    return;
                  }
                } catch (refreshError) {
                  console.error("Token refresh failed:", refreshError);
                  // If refresh fails, clear everything and redirect to login
                  localStorage.clear();
                  router.push("/login");
                  return;
                }
              } else {
                // No refresh token available, clear and redirect
                localStorage.clear();
                router.push("/login");
                return;
              }
            } else {
              // Other auth errors - clear storage and redirect
              localStorage.clear();
              router.push("/login");
              return;
            }
          }

          // If user is authenticated and on an excluded path, redirect to assistant
          if (isExcludedPath) {
            router.push("/assistant");
            return;
          }
        }

        setChecked(true); // Done checking
      } catch (error) {
        // console.error("Auth check error:", error);
        localStorage.clear();
        router.push("/login");
      }
    };

    checkAuthStatus();
  }, [router, pathname]);

  // Show loading state while checking auth
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
