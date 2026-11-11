import type { TeamMember } from './sanity';

/**
 * Seat order for the executive, read from each member's role text so it holds
 * whatever rank an editor picked in Sanity. Row one is the society's officers,
 * row two its vice presidents; any other executive role follows in a third row.
 */
const SEATS: { row: number; match: RegExp }[] = [
  { row: 0, match: /chair/i },
  { row: 0, match: /^(co-?\s*)?president/i },
  { row: 0, match: /general\s+sec|gen\.?\s*sec|secretary/i },
  { row: 1, match: /(vice\s+president|vp).*external/i },
  { row: 1, match: /(vice\s+president|vp).*event/i },
  { row: 1, match: /(vice\s+president|vp).*activit/i },
  { row: 1, match: /(vice\s+president|vp).*operation/i },
  { row: 1, match: /vice\s+president|^vp\b/i },
];

function seatOf(member: TeamMember) {
  const index = SEATS.findIndex((seat) => seat.match.test(member.role ?? ''));
  return index === -1 ? { row: 2, index: SEATS.length } : { row: SEATS[index].row, index };
}

const byOrderThenName = (a: TeamMember, b: TeamMember) =>
  (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name);

/** The executive as rows of seats, empty rows dropped */
export function executiveRows(members: TeamMember[]): TeamMember[][] {
  const rows: TeamMember[][] = [[], [], []];
  const seated = members
    .filter((m) => m.category === 'exec')
    .map((member) => ({ member, seat: seatOf(member) }))
    .sort((a, b) => a.seat.index - b.seat.index || byOrderThenName(a.member, b.member));
  for (const { member, seat } of seated) rows[seat.row].push(member);
  return rows.filter((row) => row.length > 0);
}

const PORTFOLIOS = ['Marketing', 'Multimedia', 'Events', 'Sponsorships', 'Socials', 'Human Resources'];

/** Directors grouped by portfolio, in the schema's portfolio order */
export function directorGroups(members: TeamMember[]) {
  const directors = members.filter((m) => m.category === 'director');
  const names = [...new Set(directors.map((m) => m.portfolio || 'Directors'))].sort(
    (a, b) => (PORTFOLIOS.indexOf(a) + 1 || 99) - (PORTFOLIOS.indexOf(b) + 1 || 99),
  );
  return names.map((name) => ({
    name,
    members: directors.filter((m) => (m.portfolio || 'Directors') === name).sort(byOrderThenName),
  }));
}
