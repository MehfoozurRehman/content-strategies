export const EXCLUED_PATHS = ['/', '/login', '/forgot-password', '/sign-up', '/reset-password'];

export const accessibleRoutes = {
    "end-user": ["/voice-of-customer",'/assistant',"/voice-of-business","/voice-of-market",'/account-settings'],
    "admin": ["/voice-of-customer", "/user-management","/assistant","/voice-of-business","/voice-of-market",'/account-settings'],
    "editor": ["/voice-of-customer", "/user-management","/assistant","/voice-of-business","/voice-of-market",'/account-settings'],
    "super-admin":["/voice-of-customer", "/user-management","/assistant","/voice-of-business",'/voice-of-market','/category','/ai-navigator-users','/account-settings','/manage-library'],
    "super-editor":["/voice-of-customer", "/user-management","/assistant","/voice-of-business",'/voice-of-market','/category','/account-settings']
};

export const getRandomColor = () => {
    const colors = [
        "bg-red-100 text-red-700",
        "bg-green-100 text-green-700",
        "bg-blue-100 text-blue-700",
        "bg-yellow-100 text-yellow-700",
        "bg-purple-100 text-purple-700",
        "bg-pink-100 text-pink-700",
        "bg-indigo-100 text-indigo-700",
        "bg-gray-100 text-gray-700"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

export const COMPANY_CONFIG = [
    {
      id: "1",
      podcastTitle: "The Contact Center Perspectives Podcast",
      logo: "/logo_content_stratigies.png"
    },
    {
      id: "4",
      podcastTitle: "Go Beyond the Connection Podcast",
      logo: "/BigleafDark.png"
    },
    {
      id: "5",
      podcastTitle: "Go Beyond the Connection Podcast",
      logo: "/EastridgeDark.png"
    },
    {
      id: "7",
      podcastTitle: "Conversations from the frontline of digital services",
      logo: "/TaskUsDark.png"
    }
  ];
  
  export const getCompanyConfig = (companyId) => {
    return COMPANY_CONFIG.find(c => c.id === companyId) || COMPANY_CONFIG[0];
  };

