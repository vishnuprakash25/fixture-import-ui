import { getFixtureShortId } from '../core/helpers.js';

const sportTypes = [
  { id: 'american-football', label: 'American Football' },
  { id: 'athletics', label: 'Athletics' },
  { id: 'baseball', label: 'Baseball' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'boxing', label: 'Boxing' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'darts', label: 'Darts' },
  { id: 'equestrian', label: 'Equestrian' },
  { id: 'extreme-sports', label: 'Extreme Sports' },
  { id: 'fishing', label: 'Fishing' },
  { id: 'football', label: 'Football' },
  { id: 'golf', label: 'Golf' },
  { id: 'motorsport', label: 'Formula 1' },
  { id: 'racing-horse', label: 'Racing (Horse)' },
  { id: 'rugby', label: 'Rugby (Union League)' },
  { id: 'snooker-pool', label: 'Snooker/Pool' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'watersports', label: 'Watersports' }
];

const groupCatalog = [
  {
    id: 'premier-league-2025',
    name: 'Premier League 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'English Premier League',
    startDate: 'Aug 16, 2025',
    endDate: 'May 24, 2026',
    venue: 'Various (England)',
    fixtures: [
      { name: 'Arsenal vs Chelsea', date: 'Dec 22, 2025', venue: 'Emirates Stadium, London' },
      { name: 'Liverpool vs Man United', date: 'Jan 4, 2026', venue: 'Anfield, Liverpool' },
      { name: 'Tottenham vs Newcastle', date: 'Jan 18, 2026', venue: 'Tottenham Hotspur Stadium, London' }
    ]
  },
  {
    id: 'champions-league-2025',
    name: 'UEFA Champions League 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'UEFA',
    startDate: 'Sep 16, 2025',
    endDate: 'May 30, 2026',
    venue: 'Various (Europe)',
    fixtures: [
      { name: 'Real Madrid vs Bayern Munich', date: 'Feb 12, 2026', venue: 'Santiago Bernabeu, Madrid' },
      { name: 'PSG vs Inter Milan', date: 'Feb 19, 2026', venue: 'Parc des Princes, Paris' },
      { name: 'Barcelona vs Man City', date: 'Mar 5, 2026', venue: 'Camp Nou, Barcelona' }
    ]
  },
  {
    id: 'europa-league-2025',
    name: 'UEFA Europa League 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'UEFA',
    startDate: 'Sep 18, 2025',
    endDate: 'May 22, 2026',
    venue: 'Various (Europe)',
    fixtures: [
      { name: 'Roma vs Sevilla', date: 'Feb 6, 2026', venue: 'Stadio Olimpico, Rome' },
      { name: 'Leverkusen vs Benfica', date: 'Feb 13, 2026', venue: 'BayArena, Leverkusen' },
      { name: 'Sporting vs Marseille', date: 'Feb 20, 2026', venue: 'Jose Alvalade, Lisbon' }
    ]
  },
  {
    id: 'serie-a-2025',
    name: 'Serie A 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'Lega Serie A',
    startDate: 'Aug 24, 2025',
    endDate: 'May 24, 2026',
    venue: 'Various (Italy)',
    fixtures: [
      { name: 'Inter vs Juventus', date: 'Nov 30, 2025', venue: 'San Siro, Milan' },
      { name: 'Milan vs Napoli', date: 'Dec 14, 2025', venue: 'San Siro, Milan' },
      { name: 'Atalanta vs Lazio', date: 'Jan 11, 2026', venue: 'Gewiss Stadium, Bergamo' }
    ]
  },
  {
    id: 'la-liga-2025',
    name: 'La Liga 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'LALIGA',
    startDate: 'Aug 17, 2025',
    endDate: 'May 24, 2026',
    venue: 'Various (Spain)',
    fixtures: [
      { name: 'Barcelona vs Atletico Madrid', date: 'Dec 7, 2025', venue: 'Camp Nou, Barcelona' },
      { name: 'Real Madrid vs Sevilla', date: 'Dec 21, 2025', venue: 'Santiago Bernabeu, Madrid' },
      { name: 'Valencia vs Villarreal', date: 'Jan 18, 2026', venue: 'Mestalla, Valencia' }
    ]
  },
  {
    id: 'bundesliga-2025',
    name: 'Bundesliga 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'DFL',
    startDate: 'Aug 22, 2025',
    endDate: 'May 16, 2026',
    venue: 'Various (Germany)',
    fixtures: [
      { name: 'Bayern Munich vs Dortmund', date: 'Dec 6, 2025', venue: 'Allianz Arena, Munich' },
      { name: 'Leipzig vs Leverkusen', date: 'Dec 14, 2025', venue: 'Red Bull Arena, Leipzig' },
      { name: 'Stuttgart vs Frankfurt', date: 'Jan 17, 2026', venue: 'MHPArena, Stuttgart' }
    ]
  },
  {
    id: 'ligue-1-2025',
    name: 'Ligue 1 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'LFP',
    startDate: 'Aug 15, 2025',
    endDate: 'May 23, 2026',
    venue: 'Various (France)',
    fixtures: [
      { name: 'PSG vs Marseille', date: 'Nov 23, 2025', venue: 'Parc des Princes, Paris' },
      { name: 'Lyon vs Monaco', date: 'Dec 13, 2025', venue: 'Groupama Stadium, Lyon' },
      { name: 'Lille vs Nice', date: 'Jan 10, 2026', venue: 'Pierre-Mauroy Stadium, Lille' }
    ]
  },
  {
    id: 'fa-cup-2025',
    name: 'FA Cup 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'The FA',
    startDate: 'Nov 1, 2025',
    endDate: 'May 16, 2026',
    venue: 'Various (England)',
    fixtures: [
      { name: 'FA Cup Third Round Draw', date: 'Jan 3, 2026', venue: 'Various' },
      { name: 'FA Cup Quarter Final 1', date: 'Mar 14, 2026', venue: 'Wembley, London' },
      { name: 'FA Cup Semi Final', date: 'Apr 18, 2026', venue: 'Wembley, London' }
    ]
  },
  {
    id: 'copa-del-rey-2025',
    name: 'Copa del Rey 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'RFEF',
    startDate: 'Oct 28, 2025',
    endDate: 'Apr 25, 2026',
    venue: 'Various (Spain)',
    fixtures: [
      { name: 'Quarter Final Leg 1', date: 'Jan 21, 2026', venue: 'Various' },
      { name: 'Quarter Final Leg 2', date: 'Jan 28, 2026', venue: 'Various' },
      { name: 'Final', date: 'Apr 25, 2026', venue: 'La Cartuja, Seville' }
    ]
  },
  {
    id: 'eredvisie-2025',
    name: 'Eredivisie 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'KNVB',
    startDate: 'Aug 8, 2025',
    endDate: 'May 17, 2026',
    venue: 'Various (Netherlands)',
    fixtures: [
      { name: 'Ajax vs PSV', date: 'Nov 9, 2025', venue: 'Johan Cruyff Arena, Amsterdam' },
      { name: 'Feyenoord vs AZ', date: 'Dec 14, 2025', venue: 'De Kuip, Rotterdam' },
      { name: 'Twente vs Utrecht', date: 'Jan 24, 2026', venue: 'De Grolsch Veste, Enschede' }
    ]
  },
  {
    id: 'championship-2025',
    name: 'EFL Championship 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'EFL',
    startDate: 'Aug 9, 2025',
    endDate: 'May 2, 2026',
    venue: 'Various (England)',
    fixtures: [
      { name: 'Leeds vs Sunderland', date: 'Nov 1, 2025', venue: 'Elland Road, Leeds' },
      { name: 'Burnley vs Norwich', date: 'Dec 20, 2025', venue: 'Turf Moor, Burnley' },
      { name: 'Middlesbrough vs Coventry', date: 'Jan 17, 2026', venue: 'Riverside Stadium, Middlesbrough' }
    ]
  },
  {
    id: 'mls-cup-2026',
    name: 'MLS 2026',
    sport: 'Football',
    season: '2026',
    organiser: 'Major League Soccer',
    startDate: 'Feb 21, 2026',
    endDate: 'Dec 6, 2026',
    venue: 'Various (USA)',
    fixtures: [
      { name: 'LA Galaxy vs Seattle Sounders', date: 'Mar 7, 2026', venue: 'Dignity Health Sports Park, Carson' },
      { name: 'Inter Miami vs Atlanta United', date: 'Apr 12, 2026', venue: 'DRV PNK Stadium, Fort Lauderdale' },
      { name: 'NYCFC vs Columbus Crew', date: 'May 16, 2026', venue: 'Yankee Stadium, New York' }
    ]
  },
  {
    id: 'australian-open-2026',
    name: 'Australian Open 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'Tennis Australia',
    startDate: 'Jan 12, 2026',
    endDate: 'Jan 26, 2026',
    venue: 'Melbourne Park, Australia',
    fixtures: [
      { name: 'Australian Open Round 1', date: 'Jan 12, 2026', venue: 'Rod Laver Arena, Melbourne' },
      { name: 'Australian Open Semi Final', date: 'Jan 24, 2026', venue: 'Rod Laver Arena, Melbourne' },
      { name: 'Australian Open Final', date: 'Jan 26, 2026', venue: 'Rod Laver Arena, Melbourne' }
    ]
  },
  {
    id: 'french-open-2026',
    name: 'French Open 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'FFT',
    startDate: 'May 24, 2026',
    endDate: 'Jun 8, 2026',
    venue: 'Roland Garros, Paris',
    fixtures: [
      { name: 'French Open Round 1', date: 'May 24, 2026', venue: 'Court Philippe-Chatrier, Paris' },
      { name: 'French Open Semi Final', date: 'Jun 6, 2026', venue: 'Court Philippe-Chatrier, Paris' },
      { name: 'French Open Final', date: 'Jun 8, 2026', venue: 'Court Philippe-Chatrier, Paris' }
    ]
  },
  {
    id: 'wimbledon-2026',
    name: 'Wimbledon 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'All England Lawn Tennis Club',
    startDate: 'Jun 29, 2026',
    endDate: 'Jul 12, 2026',
    venue: 'All England Club, London',
    fixtures: [
      { name: 'Wimbledon Round 1', date: 'Jun 29, 2026', venue: 'Centre Court, London' },
      { name: 'Wimbledon Semi Final', date: 'Jul 10, 2026', venue: 'Centre Court, London' },
      { name: 'Wimbledon Final', date: 'Jul 12, 2026', venue: 'Centre Court, London' }
    ]
  },
  {
    id: 'us-open-2026',
    name: 'US Open 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'USTA',
    startDate: 'Aug 31, 2026',
    endDate: 'Sep 13, 2026',
    venue: 'Flushing Meadows, New York',
    fixtures: [
      { name: 'US Open Round 1', date: 'Aug 31, 2026', venue: 'Arthur Ashe Stadium, New York' },
      { name: 'US Open Semi Final', date: 'Sep 11, 2026', venue: 'Arthur Ashe Stadium, New York' },
      { name: 'US Open Final', date: 'Sep 13, 2026', venue: 'Arthur Ashe Stadium, New York' }
    ]
  },
  {
    id: 'atp-masters-indian-wells-2026',
    name: 'ATP Masters Indian Wells 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'ATP',
    startDate: 'Mar 9, 2026',
    endDate: 'Mar 22, 2026',
    venue: 'Indian Wells Tennis Garden, California',
    fixtures: [
      { name: 'Indian Wells Round of 32', date: 'Mar 13, 2026', venue: 'Stadium 1, Indian Wells' },
      { name: 'Indian Wells Quarter Final', date: 'Mar 19, 2026', venue: 'Stadium 1, Indian Wells' },
      { name: 'Indian Wells Final', date: 'Mar 22, 2026', venue: 'Stadium 1, Indian Wells' }
    ]
  },
  {
    id: 'atp-masters-miami-2026',
    name: 'ATP Masters Miami 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'ATP',
    startDate: 'Mar 23, 2026',
    endDate: 'Apr 5, 2026',
    venue: 'Hard Rock Stadium, Miami',
    fixtures: [
      { name: 'Miami Open Round of 32', date: 'Mar 27, 2026', venue: 'Center Court, Miami Gardens' },
      { name: 'Miami Open Semi Final', date: 'Apr 3, 2026', venue: 'Center Court, Miami Gardens' },
      { name: 'Miami Open Final', date: 'Apr 5, 2026', venue: 'Center Court, Miami Gardens' }
    ]
  },
  {
    id: 'atp-masters-madrid-2026',
    name: 'ATP Masters Madrid 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'ATP',
    startDate: 'Apr 27, 2026',
    endDate: 'May 10, 2026',
    venue: 'Caja Magica, Madrid',
    fixtures: [
      { name: 'Madrid Open Round of 16', date: 'May 4, 2026', venue: 'Manolo Santana Stadium, Madrid' },
      { name: 'Madrid Open Semi Final', date: 'May 8, 2026', venue: 'Manolo Santana Stadium, Madrid' },
      { name: 'Madrid Open Final', date: 'May 10, 2026', venue: 'Manolo Santana Stadium, Madrid' }
    ]
  },
  {
    id: 'atp-masters-rome-2026',
    name: 'ATP Masters Rome 2026',
    sport: 'Tennis',
    season: '2026',
    organiser: 'ATP',
    startDate: 'May 11, 2026',
    endDate: 'May 24, 2026',
    venue: 'Foro Italico, Rome',
    fixtures: [
      { name: 'Rome Masters Round of 16', date: 'May 18, 2026', venue: 'Campo Centrale, Rome' },
      { name: 'Rome Masters Semi Final', date: 'May 22, 2026', venue: 'Campo Centrale, Rome' },
      { name: 'Rome Masters Final', date: 'May 24, 2026', venue: 'Campo Centrale, Rome' }
    ]
  },
  {
    id: 'f1-bahrain-gp-2026',
    name: 'Formula 1 Bahrain Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'Mar 6, 2026',
    endDate: 'Mar 8, 2026',
    venue: 'Bahrain International Circuit, Sakhir',
    fixtures: [
      { name: 'Bahrain GP - Practice 1', date: 'Mar 6, 2026', venue: 'Bahrain International Circuit' },
      { name: 'Bahrain GP - Qualifying', date: 'Mar 7, 2026', venue: 'Bahrain International Circuit' },
      { name: 'Bahrain GP - Race', date: 'Mar 8, 2026', venue: 'Bahrain International Circuit' }
    ]
  },
  {
    id: 'f1-saudi-gp-2026',
    name: 'Formula 1 Saudi Arabian Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'Mar 13, 2026',
    endDate: 'Mar 15, 2026',
    venue: 'Jeddah Corniche Circuit, Jeddah',
    fixtures: [
      { name: 'Saudi GP - Practice 1', date: 'Mar 13, 2026', venue: 'Jeddah Corniche Circuit' },
      { name: 'Saudi GP - Qualifying', date: 'Mar 14, 2026', venue: 'Jeddah Corniche Circuit' },
      { name: 'Saudi GP - Race', date: 'Mar 15, 2026', venue: 'Jeddah Corniche Circuit' }
    ]
  },
  {
    id: 'f1-australian-gp-2026',
    name: 'Formula 1 Australian Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'Mar 20, 2026',
    endDate: 'Mar 22, 2026',
    venue: 'Albert Park, Melbourne',
    fixtures: [
      { name: 'Australian GP - Practice 1', date: 'Mar 20, 2026', venue: 'Albert Park Circuit' },
      { name: 'Australian GP - Qualifying', date: 'Mar 21, 2026', venue: 'Albert Park Circuit' },
      { name: 'Australian GP - Race', date: 'Mar 22, 2026', venue: 'Albert Park Circuit' }
    ]
  },
  {
    id: 'f1-japanese-gp-2026',
    name: 'Formula 1 Japanese Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'Apr 3, 2026',
    endDate: 'Apr 5, 2026',
    venue: 'Suzuka Circuit, Japan',
    fixtures: [
      { name: 'Japanese GP - Practice 1', date: 'Apr 3, 2026', venue: 'Suzuka Circuit' },
      { name: 'Japanese GP - Qualifying', date: 'Apr 4, 2026', venue: 'Suzuka Circuit' },
      { name: 'Japanese GP - Race', date: 'Apr 5, 2026', venue: 'Suzuka Circuit' }
    ]
  },
  {
    id: 'f1-miami-gp-2026',
    name: 'Formula 1 Miami Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'May 1, 2026',
    endDate: 'May 3, 2026',
    venue: 'Miami International Autodrome, Miami Gardens',
    fixtures: [
      { name: 'Miami GP - Practice 1', date: 'May 1, 2026', venue: 'Miami International Autodrome' },
      { name: 'Miami GP - Qualifying', date: 'May 2, 2026', venue: 'Miami International Autodrome' },
      { name: 'Miami GP - Race', date: 'May 3, 2026', venue: 'Miami International Autodrome' }
    ]
  },
  {
    id: 'f1-emilia-romagna-gp-2026',
    name: 'Formula 1 Emilia Romagna Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'May 15, 2026',
    endDate: 'May 17, 2026',
    venue: 'Imola Circuit, Italy',
    fixtures: [
      { name: 'Emilia Romagna GP - Practice 1', date: 'May 15, 2026', venue: 'Imola Circuit' },
      { name: 'Emilia Romagna GP - Qualifying', date: 'May 16, 2026', venue: 'Imola Circuit' },
      { name: 'Emilia Romagna GP - Race', date: 'May 17, 2026', venue: 'Imola Circuit' }
    ]
  },
  {
    id: 'f1-monaco-gp-2026',
    name: 'Formula 1 Monaco Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'May 22, 2026',
    endDate: 'May 24, 2026',
    venue: 'Circuit de Monaco, Monte Carlo',
    fixtures: [
      { name: 'Monaco GP - Practice 1', date: 'May 22, 2026', venue: 'Circuit de Monaco' },
      { name: 'Monaco GP - Qualifying', date: 'May 23, 2026', venue: 'Circuit de Monaco' },
      { name: 'Monaco GP - Race', date: 'May 24, 2026', venue: 'Circuit de Monaco' }
    ]
  },
  {
    id: 'f1-british-gp-2026',
    name: 'Formula 1 British Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'Jul 3, 2026',
    endDate: 'Jul 5, 2026',
    venue: 'Silverstone Circuit, UK',
    fixtures: [
      { name: 'British GP - Practice 1', date: 'Jul 3, 2026', venue: 'Silverstone Circuit' },
      { name: 'British GP - Qualifying', date: 'Jul 4, 2026', venue: 'Silverstone Circuit' },
      { name: 'British GP - Race', date: 'Jul 5, 2026', venue: 'Silverstone Circuit' }
    ]
  },
  {
    id: 'f1-italian-gp-2026',
    name: 'Formula 1 Italian Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'Sep 4, 2026',
    endDate: 'Sep 6, 2026',
    venue: 'Autodromo di Monza, Italy',
    fixtures: [
      { name: 'Italian GP - Practice 1', date: 'Sep 4, 2026', venue: 'Autodromo di Monza' },
      { name: 'Italian GP - Qualifying', date: 'Sep 5, 2026', venue: 'Autodromo di Monza' },
      { name: 'Italian GP - Race', date: 'Sep 6, 2026', venue: 'Autodromo di Monza' }
    ]
  },
  {
    id: 'f1-abu-dhabi-gp-2026',
    name: 'Formula 1 Abu Dhabi Grand Prix 2026',
    sport: 'Formula 1',
    season: '2026',
    organiser: 'FIA / Formula 1',
    startDate: 'Dec 4, 2026',
    endDate: 'Dec 6, 2026',
    venue: 'Yas Marina Circuit, Abu Dhabi',
    fixtures: [
      { name: 'Abu Dhabi GP - Practice 1', date: 'Dec 4, 2026', venue: 'Yas Marina Circuit' },
      { name: 'Abu Dhabi GP - Qualifying', date: 'Dec 5, 2026', venue: 'Yas Marina Circuit' },
      { name: 'Abu Dhabi GP - Race', date: 'Dec 6, 2026', venue: 'Yas Marina Circuit' }
    ]
  }
];

