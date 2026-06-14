#!/usr/bin/env python3
"""Fetch WC 2026 data from football-data.org and write data/wc2026.json."""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

API_KEY = os.environ['FOOTBALL_API_KEY']
BASE    = 'https://api.football-data.org/v4/competitions/WC'
OUT     = 'data/wc2026.json'

# Map football-data.org team names → our canonical names
NAME_MAP = {
    'United States': 'USA',
    'Türkiye': 'Turkey',
    'Bosnia and Herzegovina': 'Bosnia',
    'Bosnia-Herzegovina': 'Bosnia',
    "Côte d'Ivoire": 'Ivory Coast',
    'Congo DR': 'DR Congo',
    'Czech Republic': 'Czech Republic',
    'Czechia': 'Czech Republic',
}

STAGE_KEY = {
    'GROUP_STAGE':     'GROUP',
    'LAST_32':         'R32',
    'LAST_16':         'R16',
    'QUARTER_FINALS':  'QF',
    'SEMI_FINALS':     'SF',
    'FINAL':           'FINAL',
}
STAGE_ORDER = ['GROUP_STAGE', 'LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']


def fetch(path):
    req = urllib.request.Request(
        BASE + path,
        headers={'X-Auth-Token': API_KEY, 'Accept': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def norm(name):
    return NAME_MAP.get(name, name)


def compute_team_status(matches):
    """Determine each team's furthest stage and elimination status."""
    status = {}  # team -> {stage_idx, round, eliminated, champion}

    for m in matches:
        stage = m.get('stage', '')
        if stage not in STAGE_ORDER:
            continue
        stage_idx = STAGE_ORDER.index(stage)
        home = norm(m['homeTeam']['name']) if m['homeTeam']['name'] else None
        away = norm(m['awayTeam']['name']) if m['awayTeam']['name'] else None

        for team in [home, away]:
            if not team:
                continue
            if team not in status or stage_idx > status[team]['stage_idx']:
                status[team] = {
                    'stage_idx': stage_idx,
                    'round': STAGE_KEY[stage],
                    'eliminated': False,
                    'champion': False,
                }

        if m['status'] == 'FINISHED' and stage != 'GROUP_STAGE' and home and away:
            winner_side = (m.get('score') or {}).get('winner')
            if winner_side == 'HOME_TEAM':
                loser, winner = away, home
            elif winner_side == 'AWAY_TEAM':
                loser, winner = home, away
            else:
                continue  # draw (shouldn't happen in knockout)
            status[loser]['eliminated'] = True
            if stage == 'FINAL':
                status[winner]['champion'] = True

    # Any team still at GROUP stage but R32 has started → eliminated from groups
    r32_started = any(
        s['stage_idx'] >= STAGE_ORDER.index('LAST_32')
        for s in status.values()
    )
    if r32_started:
        r32_teams = {t for t, s in status.items() if s['stage_idx'] >= STAGE_ORDER.index('LAST_32')}
        for team, s in status.items():
            if s['round'] == 'GROUP' and team not in r32_teams:
                s['eliminated'] = True

    return {t: {'round': s['round'], 'eliminated': s['eliminated'], 'champion': s['champion']}
            for t, s in status.items()}


def build_groups(standings_data, matches):
    groups = {}

    # Build standings per group
    for entry in standings_data.get('standings', []):
        if entry.get('type') != 'TOTAL':
            continue
        group_raw = entry.get('group', '')
        g = group_raw.replace('GROUP_', '').replace('Group ', '').strip() if group_raw else None
        if not g:
            continue
        groups.setdefault(g, {'standings': [], 'matches': []})
        for row in entry.get('table', []):
            groups[g]['standings'].append({
                'team':   norm(row['team']['name']),
                'played': row['playedGames'],
                'won':    row['won'],
                'drawn':  row['draw'],
                'lost':   row['lost'],
                'gf':     row['goalsFor'],
                'ga':     row['goalsAgainst'],
                'gd':     row['goalDifference'],
                'points': row['points'],
            })

    # Add matches per group
    for m in matches:
        if m.get('stage') != 'GROUP_STAGE':
            continue
        group_raw = m.get('group', '')
        g = group_raw.replace('GROUP_', '').replace('Group ', '').strip() if group_raw else None
        if not g or g not in groups:
            continue
        score = m.get('score') or {}
        ft = score.get('fullTime') or {}
        finished = m['status'] == 'FINISHED'
        groups[g]['matches'].append({
            'home':      norm(m['homeTeam']['name']),
            'away':      norm(m['awayTeam']['name']),
            'homeScore': ft.get('home') if finished else None,
            'awayScore': ft.get('away') if finished else None,
            'date':      m['utcDate'],
            'status':    m['status'],
        })

    return groups


def build_knockout(matches):
    knockout = {k: [] for k in ['R32', 'R16', 'QF', 'SF', 'FINAL']}
    for m in matches:
        stage = m.get('stage', '')
        if stage == 'GROUP_STAGE' or stage not in STAGE_KEY:
            continue
        key = STAGE_KEY[stage]
        score = m.get('score') or {}
        ft = score.get('fullTime') or {}
        finished = m['status'] == 'FINISHED'
        knockout[key].append({
            'home':      norm(m['homeTeam']['name']) if m['homeTeam']['name'] else None,
            'away':      norm(m['awayTeam']['name']) if m['awayTeam']['name'] else None,
            'homeScore': ft.get('home') if finished else None,
            'awayScore': ft.get('away') if finished else None,
            'date':      m['utcDate'],
            'status':    m['status'],
        })
    return knockout


def main():
    print('Fetching standings...')
    standings = fetch('/standings')
    print('Fetching matches...')
    matches_data = fetch('/matches')
    matches = matches_data.get('matches', [])

    result = {
        'lastUpdated': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'groups':      build_groups(standings, matches),
        'knockout':    build_knockout(matches),
        'teamStatus':  compute_team_status(matches),
    }

    with open(OUT, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f'Written {OUT}')


if __name__ == '__main__':
    main()
