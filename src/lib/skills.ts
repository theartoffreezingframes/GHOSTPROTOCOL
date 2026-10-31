/**
 * ═══════════════════════════════════════════════════════════════
 * GHOST PROTOCOL // CAPABILITY MATRIX
 * ═══════════════════════════════════════════════════════════════
 * Derives what the repo can actually evidence about each operative.
 * Nothing is scored, estimated, ranked or inferred from a codename or
 * a role title.
 *
 * Four states, because three would force a false claim:
 *
 *   VERIFIED                the operative's own record declares a tool in
 *                           this category. Cites exactly which one.
 *   PENDING VERIFICATION    an individual claim is expected but not yet
 *                           confirmed. Nothing is inferred to fill the gap.
 *   UNIT TOOLKIT            the tool is declared for the unit, but no
 *                           individual record claims it. This is a
 *                           team-level fact, never a claim about a person.
 *   NOT SPECIFIED           an operative is on record, but nothing maps
 *                           them to this category.
 *   INFORMATION UNAVAILABLE this axis is not tool-based, so the site
 *                           claims nothing either way.
 *
 * Collapsing UNIT TOOLKIT into VERIFIED is the exact error that would
 * turn a team capability into six invented individual skills.
 */
import { arsenalGroups, arsenalTools, type ArsenalGroupId, type ArsenalTool } from '../data/site'
import { activeOperatives } from '../data/team'

export type SkillState =
  | 'VERIFIED'
  | 'PENDING VERIFICATION'
  | 'UNIT TOOLKIT'
  | 'NOT SPECIFIED'
  | 'INFORMATION UNAVAILABLE'

export type SkillCategoryId =
  | ArsenalGroupId
  | 'web-development'
  | 'databases'
  | 'reverse-engineering'
  | 'technical-research'
  | 'intelligence-analysis'

export type SkillCategory = {
  id: SkillCategoryId
  label: string
  note: string
  /** Tool-based rows can be evidenced by the arsenal; the rest cannot. */
  toolBased: boolean
  /** Shown when a cell has no verification for this row. */
  basis: string
  /** Category-level note used in the detail panel. */
  teamNote?: string
}

/**
 * Ten comparison rows. The first six are the existing arsenal groups —
 * reused, not copied — so a tool added to the arsenal appears here with
 * no second edit.
 */
export const skillCategories: SkillCategory[] = [
  ...arsenalGroups.map((group) => ({
    id: group.id as SkillCategoryId,
    label: group.label,
    note: group.note,
    toolBased: true,
    basis: 'No declared tool recorded for this operative.',
    teamNote: 'Declared at unit level; no individual record names a tool here.',
  })),
  {
    id: 'web-development',
    label: 'WEB DEVELOPMENT',
    note: 'FRONTEND & SERVICE WORK',
    toolBased: false,
    basis: 'No record maps this axis to an operative, so nothing is claimed.',
  },
  {
    id: 'databases',
    label: 'DATABASE TECHNOLOGIES',
    note: 'STORAGE & QUERY ENGINES',
    toolBased: false,
    basis: 'Not a tool category on this site, so it cannot be evidenced here.',
  },
  {
    id: 'reverse-engineering',
    label: 'REVERSE ENGINEERING',
    note: 'BINARY & PROTOCOL ANALYSIS',
    toolBased: false,
    basis: 'Not a tool category on this site, so it cannot be evidenced here.',
  },
  {
    id: 'technical-research',
    label: 'TECHNICAL RESEARCH',
    note: 'TOOLING RESEARCH & EVALUATION',
    toolBased: true,
    basis: 'No declared tool recorded for this operative.',
  },
  {
    id: 'intelligence-analysis',
    label: 'INTELLIGENCE ANALYSIS',
    note: 'REPORTING & PATTERN WORK',
    toolBased: false,
    basis: 'Not a tool category on this site, so it cannot be evidenced here.',
  },
]

/**
 * Tools this *operative* is personally documented with.
 * Evidence is the operative's own `skills` array — the `skills: []` on
 * every record today is why no individual cell is VERIFIED yet.
 */
export function toolsFor(codename: string, category: SkillCategoryId): ArsenalTool[] {
  const row = skillCategories.find((entry) => entry.id === category)
  if (!row?.toolBased) return []
  const operative = activeOperatives.find((record) => record.codename === codename)
  if (!operative || operative.skills.length === 0) return []

  const declared = operative.skills.map((skill) => skill.toLowerCase())
  return arsenalTools.filter(
    (tool) =>
      tool.group === category &&
      [tool.name, ...tool.aliases].some((name) => declared.includes(name.toLowerCase())),
  )
}