// ─── Published Fixtures Seed ───
// ⚠️ IMPORTANT: The ordering of fixtures in this array is used by test assertions:
//   - scripts/smoke-test.mjs: References 'Arsenal vs Chelsea' as the first published fixture
//   - scripts/dom-integration-test.mjs: Uses indices and specific fixture names for DOM assertions
// If you reorder or modify this list, you MUST update corresponding assertions in the test files.
const publishedFixturesSeed = [
  { groupId: 'premier-league-2025', name: 'Arsenal vs Chelsea', importedOn: 'Nov 10, 2025', titleId: '10001', importedBy: 'vishnu.prakash@sky.uk' },
  { groupId: 'premier-league-2025', name: 'Liverpool vs Man United', importedOn: 'Nov 12, 2025', titleId: '10002', importedBy: 'vishnu.prakash@sky.uk' },
  { groupId: 'champions-league-2025', name: 'Real Madrid vs Bayern Munich', importedOn: 'Nov 7, 2025', titleId: '10011', importedBy: 'vishnu.prakash@sky.uk' },
  { groupId: 'champions-league-2025', name: 'Barcelona vs Man City', importedOn: 'Nov 9, 2025', titleId: '10012', importedBy: 'vishnu.prakash@sky.uk' },
  { groupId: 'la-liga-2025', name: 'Real Madrid vs Sevilla', importedOn: 'Nov 19, 2025', titleId: '10021', importedBy: 'ops@sky.uk' },
  { groupId: 'bundesliga-2025', name: 'Bayern Munich vs Dortmund', importedOn: 'Nov 20, 2025', titleId: '10031', importedBy: 'ops@sky.uk' },
  { groupId: 'ligue-1-2025', name: 'PSG vs Marseille', importedOn: 'Nov 22, 2025', titleId: '10041', importedBy: 'ops@sky.uk' },
  { groupId: 'australian-open-2026', name: 'Australian Open Semi Final', importedOn: 'Nov 8, 2025', titleId: '20011', importedBy: 'vishnu.prakash@sky.uk' },
  { groupId: 'australian-open-2026', name: 'Australian Open Final', importedOn: 'Nov 9, 2025', titleId: '20012', importedBy: 'vishnu.prakash@sky.uk' },
  { groupId: 'wimbledon-2026', name: 'Wimbledon Final', importedOn: 'Nov 8, 2025', titleId: '20021', importedBy: 'vishnu.prakash@sky.uk' },
  { groupId: 'us-open-2026', name: 'US Open Final', importedOn: 'Nov 14, 2025', titleId: '20031', importedBy: 'rightsbot@sky.uk' },
  { groupId: 'atp-masters-rome-2026', name: 'Rome Masters Final', importedOn: 'Nov 15, 2025', titleId: '20041', importedBy: 'rightsbot@sky.uk' },
  { groupId: 'f1-bahrain-gp-2026', name: 'Bahrain GP - Race', importedOn: 'Nov 5, 2025', titleId: '30011', importedBy: 'Event Hub' },
  { groupId: 'f1-saudi-gp-2026', name: 'Saudi GP - Race', importedOn: 'Nov 6, 2025', titleId: '30012', importedBy: 'Event Hub' },
  { groupId: 'f1-australian-gp-2026', name: 'Australian GP - Race', importedOn: 'Nov 7, 2025', titleId: '30013', importedBy: 'Event Hub' },
  { groupId: 'f1-japanese-gp-2026', name: 'Japanese GP - Race', importedOn: 'Nov 8, 2025', titleId: '30014', importedBy: 'Event Hub' },
  { groupId: 'f1-miami-gp-2026', name: 'Miami GP - Race', importedOn: 'Nov 9, 2025', titleId: '30015', importedBy: 'Event Hub' },
  { groupId: 'f1-monaco-gp-2026', name: 'Monaco GP - Qualifying', importedOn: 'Nov 10, 2025', titleId: '30016', importedBy: 'Event Hub' },
  { groupId: 'f1-british-gp-2026', name: 'British GP - Race', importedOn: 'Nov 11, 2025', titleId: '30017', importedBy: 'Event Hub' },
  { groupId: 'f1-italian-gp-2026', name: 'Italian GP - Race', importedOn: 'Nov 12, 2025', titleId: '30018', importedBy: 'Event Hub' },
  { groupId: 'f1-abu-dhabi-gp-2026', name: 'Abu Dhabi GP - Race', importedOn: 'Nov 13, 2025', titleId: '30019', importedBy: 'Event Hub' }
];

