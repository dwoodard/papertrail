/** Generate a RFC-4122 v4 id. Available in extension contexts via Web Crypto. */
export function uuid(): string {
    return crypto.randomUUID()
}