/** Tools declared for the unit as a whole in one category. */
export function teamToolsFor(category: SkillCategoryId): ArsenalTool[] {
  const row = skillCategories.find((entry) => entry.id === category)
  if (!row?.toolBased) return []
  return arsenalTools.filter((tool) => tool.group === category && tool.teamWide)
}

export type SkillCell = {
  state: SkillState
  tools: ArsenalTool[]
  /** Short label for the cell. */
  label: string
  /** Full sentence used as the accessible description / tooltip. */
  detail: string
}

export function skillCell(codename: string, category: SkillCategory): SkillCell {
  if (!category.toolBased) {
    return {
      state: 'INFORMATION UNAVAILABLE',
      tools: [],
      label: '—',
      detail: `${category.label}: the site holds no records on this axis, so nothing is claimed.`,
    }
  }

  // 1. Personal evidence first — the only thing that may say VERIFIED.
  const personal = toolsFor(codename, category.id)
  if (personal.length > 0) {
    return {
      state: 'VERIFIED',
      tools: personal,
      label: String(personal.length).padStart(2, '0'),
      detail: `${category.label}: ${codename}'s record declares ${personal
        .map((tool) => tool.name)
        .join(', ')}.`,
    }
  }

  // 2. Unit-level declaration — explicitly NOT a claim about this person.
  const team = teamToolsFor(category.id)
  if (team.length > 0) {
    return {
      state: 'UNIT TOOLKIT',
      tools: team,
      label: 'UNIT',
      detail: `${category.label}: the unit declares ${team
        .map((tool) => tool.name)
        .join(', ')}, but ${codename}'s own record does not name a tool here.`,
    }
  }

  // 3. Nothing on file for this person. Individual skill stays pending —
  //    rank, codename, participation and job description are never
  //    promoted into evidence.
  return {
    state: 'PENDING VERIFICATION',
    tools: [],
    label: '—',
    detail: `${category.label}: ${codename} has no confirmed tooling on file. Pending verification — nothing is inferred from rank or role.`,
  }
}

/** Per-operative verified tool count — a count of records, never a score. */
export function verifiedToolCount(codename: string) {
  const operative = activeOperatives.find((record) => record.codename === codename)
  if (!operative || operative.skills.length === 0) return 0
  const declared = operative.skills.map((skill) => skill.toLowerCase())
  return arsenalTools.filter((tool) =>
    [tool.name, ...tool.aliases].some((name) => declared.includes(name.toLowerCase())),
  ).length
}

/** The toolkit this site declares for the unit as a whole. */
export const teamToolkit = arsenalTools.filter((tool) => tool.teamWide)

export const skillMatrixCopy = {
  label: 'CAPABILITY MATRIX',
  heading: ['WHAT IS CONFIRMED.', 'WHAT IS NOT.'],
  note:
    'A record of documented tooling, not a ranking. Rows show only what this site can evidence — gaps stay labelled as gaps.',
  searchLabel: 'Filter operatives or tools',
  searchPlaceholder: 'FILTER BY OPERATIVE OR TOOL…',
  clear: 'CLEAR',
  compare: 'COMPARE',
  teamRow: 'UNIT TOOLKIT',
  states: {
    VERIFIED: 'VERIFIED',
    'PENDING VERIFICATION': 'PENDING',
    'UNIT TOOLKIT': 'UNIT TOOLKIT',
    'NOT SPECIFIED': 'NOT SPECIFIED',
    'INFORMATION UNAVAILABLE': 'INFO UNAVAILABLE',
  } as Record<SkillState, string>,
  stateNotes: {
    VERIFIED: "This operative's own record declares a tool in this category.",
    'PENDING VERIFICATION':
      'No confirmed tooling on file for this operative. Not inferred from rank or role.',
    'UNIT TOOLKIT': 'The unit declares this tooling; no individual record claims it.',
    'NOT SPECIFIED': 'Operative on record; no tool-level evidence for this category.',
    'INFORMATION UNAVAILABLE': 'This axis is not tool-based, so the site claims nothing.',
  } as Record<SkillState, string>,
  unitRow: 'UNIT TOOLKIT',
  unitNote:
    'Declared for the collective as a whole. It is not evidence about any single operative.',
  pendingBanner:
    'INDIVIDUAL SKILLS ARE PENDING VERIFICATION. No operative record names a tool of their own yet, so no person-column claims a skill. Rank, codename, mission participation and job description are never treated as evidence.',
  legendTitle: 'READING THE MATRIX',
  footnote:
    'No percentages, experience levels, proficiency scores or rankings appear here by design. A dash means the record is silent — it does not mean the operative lacks the skill.',
  empty: 'No operative or tool matches that filter.',
  detailTitle: 'CATEGORY RECORD',
}

/** The six columns, in official operative order. */
export const matrixOperatives = activeOperatives
