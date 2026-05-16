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
    const [user, setUser] = useState(() => safeParse("user"));
    const [menus, setMenus] = useState(() => safeParse("menus", []));

    const login = (data) => {
        // Token stored in sessionStorage so it doesn't persist across browser sessions
        sessionStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("menus", JSON.stringify(data.menus));

        setUser(data.user);
        setMenus(data.menus);
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("menus");
        setUser(null);
        setMenus([]);
    };

    return (
        <AuthContext.Provider value={{ user, menus, login, logout }}>
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
