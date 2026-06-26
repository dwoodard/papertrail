import type { PtMessage } from '@contracts'
import { resolveModule } from '@/modules/registry'
import { dispatchObservations } from '@/observations/dispatcher'
import { onMessage } from '@/utils/messaging'

/**
 * Resolve module → create runtime → listen for messages → route to runtime
 *
 * This script runs on matched URLs (e.g., google.com/maps) and:
 * 1. Resolves which module should handle this URL
 * 2. Creates the module's runtime with the observation dispatcher as emit
 * 3. Listens for commands from the side panel
 * 4. Routes commands to the appropriate runtime methods
 */

const module = resolveModule(window.location.href)

if (!module) {
  console.log('[Papertrail] No module found for this URL')
} else {
  console.log(`[Papertrail] Loaded module: ${module.descriptor.label}`)

  // Create the module's runtime, passing the dispatcher as the emit callback
  const runtime = module.createRuntime?.((observations) =>
    dispatchObservations(observations)
  )

  if (runtime) {
    // Listen for messages from the side panel
    onMessage((message: PtMessage) => {
      try {
        if (message.type === 'ACTIVATE_PASSIVE') {
          if (message.active) {
            console.log('[Papertrail] Starting passive capture')
            runtime.startPassiveCapture?.()
          } else {
            console.log('[Papertrail] Stopping passive capture')
            runtime.stopPassiveCapture?.()
          }
        } else if (message.type === 'BULK_COLLECT') {
          console.log('[Papertrail] Starting bulk collect')
          void runtime.bulkCollect?.(message.options)
        } else if (message.type === 'STOP_COLLECT') {
          console.log('[Papertrail] Stopping bulk collect')
          runtime.stopCollect?.()
        }
      } catch (error) {
        console.error('[Papertrail] Runtime error:', error)
      }
    })

    console.log('[Papertrail] Content script ready')
  } else {
    console.warn('[Papertrail] Module has no runtime')
  }
}

export {}
