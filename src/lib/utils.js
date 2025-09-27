import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function isValidPassword(password) {
  return password.length >= 6;

}
export function formatUrl(url) {
  if (!url) return '#';

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
}
export const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

// utils/themeHelpers.js
export const normalizeThemes = (themes) => {
  if (!themes) return [];

  // If it's already an array of strings, return as is
  if (Array.isArray(themes) && themes.every(item => typeof item === 'string')) {
    return themes;
  }

  // If it's an array of objects, extract the theme values
  if (Array.isArray(themes) && themes.every(item => typeof item === 'object')) {
    return themes.map(item => item.theme || item);
  }

  // Handle case where themes might be a stringified JSON
  try {
    const parsed = typeof themes === 'string' ? JSON.parse(themes) : themes;
    return normalizeThemes(parsed);
  } catch (e) {
    console.log("Error parsing themes:", e);
    return [];
  }
};

export const sanitizeFileName = (name) => {
  return name
    .replace(/\s+/g, '_')      // replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, ''); // remove special chars
};

export const getNestedCount = (obj) => {
  if (!obj || typeof obj !== 'object') return 0;
  
  return Object.values(obj)
    .filter(Array.isArray)
    .reduce((total, items) => total + items.length, 0);
};

// Add this utility function at the top of the file
export const extractFieldsFromTemplate = (templateText) => {
  const fieldRegex = /{([^}]+)}/g;
  const fields = [];
  let match;

  while ((match = fieldRegex.exec(templateText))) {
    fields.push(match[1].trim());
  }

  return Array.from(new Set(fields)); // Remove duplicates
};