const publishedKeySet = new Set(publishedFixturesSeed.map((item) => `${item.groupId}::${item.name}`));

const fixtureGroups = groupCatalog.reduce((acc, group) => {
  acc[group.id] = {
    name: group.name,
    sport: group.sport,
    season: group.season,
    organiser: group.organiser,
    startDate: group.startDate,
    endDate: group.endDate,
    venue: group.venue,
    totalFixtures: group.fixtures.length,
    fixtures: group.fixtures.map((fixture) => ({
      ...fixture,
      status: publishedKeySet.has(`${group.id}::${fixture.name}`) ? 'Imported' : 'Available'
    }))
  };
  return acc;
}, {});

const sportTypeBySport = {
  Football: { typeId: 'football', sportType: 'Football' },
  Tennis: { typeId: 'tennis', sportType: 'Tennis' },
  'Formula 1': { typeId: 'motorsport', sportType: 'Formula 1' }
};

let fixtureCounter = 1;
const importableFixtures = Object.entries(fixtureGroups).flatMap(([groupId, group]) => {
  const sportInfo = sportTypeBySport[group.sport] || { typeId: '', sportType: group.sport };
  return group.fixtures.map((fixture) => {
    const id = `${String(fixtureCounter).padStart(4, '0')}-fx-${groupId}`;
    fixtureCounter += 1;
    const imported = publishedKeySet.has(`${groupId}::${fixture.name}`);
    return {
      id,
      name: fixture.name,
      groupId,
      typeId: sportInfo.typeId,
      sportType: sportInfo.sportType,
      date: fixture.date,
      venue: fixture.venue,
      status: imported ? 'Imported' : 'Available'
    };
  });
}).map((fixture) => ({ ...fixture, shortId: getFixtureShortId(fixture.id) }));

