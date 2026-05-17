// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function safeParse(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export const AuthProvider = ({ children }) => {
    const [user,     setUser]     = useState(() => safeParse("user"));
    const [menus,    setMenus]    = useState(() => safeParse("menus", []));
    const [org,      setOrg]      = useState(() => safeParse("org"));
    const [roleName, setRoleName] = useState(() => localStorage.getItem("role_name") || "");

    const login = (data) => {
        // Token in sessionStorage (cleared on browser close)
        sessionStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));
        localStorage.setItem("menus", JSON.stringify(data.menus));

        setUser(data.user);
        setMenus(data.menus);

        if (data.org) {
            localStorage.setItem("org", JSON.stringify(data.org));
            setOrg(data.org);
        }
        if (data.role_name) {
            localStorage.setItem("role_name", data.role_name);
            setRoleName(data.role_name);
        }
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("menus");
        localStorage.removeItem("org");
        localStorage.removeItem("role_name");
        setUser(null);
        setMenus([]);
        setOrg(null);
        setRoleName("");
    };

    return (
        <AuthContext.Provider value={{ user, menus, org, roleName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const usePermission = (path) => {
    const { menus } = useAuth();

    if (!path || path === "/Dashboard" || path === "/") {
        return { canView: true, canAdd: true, canEdit: true, canDelete: true };
    }

    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
    const menu = menus.find(m => m.path === normalizedPath || m.path === path);

    if (!menu?.permissions) {
        return { canView: false, canAdd: false, canEdit: false, canDelete: false };
    }

    return {
        canView:   !!menu.permissions.view,
        canAdd:    !!menu.permissions.add,
        canEdit:   !!menu.permissions.edit,
        canDelete: !!menu.permissions.delete,
    };
};
