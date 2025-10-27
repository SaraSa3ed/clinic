import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useGetCurrentUserQuery } from '@/services/authApi';
import { useGetRoleModulesQuery } from '@/services/rolesApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [userPermissions, setUserPermissions] = useState({});

  // التحقق من المستخدم الحالي - بمجرد توفر التوكن حتى نضمن اكتمال بيانات الدور بعد تسجيل الدخول
  const { data: currentUser, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  // استخراج roleId من أشكال متعددة قادمة من الخادم
  const extractedRoleId = (() => {
    if (!user) return null;
    // حقول مباشرة على المستخدم
    const direct = user.roleId || user.role_id || user.roleID;
    if (direct) return direct;
    // كائن الدور
    if (user.role && typeof user.role === 'object') {
      return user.role.id || user.role.roleId || user.role.role_id || user.role.roleID || null;
    }
    // في حال كان الدور نصاً (غير مدعوم لاستخراج id)
    return null;
  })();

  const roleId = extractedRoleId;

  console.log('🔍 AuthContext - Role ID extraction:', {
    user,
    roleId,
    userRoleId: user?.roleId,
    userRoleUnderscore: user?.role_id,
    userRoleCamelID: user?.roleID,
    userRole: user?.role,
    roleType: typeof user?.role,
    roleObjectId: user?.role?.id,
    roleObjectRoleId: user?.role?.roleId,
    roleObjectRole_id: user?.role?.role_id,
    roleObjectRoleID: user?.role?.roleID
  });
  
  const { data: roleModules, isLoading: isLoadingPermissions } = useGetRoleModulesQuery(
    roleId, 
    { skip: !roleId }
  );

  useEffect(() => {
    if (token) {
      console.log('🔄 AuthContext - Token changed, setting authenticated');
      setIsAuthenticated(true);
    } else {
      console.log('🔄 AuthContext - Token removed, setting unauthenticated');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      console.log('🔄 AuthContext - currentUser changed:', currentUser);
      console.log('🔄 AuthContext - currentUser structure:', {
        data: currentUser.data,
        user: currentUser.data?.user,
        directUser: currentUser,
        keys: Object.keys(currentUser)
      });

      // استخراج بيانات المستخدم من data.user إذا كانت موجودة
      const userData = currentUser.data?.user || currentUser;

      // إذا لم يكن لدينا مستخدم، أو المستخدم الحالي لا يحتوي roleId المستخرج، أو اختلفت البيانات
      const hasExistingRoleId = !!extractedRoleId;
      const shouldUpdate = !user || !hasExistingRoleId || JSON.stringify(user) !== JSON.stringify(userData);

      if (shouldUpdate) {
        console.log('✅ AuthContext - Updating user data from /auth/me');
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('⏭️ AuthContext - Skipping user update; data looks up-to-date');
      }
    }
  }, [currentUser]);

  // تحديث صلاحيات المستخدم عند تغيير الدور
  useEffect(() => {
    if (roleModules) {
      console.log('🔄 AuthContext - roleModules changed:', roleModules);
      // تحقق من أن البيانات مختلفة قبل التحديث
      if (JSON.stringify(roleModules) !== JSON.stringify(userPermissions)) {
        console.log('✅ AuthContext - Updating user permissions');
        setUserPermissions(roleModules);
      } else {
        console.log('⏭️ AuthContext - Permissions unchanged, skipping update');
      }
    } else {
      console.log('🔄 AuthContext - No roleModules data');
    }
  }, [roleModules, userPermissions]);

  useEffect(() => {
    if (error && token && !user) {
      // إذا كان هناك خطأ في التحقق من المستخدم، قم بتسجيل الخروج
      console.log('❌ AuthContext - Error in currentUser query, logging out');
      logout();
    }
  }, [error, token, user]);

  const login = (newToken, userData = null) => {
    console.log('🔄 AuthContext - Login called with token and userData:', { newToken, userData });
    
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    
    // إذا تم تمرير بيانات المستخدم، احفظها مباشرة
    if (userData) {
      console.log('✅ AuthContext - Setting user data from login:', userData);
      setUser(userData);
    }
  };

  const logout = () => {
    console.log('🔄 AuthContext - Logout called');
    localStorage.removeItem('authToken');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setUserPermissions({});
  };

  // دالة للتحقق من الصلاحيات
  const hasPermission = (moduleName, pageName, permission) => {
    console.log('🔍 hasPermission called:', {
      moduleName,
      pageName,
      permission,
      userPermissions: userPermissions ? Object.keys(userPermissions) : 'null',
      hasModule: userPermissions && userPermissions[moduleName] ? 'yes' : 'no'
    });
    
    if (!userPermissions || !userPermissions[moduleName] || !userPermissions[moduleName].pages) {
      console.log('❌ hasPermission - No module or pages found');
      return false;
    }
    
    const page = userPermissions[moduleName].pages[pageName];
    if (!page || !page.permissions) {
      console.log('❌ hasPermission - No page or permissions found:', {
        page,
        availablePages: userPermissions[moduleName].pages ? Object.keys(userPermissions[moduleName].pages) : 'none'
      });
      return false;
    }
    
    const hasPermissionResult = page.permissions[permission] === true;
    console.log('✅ hasPermission result:', {
      permission,
      value: page.permissions[permission],
      result: hasPermissionResult
    });
    
    return hasPermissionResult;
  };

  // دالة للتحقق من إمكانية الوصول للصفحة
  const canAccessPage = (moduleName, pageName) => {
    const result = hasPermission(moduleName, pageName, 'canView');
    return result;
  };

  // دالة للتحقق من إمكانية الإضافة
  const canCreate = (moduleName, pageName) => {
    return hasPermission(moduleName, pageName, 'canCreate');
  };

  // دالة للتحقق من إمكانية التعديل
  const canUpdate = (moduleName, pageName) => {
    return hasPermission(moduleName, pageName, 'canUpdate');
  };

  // دالة للتحقق من إمكانية الحذف
  const canDelete = (moduleName, pageName) => {
    return hasPermission(moduleName, pageName, 'canDelete');
  };

  // دالة للتحقق من إمكانية التصدير
  const canExport = (moduleName, pageName) => {
    return hasPermission(moduleName, pageName, 'canExport');
  };

  // دالة للتحقق من إمكانية الاستيراد
  const canImport = (moduleName, pageName) => {
    return hasPermission(moduleName, pageName, 'canImport');
  };

  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    isLoadingPermissions,
    userPermissions,
    login,
    logout,
    hasPermission,
    canAccessPage,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
    canImport,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