const subscriptions = Object.entries(
  publishedFixturesSeed.reduce((acc, entry) => {
    const current = acc[entry.groupId] || [];
    current.push(entry);
    acc[entry.groupId] = current;
    return acc;
  }, {})
).map(([groupId, fixtures], index) => {
  const group = fixtureGroups[groupId];
  const sortedByImportedDate = fixtures.slice().sort((a, b) => new Date(a.importedOn) - new Date(b.importedOn));
  const latestDate = fixtures.slice().sort((a, b) => new Date(b.importedOn) - new Date(a.importedOn))[0]?.importedOn || 'Nov 1, 2025';

  return {
    id: `sub-${groupId}`,
    groupId,
    groupName: group.name,
    fixtureManagerRecordId: `FM-${groupId}`,
    type: group.sport,
    importedSince: sortedByImportedDate[0]?.importedOn || 'Nov 1, 2025',
    lastSyncedAt: `${latestDate} ${String(10 + (index % 10)).padStart(2, '0')}:2${index % 6}`,
    queueStatus: 'Fixture Hub event queue listener active',
    activityLabel: `${fixtures.length * 3 + 7} updates`,
    activityKey: groupId.toUpperCase().replace(/-/g, '_'),
    importedFixtures: fixtures.map((fixture) => ({
      name: fixture.name,
      type: group.sport,
      importedOn: fixture.importedOn,
      titleId: fixture.titleId,
      status: 'Imported'
    }))
  };
});

