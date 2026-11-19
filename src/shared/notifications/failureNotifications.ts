export type ProcessingFailure = { id: string; error: string }

/** Initial snapshots are history; only subsequent, previously unseen failures notify. */
export class FailureNotifications {
  private seen = new Map<string, Set<string>>()

  collect(conversationId: string, failures: ProcessingFailure[]): ProcessingFailure[] {
    const known = this.seen.get(conversationId)
    if (!known) {
      this.seen.set(conversationId, new Set(failures.map(failure => failure.id)))
      return []
    }
    const fresh = failures.filter(failure => !known.has(failure.id))
    for (const failure of fresh) known.add(failure.id)
    return fresh
  }
}
