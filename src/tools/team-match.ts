export interface TeamMatch {
	team: number;
	match: string;
	year: number;
	event: string;
	alliance: string;
	time: number;
	week: number;
	elim: boolean;
	dq: boolean;
	surrogate: boolean;
	status: string;
	epa: {
		total_points: number;
		post: number;
		breakdown: {
			total_points: number;
			auto_points: number;
			teleop_points: number;
			endgame_points: number;
			[key: string]: number;
		};
	};
}

export function formatTeamMatch(teamMatch: TeamMatch): string {
	const lines: string[] = [];

	lines.push(`=== Team ${teamMatch.team} in Match ${teamMatch.match} ===`);
	lines.push("");

	// Basic match info
	lines.push("📅 MATCH DETAILS");
	lines.push(`Match: ${teamMatch.match}`);
	lines.push(`Event: ${teamMatch.event} | Year: ${teamMatch.year} | Week: ${teamMatch.week}`);
	lines.push(`Alliance: ${teamMatch.alliance.toUpperCase()}`);
	lines.push(`Type: ${teamMatch.elim ? "Elimination" : "Qualification"}`);
	lines.push(`Status: ${teamMatch.status}`);

	if (teamMatch.time > 0) {
		const matchDate = new Date(teamMatch.time * 1000);
		lines.push(`Time: ${matchDate.toLocaleString()}`);
	}
	lines.push("");

	// Team status indicators
	lines.push("🏷️ TEAM STATUS");
	if (teamMatch.dq) {
		lines.push(`❌ DISQUALIFIED`);
	}
	if (teamMatch.surrogate) {
		lines.push(`🔄 SURROGATE TEAM`);
	}
	if (!teamMatch.dq && !teamMatch.surrogate) {
		lines.push(`✅ Regular team member`);
	}
	lines.push("");

	// EPA Performance
	lines.push("📊 EPA PERFORMANCE");
	lines.push(`Total EPA Contribution: ${teamMatch.epa.total_points.toFixed(2)} points`);
	lines.push(`Post-Match EPA: ${teamMatch.epa.post.toFixed(2)}`);
	lines.push("");

	// Performance breakdown
	lines.push("🎮 PERFORMANCE BREAKDOWN");
	const breakdown = teamMatch.epa.breakdown;
	lines.push(`Total Points: ${breakdown.total_points.toFixed(2)}`);
	lines.push(`Auto Contribution: ${breakdown.auto_points.toFixed(2)} points`);
	lines.push(`Teleop Contribution: ${breakdown.teleop_points.toFixed(2)} points`);
	lines.push(`Endgame Contribution: ${breakdown.endgame_points.toFixed(2)} points`);
	lines.push("");

	// Game-specific breakdown (additional metrics)
	const otherKeys = Object.keys(breakdown).filter(
		(key) => !["total_points", "auto_points", "teleop_points", "endgame_points"].includes(key),
	);

	if (otherKeys.length > 0) {
		lines.push("🎯 GAME-SPECIFIC CONTRIBUTIONS");
		otherKeys.forEach((key) => {
			const value = breakdown[key];
			if (value !== null && value !== undefined) {
				lines.push(`${key}: ${value.toFixed(2)}`);
			}
		});
		lines.push("");
	}

	// Performance summary
	lines.push("📈 PERFORMANCE SUMMARY");
	const autoPercent =
		breakdown.total_points > 0 ? (breakdown.auto_points / breakdown.total_points) * 100 : 0;
	const teleopPercent =
		breakdown.total_points > 0 ? (breakdown.teleop_points / breakdown.total_points) * 100 : 0;
	const endgamePercent =
		breakdown.total_points > 0 ? (breakdown.endgame_points / breakdown.total_points) * 100 : 0;

	lines.push(`Auto: ${autoPercent.toFixed(1)}% of contribution`);
	lines.push(`Teleop: ${teleopPercent.toFixed(1)}% of contribution`);
	lines.push(`Endgame: ${endgamePercent.toFixed(1)}% of contribution`);
	lines.push("");

	lines.push(
		`💡 This shows Team ${teamMatch.team}'s individual contribution to their ${teamMatch.alliance} alliance`,
	);
	lines.push(`💡 Match format: ${teamMatch.match} | Event format: ${teamMatch.event}`);

	return lines.join("\n");
}

export function formatTeamMatchesList(teamMatches: TeamMatch[]): string {
	if (teamMatches.length === 0) {
		return "No team matches found.";
	}

	const lines: string[] = [];
	lines.push(`=== ${teamMatches.length} Team Matches Found ===`);
	lines.push("");

	teamMatches.forEach((teamMatch, index) => {
		if (index > 0) lines.push(""); // Add spacing between matches

		// Compact format for list view
		lines.push(`${index + 1}. Team ${teamMatch.team} in ${teamMatch.match}`);
		lines.push(`   📅 ${teamMatch.year} | Week ${teamMatch.week} | Event: ${teamMatch.event}`);
		lines.push(
			`   🏁 ${teamMatch.alliance.toUpperCase()} Alliance | ${teamMatch.elim ? "Elimination" : "Qualification"} | Status: ${teamMatch.status}`,
		);

		// Team status indicators
		const statusIndicators = [];
		if (teamMatch.dq) statusIndicators.push("DQ");
		if (teamMatch.surrogate) statusIndicators.push("Surrogate");
		if (statusIndicators.length > 0) {
			lines.push(`   🏷️ ${statusIndicators.join(", ")}`);
		}

		// Performance summary
		const breakdown = teamMatch.epa.breakdown;
		lines.push(
			`   📊 EPA: ${teamMatch.epa.total_points.toFixed(1)} | Post-Match: ${teamMatch.epa.post.toFixed(1)}`,
		);
		lines.push(
			`   🎮 Contribution: Auto ${breakdown.auto_points.toFixed(1)} | Teleop ${breakdown.teleop_points.toFixed(1)} | Endgame ${breakdown.endgame_points.toFixed(1)}`,
		);

		// Time if available
		if (teamMatch.time > 0) {
			const matchDate = new Date(teamMatch.time * 1000);
			lines.push(`   ⏰ ${matchDate.toLocaleDateString()} ${matchDate.toLocaleTimeString()}`);
		}
	});

	lines.push("");
	lines.push(`💡 Use get-team-match with specific team and match for detailed analysis`);

	return lines.join("\n");
}
