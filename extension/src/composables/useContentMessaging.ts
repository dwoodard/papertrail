import type { BulkCollectOptions, CollectProgress } from '@contracts'
import { onMounted, onUnmounted, ref } from 'vue'

import { onMessage, sendToActiveTab } from '@/utils/messaging'

/**
 * Side-panel side of the content bridge: sends collection commands to the
 * active tab's content script and tracks bulk-collect progress reported back.
 */
export function useContentMessaging() {
    const collecting = ref(false)
    const progress = ref<CollectProgress>({ done: 0, total: 0 })
    let unsubscribe: (() => void) | null = null

    function startCollect(options: BulkCollectOptions = {}): Promise<void> {
        collecting.value = true
        progress.value = { done: 0, total: 0 }

        return sendToActiveTab({ type: 'BULK_COLLECT', options })
    }

    function stopCollect(): Promise<void> {
        return sendToActiveTab({ type: 'STOP_COLLECT' })
    }

    function setPassive(active: boolean): Promise<void> {
        return sendToActiveTab({ type: 'ACTIVATE_PASSIVE', active })
    }

    onMounted(() => {
        unsubscribe = onMessage((message) => {
            if (message.type === 'COLLECT_PROGRESS') {
                collecting.value = true
                progress.value = message.progress
            } else if (message.type === 'COLLECT_DONE') {
                collecting.value = false
            }
        })
    })

    onUnmounted(() => {
        unsubscribe?.()
    })

    return { collecting, progress, startCollect, stopCollect, setPassive }
}
