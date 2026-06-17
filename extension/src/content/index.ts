// Papertrail content script entry.
//
// Responsibilities (built out across milestones):
//  - resolve which collector module matches the current page
//  - run that module's extractors and set up passive capture
//  - emit observations and respond to messages from the side panel/popup

import { resolveModule } from '@/modules/registry'
import { onMessageOfType } from '@/utils/messaging'

const url = window.location.href
const module = resolveModule(url)

if (module) {
    console.log(`[Papertrail] content: "${module.descriptor.label}" module matched`, url)
} else {
    console.log('[Papertrail] content: no module for', url)
}

// The side panel can ask the content script which module is handling this page.
onMessageOfType('REQUEST_MODULE_CONTEXT', () => {
    console.log('[Papertrail] content: module context requested')
})

export {}
