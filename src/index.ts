import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { type Team, formatTeam, formatTeamsList } from "./tools/team";
import { makeStatboticsRequest } from "./utils/web-requests";
import { formatYearStats, formatYearsList, type YearData } from "./tools/year";
import { type TeamYear, formatTeamYear, formatTeamYearsList } from "./tools/team-year";
import { type Event, formatEvent, formatEventsList } from "./tools/event";
import { type TeamEvent, formatTeamEvent, formatTeamEventsList } from "./tools/team-event";
import { type Match, formatMatch, formatMatchesList } from "./tools/match";
import { type TeamMatch, formatTeamMatch, formatTeamMatchesList } from "./tools/team-match";

const STATBOTICS_API_BASE = "https://api.statbotics.io";
const USER_AGENT = "statbotics-app/1.0";

// Define our Statbotics MCP agent
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "robostats",
		version: "1.0.0",
	});

	async init() {
		// Register Statbotics team tool
		this.server.tool(
			"get-team",
			"Get Statbotics team statistics by team number",
			{
				team: z.number().int().describe("Team number (e.g. 254)"),
			},
			async ({ team }) => {
				const url = `${STATBOTICS_API_BASE}/v3/team/${team}`;
				const teamData = await makeStatboticsRequest<Team>(url, USER_AGENT);

				if (!teamData) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to retrieve data for team ${team}`,
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeam(teamData),
						},
					],
				};
			},
		);

		// Register Statbotics team-year tool
		this.server.tool(
			"get-team-year",
			"Get Statbotics team performance statistics for a specific year",
			{
				team: z.number().int().describe("Team number (e.g. 254)"),
				year: z.number().int().describe("Competition year (e.g. 2024)"),
			},
			async ({ team, year }) => {
				const url = `${STATBOTICS_API_BASE}/v3/team_year/${team}/${year}`;
				const teamYearData = await makeStatboticsRequest<TeamYear>(url, USER_AGENT);

				if (!teamYearData) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to retrieve data for team ${team} in year ${year}`,
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeamYear(teamYearData),
						},
					],
				};
			},
		);

		// Register Statbotics teams list tool
		this.server.tool(
			"get-teams",
			"Get a list of teams and their general statistics based on optional filters",
			{
				country: z
					.string()
					.optional()
					.describe("Capitalized country name (e.g. USA, Canada)"),
				state: z
					.string()
					.optional()
					.describe("Capitalized two-letter state code (e.g. CA, TX)"),
				district: z
					.enum([
						"fma",
						"fnc",
						"fsc",
						"fit",
						"fin",
						"fim",
						"ne",
						"chs",
						"ont",
						"pnw",
						"pch",
						"isr",
					])
					.optional()
					.describe(
						"District code (e.g. fma, fnc, fsc, fit, fin, fim, ne, chs, ont, pnw, pch, isr)",
					),
				active: z
					.boolean()
					.optional()
					.describe("Whether the team has played in the last year"),
				metric: z
					.enum([
						"norm_epa",
						"rookie_year",
						"wins",
						"losses",
						"ties",
						"winrate",
						"team",
						"name",
						"count",
					])
					.optional()
					.describe("How to sort the returned values"),
				ascending: z
					.boolean()
					.optional()
					.describe("Whether to sort in ascending order (default: true)"),
				limit: z
					.number()
					.int()
					.min(1)
					.max(1000)
					.optional()
					.describe("Maximum number of teams to return (default: 100, max: 1000)"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Offset from the first result to return (default: 0)"),
			},
			async ({
				country,
				state,
				district,
				active,
				metric,
				ascending,
				limit = 100,
				offset = 0,
			}) => {
				const params = new URLSearchParams();
				if (country) params.append("country", country);
				if (state) params.append("state", state);
				if (district) params.append("district", district);
				if (active !== undefined) params.append("active", active.toString());
				if (metric) params.append("metric", metric);
				if (ascending !== undefined) params.append("ascending", ascending.toString());
				params.append("limit", limit.toString());
				params.append("offset", offset.toString());

				const url = `${STATBOTICS_API_BASE}/v3/teams?${params.toString()}`;
				const teamsData = await makeStatboticsRequest<Team[]>(url, USER_AGENT);

				if (!teamsData) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to retrieve teams data",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeamsList(teamsData),
						},
					],
				};
			},
		);

		// Register Statbotics years list tool
		this.server.tool(
			"get-years",
			"Get a list of FRC years and their general statistics with optional filters",
			{
				metric: z
					.enum(["year", "score_mean", "score_sd", "count"])
					.optional()
					.describe("How to sort the returned values"),
				ascending: z
					.boolean()
					.optional()
					.describe("Whether to sort in ascending order (default: true)"),
				limit: z
					.number()
					.int()
					.min(1)
					.max(1000)
					.optional()
					.describe("Maximum number of years to return (default: 1000, max: 1000)"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Offset from the first result to return (default: 0)"),
			},
			async ({ metric, ascending, limit = 1000, offset = 0 }) => {
				const params = new URLSearchParams();
				if (metric) params.append("metric", metric);
				if (ascending !== undefined) params.append("ascending", ascending.toString());
				params.append("limit", limit.toString());
				params.append("offset", offset.toString());

				const url = `${STATBOTICS_API_BASE}/v3/years?${params.toString()}`;
				const yearsData = await makeStatboticsRequest<YearData[]>(url, USER_AGENT);

				if (!yearsData) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to retrieve years data",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatYearsList(yearsData),
						},
					],
				};
			},
		);

		// Register Statbotics team years query tool
		this.server.tool(
			"get-team-years",
			"Query multiple years of a team's statistics with optional filters",
			{
				team: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Team number (no prefix), e.g. 5511"),
				year: z.number().int().min(2002).max(2025).optional().describe("Four-digit year"),
				country: z
					.string()
					.optional()
					.describe("Capitalized country name, e.g. USA or Canada"),
				state: z.string().optional().describe("Capitalized two-letter state code, e.g. NC"),
				district: z
					.enum([
						"fma",
						"fnc",
						"fsc",
						"fit",
						"fin",
						"fim",
						"ne",
						"chs",
						"ont",
						"pnw",
						"pch",
						"isr",
					])
					.optional()
					.describe("District code"),
				metric: z
					.enum([
						"team",
						"year",
						"wins",
						"losses",
						"ties",
						"winrate",
						"norm_epa",
						"rookie_year",
						"count",
					])
					.optional()
					.describe("How to sort the returned values. Any column in the table is valid"),
				ascending: z
					.boolean()
					.optional()
					.describe(
						"Whether to sort the returned values in ascending order. Default is ascending",
					),
				limit: z
					.number()
					.int()
					.min(1)
					.max(1000)
					.optional()
					.describe("Maximum number of events to return. Default is 1000"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Offset from the first result to return"),
			},
			async ({
				team,
				year,
				country,
				state,
				district,
				metric,
				ascending,
				limit = 1000,
				offset = 0,
			}) => {
				const params = new URLSearchParams();
				if (team !== undefined) params.append("team", team.toString());
				if (year !== undefined) params.append("year", year.toString());
				if (country) params.append("country", country);
				if (state) params.append("state", state);
				if (district) params.append("district", district);
				if (metric) params.append("metric", metric);
				if (ascending !== undefined) params.append("ascending", ascending.toString());
				params.append("limit", limit.toString());
				params.append("offset", offset.toString());

				const url = `${STATBOTICS_API_BASE}/v3/team_years?${params.toString()}`;
				const teamYearsData = await makeStatboticsRequest<TeamYear[]>(url, USER_AGENT);

				if (!teamYearsData) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to retrieve team years data",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeamYearsList(teamYearsData),
						},
					],
				};
			},
		);

		// Register Statbotics event tool
		this.server.tool(
			"get-event",
			"Get Statbotics event statistics by event key",
			{
				event: z.string().describe("Event key (e.g. 2024ncwak, 2024casf)"),
			},
			async ({ event }) => {
				const url = `${STATBOTICS_API_BASE}/v3/event/${event}`;
				const eventData = await makeStatboticsRequest<Event>(url, USER_AGENT);

				if (!eventData) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to retrieve data for event ${event}`,
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatEvent(eventData),
						},
					],
				};
			},
		);

		// Register Statbotics events search tool
		this.server.tool(
			"get-events",
			"Get a list of events and their general statistics with optional filters",
			{
				year: z.number().int().min(2002).max(2025).optional().describe("Four-digit year"),
				country: z
					.string()
					.optional()
					.describe("Capitalized country name, e.g. USA or Canada"),
				state: z.string().optional().describe("Capitalized two-letter state code, e.g. NC"),
				district: z
					.enum([
						"fma",
						"fnc",
						"fsc",
						"fit",
						"fin",
						"fim",
						"ne",
						"chs",
						"ont",
						"pnw",
						"pch",
						"isr",
					])
					.optional()
					.describe("District code"),
				type: z
					.enum(["regional", "district", "district_cmp"])
					.optional()
					.describe("Event type"),
				week: z
					.number()
					.int()
					.min(0)
					.max(8)
					.optional()
					.describe("Week of the competition season. 8 is CMP"),
				metric: z
					.enum([
						"year",
						"week",
						"name",
						"key",
						"type",
						"country",
						"state",
						"num_teams",
						"qual_matches",
						"start_date",
						"end_date",
						"status",
					])
					.optional()
					.describe("How to sort the returned values"),
				ascending: z
					.boolean()
					.optional()
					.describe(
						"Whether to sort the returned values in ascending order. Default is ascending",
					),
				limit: z
					.number()
					.int()
					.min(1)
					.max(1000)
					.optional()
					.describe("Maximum number of events to return. Default is 50"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Offset from the first result to return"),
			},
			async ({
				year,
				country,
				state,
				district,
				type,
				week,
				metric,
				ascending,
				limit = 50,
				offset = 0,
			}) => {
				const params = new URLSearchParams();
				if (year !== undefined) params.append("year", year.toString());
				if (country) params.append("country", country);
				if (state) params.append("state", state);
				if (district) params.append("district", district);
				if (type) params.append("type", type);
				if (week !== undefined) params.append("week", week.toString());
				if (metric) params.append("metric", metric);
				if (ascending !== undefined) params.append("ascending", ascending.toString());
				params.append("limit", limit.toString());
				params.append("offset", offset.toString());

				const url = `${STATBOTICS_API_BASE}/v3/events?${params.toString()}`;
				const eventsData = await makeStatboticsRequest<Event[]>(url, USER_AGENT);

				if (!eventsData) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to retrieve events data",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatEventsList(eventsData),
						},
					],
				};
			},
		);

		// Register Statbotics year stats tool
		this.server.tool(
			"get-year-stats",
			"Get Statbotics average year stats by year",
			{
				year: z.number().int().describe("Competition year (e.g. 2023)"),
			},
			async ({ year }) => {
				const url = `${STATBOTICS_API_BASE}/v3/year/${year}`;
				const yearData = await makeStatboticsRequest(url, USER_AGENT);

				if (!yearData) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to retrieve data for year ${year}`,
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatYearStats(yearData),
						},
					],
				};
			},
		);

		// Register Statbotics team-event tool
		this.server.tool(
			"get-team-event",
			"Get Statbotics team performance statistics for a specific event",
			{
				team: z.number().int().describe("Team number (e.g. 254)"),
				event: z.string().describe("Event key (e.g. 2024ncwak, 2024casf)"),
			},
			async ({ team, event }) => {
				const url = `${STATBOTICS_API_BASE}/v3/team_event/${team}/${event}`;
				const teamEventData = await makeStatboticsRequest<TeamEvent>(url, USER_AGENT);

				if (!teamEventData) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to retrieve data for team ${team} at event ${event}`,
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeamEvent(teamEventData),
						},
					],
				};
			},
		);

		// Register Statbotics team events bulk query tool
		this.server.tool(
			"get-team-events",
			"Query multiple events a team has participated in with optional filters",
			{
				team: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Team number (no prefix), e.g. 5511"),
				year: z.number().int().min(2002).max(2025).optional().describe("Four-digit year"),
				event: z.string().optional().describe("Event key, e.g. 2019ncwak"),
				country: z
					.string()
					.optional()
					.describe("Capitalized country name, e.g. USA or Canada"),
				state: z.string().optional().describe("Capitalized two-letter state code, e.g. NC"),
				district: z
					.enum([
						"fma",
						"fnc",
						"fsc",
						"fit",
						"fin",
						"fim",
						"ne",
						"chs",
						"ont",
						"pnw",
						"pch",
						"isr",
					])
					.optional()
					.describe("District code"),
				type: z
					.enum(["regional", "district", "district_cmp", "cmp_division", "cmp_finals"])
					.optional()
					.describe("Event type"),
				week: z
					.number()
					.int()
					.min(0)
					.max(8)
					.optional()
					.describe("Week of the competition season. 8 is CMP"),
				metric: z
					.enum([
						"team",
						"year",
						"event",
						"week",
						"type",
						"country",
						"state",
						"wins",
						"losses",
						"ties",
						"winrate",
						"norm_epa",
						"rank",
						"rps",
					])
					.optional()
					.describe("How to sort the returned values. Any column in the table is valid"),
				ascending: z
					.boolean()
					.optional()
					.describe(
						"Whether to sort the returned values in ascending order. Default is ascending",
					),
				limit: z
					.number()
					.int()
					.min(1)
					.max(1000)
					.optional()
					.describe("Maximum number of team events to return. Default is 50"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Offset from the first result to return"),
			},
			async ({
				team,
				year,
				event,
				country,
				state,
				district,
				type,
				week,
				metric,
				ascending,
				limit = 50,
				offset = 0,
			}) => {
				const params = new URLSearchParams();
				if (team !== undefined) params.append("team", team.toString());
				if (year !== undefined) params.append("year", year.toString());
				if (event) params.append("event", event);
				if (country) params.append("country", country);
				if (state) params.append("state", state);
				if (district) params.append("district", district);
				if (type) params.append("type", type);
				if (week !== undefined) params.append("week", week.toString());
				if (metric) params.append("metric", metric);
				if (ascending !== undefined) params.append("ascending", ascending.toString());
				params.append("limit", limit.toString());
				params.append("offset", offset.toString());

				const url = `${STATBOTICS_API_BASE}/v3/team_events?${params.toString()}`;
				const teamEventsData = await makeStatboticsRequest<TeamEvent[]>(url, USER_AGENT);

				if (!teamEventsData) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to retrieve team events data",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeamEventsList(teamEventsData),
						},
					],
				};
			},
		);

		// Register Statbotics match tool
		this.server.tool(
			"get-match",
			"Get Statbotics match statistics by match key",
			{
				match: z
					.string()
					.describe(
						"Match key (e.g. 2024casd_f1m1 (finals 1 match 1), 2024ncwak_qm15 (qual 15), 2019casj_sf1m1 (semifinal 1 match 1))",
					),
			},
			async ({ match }) => {
				const url = `${STATBOTICS_API_BASE}/v3/match/${match}`;
				const matchData = await makeStatboticsRequest<Match>(url, USER_AGENT);

				if (!matchData) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to retrieve data for match ${match}`,
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatMatch(matchData),
						},
					],
				};
			},
		);

		// Register Statbotics matches bulk query tool
		this.server.tool(
			"get-matches",
			"Query multiple match statistics with optional filters including team, year, event, week, and elimination match",
			{
				team: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Team number (no prefix), e.g. 5511"),
				year: z.number().int().min(2002).max(2025).optional().describe("Four-digit year"),
				event: z.string().optional().describe("Event key, e.g. 2019ncwak"),
				week: z
					.number()
					.int()
					.min(0)
					.max(8)
					.optional()
					.describe("Week of the competition season. 8 is CMP"),
				elim: z.boolean().optional().describe("Whether the match is an elimination match"),
				metric: z
					.enum([
						// Basic match properties
						"key",
						"year",
						"event",
						"week",
						"comp_level",
						"set_number",
						"match_number",
						"time",
						"predicted_time",
						"status",
						// Prediction metrics
						"red_score",
						"blue_score",
						"red_rp_1",
						"blue_rp_1",
						"red_rp_2",
						"blue_rp_2",
						// Result metrics (actual scores and breakdowns)
						"winner",
						"red_score",
						"blue_score",
						"red_no_foul",
						"blue_no_foul",
					])
					.optional()
					.describe("How to sort the returned values. Any column in the table is valid"),
				ascending: z
					.boolean()
					.optional()
					.describe(
						"Whether to sort the returned values in ascending order. Default is ascending",
					),
				limit: z
					.number()
					.int()
					.min(1)
					.max(1000)
					.optional()
					.describe("Maximum number of matches to return. Default is 1000"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Offset from the first result to return"),
			},
			async ({
				team,
				year,
				event,
				week,
				elim,
				metric,
				ascending,
				limit = 1000,
				offset = 0,
			}) => {
				const params = new URLSearchParams();
				if (team !== undefined) params.append("team", team.toString());
				if (year !== undefined) params.append("year", year.toString());
				if (event) params.append("event", event);
				if (week !== undefined) params.append("week", week.toString());
				if (elim !== undefined) params.append("elim", elim.toString());
				if (metric) params.append("metric", metric);
				if (ascending !== undefined) params.append("ascending", ascending.toString());
				params.append("limit", limit.toString());
				params.append("offset", offset.toString());

				const url = `${STATBOTICS_API_BASE}/v3/matches?${params.toString()}`;
				const matchesData = await makeStatboticsRequest<Match[]>(url, USER_AGENT);

				if (!matchesData) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to retrieve matches data",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatMatchesList(matchesData),
						},
					],
				};
			},
		);

		// Register Statbotics team match tool
		this.server.tool(
			"get-team-match",
			"Get Statbotics team performance data for a specific match",
			{
				team: z.number().int().describe("Team number (e.g. 254)"),
				match: z
					.string()
					.describe("Match key (e.g. 2024casd_f1m1, 2024ncwak_qm15, 2019casj_sf1m1)"),
			},
			async ({ team, match }) => {
				const url = `${STATBOTICS_API_BASE}/v3/team_match/${team}/${match}`;
				const teamMatchData = await makeStatboticsRequest<TeamMatch>(url, USER_AGENT);

				if (!teamMatchData) {
					return {
						content: [
							{
								type: "text",
								text: `Failed to retrieve data for team ${team} in match ${match}`,
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeamMatch(teamMatchData),
						},
					],
				};
			},
		);

		// Register Statbotics team matches bulk query tool
		this.server.tool(
			"get-team-matches",
			"Query multiple match statistics with optional filters including team, year, event, week, and elimination match",
			{
				team: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Team number (no prefix), e.g. 5511"),
				year: z.number().int().min(2002).max(2025).optional().describe("Four-digit year"),
				event: z.string().optional().describe("Event key, e.g. 2019ncwak"),
				week: z
					.number()
					.int()
					.min(0)
					.max(8)
					.optional()
					.describe("Week of the competition season. 8 is CMP"),
				match: z.string().optional().describe("Match key, e.g. 2019ncwak_f1m1"),
				elim: z.boolean().optional().describe("Whether the match is an elimination match"),
				metric: z
					.enum([
						// Basic properties
						"team",
						"match",
						"year",
						"event",
						"week",
						"alliance",
						"time",
						"status",
						// Performance metrics
						"epa",
					])
					.optional()
					.describe("How to sort the returned values. Any column in the table is valid"),
				ascending: z
					.boolean()
					.optional()
					.describe(
						"Whether to sort the returned values in ascending order. Default is ascending",
					),
				limit: z
					.number()
					.int()
					.min(1)
					.max(1000)
					.optional()
					.describe("Maximum number of team matches to return. Default is 50"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Offset from the first result to return"),
			},
			async ({
				team,
				year,
				event,
				week,
				match,
				elim,
				metric,
				ascending,
				limit = 50,
				offset = 0,
			}) => {
				const params = new URLSearchParams();
				if (team !== undefined) params.append("team", team.toString());
				if (year !== undefined) params.append("year", year.toString());
				if (event) params.append("event", event);
				if (week !== undefined) params.append("week", week.toString());
				if (match) params.append("match", match);
				if (elim !== undefined) params.append("elim", elim.toString());
				if (metric) params.append("metric", metric);
				if (ascending !== undefined) params.append("ascending", ascending.toString());
				params.append("limit", limit.toString());
				params.append("offset", offset.toString());

				const url = `${STATBOTICS_API_BASE}/v3/team_matches?${params.toString()}`;
				const teamMatchesData = await makeStatboticsRequest<TeamMatch[]>(url, USER_AGENT);

				if (!teamMatchesData) {
					return {
						content: [
							{
								type: "text",
								text: "Failed to retrieve team matches data",
							},
						],
					};
				}

				return {
					content: [
						{
							type: "text",
							text: formatTeamMatchesList(teamMatchesData),
						},
					],
				};
			},
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
