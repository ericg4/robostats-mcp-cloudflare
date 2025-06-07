export interface Match {
  key: string;
  year: number;
  event: string;
  week: number;
  elim: boolean;
  comp_level: string;
  set_number: number;
  match_number: number;
  match_name: string;
  time: number;
  predicted_time: number;
  status: string;
  video: string | null;
  alliances: {
    red: {
      team_keys: number[];
      surrogate_team_keys: number[];
      dq_team_keys: number[];
    };
    blue: {
      team_keys: number[];
      surrogate_team_keys: number[];
      dq_team_keys: number[];
    };
  };
  pred: {
    winner: string;
    red_win_prob: number;
    red_score: number;
    blue_score: number;
    [key: string]: number | string;
    red_rp_1: number;
    blue_rp_1: number;
    red_rp_2: number;
    blue_rp_2: number;
  };
  result: {
    winner: string;
    red_score: number;
    blue_score: number;
    red_no_foul: boolean;
    blue_no_foul: boolean;
    red_auto_points: number;
    blue_auto_points: number;
    red_teleop_points: number;
    blue_teleop_points: number;
    red_endgame_points: number;
    blue_endgame_points: number;
    [key: string]: string | boolean | number | null;
  };
}

export function formatMatch(match: Match): string {
  const lines: string[] = [];
  
  lines.push(`=== ${match.match_name} (${match.key}) ===`);
  lines.push("");
  
  // Basic match info
  lines.push("📅 MATCH DETAILS");
  lines.push(`Event: ${match.event} | Year: ${match.year} | Week: ${match.week}`);
  lines.push(`Type: ${match.elim ? "Elimination" : "Qualification"} | Level: ${match.comp_level}`);
  lines.push(`Set: ${match.set_number} | Match: ${match.match_number}`);
  lines.push(`Status: ${match.status}`);
  if (match.time > 0) {
    const matchDate = new Date(match.time * 1000);
    lines.push(`Time: ${matchDate.toLocaleString()}`);
  }
  lines.push("");
  
  // Alliance lineup
  lines.push("🤖 ALLIANCE LINEUP");
  lines.push(`🔴 Red Alliance: ${match.alliances.red.team_keys.join(", ")}`);
  if (match.alliances.red.surrogate_team_keys.length > 0) {
    lines.push(`   Surrogates: ${match.alliances.red.surrogate_team_keys.join(", ")}`);
  }
  if (match.alliances.red.dq_team_keys.length > 0) {
    lines.push(`   DQ'd: ${match.alliances.red.dq_team_keys.join(", ")}`);
  }
  
  lines.push(`🔵 Blue Alliance: ${match.alliances.blue.team_keys.join(", ")}`);
  if (match.alliances.blue.surrogate_team_keys.length > 0) {
    lines.push(`   Surrogates: ${match.alliances.blue.surrogate_team_keys.join(", ")}`);
  }
  if (match.alliances.blue.dq_team_keys.length > 0) {
    lines.push(`   DQ'd: ${match.alliances.blue.dq_team_keys.join(", ")}`);
  }
  lines.push("");
  
  // Predictions
  lines.push("🎯 PREDICTIONS");
  lines.push(`Predicted Winner: ${match.pred.winner}`);
  lines.push(`Win Probability: Red ${(match.pred.red_win_prob * 100).toFixed(1)}% | Blue ${((1 - match.pred.red_win_prob) * 100).toFixed(1)}%`);
  lines.push(`Predicted Score: Red ${match.pred.red_score.toFixed(1)} | Blue ${match.pred.blue_score.toFixed(1)}`);
  lines.push(`Predicted RPs:`);
  lines.push(`  Red: RP1 ${match.pred.red_rp_1.toFixed(2)} | RP2 ${match.pred.red_rp_2.toFixed(2)}`);
  lines.push(`  Blue: RP1 ${match.pred.blue_rp_1.toFixed(2)} | RP2 ${match.pred.blue_rp_2.toFixed(2)}`);
  lines.push("");
  
  // Results (if match has been played)
  if (match.result.winner !== "") {
    lines.push("🏆 ACTUAL RESULTS");
    lines.push(`Winner: ${match.result.winner}`);
    lines.push(`Final Score: Red ${match.result.red_score} | Blue ${match.result.blue_score}`);
    lines.push("");
    
    lines.push("📊 SCORE BREAKDOWN");
    lines.push(`Auto Points: Red ${match.result.red_auto_points} | Blue ${match.result.blue_auto_points}`);
    lines.push(`Teleop Points: Red ${match.result.red_teleop_points} | Blue ${match.result.blue_teleop_points}`);
    lines.push(`Endgame Points: Red ${match.result.red_endgame_points} | Blue ${match.result.blue_endgame_points}`);
    lines.push(`No Fouls: Red ${match.result.red_no_foul ? "✅" : "❌"} | Blue ${match.result.blue_no_foul ? "✅" : "❌"}`);
    lines.push("");
    
    // Additional result details (game-specific breakdown)
    const otherKeys = Object.keys(match.result).filter(key => 
      !['winner', 'red_score', 'blue_score', 'red_no_foul', 'blue_no_foul', 
        'red_auto_points', 'blue_auto_points', 'red_teleop_points', 'blue_teleop_points',
        'red_endgame_points', 'blue_endgame_points'].includes(key)
    );
    
    if (otherKeys.length > 0) {
      lines.push("🎮 GAME-SPECIFIC BREAKDOWN");
      otherKeys.forEach(key => {
        const value = match.result[key];
        if (value !== null && value !== undefined) {
          lines.push(`${key}: ${value}`);
        }
      });
      lines.push("");
    }
  } else {
    lines.push("⏳ Match has not been played yet");
    lines.push("");
  }
  
  // Video link
  if (match.video) {
    lines.push("📹 VIDEO");
    lines.push(`Video: ${match.video}`);
    lines.push("");
  }
  
  lines.push(`💡 Match key format: ${match.key} (Event + Match Identifier)`);
  lines.push(`💡 Match types: qm## (qual), sf##m# (semifinal), f#m# (final)`);
  
  return lines.join("\n");
}

