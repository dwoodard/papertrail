import { computed } from 'vue'

export function useKeywordGroups(results) {
  const keywordGroups = computed(() => {
    const groups = {}

    results.value.forEach(result => {
      const keyword = result.keyword || 'Untagged'
      if (!groups[keyword]) {
        groups[keyword] = []
      }
      groups[keyword].push(result)
    })

    return groups
  })

  return keywordGroups
}