const recentlyImported = publishedFixturesSeed
  .slice()
  .sort((a, b) => new Date(b.importedOn) - new Date(a.importedOn))
  .slice(0, 8)
  .map((entry, idx) => ({
    name: entry.name,
    groupId: entry.groupId,
    sport: fixtureGroups[entry.groupId]?.sport || 'Unknown',
    importDate: entry.importedOn,
    titleId: idx < 2 ? '' : entry.titleId,
    importStatus: idx < 2 ? 'In Progress' : 'Processed',
    venue: fixtureGroups[entry.groupId]?.fixtures.find((fixture) => fixture.name === entry.name)?.venue || 'Various',
    importedBy: entry.importedBy
  }));

const activityLog = [
  {
    id: 1,
    timestamp: 'Nov 13, 2025 14:23',
    action: 'Manual Import',
    actionBadge: 'badge-blue',
    fixture: 'Arsenal vs Chelsea',
    groupId: 'premier-league-2025',
    groupName: 'Premier League 2025/26',
    user: 'vishnu.prakash@sky.uk',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Initial import',
    oldValue: 'N/A',
    newValue: 'Created RightsLogic title 10001',
    updatedBy: 'vishnu.prakash@sky.uk',
    source: 'Manual import'
  },
  {
    id: 2,
    timestamp: 'Nov 13, 2025 14:41',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'Bahrain GP - Race',
    groupId: 'f1-bahrain-gp-2026',
    groupName: 'Formula 1 Bahrain Grand Prix 2026',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Fixture name update',
    oldValue: 'Bahrain GP - Race',
    newValue: 'Bahrain GP - Race (Night Race)',
    updatedBy: 'Event Hub',
    source: 'Event notification sync'
  },
  {
    id: 3,
    timestamp: 'Nov 13, 2025 13:55',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'UEFA Champions League 2025/26',
    groupId: 'champions-league-2025',
    groupName: 'UEFA Champions League 2025/26',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Fixture group name update',
    oldValue: 'Champions League 2025/26',
    newValue: 'UEFA Champions League 2025/26',
    updatedBy: 'Event Hub',
    source: 'Event notification sync'
  },
  {
    id: 4,
    timestamp: 'Nov 13, 2025 13:22',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'Monaco GP - Qualifying',
    groupId: 'f1-monaco-gp-2026',
    groupName: 'Formula 1 Monaco Grand Prix 2026',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Type update',
    oldValue: 'Motor Sport',
    newValue: 'Formula 1',
    updatedBy: 'Event Hub',
    source: 'Event notification sync'
  },
  {
    id: 5,
    timestamp: 'Nov 13, 2025 12:58',
    action: 'Manual Import',
    actionBadge: 'badge-blue',
    fixture: 'Wimbledon Final',
    groupId: 'wimbledon-2026',
    groupName: 'Wimbledon 2026',
    user: 'vishnu.prakash@sky.uk',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Initial import',
    oldValue: 'N/A',
    newValue: 'Created RightsLogic title 20021',
    updatedBy: 'vishnu.prakash@sky.uk',
    source: 'Manual import'
  },
  {
    id: 6,
    timestamp: 'Nov 13, 2025 12:19',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'US Open Final',
    groupId: 'us-open-2026',
    groupName: 'US Open 2026',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Fixture name update',
    oldValue: 'US Open Final',
    newValue: 'US Open Finals',
    updatedBy: 'Event Hub',
    source: 'Event notification sync'
  },
  {
    id: 7,
    timestamp: 'Nov 13, 2025 11:45',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'Formula 1 British Grand Prix 2026',
    groupId: 'f1-british-gp-2026',
    groupName: 'Formula 1 British Grand Prix 2026',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Fixture group name update',
    oldValue: 'F1 British Grand Prix 2026',
    newValue: 'Formula 1 British Grand Prix 2026',
    updatedBy: 'Event Hub',
    source: 'Event notification sync'
  },
  {
    id: 8,
    timestamp: 'Nov 13, 2025 11:21',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'Italian GP - Race',
    groupId: 'f1-italian-gp-2026',
    groupName: 'Formula 1 Italian Grand Prix 2026',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Type update',
    oldValue: 'Formula 1',
    newValue: 'Formula 1',
    updatedBy: 'Event Hub',
    source: 'Event notification sync (no material change)'
  },
  {
    id: 9,
    timestamp: 'Nov 13, 2025 10:52',
    action: 'Manual Import',
    actionBadge: 'badge-blue',
    fixture: 'Real Madrid vs Bayern Munich',
    groupId: 'champions-league-2025',
    groupName: 'UEFA Champions League 2025/26',
    user: 'vishnu.prakash@sky.uk',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Initial import',
    oldValue: 'N/A',
    newValue: 'Created RightsLogic title 10011',
    updatedBy: 'vishnu.prakash@sky.uk',
    source: 'Manual import'
  },
  {
    id: 10,
    timestamp: 'Nov 13, 2025 10:06',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'Roma vs Sevilla',
    groupId: 'europa-league-2025',
    groupName: 'UEFA Europa League 2025/26',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Fixture name update',
    oldValue: 'Roma v Sevilla',
    newValue: 'Roma vs Sevilla',
    updatedBy: 'Event Hub',
    source: 'Event notification sync'
  },
  {
    id: 11,
    timestamp: 'Nov 13, 2025 09:24',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'ATP Masters Rome 2026',
    groupId: 'atp-masters-rome-2026',
    groupName: 'ATP Masters Rome 2026',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Fixture group name update',
    oldValue: 'Rome Masters 2026',
    newValue: 'ATP Masters Rome 2026',
    updatedBy: 'Event Hub',
    source: 'Event notification sync'
  },
  {
    id: 12,
    timestamp: 'Nov 13, 2025 08:41',
    action: 'Auto Update',
    actionBadge: 'badge-indigo',
    fixture: 'Arsenal vs Chelsea',
    groupId: 'premier-league-2025',
    groupName: 'Premier League 2025/26',
    user: 'Fixture Hub Queue',
    status: 'Success',
    statusBadge: 'badge-green',
    detailType: 'Type update',
    oldValue: 'Football',
    newValue: 'Football',
    updatedBy: 'Event Hub',
    source: 'Event notification sync (classification verified)'
  }
];

