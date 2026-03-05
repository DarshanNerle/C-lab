import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeLocalStorage } from '../utils/safeStorage'

const useThemeStore = create(
    persist(
        (set) => ({
            isSoundEnabled: true,
            soundVolume: 0.5,
            immersiveMode: false,
            animationIntensity: 'normal',
            themeMode: 'dark',
            isSidebarCollapsed: false,

            toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
            setSoundVolume: (volume) => set({ soundVolume: Math.min(1, Math.max(0, Number(volume) || 0)) }),
            toggleImmersiveMode: () => set((state) => ({ immersiveMode: !state.immersiveMode })),
            setAnimationIntensity: (mode) => set({ animationIntensity: mode === 'reduced' ? 'reduced' : 'normal' }),
            setThemeMode: (mode) => set({ themeMode: mode === 'light' ? 'light' : mode === 'system' ? 'system' : 'dark' }),
            toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            
            // Sync with DB data
            syncSettings: (settings) => set({
                isSoundEnabled: settings.soundEnabled ?? true,
                soundVolume: settings.soundVolume ?? 0.5,
                immersiveMode: settings.immersiveMode ?? false,
                animationIntensity: settings.animationIntensity === 'reduced' ? 'reduced' : 'normal',
                themeMode: settings.theme === 'light' ? 'light' : settings.theme === 'system' || settings.autoTheme ? 'system' : (settings.darkMode === false ? 'light' : 'dark'),
                isSidebarCollapsed: settings.isSidebarCollapsed ?? false
            })
        }),
        {
            name: 'c-lab-theme-settings',
            storage: safeLocalStorage
        }
    )
)

export default useThemeStore
