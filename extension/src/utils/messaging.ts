import type { PtMessage, PtMessageOf, PtMessageType } from '@contracts'

/**
 * Typed wrappers over Chrome's messaging APIs. Everything that crosses a
 * context boundary (content ⇄ background ⇄ side panel ⇄ popup) goes through a
 * `PtMessage`, so senders and handlers stay type-checked.
 */

/** Broadcast to the extension (background + any open panel/popup). */
export function sendRuntimeMessage(message: PtMessage): Promise<void> {
    return new Promise((resolve) => {
        if (!chrome?.runtime) {
            console.log('[Dev Mode] Skipping message:', message.type)
            resolve()

            return
        }

        chrome.runtime.sendMessage(message, () => {
            // Swallow "receiving end does not exist" when no listener is open.
            void chrome.runtime.lastError
            resolve()
        })
    })
}

/** Send to a specific tab's content script. */
export function sendTabMessage(tabId: number, message: PtMessage): Promise<void> {
    return new Promise((resolve) => {
        if (!chrome?.tabs) {
            console.log('[Dev Mode] Skipping tab message:', message.type)
            resolve()

            return
        }

        chrome.tabs.sendMessage(tabId, message, () => {
            if (chrome.runtime.lastError) {
                console.error('[Messaging] Send error to tab', tabId, ':', chrome.runtime.lastError.message)
            } else {
                console.log('[Messaging] Message sent to tab', tabId, ':', message.type)
            }

            resolve()
        })
    })
}

/** Send to the content script of the active tab in the current window. */
export async function sendToActiveTab(message: PtMessage): Promise<void> {
    if (!chrome?.tabs) {
        console.log('[Dev Mode] Skipping active tab message:', message.type)

        return
    }

    // Get all tabs
    const allTabs = await chrome.tabs.query({})
    console.log('[Messaging] Total tabs:', allTabs.length)

    // Log all tabs to help debug
    allTabs.forEach((t, i) => {
        if (t.url?.includes('google.com') || t.url?.includes('youtube.com')) {
            console.log(`[Messaging] Tab ${i}: ID=${t.id}, Active=${t.active}, URL=${t.url?.substring(0, 80)}`)
        }
    })

    // Find Google Maps or YouTube tab (the content script runs on these)
    let tabs = allTabs.filter(t => t.url?.includes('google.com/maps/search') || t.url?.includes('youtube.com'))
    console.log('[Messaging] Found content-script tabs:', tabs.length)

    // If still no tab, try active tab
    if (tabs.length === 0) {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true })
        console.log('[Messaging] Falling back to active tab:', activeTabs[0]?.url?.substring(0, 60))
        tabs = activeTabs
    }

    const tab = tabs[0]

    if (tab?.id != null) {
        console.log('[Messaging] Sending', message.type, 'to tab', tab.id)
        await sendTabMessage(tab.id, message)
    } else {
        console.error('[Messaging] No target tab found for message:', message.type)
    }
}

/** Subscribe to all incoming messages. Returns an unsubscribe function. */
export function onMessage(handler: (message: PtMessage) => void): () => void {
    const listener = (message: unknown) => {
        if (message && typeof message === 'object' && 'type' in message) {
            handler(message as PtMessage)
        }
    }

    if (!chrome?.runtime) {
        return () => {} // No-op in dev mode
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => chrome.runtime.onMessage.removeListener(listener)
}

/** Subscribe to a single message variant by its `type`. */
export function onMessageOfType<T extends PtMessageType>(
    type: T,
    handler: (message: PtMessageOf<T>) => void,
): () => void {
    return onMessage((message) => {
        if (message.type === type) {
            handler(message as PtMessageOf<T>)
        }
    })
}
