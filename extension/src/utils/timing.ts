/** Random integer in [min, max] inclusive. */
export const rand = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min

/** Promise that resolves after `ms` milliseconds. */
export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
