import type { ActiveModuleContext } from '@contracts'
import { onMounted, onUnmounted, ref } from 'vue'

import { buildModuleContext } from '@/modules/registry'

/**
 * Tracks which collector module applies to the active tab, updating as the
 * user switches tabs or navigates (product spec §5 — "update based on the
 * current tab"). Resolves entirely client-side from the tab URL.
 */
export function useActiveModule() {
    const context = ref<ActiveModuleContext | null>(null)

    async function refresh(): Promise<void> {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (tab?.id != null && tab.url) {
            context.value = buildModuleContext(tab.id, tab.url)
        } else {
            context.value = null
        }
    }

    const onActivated = (): void => {
        void refresh()
    }
    const onUpdated = (
        _tabId: number,
        changeInfo: chrome.tabs.TabChangeInfo,
        tab: chrome.tabs.Tab,
    ): void => {
        if (tab.active && (changeInfo.url || changeInfo.status === 'complete')) {
            void refresh()
        }
    }

    onMounted(() => {
        void refresh()
        chrome.tabs.onActivated.addListener(onActivated)
        chrome.tabs.onUpdated.addListener(onUpdated)
    })

    onUnmounted(() => {
        chrome.tabs.onActivated.removeListener(onActivated)
        chrome.tabs.onUpdated.removeListener(onUpdated)
    })

    return { context, refresh }
}
