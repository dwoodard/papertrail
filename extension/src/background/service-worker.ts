// Papertrail background service worker.
//
// Responsibilities (built out across milestones):
//  - track the active tab and resolve which collector module matches the URL
//  - relay module context to the side panel
//  - hold the observation dispatcher (later milestone)

import { buildModuleContext } from '@/modules/registry'
import { sendRuntimeMessage } from '@/utils/messaging'

async function broadcastActiveModule(tabId: number, url: string | undefined): Promise<void> {
    if (!url) {
        return
    }

    await sendRuntimeMessage({ type: 'MODULE_ACTIVE', context: buildModuleContext(tabId, url) })
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
        void chrome.runtime.lastError
        void broadcastActiveModule(tabId, tab?.url)
    })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && (changeInfo.url || changeInfo.status === 'complete')) {
        void broadcastActiveModule(tabId, tab.url)
    }
})

// Set up context menu
chrome.contextMenus.create({
    id: 'papertrail-main',
    title: 'Papertrail Main',
    contexts: ['action'],
})

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'papertrail-main') {
        void chrome.tabs.create({
            url: chrome.runtime.getURL('src/pages/main.html'),
        })
    }
})

console.log('[Papertrail] background service worker loaded')

export {}