const eventNotificationUpdates = activityLog.filter(
  (entry) => entry.action === 'Auto Update' && String(entry.source || '').toLowerCase().includes('event notification')
);
const latestUpdateTimestamp = eventNotificationUpdates.reduce((latest, entry) => {
  const ts = new Date(entry.timestamp).getTime();
  return Number.isNaN(ts) || ts < latest ? latest : ts;
}, 0);
const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
const recentWeekUpdatesCount = eventNotificationUpdates.filter((entry) => {
  const ts = new Date(entry.timestamp).getTime();
  return !Number.isNaN(ts) && latestUpdateTimestamp - ts <= oneWeekMs;
}).length;
const recentMonthUpdatesCount = eventNotificationUpdates.filter((entry) => {
  const ts = new Date(entry.timestamp).getTime();
  return !Number.isNaN(ts) && latestUpdateTimestamp - ts <= oneMonthMs;
}).length;

const importQueueCount = recentlyImported.filter((item) => item.importStatus === 'In Progress').length;
const updateQueueCount = 6;
const hasProcessingQueue = importQueueCount > 0 || updateQueueCount > 0;

const totalFixtureCount = importableFixtures.length + publishedFixturesSeed.length;

const dashboardStats = [
  {
    icon: 'RL',
    iconClass: 'rose',
    trend: `${subscriptions.length} Fixture Groups`,
    trendDirection: 'up',
    value: String(publishedFixturesSeed.length),
    label: 'Imported Fixtures',
    chart: {
      type: 'bars',
      bars: [2, 4, 3, 5, 2, 3, 2],
      color: 'rose'
    }
  },
  {
    icon: 'UP',
    iconClass: 'sky',
    trend: `Week: ${recentWeekUpdatesCount} | Month: ${recentMonthUpdatesCount}`,
    trendDirection: 'up',
    value: String(eventNotificationUpdates.length),
    label: 'Processed Updates',
    chart: {
      type: 'bars',
      bars: [3, 5, 2, 4, 6, 3, 5],
      color: 'sky'
    }
  },
  {
    icon: 'PQ',
    iconClass: 'purple',
    trend: `Imports: ${importQueueCount} | Updates: ${updateQueueCount}`,
    trendDirection: 'up',
    value: String(importQueueCount + updateQueueCount),
    label: 'In Progress',
    hidden: !hasProcessingQueue,
    chart: {
      type: 'segmented',
      segments: [
        { value: importQueueCount, label: 'Imports' },
        { value: updateQueueCount, label: 'Updates' }
      ]
    }
  }
];

export const mockData = {
  sportTypes,
  dashboardStats,
  fixtureGroups,
  importableFixtures,
  recentlyImported,
  subscriptions,
  activityLog
};
