import { defineManifest } from '@crxjs/vite-plugin'

import pkg from './package.json'

export default defineManifest({
    manifest_version: 3,
    name: 'Papertrail OSINT Collector',
    version: pkg.version,
    description:
        'Project-based OSINT collection workspace. Collects observations while browsing and surfaces an intelligence graph.',
    permissions: ['storage', 'activeTab', 'sidePanel', 'tabs', 'scripting', 'contextMenus'],
    host_permissions: ['https://www.google.com/maps/*'],
    action: {
        default_title: 'Papertrail',
        default_popup: 'src/popup/index.html',
    },
    side_panel: {
        default_path: 'src/side-panel/index.html',
    },
    background: {
        service_worker: 'src/background/service-worker.ts',
        type: 'module',
    },
    content_scripts: [
        {
            matches: ['https://www.google.com/maps/*'],
            js: ['src/content/content-script.ts'],
            run_at: 'document_idle',
        },
    ],
})
