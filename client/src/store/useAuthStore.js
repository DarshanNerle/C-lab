import { create } from 'zustand'

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    dbSource: 'unknown',
    isDbDegraded: false,
    storageMode: 'mongo',
    isLocalMode: false,

    setUser: (user, profileData = null, dbSource = 'unknown', storageMode = 'mongo') => set({
        user,
        profile: profileData,
        isAuthenticated: !!user,
        isStudent: profileData?.role === 'student',
        isTeacher: profileData?.role === 'teacher',
        isAdmin: profileData?.role === 'admin',
        dbSource,
        isDbDegraded: dbSource === 'memory',
        storageMode: storageMode === 'local' ? 'local' : 'mongo',
        isLocalMode: storageMode === 'local',
        isLoading: false
    }),
    setStorageMode: (storageMode = 'mongo') => set({
        storageMode: storageMode === 'local' ? 'local' : 'mongo',
        isLocalMode: storageMode === 'local'
    }),

    clearUser: () => set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isStudent: false,
        isTeacher: false,
        isAdmin: false,
        dbSource: 'unknown',
        isDbDegraded: false,
        storageMode: 'mongo',
        isLocalMode: false,
        isLoading: false
    })
}))

export default useAuthStore
