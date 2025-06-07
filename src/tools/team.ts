export interface Team {
  team: number;
  name: string;
  country: string;
  state: string | null;
  district: string | null;
  rookie_year: number;
  active: boolean;
  record: {
    wins: number;
    losses: number;
    ties: number;
    count: number;
    winrate: number;
  };
  norm_epa: {
    current: number;
    recent: number;
    mean: number;
    max: number;
  };
}

export function formatTeam(team: Team): string {
  return [
    `Team ${team.team}: ${team.name}`,
    `Country: ${team.country}`,
    `State: ${team.state ?? "N/A"}`,
    `District: ${team.district ?? "N/A"}`,
    `Rookie Year: ${team.rookie_year}`,
    `Active: ${team.active ? "Yes" : "No"}`,
    `Record: ${team.record.wins}-${team.record.losses}-${team.record.ties} (Games: ${team.record.count}, Winrate: ${(team.record.winrate * 100).toFixed(1)}%)`,
    `EPA (current/recent/mean/max): ${team.norm_epa.current.toFixed(2)}/${team.norm_epa.recent.toFixed(2)}/${team.norm_epa.mean.toFixed(2)}/${team.norm_epa.max.toFixed(2)}`,
  ].join("\n");
}

export function formatTeamsList(teams: Team[]): string {
  if (!teams || teams.length === 0) return "No teams found.";
  
  const lines: string[] = [];
  lines.push(`=== Found ${teams.length} Teams ===`);
  lines.push("");
  
  teams.forEach(team => {
    const location = [team.state, team.country].filter(Boolean).join(", ");
    const epa = team.norm_epa.current.toFixed(1);
    const record = `${team.record.wins}-${team.record.losses}-${team.record.ties}`;
    
    lines.push(`${team.team} | ${team.name}`);
    lines.push(`   📍 ${location} ${team.district ? `(${team.district})` : ""}`);
    lines.push(`   📊 EPA: ${epa} | Record: ${record} (${(team.record.winrate * 100).toFixed(0)}%) | Rookie: ${team.rookie_year}`);
    lines.push("");
  });
  
  return lines.join("\n");
}
