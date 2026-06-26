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

    const tabs = await chrome.tabs.query({ active: true })
    const tab = tabs[0]

    if (tab?.id != null) {
        await sendTabMessage(tab.id, message)
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
