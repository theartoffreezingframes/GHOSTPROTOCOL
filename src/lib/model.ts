/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // DERIVED MODEL
 * ═══════════════════════════════════════════════════════════════
 * Every count the UI displays is computed here, once, from the two
 * source arrays (operatives + missions). No component hardcodes a
 * number, and there is no second copy of the participation data.
 */
import { activeOperatives, missionHistory, type Operative } from '../data/team'
import {
  archive,
  statusDisplay,
  type Mission,
  type MissionId,
  type MissionStatus,
} from '../data/missions'

export type DerivedStats = {
  operatives: number
  missions: number
  completed: number
  ongoing: number
  upcoming: number
  activeOperations: number
  archivedOperations: number
  assignments: number
  soloOperations: number
}

export const stats: DerivedStats = {
  operatives: activeOperatives.length,
  missions: archive.length,
  completed: archive.filter((mission) => mission.status === 'COMPLETED').length,
  ongoing: archive.filter((mission) => mission.status === 'ONGOING').length,
  upcoming: archive.filter((mission) => mission.status === 'UPCOMING').length,
  activeOperations: archive.filter((mission) => statusDisplay[mission.status].active).length,
  archivedOperations: archive.filter((mission) => mission.status === 'COMPLETED').length,
  assignments: activeOperatives.reduce((total, operative) => total + operative.missions.length, 0),
  soloOperations: archive.filter((mission) => mission.operationType === 'SOLO').length,
}

/** Operatives assigned to a mission, in official operative order. */
export function operativesForMission(id: MissionId): Operative[] {
  return activeOperatives.filter((operative) => operative.missions.includes(id))
}

/** Missions one operative is assigned to, with status already resolved. */
export function missionsForOperative(operative: Operative) {
  return missionHistory(operative)
}

/** `01` … `06` — never used for math, only for display. */
export function two(n: number) {
  return String(n).padStart(2, '0')
}

export type { Mission, MissionId, MissionStatus }
