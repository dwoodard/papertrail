const transcript = await (async function() {
    async function openTranscript() {
        const transcriptButton = document.querySelector(
            'button[aria-label="Show transcript"], #primary-button ytd-button-shape button'
        )

        if (!transcriptButton) {
            console.error("Transcript button not found. You may need to expand the description first.")
            return null
        }

        transcriptButton.click()

        return new Promise((resolve, reject) => {
            const contents = document.querySelector('#contents')

            if (!contents) {
                reject("#contents not found.")
                return
            }

            const getContainer = () => {
                return document.querySelector('.ytSectionListRendererContents')
            }

            const getSegments = () => {
                const container = getContainer()

                if (!container) {
                    return []
                }

                return Array.from(
                    container.querySelectorAll('.ytwTranscriptSegmentViewModelHost')
                )
            }

            let idleTimer = null

            const finishIfReady = () => {
                const container = getContainer()
                const segments = getSegments()

                if (!container || segments.length === 0) {
                    return
                }

                clearTimeout(idleTimer)

                idleTimer = setTimeout(() => {
                    const finalSegments = getSegments()

                    if (finalSegments.length > 0) {
                        observer.disconnect()
                        console.log(`Transcript loaded with ${finalSegments.length} segments.`)
                        resolve(container)
                    }
                }, 750)
            }

            const existingContainer = getContainer()
            const existingSegments = getSegments()

            if (existingContainer && existingSegments.length > 0) {
                console.log(`Transcript already loaded with ${existingSegments.length} segments.`)
                resolve(existingContainer)
                return
            }

            const observer = new MutationObserver(() => {
                finishIfReady()
            })

            observer.observe(contents, {
                childList: true,
                subtree: true,
                characterData: true
            })

            finishIfReady()
        })
    }

    function copyTranscriptText(container) {
        const segments = container.querySelectorAll('.ytwTranscriptSegmentViewModelHost')

        const transcript = Array.from(segments)
            .map(segment => {
                const timestamp = segment
                    .querySelector('.ytwTranscriptSegmentViewModelTimestamp')
                    ?.innerText
                    .trim() || ""

                const text = segment
                    .querySelector('.ytAttributedStringHost')
                    ?.innerText
                    .trim() || ""

                return `${timestamp} ${text}`.trim()
            })
            .filter(line => line.length > 0)
            .join('\n')

        copy(transcript)

        console.log("Successfully copied transcript to clipboard.")
        console.log(transcript)

        return transcript
    }

    const container = await openTranscript()

    if (!container) {
        return ""
    }

    return copyTranscriptText(container)
})()


