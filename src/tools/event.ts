export interface Event {
	key: string;
	year: number;
	name: string;
	time: number;
	country: string;
	state: string;
	district: string | null;
	start_date: string;
	end_date: string;
	type: string;
	week: number;
	video: string | null;
	status: string;
	status_str: string;
	num_teams: number;
	current_match: number;
	qual_matches: number;
	epa: {
		max: number | null;
		top_8: number | null;
		top_24: number | null;
		mean: number | null;
		sd: number | null;
	};
	metrics: {
		win_prob: {
			count: number;
			conf: number | null;
			acc: number | null;
			mse: number | null;
		};
		score_pred: {
			count: number;
			rmse: number | null;
			error: number | null;
		};
		rp_pred?: {
			count: number;
			[key: string]:
				| number
				| {
						error: number;
						acc: number;
				  };
		};
	};
}

export function formatEvent(event: Event): string {
	const lines: string[] = [];

	lines.push(`=== ${event.name} (${event.key}) ===`);
	lines.push("");

	// Basic event info
	lines.push("📅 EVENT DETAILS");
	lines.push(`Year: ${event.year}`);
	lines.push(`Dates: ${event.start_date} to ${event.end_date}`);
	lines.push(`Location: ${event.state ? `${event.state}, ` : ""}${event.country}`);
	lines.push(`District: ${event.district || "N/A"}`);
	lines.push(`Type: ${event.type}`);
	lines.push(`Week: ${event.week}`);
	lines.push("");

	// Competition status
	lines.push("🏁 STATUS");
	lines.push(`Status: ${event.status_str}`);
	lines.push(`Teams: ${event.num_teams}`);
	lines.push(`Qualification Matches: ${event.qual_matches}`);
	if (event.current_match > 0) {
		lines.push(`Current Match: ${event.current_match}`);
	}
	lines.push("");

	// EPA statistics - handle null values
	lines.push("📊 EPA STATISTICS");
	if (event.epa.mean !== null && event.epa.sd !== null) {
		lines.push(`Mean EPA: ${event.epa.mean.toFixed(2)} ± ${event.epa.sd.toFixed(2)}`);
	} else {
		lines.push(`Mean EPA: N/A`);
	}

	if (event.epa.max !== null) {
		lines.push(`Max EPA: ${event.epa.max.toFixed(2)}`);
	} else {
		lines.push(`Max EPA: N/A`);
	}

	if (event.epa.top_8 !== null) {
		lines.push(`Top 8 EPA: ${event.epa.top_8.toFixed(2)}`);
	} else {
		lines.push(`Top 8 EPA: N/A`);
	}

	if (event.epa.top_24 !== null) {
		lines.push(`Top 24 EPA: ${event.epa.top_24.toFixed(2)}`);
	} else {
		lines.push(`Top 24 EPA: N/A`);
	}
	lines.push("");

	// Prediction metrics - handle null values
	lines.push("🎯 PREDICTION METRICS");
	if (event.metrics.win_prob.count > 0 && event.metrics.win_prob.acc !== null) {
		lines.push(
			`Win Probability: ${event.metrics.win_prob.acc.toFixed(3)} accuracy (${event.metrics.win_prob.count} predictions)`,
		);
	} else {
		lines.push(`Win Probability: N/A`);
	}

	if (event.metrics.score_pred.count > 0 && event.metrics.score_pred.rmse !== null) {
		lines.push(
			`Score Prediction: ${event.metrics.score_pred.rmse.toFixed(2)} RMSE (${event.metrics.score_pred.count} predictions)`,
		);
	} else {
		lines.push(`Score Prediction: N/A`);
	}

	if (event.metrics.rp_pred && event.metrics.rp_pred.count > 0) {
		lines.push(`Ranking Point Predictions:`);
		// Iterate through all RP prediction keys except 'count'
		Object.entries(event.metrics.rp_pred).forEach(([key, value]) => {
			if (key !== "count" && typeof value === "object" && "acc" in value) {
				lines.push(`  • ${key}: ${value.acc.toFixed(3)} accuracy`);
			}
		});
	} else {
		lines.push(`Ranking Point Predictions: N/A`);
	}
	lines.push("");

	// Additional info
	if (event.video) {
		lines.push("📹 VIDEO");
		lines.push(`Video: ${event.video}`);
		lines.push("");
	}

	lines.push(`💡 Event key format: ${event.key} (Year + Location Code)`);

	return lines.join("\n");
}

export function formatEventsList(events: Event[]): string {
	if (events.length === 0) {
		return "No events found.";
	}

	const lines: string[] = [];
	lines.push(`=== ${events.length} Events Found ===`);
	lines.push("");

	events.forEach((event, index) => {
		if (index > 0) lines.push(""); // Add spacing between events

		// Compact format for list view
		lines.push(`${index + 1}. ${event.name} (${event.key})`);
		lines.push(
			`   📅 ${event.start_date} to ${event.end_date} | Week ${event.week} | ${event.type}`,
		);
		lines.push(
			`   📍 ${event.state ? `${event.state}, ` : ""}${event.country} | District: ${event.district || "N/A"}`,
		);
		lines.push(`   👥 ${event.num_teams} teams | Status: ${event.status_str}`);

		// Handle null EPA values in list view
		const meanEPA = event.epa.mean !== null ? event.epa.mean.toFixed(1) : "N/A";
		const sdEPA = event.epa.sd !== null ? event.epa.sd.toFixed(1) : "N/A";
		const maxEPA = event.epa.max !== null ? event.epa.max.toFixed(1) : "N/A";
		lines.push(`   📊 Mean EPA: ${meanEPA} ± ${sdEPA} | Max: ${maxEPA}`);
	});

	lines.push("");
	lines.push(`💡 Use get-event with specific event key for detailed analysis`);

	return lines.join("\n");
}
