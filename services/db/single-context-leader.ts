import type { LeaderElection } from "@tanstack/offline-transactions"

// The app runs in one JS context, so this executor always owns the outbox (no tab election).
export const singleContextLeader: LeaderElection = {
  requestLeadership: () => Promise.resolve(true),
  releaseLeadership: () => {},
  isLeader: () => true,
  onLeadershipChange: () => () => {},
}
