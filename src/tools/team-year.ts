export interface TeamYear {
	team: number;
	year: number;
	name: string;
	country: string;
	state: string | null;
	district: string | null;
	rookie_year: number;
	epa: {
		total_points: {
			mean: number;
			sd: number;
		};
		unitless: number;
		norm: number;
		conf: [number, number];
		breakdown: {
			[key: string]: number; // Flexible breakdown since it changes each year
		};
		stats: {
			start: number;
			pre_champs: number;
			max: number;
		};
		ranks: {
			total: {
				rank: number;
				percentile: number;
				team_count: number;
			};
			country: {
				rank: number;
				percentile: number;
				team_count: number;
			};
			state: {
				rank: number;
				percentile: number;
				team_count: number;
			};
			district: {
				rank: number;
				percentile: number;
				team_count: number;
			};
		};
	};
	record: {
		wins: number;
		losses: number;
		ties: number;
		count: number;
		winrate: number;
	};
	district_points: number | null;
	district_rank: number | null;
}

export function formatTeamYear(teamYear: TeamYear): string {
	const lines: string[] = [];

	lines.push(`=== Team ${teamYear.team} "${teamYear.name}" - ${teamYear.year} Season ===`);
	lines.push("");

	// Basic info
	lines.push("📍 TEAM INFO");
	lines.push(`Location: ${teamYear.state ?? "N/A"}, ${teamYear.country}`);
	lines.push(`District: ${teamYear.district ?? "N/A"}`);
	lines.push(`Rookie Year: ${teamYear.rookie_year}`);
	lines.push("");

	// EPA Performance
	lines.push("📊 EPA PERFORMANCE");
	lines.push(`EPA (Norm): ${teamYear.epa.norm}`);
	lines.push(`EPA (Unitless): ${teamYear.epa.unitless}`);
	lines.push(
		`Expected Points: ${teamYear.epa.total_points.mean.toFixed(2)} ± ${teamYear.epa.total_points.sd.toFixed(2)}`,
	);
	lines.push(
		`Confidence Interval: [${teamYear.epa.conf[0].toFixed(2)}, ${teamYear.epa.conf[1].toFixed(2)}]`,
	);
	lines.push("");

	// Season progression
	lines.push("📈 SEASON PROGRESSION");
	lines.push(`Start EPA: ${teamYear.epa.stats.start.toFixed(2)}`);
	lines.push(`Pre-Champs EPA: ${teamYear.epa.stats.pre_champs.toFixed(2)}`);
	lines.push(`Max EPA: ${teamYear.epa.stats.max.toFixed(2)}`);
	lines.push("");

	// Game breakdown (key stats)
	if (teamYear.epa.breakdown) {
		lines.push("🎮 GAME BREAKDOWN");
		const breakdown = teamYear.epa.breakdown;
		if (breakdown.total_points)
			lines.push(`Total Points: ${breakdown.total_points.toFixed(2)}`);
		if (breakdown.auto_points) lines.push(`Auto Points: ${breakdown.auto_points.toFixed(2)}`);
		if (breakdown.teleop_points)
			lines.push(`Teleop Points: ${breakdown.teleop_points.toFixed(2)}`);
		if (breakdown.endgame_points)
			lines.push(`Endgame Points: ${breakdown.endgame_points.toFixed(2)}`);

		// Ranking points (if available)
		if (breakdown.rp_1 !== undefined || breakdown.rp_2 !== undefined) {
			const rps = [];
			if (breakdown.rp_1 !== undefined)
				rps.push(`RP1: ${(breakdown.rp_1 * 100).toFixed(1)}%`);
			if (breakdown.rp_2 !== undefined)
				rps.push(`RP2: ${(breakdown.rp_2 * 100).toFixed(1)}%`);
			lines.push(`Ranking Points: ${rps.join(" | ")}`);
		}
		lines.push("");
	}

	// Record
	lines.push("🏆 MATCH RECORD");
	lines.push(`Record: ${teamYear.record.wins}-${teamYear.record.losses}-${teamYear.record.ties}`);
	lines.push(
		`Win Rate: ${(teamYear.record.winrate * 100).toFixed(1)}% (${teamYear.record.count} matches)`,
	);
	lines.push("");

	// Rankings
	lines.push("🌍 RANKINGS");
	lines.push(
		`Global: #${teamYear.epa.ranks.total.rank} of ${teamYear.epa.ranks.total.team_count.toLocaleString()} (${(teamYear.epa.ranks.total.percentile * 100).toFixed(1)}th percentile)`,
	);
	lines.push(
		`Country: #${teamYear.epa.ranks.country.rank} of ${teamYear.epa.ranks.country.team_count.toLocaleString()} (${(teamYear.epa.ranks.country.percentile * 100).toFixed(1)}th percentile)`,
	);
	lines.push(
		`State: #${teamYear.epa.ranks.state.rank} of ${teamYear.epa.ranks.state.team_count.toLocaleString()} (${(teamYear.epa.ranks.state.percentile * 100).toFixed(1)}th percentile)`,
	);
	lines.push(
		`District: #${teamYear.epa.ranks.district.rank} of ${teamYear.epa.ranks.district.team_count.toLocaleString()} (${(teamYear.epa.ranks.district.percentile * 100).toFixed(1)}th percentile)`,
	);
	lines.push("");

	// District points (if applicable)
	if (teamYear.district_points !== null) {
		lines.push("🏅 DISTRICT");
		lines.push(`District Points: ${teamYear.district_points}`);
		if (teamYear.district_rank !== null)
			lines.push(`District Rank: #${teamYear.district_rank}`);
		lines.push("");
	}

	return lines.join("\n");
}

export function formatTeamYearsList(teamYears: TeamYear[]): string {
	if (teamYears.length === 0) {
		return "No team years found.";
	}

	const lines: string[] = [];
	lines.push(`=== ${teamYears.length} Team Years Found ===`);
	lines.push("");

	teamYears.forEach((teamYear, index) => {
		if (index > 0) lines.push(""); // Add spacing between teams

		// Compact format for list view
		lines.push(`${index + 1}. Team ${teamYear.team} "${teamYear.name}" (${teamYear.year})`);
		lines.push(
			`   📍 ${teamYear.state ?? "N/A"}, ${teamYear.country} | District: ${teamYear.district ?? "N/A"}`,
		);
		lines.push(
			`   📊 EPA: ${teamYear.epa.norm} | Record: ${teamYear.record.wins}-${teamYear.record.losses}-${teamYear.record.ties} (${(teamYear.record.winrate * 100).toFixed(1)}%)`,
		);
		lines.push(
			`   🌍 Global Rank: #${teamYear.epa.ranks.total.rank} (${(teamYear.epa.ranks.total.percentile * 100).toFixed(1)}th percentile)`,
		);
	});

	lines.push("");
	lines.push(`💡 Use get-team-year with specific team number and year for detailed analysis`);

	return lines.join("\n");
}
