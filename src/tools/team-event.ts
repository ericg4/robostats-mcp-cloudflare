export interface TeamEvent {
	team: number;
	year: number;
	event: string;
	time: number;
	team_name: string;
	event_name: string;
	country: string;
	state: string;
	district: string | null;
	type: string;
	week: number;
	status: string;
	first_event: boolean;
	epa: {
		total_points: {
			mean: number;
			sd: number;
		};
		unitless: number;
		norm: number;
		conf: [number, number];
		breakdown: {
			[key: string]: number;
		};
		stats: {
			start: number;
			pre_elim: number;
			mean: number;
			max: number;
		};
	};
	record: {
		qual: {
			wins: number;
			losses: number;
			ties: number;
			count: number;
			winrate: number;
			rps: number | null;
			rps_per_match: number | null;
			rank: number | null;
			num_teams: number;
		};
		elim: {
			wins: number;
			losses: number;
			ties: number;
			count: number;
			winrate: number;
			alliance: string | null;
			is_captain: boolean | null;
		};
		total: {
			wins: number;
			losses: number;
			ties: number;
			count: number;
			winrate: number;
		};
	};
	district_points: number | null;
}

export function formatTeamEvent(teamEvent: TeamEvent): string {
	const lines: string[] = [];

	lines.push(
		`=== Team ${teamEvent.team} "${teamEvent.team_name}" at ${teamEvent.event_name} ===`,
	);
	lines.push("");

	// Basic event info
	lines.push("📅 EVENT DETAILS");
	lines.push(`Event: ${teamEvent.event_name} (${teamEvent.event})`);
	lines.push(`Year: ${teamEvent.year} | Week: ${teamEvent.week} | Type: ${teamEvent.type}`);
	lines.push(`Location: ${teamEvent.state ? `${teamEvent.state}, ` : ""}${teamEvent.country}`);
	lines.push(`District: ${teamEvent.district || "N/A"}`);
	lines.push(`Status: ${teamEvent.status}`);
	if (teamEvent.first_event) {
		lines.push(`🆕 First event of the season`);
	}
	lines.push("");

	// EPA Performance
	lines.push("📊 EPA PERFORMANCE");
	lines.push(`Final EPA: ${teamEvent.epa.norm.toFixed(2)} (Normalized)`);
	lines.push(`Unitless EPA: ${teamEvent.epa.unitless.toFixed(2)}`);
	lines.push(
		`Confidence Interval: [${teamEvent.epa.conf[0].toFixed(2)}, ${teamEvent.epa.conf[1].toFixed(2)}]`,
	);
	lines.push(
		`Expected Score: ${teamEvent.epa.total_points.mean.toFixed(1)} ± ${teamEvent.epa.total_points.sd.toFixed(1)}`,
	);
	lines.push("");

	// EPA progression
	lines.push("📈 EPA PROGRESSION");
	lines.push(`Starting EPA: ${teamEvent.epa.stats.start.toFixed(2)}`);
	lines.push(`Pre-Elimination EPA: ${teamEvent.epa.stats.pre_elim.toFixed(2)}`);
	lines.push(`Mean EPA: ${teamEvent.epa.stats.mean.toFixed(2)}`);
	lines.push(`Peak EPA: ${teamEvent.epa.stats.max.toFixed(2)}`);
	lines.push("");

	// Game breakdown
	if (Object.keys(teamEvent.epa.breakdown).length > 0) {
		lines.push("🎮 GAME BREAKDOWN");
		Object.entries(teamEvent.epa.breakdown).forEach(([component, value]) => {
			lines.push(`${component}: ${value.toFixed(2)}`);
		});
		lines.push("");
	}

	// Qualification record
	lines.push("🏆 QUALIFICATION RECORD");
	const qualRecord = teamEvent.record.qual;
	lines.push(
		`Record: ${qualRecord.wins}-${qualRecord.losses}-${qualRecord.ties} (${(qualRecord.winrate * 100).toFixed(1)}%)`,
	);
	if (qualRecord.rank !== null) {
		lines.push(`Ranking: ${qualRecord.rank}/${qualRecord.num_teams}`);
	}
	if (qualRecord.rps !== null && qualRecord.rps_per_match !== null) {
		lines.push(
			`Ranking Points: ${qualRecord.rps} total (${qualRecord.rps_per_match.toFixed(1)} per match)`,
		);
	}
	lines.push(`Matches Played: ${qualRecord.count}`);
	lines.push("");

	// Elimination record
	if (teamEvent.record.elim.count > 0) {
		lines.push("🥇 ELIMINATION RECORD");
		const elimRecord = teamEvent.record.elim;
		lines.push(
			`Record: ${elimRecord.wins}-${elimRecord.losses}-${elimRecord.ties} (${(elimRecord.winrate * 100).toFixed(1)}%)`,
		);
		lines.push(`Matches Played: ${elimRecord.count}`);
		if (elimRecord.alliance) {
			lines.push(`Alliance: ${elimRecord.alliance}`);
			lines.push(`Captain: ${elimRecord.is_captain ? "Yes" : "No"}`);
		}
		lines.push("");
	}

	// Overall record
	lines.push("📊 OVERALL EVENT RECORD");
	const totalRecord = teamEvent.record.total;
	lines.push(
		`Total Record: ${totalRecord.wins}-${totalRecord.losses}-${totalRecord.ties} (${(totalRecord.winrate * 100).toFixed(1)}%)`,
	);
	lines.push(`Total Matches: ${totalRecord.count}`);
	lines.push("");

	// District points
	if (teamEvent.district_points !== null) {
		lines.push("🏅 DISTRICT POINTS");
		lines.push(`Points Earned: ${teamEvent.district_points}`);
		lines.push("");
	}

	lines.push(`💡 Event key format: ${teamEvent.event} (Year + Location Code)`);

	return lines.join("\n");
}