export function formatMatchesList(matches: Match[]): string {
  if (matches.length === 0) {
    return "No matches found.";
  }

  const lines: string[] = [];
  lines.push(`=== ${matches.length} Matches Found ===`);
  lines.push("");

  matches.forEach((match, index) => {
    if (index > 0) lines.push(""); // Add spacing between matches
    
    // Compact format for list view
    lines.push(`${index + 1}. ${match.match_name} (${match.key})`);
    lines.push(`   📅 ${match.year} | Week ${match.week} | Event: ${match.event}`);
    lines.push(`   🏁 Type: ${match.elim ? "Elimination" : "Qualification"} | Status: ${match.status}`);
    
    // Alliance lineup
    lines.push(`   🔴 Red: ${match.alliances.red.team_keys.join(", ")}`);
    lines.push(`   🔵 Blue: ${match.alliances.blue.team_keys.join(", ")}`);
    
    // Predictions and results
    lines.push(`   🎯 Predicted: ${match.pred.winner} (${(match.pred.red_win_prob * 100).toFixed(1)}% Red) | Score: ${match.pred.red_score.toFixed(0)}-${match.pred.blue_score.toFixed(0)}`);
    
    if (match.result.winner !== "") {
      lines.push(`   🏆 Result: ${match.result.winner} wins ${match.result.red_score}-${match.result.blue_score}`);
    } else {
      lines.push(`   ⏳ Match not yet played`);
    }
    
    // Video link if available
    if (match.video) {
      lines.push(`   📹 Video: ${match.video}`);
    }
  });

  lines.push("");
  lines.push(`💡 Use get-match with specific match key for detailed analysis`);

  return lines.join("\n");
}