export function formatTeamEventsList(teamEvents: TeamEvent[]): string {
	if (teamEvents.length === 0) {
		return "No team events found.";
	}

	const lines: string[] = [];
	lines.push(`=== ${teamEvents.length} Team Events Found ===`);
	lines.push("");

	teamEvents.forEach((teamEvent, index) => {
		if (index > 0) lines.push(""); // Add spacing between events

		// Compact format for list view
		lines.push(
			`${index + 1}. Team ${teamEvent.team} "${teamEvent.team_name}" at ${teamEvent.event_name}`,
		);
		lines.push(
			`   📅 ${teamEvent.year} | Week ${teamEvent.week} | ${teamEvent.type} | ${teamEvent.event}`,
		);
		lines.push(
			`   📍 ${teamEvent.state ? `${teamEvent.state}, ` : ""}${teamEvent.country} | District: ${teamEvent.district || "N/A"}`,
		);

		// Performance summary
		const qualRecord = teamEvent.record.qual;
		const totalRecord = teamEvent.record.total;
		const rankInfo =
			qualRecord.rank !== null ? `Rank: ${qualRecord.rank}/${qualRecord.num_teams}` : "";
		lines.push(
			`   🏆 Qual: ${qualRecord.wins}-${qualRecord.losses}-${qualRecord.ties} (${(qualRecord.winrate * 100).toFixed(1)}%) | ${rankInfo}`,
		);

		if (teamEvent.record.elim.count > 0) {
			const elimRecord = teamEvent.record.elim;
			lines.push(
				`   🥇 Elim: ${elimRecord.wins}-${elimRecord.losses}-${elimRecord.ties} (${(elimRecord.winrate * 100).toFixed(1)}%)`,
			);
		}

		lines.push(
			`   📊 EPA: ${teamEvent.epa.norm.toFixed(1)} | Overall: ${totalRecord.wins}-${totalRecord.losses}-${totalRecord.ties} (${(totalRecord.winrate * 100).toFixed(1)}%)`,
		);

		// District points if applicable
		if (teamEvent.district_points !== null) {
			lines.push(`   🏅 District Points: ${teamEvent.district_points}`);
		}
	});

	lines.push("");
	lines.push(`💡 Use get-team-event with specific team and event for detailed analysis`);

	return lines.join("\n");
}
