const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

window.addEventListener("error", (event) => {
  const message = event.message || "Game script error";
  console.error(event.error || message);
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = `Game error: ${message}`;
    toast.classList.add("show");
  }
});

const startMenu = document.getElementById("start-menu");
const menuTabs = document.querySelectorAll(".menu-tab");
const menuPages = document.querySelectorAll(".menu-page");
const menuRecords = document.getElementById("menu-records");
const modeButtons = document.querySelectorAll(".mode-button");
const playerTwoField = document.getElementById("player-two-field");
const playerTwoBallField = document.getElementById("player-two-ball-field");
const ballSwatches = document.querySelectorAll(".ball-swatch");
const offlineStatus = document.getElementById("offline-status");
const introGate = document.getElementById("intro-gate");
const introEnter = document.getElementById("intro-enter");
const embedLaunchOverlay = document.getElementById("embed-launch-overlay");
const embedOpenGame = document.getElementById("embed-open-game");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const holeEl = document.getElementById("hole");
const strokesEl = document.getElementById("strokes");
const parEl = document.getElementById("par");
const matchHoleEl = document.getElementById("match-hole");
const matchParEl = document.getElementById("match-par");
const activePlayerEl = document.getElementById("active-player");
const playerScorelineEl = document.getElementById("player-scoreline");
const playerOneNameInput = document.getElementById("player-one-name");
const playerTwoNameInput = document.getElementById("player-two-name");
const courseSelect = document.getElementById("course-select");
const courseNameEl = document.getElementById("course-name");
const leaderboardList = document.getElementById("leaderboard-list");
const startMatchButton = document.getElementById("start-match");
const leaderboardShortcut = document.getElementById("leaderboard-shortcut");
const leaderboardStatus = document.getElementById("leaderboard-status");
const playerOneCard = document.getElementById("player-one-card");
const playerTwoCard = document.getElementById("player-two-card");
const streakEl = document.getElementById("streak");
const bucksEl = document.getElementById("bucks");
const toastEl = document.getElementById("toast");
const blokePopup = document.getElementById("bloke-popup");
const blokeLineEl = document.getElementById("bloke-line");
const powerBar = document.getElementById("power-bar");
const clubLabel = document.getElementById("club-label");
const shotStatsEl = document.getElementById("shot-stats");
const pinYardageEl = document.getElementById("pin-yardage");
const avgYardageEl = document.getElementById("avg-yardage");
const perfectYardageEl = document.getElementById("perfect-yardage");
const avgYardageLabelEl = document.getElementById("avg-yardage-label");
const perfectYardageLabelEl = document.getElementById("perfect-yardage-label");
const wedgeShotToggle = document.getElementById("wedge-shot-toggle");
const shotModeButtons = document.querySelectorAll(".shot-mode");
const soundToggle = document.getElementById("sound-toggle");
const soundLabel = document.getElementById("sound-label");
const fullscreenToggle = document.getElementById("fullscreen-toggle");
const gameCard = document.querySelector(".game-card");

const W = 960;
const H = 620;
let canvasScale = 1;

function configureCanvasResolution() {
  const nextScale = Math.min(2.5, Math.max(1, window.devicePixelRatio || 1));
  const nextWidth = Math.round(W * nextScale);
  const nextHeight = Math.round(H * nextScale);
  if (canvas.width !== nextWidth || canvas.height !== nextHeight || canvasScale !== nextScale) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvasScale = nextScale;
  }
  canvas.style.aspectRatio = `${W} / ${H}`;
  ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

configureCanvasResolution();

const clubs = {
  putter: { name: "Tiny Tapper", power: 7.8, drag: 0.982, loft: 0, spin: 0.2, bounce: 0.05, aim: 115, spray: 0, check: 1 },
  wedge: { name: "Rusty Flirt", power: 10.8, drag: 0.952, loft: 26, spin: 0.48, bounce: 0.18, aim: 128, spray: 0.04, check: 0.62 },
  wedgeChip: { name: "Rusty Flirt Chip", power: 9.7, drag: 0.966, loft: 10, spin: 0.34, bounce: 0.12, aim: 132, spray: 0.025, check: 0.82 },
  driver: { name: "Send Daddy", power: 18.4, drag: 0.978, loft: 18, spin: 0.78, bounce: 0.58, aim: 156, spray: 0.18, check: 1.22 },
};

const courses = [
  { name: "The Tipsy Kangaroo", key: "tipsy-kangaroo", breakMod: 0.9, hazardBonus: 0, safeScale: 1.05, cupBonus: 4, decor: "gum" },
  { name: "Bogey After Dark", key: "bogey-after-dark", breakMod: 1.08, hazardBonus: 1, safeScale: 0.95, cupBonus: 2, decor: "lantern" },
  { name: "The Rusty Shaft", key: "rusty-shaft", breakMod: 1.18, hazardBonus: 1, safeScale: 0.9, cupBonus: 0, decor: "scrap" },
  { name: "Mulligan's Hangover", key: "mulligans-hangover", breakMod: 1.32, hazardBonus: 2, safeScale: 0.84, cupBonus: -1, decor: "party" },
];

const FIREBASE_LEADERBOARD_URL = "https://blokes-golf-leaderboard-default-rtdb.firebaseio.com";

const openers = [
  "Drag it back, let it rip, blame the club.",
  "Welcome to Blokes Mini Golf. Standards are low. Stakes are enormous.",
  "One clean swing away from acting unbearable.",
  "Aim sober. Swing like you are not.",
  "The pin is flirting. Do something about it.",
];

const shotLines = {
  soft: [
    "Gentle. Almost suspiciously gentle.",
    "That had bedtime energy.",
    "A polite little nudge from a man with taxes due.",
    "Soft hands. Suspicious wrists.",
    "That was less a strike and more a suggestion.",
    "That was a whisper with dimples.",
    "You tapped it like it owed you an apology.",
    "That ball barely clocked in for work.",
    "That had all the urgency of a man reading shampoo labels.",
    "Baby swing. Tiny drama. Big little feelings.",
    "That was a love tap from someone afraid of consequences.",
    "The ball moved out of politeness.",
    "You gave it a suggestion and hoped it had ambition.",
    "That stroke had cardigan energy.",
  ],
  medium: [
    "That one had a bit of chest hair on it.",
    "Respectable. Your ancestors remain cautiously interested.",
    "Not filthy, but definitely not church.",
    "Decent contact. Try not to become unbearable.",
    "That had weekend league confidence.",
    "Fine shot. Annoyingly competent.",
    "That'll play, you smug little miracle.",
    "Clean enough to make the group chat nervous.",
    "That's the amount of violence we can legally endorse.",
    "Nice tempo. Annoying how much better that was.",
    "That one had manners and a fake ID.",
    "Good middle weight. Almost like you meant it.",
    "A sensible shot from a deeply unserious athlete.",
    "That is exactly why the flick matters, unfortunately for my jokes.",
  ],
  hard: [
    "Oh good, violence with dimples.",
    "Absolutely sent. HR has been notified.",
    "That swing just winked at someone's wife.",
    "Crikey, that one left with paperwork.",
    "You didn't hit it, you filed a complaint with it.",
    "That ball owes rent in another zip code now.",
    "You launched that like it knew your browsing history.",
    "Good lord. That ball just joined witness protection.",
    "That was loud, dumb, and weirdly attractive.",
    "You absolutely launched that little idiot.",
    "That's a full send with no adult supervision.",
    "Beautiful power. Questionable morals.",
    "That shot left the tee with weekend plans.",
    "You hit that like it owed your mother money.",
    "Huge pullback. Huge consequences. Delicious.",
  ],
};

const missLines = [
  "Line up the next one. Pretend that was research.",
  "Close enough to start lying about it.",
  "That was not a miss. That was brand development.",
  "The ball has chosen a worse lifestyle.",
  "Still alive. Still handsome. Barely.",
  "No worries, mate. Still a terrible decision.",
  "I've seen cleaner contact in a parking lot argument.",
  "That was a golf shot in the same way cereal is soup.",
  "Bold strategy: aim at nothing and trust the universe.",
  "That ball is filing for emancipation.",
  "You brought vibes to a geometry problem.",
  "Swing looked confident. Shame about the result.",
  "That was a bad idea wearing golf shoes.",
  "The ball tried its best. You were also there.",
  "I have seen better lines outside a nightclub.",
  "That's not course management, that's emotional damage.",
  "You aimed with your heart. Terrible organ for golf.",
  "That shot needs a cigarette and a long shower.",
  "You missed the safe zone and the course immediately started gossiping.",
  "The rough saw that coming and put fresh sheets on the bed.",
  "That break did exactly what the arrows said. Rude how information works.",
  "You under-hit it from off the green. The putter is not a rescue animal.",
  "Fairway first, ego second. I know, upsetting.",
  "That was one yardage marker away from being a personality disorder.",
  "You gave the rough a chance and it chose violence.",
  "That ball rolled out because you landed in nonsense, babe.",
  "Wrong club, right confidence. Classic tragedy.",
  "The safe zone was right there looking moisturized and available.",
  "You pulled across the swing zone and got bendy nonsense. Science, but embarrassing.",
  "That was not unlucky. That was geometry filing a complaint.",
  "The break was red for a reason, sweetheart.",
  "You tried to putt from the cabbage. Bold and financially suspicious.",
  "That shot had no landing plan, just vibes and a fake mustache.",
  "You can't flirt with the edge and act shocked when it leaves you.",
  "The ball ran off because you landed spicy. Try landing boring for once.",
  "That was nearly good, which is the meanest kind of bad.",
  "Aiming at the hole from here is cute. Aim at a safe zone, you gorgeous problem.",
  "Power was fine. Landing plan was found dead at the scene.",
];

const tapInLines = [
  "Tap it in before confidence becomes a disease.",
  "A little bedtime tap and we move on.",
  "Do the mature thing and steal the hole.",
  "Tiny Tapper time. Don't make this weird.",
  "If you miss this, we're blaming the trousers.",
  "Little tap. Big consequences. No pressure, babe.",
  "This is where heroes become screenshots.",
  "Put it in gently. The cup is shy.",
  "Short putts are straight-ish. Your hands are the unstable part.",
  "Tiny Tapper behaves on the green. Try joining it.",
  "Don't ram it. The cup is not impressed by panic.",
  "Aim center, pull small, pretend you've emotionally matured.",
  "The putter has one job. Please stop making it unionize.",
  "Soft touch here. No need to bring the divorce swing.",
];

const clubLines = {
  putter: [
    "Tiny Tapper selected. Straight, boring, useful. Horrifying.",
    "Tiny Tapper out. It goes where you point it. Try not to overthink that.",
  ],
  wedge: [
    "Rusty Flirt selected. Pops up, checks up, flirts responsibly.",
    "Rusty Flirt out. Little rollout, big attitude.",
  ],
  driver: [
    "Send Daddy selected. Long only. Near the green it becomes a lawsuit.",
    "Send Daddy is live. Great from deep, stupid up close.",
  ],
};

const sinkLines = [
  "Cup drop. Absolutely indecent.",
  "She went in. Compose yourself.",
  "That was filthy and management approves.",
  "In the hole. Tell the group chat immediately.",
  "Dropped it. Strut lightly, champion.",
  "That's in. Try not to invoice anyone for lessons.",
  "The cup accepted your apology.",
  "Oh my stars, she dropped. That was gorgeous.",
  "That's in. Somebody fetch this menace a tiny jacket.",
  "Stop it. That was actually hot.",
  "Cup took it like a dream. Filthy behavior.",
  "YES. That's how you read a line, you dangerous little accountant.",
  "That dropped because you let the break work instead of wrestling it.",
  "Gorgeous pace. The cup didn't even have time to call security.",
  "That's what happens when you land safe and stop being dramatic.",
  "You judged the rollout. I hate how proud I am.",
  "Oh she's IN. That was useful, rude, and extremely attractive.",
  "Perfect weight. I am emotionally over-invested.",
  "You used the club properly. Historic day for the household.",
];

const aceLines = [
  "Ace. Disgusting behavior.",
  "Hole in one. Someone check this bloke's pockets.",
  "Ace. You are now legally difficult to be around.",
  "Ace. That's going on the website, whether true or not.",
  "Hole in one. Local authorities have been notified.",
  "Ace. I am screaming respectfully.",
  "Hole in one. Absolutely disgusting. Do it again.",
  "Ace. That was so good it needs a parental advisory sticker.",
  "Ace. I just threw my clipboard into the sun.",
  "Hole in one. Disgusting. Inspirational. I need a minute.",
  "Ace. The course has requested legal counsel.",
  "Hole in one. You are now banned from humility.",
];

const roastLines = [
  "Mate, that swing had a terms and conditions page.",
  "You aimed like the fairway owed you money.",
  "I respect the confidence. I reject the execution.",
  "That was less golf, more public statement.",
  "Your ball saw the plan and resigned.",
  "I've seen garden furniture with better release timing.",
  "Tiny bit left, tiny bit right, mostly tragic.",
  "That shot needs a witness protection program.",
  "The rough didn't catch that ball. It adopted it.",
  "You played that like the hole insulted your family.",
  "If that was strategy, I'm the mayor of Augusta.",
  "Lovely arc. Shame it was pointed at regret.",
  "That swing had divorced dad energy.",
  "You pulled that like the fairway was your ex.",
  "That was not a shot, that was a cry for snacks.",
  "The club did nothing wrong. I checked.",
  "You treated that ball like it leaked your texts.",
  "That line was cooked, plated, and served with shame.",
  "Gorgeous confidence. Horrific little outcome.",
  "I would say nice try, but I respect us both too much.",
  "That was brave in the way gas station sushi is brave.",
  "The course just looked at me and said, seriously?",
  "That shot had main character syndrome and side character results.",
  "The fairway was open and you chose interpretive dance.",
  "Your pullback had swagger. The release had unpaid bills.",
  "I've seen better touch from a shopping cart with one bad wheel.",
  "That was a tactical mistake wearing a little hat.",
  "The ball didn't fade. It fled.",
  "The rough is not a shortcut. It is a judgmental blanket.",
  "You hit it hard and thought that counted as planning. Precious.",
  "That lie is bad because your previous shot was a crime scene.",
  "The driver near the green is spicy. You brought ghost pepper to breakfast.",
  "The wedge exists for a reason, and that reason is your nonsense.",
  "You played that like safe zones were decorative throw pillows.",
  "The ball has requested different management.",
  "That swing had confidence, and confidence is how lawsuits start.",
  "You found the one part of the course with emotional damage.",
  "That wasn't a hook. That was a breakup text.",
  "That wasn't a slice. That was the ball changing its number.",
  "The red stakes are not flirting. They are boundaries. Learn them.",
  "A little less hero, a little more boring little accountant. Painful, but useful.",
  "You saw the break arrows and chose denial. Bold perfume.",
];

const goodBlokeLines = [
  "Now we're cooking. Horrible news for everyone nearby.",
  "That's a proper golf shot. Try to act like you've done it before.",
  "Look at you, pretending to know yardage.",
  "That landed nicer than it had any right to.",
  "Safe zone found. The bloke council approves.",
  "You saucy little course manager.",
  "That was clean. Almost suspicious.",
  "We may need drug testing after that one.",
  "YES. Look at you being useful and dangerous.",
  "That was money. Dirty, gorgeous money.",
  "I am too excited for how legal that was.",
  "That safe zone landing was pure little genius behavior.",
  "You absolute weapon. That one had manners.",
  "That was so tidy I might forgive the outfit.",
  "Now that is golf. Nasty, elegant, mildly concerning.",
  "YES MA'AM. Safe zone, clean landing, very adult of you.",
  "That was a proper landing. The course has been silenced.",
  "Oh, look at you using strategy. I'm almost emotional.",
  "You picked a landing spot instead of praying. Growth looks hot on you.",
  "Perfect club choice. I may faint for tax reasons.",
  "That wedge checked up because loft is not just a rumor.",
  "Driver did driver things and somehow you survived. Stunning.",
  "That putt had pace, manners, and a suspicious little wink.",
  "You respected the rough and it respected you back. Briefly.",
  "Safe zone hit. The ball stopped because you gave it somewhere decent to live.",
  "That was controlled aggression. My favorite kind of bad decision.",
  "You used the break instead of fighting it. Terribly sexy.",
  "Clean flick, straight pull, good result. I hate when learning happens.",
  "That's the shot. Land safe, let it settle, then act smug.",
  "That was not luck. That was a tiny plan wearing cologne.",
  "Lovely rollout. You judged the pace like a functioning adult.",
  "Oh, she's dancing. That ball is sitting pretty.",
  "You absolute menace, that was well managed.",
  "Fairway found. Ego allowed one small beverage.",
];

const courseLines = [
  "This one bends. Don't get romantic with the driver.",
  "Dogleg shape. Land safe or the rough starts charging rent.",
  "Straight-ish hole. The break is still waiting to mug you.",
  "Safe zones are islands. Miss them and the ball goes sightseeing.",
  "Sand is guarding the lane. Wedge is your exit strategy.",
  "The sides are nasty. Center cut, then behave.",
  "Read the arrows. They're not decoration, unlike your warmup routine.",
  "The fairway bends. Your ego should not.",
  "Pick a safe zone and land there like you pay property tax.",
  "Water only matters if you land in it. Flying over is allowed, sweetheart.",
  "The fringe is playable. It is also where dignity goes to cough.",
  "Big pull for distance, straight pull for manners.",
  "Red stakes mean behave yourself or buy the ball dinner first.",
  "If the arrows are red, the green is trying to ruin your afternoon.",
  "Putter from rough loses power. Pull harder or choose therapy.",
  "The wedge goes farther when you fling it clean. Risk-reward, darling.",
  "Safe zones are flat-ish. Land there unless you enjoy public failure.",
  "Driver over sand is fine if it lands clean. Landing in sand is the bad bit.",
  "Water only punishes the landing. Fly it over like you pay insurance.",
  "Rough stops you faster, but break still drags you sideways because the course is petty.",
  "A straight pull keeps it honest. Edge pulls bend it like a bad alibi.",
  "Near the green, driver gets untrustworthy. That's not a bug, that's character.",
  "Use the fairway to build position. The hole is not always the first target, genius.",
  "If you miss safe zones, rollout becomes gossip with shoes on.",
  "Tiny Tapper is for the green. From rough it has the backbone of wet toast.",
  "Rusty Flirt is your sand friend. Not a therapist, but close.",
  "Big power needs a landing plan. Otherwise it's just cardio for the ball.",
  "Sometimes the chip layup is the clever play. Horrible news for the hero swing.",
  "The water is parked where lazy full drivers like to land. Do with that shame what you will.",
  "Safe zones kill the break. Miss them and the hill starts making executive decisions.",
  "A short chip to flat grass beats a big drive into wet regret.",
];

const sandRoasts = [
  "Beach day. Bring the wedge, not your life story.",
  "Sand lie. Pop it out and stop trying to be heroic.",
  "Driver from sand? Brave. Deeply unwell, but brave.",
  "That bunker has seen better decisions.",
  "You're in the beach. Wedge it out, Baywatch.",
  "Sand has claimed you. Wiggle free with the Rusty Flirt.",
  "Bunker shot. Lower the ego, raise the loft.",
  "Sand wants the Rusty Flirt. The driver is just being dramatic.",
  "Fling the wedge clean and it actually goes. Half pull gets half dignity.",
  "Out of sand, loft is queen. Bow accordingly.",
  "The bunker ate your rollout. Pick wedge and stop negotiating.",
  "Sand is not rough. It is rough with a trust fund and worse manners.",
  "A proper wedge pop gets you out in one. A scared one gets you a beach vacation.",
];

const obRoasts = [
  "Out of bounds. The ball has left the conversation.",
  "Penalty drop. That's what happens when ambition gets unsupervised.",
  "OB. The course said no and meant it.",
  "That one crossed the line emotionally and geographically.",
  "Red stakes caught you acting single.",
  "Out of bounds. That's not power, that's a public incident.",
  "Penalty time. The ball needed space from your decisions.",
  "That crossed the red stakes because you confused power with planning.",
  "OB again. The boundary has standards, apparently.",
  "Penalty drop. The course just charged you idiot tax.",
  "Out of bounds. You sent it like postage with unresolved trauma.",
  "The edge of the screen is not extra fairway, beautiful fool.",
  "That's a drop. Next time leave some room behind the green.",
];

const mechanicTipLines = [
  "Beginner tip, babe: the arrows and colored zones show break. Safe is calm, red is rude, aim like you have consequences.",
  "Break changes by zone. Green is polite, red is nasty, and nasty absolutely will drag your ball sideways.",
  "Tip, but make it rude: safe zones are where the ball calms down. Try one.",
  "Little lesson, babe: rough steals power, but break still drags the ball sideways.",
  "Aim at landing spots, not just the cup. The cup is needy, not always practical.",
  "Pull straight for straight. Pull sideways and the ball starts telling lies.",
  "The power line shows strength, not destiny. The break still gets a vote.",
  "Use driver for distance, wedge for sand, putter for green. Revolutionary, I know.",
  "If the ball keeps rolling out, stop landing in the spicy bits.",
  "Red arrows mean big break. Green arrows mean only mildly disrespectful break.",
  "Off the green, putter needs a stronger pull. Grass is sticky and so are your choices.",
  "A clean wedge fling is worth gambling on. A timid wedge is just a confession.",
  "Landing over water is fine. Landing in water is how we all lose respect.",
  "Driver near the green can betray you. Use it only when chaos has a permit.",
  "Safe zone first, cup second. That's course management, not cowardice.",
  "Hard shots need boring landing spots. I know, thrilling stuff.",
  "If you're in sand, stop being romantic and take the wedge.",
  "Rough catches weak shots. Overcooked shots still run away like a bad date.",
  "The fringe gives you a chance, not a guarantee. Very modern relationship.",
  "Flick speed matters for max power. Holding the pullback too long drains the sauce.",
  "Green, yellow, red: more pull, more power. Release quick before the shot gets stale.",
  "If the course bends, play the bend. Don't argue with landscaping.",
  "The pale true line on the green is calm. Earn that angle and you can actually hole the thing.",
];

const firstHoleRundownLines = [
  "Quick rundown: tap where you want to aim, then start the pull in the SWING ZONE.",
  "Pull straight down for a straight shot. Drift sideways and the ball starts acting divorced.",
  "Green, yellow, and red in the swing zone are power tiers. Red is big, flick is pure.",
  "Safe zones calm the break. Land there when the course looks rude.",
  "Read the arrows and colored break zones: safe is calm, red means rollout gets dragged sideways.",
  "The pale lane on the green is the true line. Get there with the right speed and the cup will finally behave.",
  "Sand wants Rusty Flirt. Green wants Tiny Tapper. Water and sand only punish if you land in them.",
];

const struggleTipLines = {
  pull: [
    "Reminder, sweetheart: your pull is wandering. Stay inside the lane unless you want hook-and-slice theatre.",
    "You're leaving the swing lane. Pull straighter first, then start getting cute.",
  ],
  weak: [
    "That was timid. Pull farther, and flick faster only when you actually need distance.",
    "Weak sauce. Putter and chip don't need violence, but they do need a proper pull.",
  ],
  break: [
    "You're landing in spicy break. Aim for a safe zone and let the course stop bullying you.",
    "Nasty break is dragging you. Safe zone first, hero speech later.",
  ],
  club: [
    "Wrong tool, babe. Sand wants wedge, green wants putter, driver wants room to run.",
    "Club choice is half the game. Stop bringing a hammer to a soup fight.",
  ],
  ob: [
    "Out again. Leave room behind the hole and stop treating red stakes like a suggestion.",
    "OB means your landing plan is fake. Aim shorter or land safe before sending it.",
  ],
};

const greatMechanicLines = [
  "That's why safe zones matter. Flat landing, calmer rollout, less public shame.",
  "See that? You landed boring and got rewarded. Horrifyingly mature.",
  "Perfect use of power. You judged rollout instead of just committing violence.",
  "That wedge had loft and intent. The sand is furious.",
  "You let the break help. That's not luck, that's literacy.",
  "Clean flick, clean line. The swing zone has accepted your apology.",
  "You played to position instead of ego. I am applauding and judging.",
  "That driver worked because you gave it room. Chaos with boundaries. Lovely.",
  "Good club choice. The ball actually believed in leadership for once.",
  "That pace was gorgeous. Not too thirsty, not too scared.",
];

const mouthHits = {
  putter: [
    "tuk",
    "doonk",
    "bip",
    "tippa tippa",
  ],
  wedge: [
    "thwip ka chunk",
    "skrrt bonk",
    "puh chonk",
    "flippa thwack",
  ],
  driver: [
    "ba thwack",
    "pffft ka dong",
    "whoppa crack",
    "boomf shakalonk",
  ],
};

function line(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function setText(element, value) {
  if (element) element.textContent = value;
}

let selectedClub = "putter";
let wedgeShotMode = "flop";
let hole = 1;
let strokes = 0;
let par = 3;
let score = 0;
let streak = 1;
let activePlayerIndex = 0;
let players = [];
let twoPlayerMode = false;
let selectedPlayerCount = 1;
let currentCourseIndex = 0;
let roundOver = false;
let messageTimer = 0;
let aiming = false;
let transitioning = false;
let aimStart = null;
let pointer = null;
let lastTime = performance.now();
let confetti = [];
let trail = [];
let swingTrace = [];
let swingTraceTimer = 0;
let shotFlash = 0;
let clubSwing = null;
let holeGhostShot = null;
let bestScore = Number(localStorage.getItem("blokes-hole-best") || 0);
let soundEnabled = localStorage.getItem("blokes-mini-golf-sound") !== "off";
let audioContext = null;
let musicGain = null;
let musicMaster = null;
let musicCompressor = null;
let musicTimer = null;
let chantTimer = null;
let surgeTimer = null;
let musicTempo = 1;
let musicEnergy = 0.7;
let lastMusicPulse = 0;
let lastMusicUpdate = 0;
let mainMenuAudioReady = false;
let musicPadGain = null;
let musicPadNodes = [];
let musicNodes = [];
let melodyIndex = 0;
let speechQueue = [];
let speaking = false;
let announcerVoice = null;
let lastSpokenLineAt = 0;
let pointFeed = [];
let lastReleaseFeedback = null;
let tutorialQueue = [];
let tutorialDelay = 0;
let seededRandomState = 1;
let courseRandomActive = false;
const cloudLeaderboardRequests = new Set();
const chosenBallColors = {
  1: "#fff4d1",
  2: "#f2c14e",
};

function createBall(color = "#fffdf5") {
  return {
    x: 140,
    y: H - 122,
    vx: 0,
    vy: 0,
    r: 9,
    moving: false,
    z: 0,
    vz: 0,
    airborne: false,
    lastSafeZone: null,
    curveSpin: 0,
    clubKey: selectedClub,
    shotMeta: null,
    color,
  };
}

function createPlayer(name, color) {
  return {
    name,
    score: 0,
    points: 0,
    currentStrokes: 0,
    holed: false,
    cleanStreak: 0,
    safeStreak: 0,
    frustrationStreak: 0,
    lastReminderStroke: -4,
    bestShot: null,
    worstShot: null,
    ball: createBall(color),
  };
}

players = [
  createPlayer("Bloke 1", chosenBallColors[1]),
  createPlayer("Bloke 2", chosenBallColors[2]),
];

let ball = players[0].ball;

let target = {};
let hazards = [];
let bumpers = [];
let safeZones = [];
let trueLineZone = null;
let decorations = [];
let greenBreak = { x: 0, y: 0, strength: 0, label: "Flat" };
let breakZones = [];
let breakArrows = [];
let yardageMarkers = [];
let aimHints = [];
let teePosition = { x: 140, y: H - 122 };
let doglegPoint = { x: W / 2, y: H / 2 };
let courseBend = 0;
const playableMargin = { left: 12, right: 12, top: 12, bottom: 92 };
let aimAnchor = { x: W / 2, y: H / 2 };
let aimStartedAt = 0;
let lastAimPoint = null;
let lastPullGainAt = 0;
let flickSpeed = 0;
let aimTarget = null;

function rnd(min, max) {
  const value = courseRandomActive ? seededRandom() : Math.random();
  return min + value * (max - min);
}

function seededRandom() {
  seededRandomState = (seededRandomState * 1664525 + 1013904223) >>> 0;
  return seededRandomState / 4294967296;
}

function seedCourseRandom() {
  let seed = 2166136261;
  const key = `${courses[currentCourseIndex]?.key || "course"}-${hole}`;
  for (let i = 0; i < key.length; i += 1) {
    seed ^= key.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  seededRandomState = seed >>> 0;
  courseRandomActive = true;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function playableBounds() {
  return {
    left: playableMargin.left,
    right: W - playableMargin.right,
    top: playableMargin.top,
    bottom: H - playableMargin.bottom,
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function setActivePlayer(index) {
  activePlayerIndex = index;
  ball = players[activePlayerIndex].ball;
  strokes = players[activePlayerIndex].currentStrokes;
  setText(strokesEl, liveRoundStrokes(players[activePlayerIndex]));
  syncPlayerUi();
}

function resetPlayerBalls() {
  players.forEach((player, index) => {
    player.ball.x = teePosition.x + (index - 0.5) * 28;
    player.ball.y = teePosition.y + index * 8;
    player.ball.vx = 0;
    player.ball.vy = 0;
    player.ball.z = 0;
    player.ball.vz = 0;
    player.ball.airborne = false;
    player.ball.moving = false;
    player.ball.lastSafeZone = null;
    player.ball.shotMeta = null;
    player.ball.curveSpin = 0;
    player.currentStrokes = 0;
    player.holed = false;
  });
  setActivePlayer(0);
  aimTarget = null;
}

function makeGreenBreak() {
  const reads = [
    { x: 1, y: 0, label: "Breaks right" },
    { x: -1, y: 0, label: "Breaks left" },
    { x: 0, y: 1, label: "Runs downhill" },
    { x: 0, y: -1, label: "Uphill grind" },
    { x: 0.75, y: 0.45, label: "Right and quick" },
    { x: -0.75, y: 0.45, label: "Left and quick" },
    { x: 0.65, y: -0.4, label: "Right, holds up" },
    { x: -0.65, y: -0.4, label: "Left, holds up" },
  ];
  const read = reads[Math.floor(rnd(0, reads.length))];
  const len = Math.hypot(read.x, read.y) || 1;
  const course = courses[currentCourseIndex];
  const strength = clamp((0.015 + hole * 0.0022) * course.breakMod, 0.014, 0.046);
  return {
    x: read.x / len,
    y: read.y / len,
    strength,
    label: read.label,
  };
}

function pathPointAt(t) {
  const clamped = clamp(t, 0, 1);
  const a = clamped < 0.5 ? teePosition : doglegPoint;
  const b = clamped < 0.5 ? doglegPoint : target;
  const localT = clamped < 0.5 ? clamped * 2 : (clamped - 0.5) * 2;
  return {
    x: a.x + (b.x - a.x) * localT,
    y: a.y + (b.y - a.y) * localT,
  };
}

function pathTangentAt(t) {
  const a = t < 0.5 ? teePosition : doglegPoint;
  const b = t < 0.5 ? doglegPoint : target;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: dx / len,
    y: dy / len,
    angle: Math.atan2(dy, dx),
    len,
  };
}

function makeBreakArrows() {
  breakArrows = [];
  const cols = 7;
  const rows = 5;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const point = {
        x: 98 + col * 126 + (row % 2) * 28,
        y: 78 + row * 104,
      };
      const read = localBreakAt(point);
      breakArrows.push({
        x: point.x,
        y: point.y,
        alpha: 0.3 + ((row + col) % 3) * 0.09,
        angle: Math.atan2(read.y, read.x),
        strength: read.strength,
      });
    }
  }

  breakZones.filter((zone) => zone.greenCollar).forEach((zone) => {
    breakArrows.push({
      x: zone.x,
      y: zone.y,
      alpha: 0.52,
      angle: Math.atan2(zone.yForce, zone.xForce),
      strength: zone.strength,
    });
  });
}

function makeTrueLineZone() {
  const routeLength = Math.max(1, coursePathLength());
  const pureDriverPixels = estimateIdealShotPixels("driver", 1);
  const reachable = routeLength <= pureDriverPixels * 1.04;
  const firstShotT = clamp(pureDriverPixels / routeLength, 0.34, 0.86);
  const approachPoint = reachable ? teePosition : pathPointAt(firstShotT);
  const dx = target.x - approachPoint.x;
  const dy = target.y - approachPoint.y;
  const len = Math.hypot(dx, dy) || 1;
  const approach = { x: dx / len, y: dy / len, angle: Math.atan2(dy, dx) };
  trueLineZone = {
    x: target.x - approach.x * target.r * 2.15,
    y: target.y - approach.y * target.r * 2.15,
    rx: target.r * (reachable ? 5.55 : 5.1),
    ry: target.r * 0.76,
    angle: approach.angle,
    xForce: 0,
    yForce: 0,
    strength: 0.0006,
    safe: true,
    trueLine: true,
    reachable,
  };
  breakZones.push(trueLineZone);
}

function makeBreakZones() {
  breakZones = [];
  trueLineZone = null;
  const directions = [
    { x: 1, y: 0.22 },
    { x: -1, y: 0.18 },
    { x: 0.18, y: 1 },
    { x: -0.25, y: -1 },
    { x: 0.72, y: -0.48 },
    { x: -0.68, y: 0.52 },
  ];

  [0.18, 0.34, 0.5, 0.66, 0.82, 0.92].forEach((t, index) => {
    const point = pathPointAt(t);
    const tangent = pathTangentAt(t);
    const sideX = -tangent.y;
    const sideY = tangent.x;
    const dir = directions[(hole + currentCourseIndex + index) % directions.length];
    const len = Math.hypot(dir.x, dir.y) || 1;
    breakZones.push({
      x: point.x + sideX * rnd(-34, 34),
      y: point.y + sideY * rnd(-42, 42),
      rx: rnd(118, 178),
      ry: rnd(72, 112),
      angle: tangent.angle + rnd(-0.55, 0.55),
      xForce: dir.x / len,
      yForce: dir.y / len,
      strength: clamp(greenBreak.strength * rnd(0.86, 1.55), 0.014, 0.052),
    });
  });

  const greenTangent = pathTangentAt(0.94);
  const greenSide = { x: -greenTangent.y, y: greenTangent.x };
  const collarStrength = clamp(greenBreak.strength * 1.78, 0.035, 0.072);
  [
    { offset: -58, dir: -1, skew: 0.38 },
    { offset: 54, dir: 1, skew: -0.34 },
    { offset: 0, dir: courseBend || (hole % 2 ? 1 : -1), skew: 0.12 },
  ].forEach((collar, index) => {
    const forceX = greenSide.x * collar.dir + greenTangent.x * collar.skew;
    const forceY = greenSide.y * collar.dir + greenTangent.y * collar.skew;
    const len = Math.hypot(forceX, forceY) || 1;
    breakZones.push({
      x: target.x + greenSide.x * collar.offset - greenTangent.x * (index === 2 ? 28 : 6),
      y: target.y + greenSide.y * collar.offset - greenTangent.y * (index === 2 ? 28 : 6),
      rx: index === 2 ? target.r * 5.8 : target.r * 4.9,
      ry: index === 2 ? target.r * 2.6 : target.r * 2.15,
      angle: greenTangent.angle + (index === 2 ? 0 : collar.dir * 0.16),
      xForce: forceX / len,
      yForce: forceY / len,
      strength: collarStrength * (index === 2 ? 0.82 : 1),
      greenCollar: true,
    });
  });

  makeTrueLineZone();

  safeZones.forEach((zone) => {
    breakZones.push({
      x: zone.x,
      y: zone.y,
      rx: zone.rx * 0.96,
      ry: zone.ry * 0.96,
      angle: zone.angle,
      xForce: 0,
      yForce: 0,
      strength: 0.0012,
      safe: true,
    });
  });
}

function localBreakAt(point = ball) {
  const matches = breakZones.filter((candidate) => inEllipseZone(candidate, point.x, point.y));
  const zone = matches.find((candidate) => candidate.safe) ||
    matches.sort((a, b) => (b.strength || 0) - (a.strength || 0))[0];
  if (zone) {
    return {
      x: zone.xForce,
      y: zone.yForce,
      strength: zone.strength,
      safe: zone.safe,
      greenCollar: zone.greenCollar,
      trueLine: zone.trueLine,
    };
  }
  return {
    x: greenBreak.x,
    y: greenBreak.y,
    strength: greenBreak.strength * 0.38,
    safe: false,
  };
}

function makeYardageMarkers() {
  yardageMarkers = [];
  const totalYards = Math.max(55, yardsFromPixels(coursePathLength()));
  const markerCount = Math.min(7, Math.floor(totalYards / 25));

  for (let i = 1; i <= markerCount; i++) {
    const yards = i * 25;
    const t = routeTFromDistance(yards * 5);
    if (t >= 0.98) continue;
    const point = pathPointAt(t);
    const tangent = pathTangentAt(t);
    const sideX = -tangent.y;
    const sideY = tangent.x;
    yardageMarkers.push({
      yards,
      x: point.x + sideX * 34,
      y: point.y + sideY * 34,
      angle: tangent.angle,
    });
  }
  const finishTangent = pathTangentAt(0.96);
  yardageMarkers.push({
    yards: totalYards,
    x: target.x - finishTangent.x * 44,
    y: target.y - finishTangent.y * 44,
    angle: finishTangent.angle,
  });
}

function makeDecorations() {
  decorations = [];
  const course = courses[currentCourseIndex];
  const count = 7 + currentCourseIndex * 2 + (hole % 3);
  for (let i = 0; i < count; i++) {
    const side = i % 2 ? -1 : 1;
    const t = (i + 1) / (count + 1);
    const point = pathPointAt(t);
    const tangent = pathTangentAt(t);
    const sx = -tangent.y;
    const sy = tangent.x;
    decorations.push({
      type: course.decor,
      x: clamp(point.x + sx * side * rnd(120, 210) + rnd(-26, 26), 34, W - 34),
      y: clamp(point.y + sy * side * rnd(95, 170) + rnd(-24, 24), 42, H - 42),
      s: rnd(0.75, 1.25),
      flip: side,
    });
  }
}

function coursePathLength() {
  return distance(teePosition, doglegPoint) + distance(doglegPoint, target);
}

function routeTFromDistance(pixelsFromTee) {
  const firstLeg = distance(teePosition, doglegPoint);
  const secondLeg = distance(doglegPoint, target);
  const total = firstLeg + secondLeg;
  const routePixels = clamp(pixelsFromTee, 0, total);
  if (routePixels <= firstLeg) return firstLeg ? (routePixels / firstLeg) * 0.5 : 0;
  return 0.5 + (secondLeg ? ((routePixels - firstLeg) / secondLeg) * 0.5 : 0);
}

function calculatePar() {
  const yards = Math.round(coursePathLength() / 5);
  const hardBreak = breakSeverity().meter > 0.68 ? 1 : 0;
  const waterCount = hazards.filter((hazard) => hazard.type === "water").length;
  const laneHazards = hazards.filter((hazard) => Math.abs(fairwaySideMiss({ x: hazard.x + hazard.w / 2, y: hazard.y + hazard.h / 2 })) < 0.18).length;
  const narrowSafeZones = courses[currentCourseIndex].safeScale < 0.92 ? 1 : 0;
  const difficulty = waterCount + laneHazards + hardBreak + narrowSafeZones + courses[currentCourseIndex].hazardBonus;
  let targetPar = yards > 165 ? 6 : yards > 118 ? 5 : yards > 72 ? 4 : 3;
  if (targetPar < 6 && yards > 80 && difficulty >= 4) targetPar += 1;
  return clamp(targetPar, 3, 6);
}

function makeSafeZones() {
  safeZones = [];
  const stops = [0.27, 0.52, 0.76];

  stops.forEach((t, index) => {
    const point = pathPointAt(t);
    const tangent = pathTangentAt(t);
    const sideX = -tangent.y;
    const sideY = tangent.x;
    safeZones.push({
      x: point.x + sideX * rnd(-24, 24),
      y: point.y + sideY * rnd(-24, 24),
      rx: (index === 1 ? 58 : 50) * courses[currentCourseIndex].safeScale,
      ry: (index === 1 ? 34 : 29) * courses[currentCourseIndex].safeScale,
      angle: tangent.angle,
      label: index === 2 ? "Flat Look" : index ? "Bend Stop" : "Safe Layup",
    });
  });
}

function inEllipseZone(zone, x, y) {
  const cos = Math.cos(-zone.angle);
  const sin = Math.sin(-zone.angle);
  const dx = x - zone.x;
  const dy = y - zone.y;
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;
  return (localX * localX) / (zone.rx * zone.rx) + (localY * localY) / (zone.ry * zone.ry) <= 1;
}

function currentSafeZone() {
  return safeZones.find((zone) => inEllipseZone(zone, ball.x, ball.y));
}

function hazardContainsBall(hazard, c = ball) {
  if (!hazard || !c) return false;
  if (hazard.type === "water") {
    const cx = hazard.x + hazard.w / 2;
    const cy = hazard.y + hazard.h / 2;
    const rx = hazard.w * 0.52 + c.r * 0.55;
    const ry = hazard.h * 0.56 + c.r * 0.55;
    return ((c.x - cx) * (c.x - cx)) / (rx * rx) + ((c.y - cy) * (c.y - cy)) / (ry * ry) <= 1;
  }
  if (hazard.type === "sand") {
    const cx = hazard.x + hazard.w / 2;
    const cy = hazard.y + hazard.h / 2;
    const rx = hazard.w * 0.55 + c.r * 0.55;
    const ry = hazard.h * 0.58 + c.r * 0.55;
    return ((c.x - cx) * (c.x - cx)) / (rx * rx) + ((c.y - cy) * (c.y - cy)) / (ry * ry) <= 1;
  }
  return inRectCircle(hazard, c);
}

function currentHazard() {
  return hazards.find((hazard) => {
    if (!hazardContainsBall(hazard)) return false;
    return !ball.airborne && ball.z <= 0;
  });
}

function nearestRouteT(from = ball) {
  let best = { t: 0, d: Infinity };
  for (let i = 0; i <= 100; i += 1) {
    const t = i / 100;
    const point = pathPointAt(t);
    const d = Math.hypot(from.x - point.x, from.y - point.y);
    if (d < best.d) best = { t, d };
  }
  return best.t;
}

function routeDistanceRemaining(from = ball) {
  if (!from || !Number.isFinite(from.x) || !target || !Number.isFinite(target.x)) return 0;
  const progress = nearestRouteT(from);
  const projected = pathPointAt(progress);
  const firstLeg = distance(teePosition, doglegPoint);
  const secondLeg = distance(doglegPoint, target);
  const directToPin = distance(from, target);

  if (directToPin < 170 || progress > 0.88) return directToPin;

  const routeRemaining =
    progress < 0.5
      ? (1 - progress * 2) * firstLeg + secondLeg
      : (1 - (progress - 0.5) * 2) * secondLeg;
  return routeRemaining + distance(from, projected) * 0.35;
}

function routeAimTarget(from = ball) {
  const progress = nearestRouteT(from);
  if (distance(from, target) < 190 || progress > 0.84) return target;
  return pathPointAt(clamp(progress + 0.28, 0.18, 1));
}

function angleDifference(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function nearestFairwayPoint(from = ball) {
  const bounds = playableBounds();
  let best = { t: 0, d: Infinity, side: 1 };
  for (let i = 8; i <= 94; i += 2) {
    const t = i / 100;
    const point = pathPointAt(t);
    const tangent = pathTangentAt(t);
    const sideX = -tangent.y;
    const sideY = tangent.x;
    const lateral = (from.x - point.x) * sideX + (from.y - point.y) * sideY;
    const d = Math.hypot(from.x - point.x, from.y - point.y);
    if (d < best.d) best = { t, d, side: lateral > 0 ? 1 : -1 };
  }
  const point = pathPointAt(best.t);
  const tangent = pathTangentAt(best.t);
  const sideX = -tangent.y;
  const sideY = tangent.x;
  return {
    x: clamp(point.x + sideX * best.side * 34, bounds.left + ball.r, bounds.right - ball.r),
    y: clamp(point.y + sideY * best.side * 34, bounds.top + ball.r, bounds.bottom - ball.r),
  };
}

function nearestFringePoint(from = ball) {
  const bounds = playableBounds();
  let best = { t: 0, d: Infinity, side: 1, lateral: 0 };
  for (let i = 8; i <= 94; i += 2) {
    const t = i / 100;
    const point = pathPointAt(t);
    const tangent = pathTangentAt(t);
    const sideX = -tangent.y;
    const sideY = tangent.x;
    const lateral = (from.x - point.x) * sideX + (from.y - point.y) * sideY;
    const d = Math.hypot(from.x - point.x, from.y - point.y);
    if (d < best.d) best = { t, d, side: lateral >= 0 ? 1 : -1, lateral: Math.abs(lateral) };
  }
  const point = pathPointAt(best.t);
  const tangent = pathTangentAt(best.t);
  const sideX = -tangent.y;
  const sideY = tangent.x;
  const fairwayWidth = 58 + 28 * Math.sin(best.t * Math.PI);
  const fringeOffset = fairwayWidth + 18;
  return {
    x: clamp(point.x + sideX * best.side * fringeOffset, bounds.left + ball.r, bounds.right - ball.r),
    y: clamp(point.y + sideY * best.side * fringeOffset, bounds.top + ball.r, bounds.bottom - ball.r),
  };
}

function fairwayPosition(t, sideOffset = 0) {
  const point = pathPointAt(t);
  const tangent = pathTangentAt(t);
  const sideX = -tangent.y;
  const sideY = tangent.x;
  return {
    x: point.x + sideX * sideOffset,
    y: point.y + sideY * sideOffset,
    angle: tangent.angle,
  };
}

function fairwaySideMiss(point = ball) {
  let best = { t: 0, lateral: 0, d: Infinity };
  for (let i = 0; i <= 100; i += 4) {
    const t = i / 100;
    const center = pathPointAt(t);
    const tangent = pathTangentAt(t);
    const lateral = Math.abs((point.x - center.x) * (-tangent.y) + (point.y - center.y) * tangent.x);
    const d = Math.hypot(point.x - center.x, point.y - center.y);
    if (d < best.d) best = { t, lateral, d };
  }
  const fairwayWidth = 48 + 22 * Math.sin(best.t * Math.PI);
  return clamp((best.lateral - fairwayWidth) / 128, 0, 1);
}

function boundaryExitPoint(from, to, bounds) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const hits = [];
  if (dx !== 0) {
    hits.push((bounds.left - from.x) / dx, (bounds.right - from.x) / dx);
  }
  if (dy !== 0) {
    hits.push((bounds.top - from.y) / dy, (bounds.bottom - from.y) / dy);
  }
  const t = hits
    .filter((value) => value >= 0 && value <= 1)
    .sort((a, b) => a - b)[0] ?? 1;
  return {
    x: clamp(from.x + dx * t, bounds.left, bounds.right),
    y: clamp(from.y + dy * t, bounds.top, bounds.bottom),
  };
}

function roughPenalty() {
  if (ball.z > 0) return 1;
  const onGreenPatch = distance(ball, target) < target.r * 3.5;
  if (currentSafeZone() || onGreenPatch) return 0.62;
  return 1.72 + fairwaySideMiss(ball) * 1.58;
}

function lieState(point = ball) {
  const sideMiss = fairwaySideMiss(point);
  const onGreenPatch = distance(point, target) < target.r * 3.9;
  const safe = currentSafeZone();
  return {
    sideMiss,
    safe,
    onGreenPatch,
    onFairway: sideMiss <= 0.06,
    inRough: sideMiss > 0.18,
    inFringe: sideMiss > 0.06 && sideMiss <= 0.18,
  };
}

function maybeBlokeCourseComment() {
  if (roundOver || transitioning || ball.moving || aiming || messageTimer > 0) return;
  if (performance.now() - maybeBlokeCourseComment.last < 52000) return;
  if (Math.random() < 0.82) {
    maybeBlokeCourseComment.last = performance.now();
    return;
  }
  maybeBlokeCourseComment.last = performance.now();
  const hazard = currentHazard();
  if (hazard && hazard.type === "sand") {
    setMessage(line(sandRoasts), 180, "roast");
    return;
  }
  const sideMiss = fairwaySideMiss(ball);
  if (sideMiss > 0.25) {
    setMessage(hole <= 4 && Math.random() > 0.45 ? line(mechanicTipLines) : "You're flirting with the side rough. It is not flirting back.", 180, "roast");
    return;
  }
  if (distance(ball, target) < 110) {
    setMessage(Math.random() > 0.5 ? "Near the cup now. The break is about to get smug." : line(tapInLines), 180, "course");
    return;
  }
  setMessage(hole <= 4 && Math.random() > 0.58 ? line(mechanicTipLines) : line(courseLines), 180, "course");
}
maybeBlokeCourseComment.last = 0;

function queueFirstHoleRundown(bendLine) {
  tutorialQueue = [bendLine, ...firstHoleRundownLines];
  tutorialDelay = 1;
}

function updateTutorialQueue(dt) {
  if (!tutorialQueue.length || roundOver || transitioning || aiming || ball.moving) return;
  tutorialDelay -= dt;
  if (tutorialDelay > 0 || messageTimer > 0) return;
  const next = tutorialQueue.shift();
  setMessage(next, 108, "course");
  tutorialDelay = 22;
}

function markHelpfulResult(good = false) {
  const player = players[activePlayerIndex];
  if (!player) return;
  if (good) player.frustrationStreak = Math.max(0, player.frustrationStreak - 1);
}

function struggleReminder(reason) {
  const player = players[activePlayerIndex];
  if (!player) return "";
  player.frustrationStreak = (player.frustrationStreak || 0) + 1;
  const enoughBad = player.frustrationStreak >= (hole === 1 ? 2 : 3);
  const spaced = player.currentStrokes - (player.lastReminderStroke || -4) >= 2;
  if (!enoughBad || !spaced) return "";
  player.lastReminderStroke = player.currentStrokes;
  const pool = struggleTipLines[reason] || mechanicTipLines;
  return line(pool);
}

function swingAnchor() {
  const bounds = playableBounds();
  return {
    x: clamp(bounds.left + 104, bounds.left + 82, bounds.right - 82),
    y: clamp(bounds.top + 138, bounds.top + 108, bounds.bottom - 278),
    r: 36,
    laneW: 96,
    laneH: 286,
  };
}

function shotVector() {
  const club = selectedClubSpec();
  const trigger = swingAnchor();
  const releaseDx = pointer.x - aimAnchor.x;
  const dy = pointer.y - aimAnchor.y;
  const pull = clamp(dy, 0, club.aim);
  const routeTarget = aimTarget || routeAimTarget(ball);
  const routeAngle = Math.atan2(routeTarget.y - ball.y, routeTarget.x - ball.x);
  const path = swingPathShape(trigger, club);
  const deadZone = trigger.laneW * 0.09;
  const releaseExcess = Math.max(0, Math.abs(releaseDx) - deadZone) * Math.sign(releaseDx);
  const dx = releaseExcess * 1.18 + path.lateral * 0.95;
  const offLine = Math.atan2(dx, Math.max(28, pull));
  const edgeRatio = clamp(Math.max(Math.abs(releaseExcess), path.maxExcess) / (trigger.laneW * 0.26), 0, 1);
  const curveResponse = edgeRatio < 0.22
    ? edgeRatio * 0.22
    : edgeRatio < 0.72
      ? 0.05 + (edgeRatio - 0.22) * 0.62
      : 0.36 + Math.pow((edgeRatio - 0.72) / 0.28, 1.75) * 0.64;
  const lateral = Math.sign(dx) * curveResponse * club.aim * clamp(pull / club.aim, 0.25, 1);
  return {
    dx,
    releaseDx,
    dy,
    pull,
    baseAngle: routeAngle,
    routeAngle,
    lateral,
    offLine,
    releaseSteer: clamp(releaseExcess / (trigger.laneW * 0.38), -1, 1),
    edgeRatio,
    curveResponse,
    ratio: pull / club.aim,
  };
}

function selectedClubKeyForShot() {
  return selectedClub === "wedge" && wedgeShotMode === "chip" ? "wedgeChip" : selectedClub;
}

function selectedClubSpec() {
  return clubs[selectedClubKeyForShot()] || clubs[selectedClub];
}

function yardsFromPixels(pixels) {
  return Math.max(1, Math.round(pixels / 5));
}

function estimateIdealShotPixels(shotClubKey, powerRatio = 1) {
  const club = clubs[shotClubKey] || clubs.driver;
  let vx = club.power * clamp(powerRatio, 0, 1);
  let z = club.loft ? 2 : 0;
  let vz = club.loft ? (vx / club.power) * club.loft : 0;
  let airborne = club.loft > 0;
  let traveled = 0;
  for (let i = 0; i < 900; i += 1) {
    const speed = Math.abs(vx);
    if (!airborne && speed < 0.11) break;
    traveled += speed;
    if (airborne) {
      vz -= 1.28;
      z += vz;
      if (z <= 0) {
        z = 0;
        airborne = false;
        const bouncePower = club.bounce * 0.9;
        if (club.bounce > 0.1 && speed > 2.2) {
          vx *= 0.88 + bouncePower * 0.12;
          vz = speed * bouncePower * 0.82;
          if (vz > 2.2) airborne = true;
        }
      }
    }
    vx *= Math.min(0.99, club.drag + 0.002);
    if (!airborne && speed < 0.62) vx *= 0.94;
  }
  return traveled;
}

function isWedgeKey(clubKey) {
  return clubKey === "wedge" || clubKey === "wedgeChip";
}

function swingPathShape(trigger, club) {
  if (!swingTrace.length) return { lateral: 0, maxExcess: 0 };
  const deadZone = trigger.laneW * 0.09;
  let weighted = 0;
  let totalWeight = 0;
  let maxExcess = 0;
  for (const point of swingTrace) {
    const pull = clamp(point.y - aimAnchor.y, 0, club.aim);
    if (pull < 10) continue;
    const rawDx = point.x - aimAnchor.x;
    const excess = Math.max(0, Math.abs(rawDx) - deadZone);
    if (excess <= 0) continue;
    const weight = 0.45 + pull / club.aim;
    weighted += Math.sign(rawDx) * excess * weight;
    totalWeight += weight;
    maxExcess = Math.max(maxExcess, excess);
  }
  return {
    lateral: totalWeight ? weighted / totalWeight : 0,
    maxExcess,
  };
}

function shotShapeFromVector(shot, maxShape = 0.22) {
  return -clamp(shot.lateral / 520, -maxShape, maxShape);
}

function effectivePowerRatio(shot) {
  const shotClubKey = selectedClubKeyForShot();
  const flick = clamp((flickSpeed - 0.18) / 1.62, 0, 1);
  const profiles = {
    driver: { flick: 1, curve: 1.42 },
    wedge: { flick: 1, curve: 1.42 },
    wedgeChip: { flick: 0.72, curve: 0.9 },
    putter: { flick: 0.44, curve: 0.78 },
  };
  const profile = profiles[shotClubKey] || profiles.putter;
  const flickCurve = Math.pow(flick, profile.curve);
  const zonePower = swingZonePower(shot.ratio);
  return clamp((zonePower + (1 - zonePower) * flickCurve * profile.flick) * swingHoldPenalty(shot), 0, 1);
}

function swingZonePower(ratio) {
  const r = clamp(ratio, 0, 1);
  if (r < 0.34) return (r / 0.34) * 0.33;
  if (r < 0.55) return 0.33 + ((r - 0.34) / 0.21) * 0.18;
  if (r < 0.76) return 0.51 + ((r - 0.55) / 0.21) * 0.15;
  return 0.66 + ((r - 0.76) / 0.24) * 0.33;
}

function swingZoneLabel(ratio) {
  const r = clamp(ratio, 0, 1);
  if (r < 0.34) return "BUILD";
  if (r < 0.55) return "GREEN";
  if (r < 0.76) return "YELLOW";
  return "RED";
}

function swingHoldPenalty(shot = null) {
  if (!lastPullGainAt) return 1;
  const holdMs = performance.now() - lastPullGainAt;
  const ratio = shot ? clamp(shot.ratio, 0, 1) : 0;
  const deepPull = clamp((ratio - 0.76) / 0.24, 0, 1);
  const grace = 240 - deepPull * 190;
  const drainWindow = 980 - deepPull * 520;
  return 1 - clamp((holdMs - grace) / drainWindow, 0, 1) * 0.78;
}

function recordAimPointer(nextPointer, now = performance.now()) {
  const nextPull = Math.max(0, nextPointer.y - aimAnchor.y);
  if (lastAimPoint) {
    const dt = Math.max(10, now - lastAimPoint.time);
    const pullChange = nextPull - lastAimPoint.pull;
    if (pullChange > 0.6) {
      flickSpeed = Math.max(flickSpeed, pullChange / dt);
      lastPullGainAt = now;
    }
  }
  pointer = nextPointer;
  lastAimPoint = { x: pointer.x, y: pointer.y, pull: nextPull, time: now };
  swingTrace.push({ x: pointer.x, y: pointer.y, life: 1 });
  if (swingTrace.length > 42) swingTrace.shift();
}

function pointInSwingStart(point) {
  const trigger = swingAnchor();
  return Math.hypot(point.x - trigger.x, point.y - trigger.y) <= trigger.r * 1.55;
}

function setAimTarget(point) {
  const bounds = playableBounds();
  aimTarget = {
    x: clamp(point.x, bounds.left + 20, bounds.right - 20),
    y: clamp(point.y, bounds.top + 20, bounds.bottom - 20),
  };
  aimHints = [];
  setToastOnly("Aim locked. Start in SWING ZONE, pull down fast, release.", 115);
}

function updateAimHints() {
  aimHints = [];
}

function blokeSay(text, mood = "talk", ttl = 220) {
  if (document.body.classList.contains("quiet-commentary")) return;
  if (!blokePopup || !blokeLineEl) return;
  setText(blokeLineEl, text);
  blokePopup.className = `bloke-popup show mood-${mood}`;
  window.clearTimeout(blokeSay.timer);
  blokeSay.timer = window.setTimeout(() => {
    if (blokePopup) blokePopup.classList.remove("show");
  }, ttl * 16);
}

function setMessage(text, ttl = 180, mood = "talk") {
  if (toastEl) {
    setText(toastEl, "");
    toastEl.classList.remove("show");
  }
  messageTimer = Math.min(ttl, 150);
  blokeSay(text, mood, Math.min(ttl, 170));
  const speechStyle = {
    roast: { rate: 1.04, pitch: 1.2, volume: 0.88, pauseMs: 70 },
    good: { rate: 1.13, pitch: 1.36, volume: 0.98, pauseMs: 55 },
    ace: { rate: 1.18, pitch: 1.45, volume: 1, pauseMs: 45 },
    course: { rate: 0.98, pitch: 1.12, volume: 0.96, pauseMs: 110 },
    talk: { rate: 1, pitch: 1.14, volume: 0.96, pauseMs: 100 },
  }[mood] || {};
  const now = performance.now();
  const shouldSpeak =
    mood === "ace" ||
    (mood === "good" && now - lastSpokenLineAt > 9500 && Math.random() < 0.42) ||
    (mood === "roast" && now - lastSpokenLineAt > 11000 && Math.random() < 0.36) ||
    (mood === "talk" && now - lastSpokenLineAt > 15000 && Math.random() < 0.18);
  if (shouldSpeak) {
    lastSpokenLineAt = now;
    speak(humanizeSpeech(text), { interrupt: false, ...speechStyle });
  }
}

function setToastOnly(text, ttl = 120) {
  if (toastEl) {
    setText(toastEl, "");
    toastEl.classList.remove("show");
  }
  messageTimer = ttl;
  blokeSay(text, "course", Math.min(ttl, 120));
}

function updateSoundButton() {
  setText(soundLabel, soundEnabled ? "Sound On" : "Sound Off");
  if (!soundToggle) return;
  soundToggle.classList.toggle("sound-off", !soundEnabled);
  soundToggle.classList.toggle("sound-on", soundEnabled);
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
}

function updateOfflineStatus() {
  if (!offlineStatus) return;
  const isOffline = !navigator.onLine;
  offlineStatus.classList.toggle("offline", isOffline);
  offlineStatus.classList.toggle("ready", !isOffline);
  if (location.protocol === "file:") {
    setText(offlineStatus, "Offline app mode works after hosting/installing from Netlify.");
    return;
  }
  setText(offlineStatus, isOffline
    ? "Offline mode active. No internet, still putting."
    : "Offline-ready after this page finishes loading once.");
}

function cleanPlayerName(value, fallback) {
  const cleaned = value.trim().slice(0, 14);
  return cleaned || fallback;
}

function syncPlayerUi() {
  const p1 = players[0];
  const p2 = players[1] || createPlayer("Ghost Bloke", "#ffd36e");
  const active = players[activePlayerIndex] || p1;
  const p1Total = liveRoundStrokes(p1);
  const p2Total = liveRoundStrokes(p2);
  const activeTotal = liveRoundStrokes(active);
  setText(activePlayerEl, active.name);
  setText(playerScorelineEl, twoPlayerMode ? `Round ${p1Total} - ${p2Total}` : `Round ${activeTotal}`);
  if (playerOneCard) {
    setText(playerOneCard.querySelector("span"), p1.name);
    setText(playerOneCard.querySelector("strong"), p1.currentStrokes);
    playerOneCard.classList.toggle("active", activePlayerIndex === 0);
  }
  if (playerTwoCard) {
    setText(playerTwoCard.querySelector("span"), p2.name);
    setText(playerTwoCard.querySelector("strong"), p2.currentStrokes);
    playerTwoCard.style.display = twoPlayerMode ? "flex" : "none";
    playerTwoCard.classList.toggle("active", activePlayerIndex === 1);
  }
  setText(courseNameEl, courses[currentCourseIndex].name);
}

function liveRoundStrokes(player) {
  if (!player) return 0;
  return (player.score || 0) + (player.holed ? 0 : player.currentStrokes || 0);
}

function awardPoints(amount, reason = "", mood = "good", speakIt = true) {
  const points = Math.max(0, Math.round(amount));
  if (!points) return 0;
  score += points;
  const player = players[activePlayerIndex];
  if (player) player.points = (player.points || 0) + points;
  if (reason) {
    pointFeed.unshift({
      text: `${reason} +${points}`,
      points,
      mood,
      life: 520,
    });
    pointFeed = pointFeed.slice(0, 5);
  }
  if (reason && speakIt) setToastOnly(`${reason} +${points}`, 110);
  return points;
}

function shotGradeInfo(shot, powerRatio, shotClubKey, distanceToCup) {
  const clean = clamp(1 - shot.edgeRatio, 0, 1);
  const flick = clamp(flickSpeed / 1.4, 0, 1);
  const control = clean * 0.72 + flick * 0.18 + clamp(powerRatio, 0, 1) * 0.1;
  if (control > 0.9) return { label: "Pure", points: 90, mood: "good", line: "Pure swing. That pull line had manners and a lawyer." };
  if (control > 0.74) return { label: "Playable", points: 55, mood: "good", line: "Playable. Not art, but nobody's calling the authorities." };
  if (shot.edgeRatio > 0.82) return { label: "Absolute Crime", points: 5, mood: "roast", line: "Absolute crime. The swing zone filed a complaint." };
  if (shot.edgeRatio > 0.55) return { label: "Cooked", points: 15, mood: "roast", line: "Cooked. You left the lane and brought receipts." };
  return { label: "Bendy", points: 30, mood: "talk", line: "Bendy. Playable, but she knows what you did." };
}

function clubChoiceBonus(shotClubKey, lie, hazard, distanceToCup, powerRatio) {
  if (hazard?.type === "sand" && isWedgeKey(shotClubKey)) {
    return { points: 70, line: "Right club in the sand. Personal growth, disgusting." };
  }
  if (shotClubKey === "wedgeChip" && distanceToCup < 350 && powerRatio > 0.72) {
    return { points: 65, line: "Rusty Flirt chip with a proper flick. Pitching-wedge behavior. Spicy." };
  }
  if (shotClubKey === "wedge" && distanceToCup < 350 && powerRatio > 0.72) {
    return { points: 55, line: "Flop had height and intent. The green got nervous." };
  }
  if (shotClubKey === "driver" && distanceToCup > 430 && powerRatio > 0.78) {
    return { points: 60, line: "Driver used from distance like an adult. Rare footage." };
  }
  if (shotClubKey === "putter" && (lie.onGreenPatch || lie.safe) && powerRatio < 0.68) {
    return { points: 35, line: "Putter pace. Tiny Tapper did tiny tapper things." };
  }
  return null;
}

function shotPowerMultiplierForLie(shotClubKey, powerRatio, distanceToCup, lie, hazard) {
  if (hazard && hazard.type === "sand") {
    if (isWedgeKey(shotClubKey)) {
      if (shotClubKey === "wedgeChip") return 0.7 + clamp(powerRatio - 0.5, 0, 0.62) * 0.72;
      return 0.72 + clamp(powerRatio - 0.62, 0, 0.5) * 0.74;
    }
    return shotClubKey === "driver" ? 1.02 : 0.55;
  }
  if (isWedgeKey(shotClubKey)) {
    const insideApproach = distanceToCup < 350;
    if (shotClubKey === "wedgeChip") return (insideApproach ? 0.95 : 0.78) + clamp(powerRatio - 0.46, 0, 0.68) * 0.58;
    return (insideApproach ? 0.98 : 0.9) + clamp(powerRatio - 0.55, 0, 0.57) * 0.48;
  }
  if (shotClubKey === "putter") {
    if (lie.onGreenPatch || lie.safe) return 1.02;
    if (lie.inRough) return 0.18;
    if (lie.inFringe) return 0.32;
    return 0.52;
  }
  return 1;
}

function estimateShotYards(shotClubKey, powerRatio) {
  const club = clubs[shotClubKey] || clubs.putter;
  const lie = lieState(ball);
  const hazard = currentHazard();
  const distanceToCup = distance(ball, target);
  let vx = club.power * clamp(powerRatio, 0, 1) * shotPowerMultiplierForLie(shotClubKey, powerRatio, distanceToCup, lie, hazard);
  let z = club.loft ? 2 : 0;
  let vz = club.loft ? (vx / club.power) * club.loft : 0;
  let airborne = club.loft > 0;
  let traveled = 0;
  const sideMiss = lie.sideMiss;
  const safeZone = lie.safe;
  for (let i = 0; i < 900; i += 1) {
    const speed = Math.abs(vx);
    if (!airborne && speed < 0.11) break;
    traveled += speed;
    if (airborne) {
      vz -= 1.28;
      z += vz;
      if (z <= 0) {
        z = 0;
        airborne = false;
        const bouncePower = club.bounce * 0.9;
        if (club.bounce > 0.1 && speed > 2.2) {
          vx *= 0.88 + bouncePower * 0.12;
          vz = speed * bouncePower * 0.82;
          if (vz > 2.2) airborne = true;
        }
      }
    }
    const roughSlowdown = !safeZone && sideMiss > 0.08 ? 0.056 + sideMiss * 0.078 : 0;
    const drag = safeZone ? 0.97 : Math.min(0.99, club.drag + 0.002 - roughSlowdown);
    vx *= drag;
    if (!airborne && speed < 0.62) vx *= 0.94;
    if (sideMiss > 0.22 && !airborne && speed < 2.2) vx *= 0.68;
  }
  return yardsFromPixels(traveled);
}

function updateShotStats() {
  if (!pinYardageEl || !avgYardageEl || !perfectYardageEl || !ball || !Number.isFinite(ball.x) || !target || !Number.isFinite(target.x)) return;
  const shotClubKey = selectedClubKeyForShot();
  if (shotStatsEl) {
    shotStatsEl.classList.remove("club-putter", "club-wedge", "club-wedgeChip", "club-driver");
    shotStatsEl.classList.add(`club-${shotClubKey}`);
  }
  const shotLabel = shotClubKey === "wedgeChip" ? "Flirt Chip" : clubs[shotClubKey]?.name || "Club";
  const averageRatio = shotClubKey === "driver" ? 0.46 : shotClubKey === "wedge" ? 0.43 : shotClubKey === "wedgeChip" ? 0.42 : 0.38;
  const averageYards = estimateShotYards(shotClubKey, averageRatio);
  const pureYards = estimateShotYards(shotClubKey, 1);
  setText(pinYardageEl, `${yardsFromPixels(routeDistanceRemaining(ball))} yd`);
  setText(avgYardageLabelEl, `${shotLabel} ${Math.round(averageRatio * 100)}%`);
  setText(avgYardageEl, `${averageYards} yd`);
  setText(perfectYardageLabelEl, `${shotLabel} Max`);
  setText(perfectYardageEl, `${pureYards} yd`);
}

function syncBallPickerVisibility() {
  if (playerTwoField) playerTwoField.style.display = selectedPlayerCount === 2 ? "grid" : "none";
  if (playerTwoBallField) playerTwoBallField.style.display = selectedPlayerCount === 2 ? "grid" : "none";
}

function syncClubUi(announce = false) {
  document.querySelectorAll(".club").forEach((button) => button.classList.toggle("active", button.dataset.club === selectedClub));
  if (wedgeShotToggle) wedgeShotToggle.classList.toggle("visible", selectedClub === "wedge");
  shotModeButtons.forEach((button) => button.classList.toggle("active", button.dataset.shot === wedgeShotMode));
  const label = selectedClub === "wedge" ? `${clubs.wedge.name} ${wedgeShotMode === "chip" ? "Chip" : "Flop"}` : clubs[selectedClub].name;
  setText(clubLabel, label);
  updateShotStats();
  if (announce) {
    const extra = selectedClub === "wedge"
      ? wedgeShotMode === "chip"
        ? " Chip is lower, cleaner, and still checks up a bit."
        : " Flop is higher, shorter, and lands soft."
      : "";
    setMessage(`${line(clubLines[selectedClub])}${extra}`);
  }
}

function startTwoPlayerMatch() {
  if (startMatchButton) setText(startMatchButton, "Start Round");
  currentCourseIndex = Number(courseSelect ? courseSelect.value : currentCourseIndex);
  players = [createPlayer(cleanPlayerName(playerOneNameInput ? playerOneNameInput.value : "Bloke 1", "Bloke 1"), chosenBallColors[1])];
  if (selectedPlayerCount === 2) players.push(createPlayer(cleanPlayerName(playerTwoNameInput ? playerTwoNameInput.value : "Bloke 2", "Bloke 2"), chosenBallColors[2]));
  if (selectedPlayerCount === 1) players.push(createPlayer("Ghost Bloke", chosenBallColors[2]));
  if (playerOneNameInput) playerOneNameInput.value = players[0].name;
  if (playerTwoNameInput) playerTwoNameInput.value = selectedPlayerCount === 2 ? players[1].name : "Bloke 2";
  twoPlayerMode = selectedPlayerCount === 2;
  activePlayerIndex = 0;
  roundOver = false;
  if (startMenu) startMenu.classList.add("hidden");
  resetRound();
  setMessage(`${players[0].name} leads us into trouble. Tap your aim spot, start in the swing zone, pull down fast, release. Crooked pulls bend it.`, 280, "course");
  renderLeaderboard();
}

function nextPlayer() {
  if (!twoPlayerMode) return;
  const nextIndex = nextPlayerIndexOnHole();
  if (nextIndex !== -1) setActivePlayer(nextIndex);
}

function nextPlayerIndexOnHole() {
  if (!twoPlayerMode) return -1;
  for (let offset = 1; offset <= players.length; offset += 1) {
    const index = (activePlayerIndex + offset) % players.length;
    if (!players[index].holed) return index;
  }
  return -1;
}

function passTurnAfterShot(prefix = "") {
  if (!twoPlayerMode || transitioning || roundOver) return false;
  const nextIndex = nextPlayerIndexOnHole();
  if (nextIndex === -1 || nextIndex === activePlayerIndex) return false;
  const nextName = players[nextIndex].name;
  trail = [];
  shotFlash = 0;
  aimHints = [];
  aimTarget = null;
  setActivePlayer(nextIndex);
  updateHud();
  setMessage(`${prefix ? `${prefix} ` : ""}${nextName} is up. Same hole, new victim.`, 150, "course");
  return true;
}

function leaderboardKey() {
  return `blokes-mini-golf-leaderboard-${courses[currentCourseIndex].key}`;
}

function leaderboardKeyForCourse(courseIndex) {
  return `blokes-mini-golf-leaderboard-${courses[courseIndex].key}`;
}

function firebaseLeaderboardUrl(courseIndex = currentCourseIndex) {
  return `${FIREBASE_LEADERBOARD_URL}/leaderboards/${courses[courseIndex].key}.json`;
}

function cleanLeaderboardEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const total = Number(entry.total);
  if (!Number.isFinite(total) || total <= 0) return null;
  return {
    name: cleanPlayerName(entry.name || "Mystery Bloke", "Mystery Bloke"),
    total: Math.max(1, Math.round(total)),
    points: Math.max(0, Math.round(Number(entry.points) || 0)),
    date: entry.date || new Date(Number(entry.createdAt) || Date.now()).toLocaleDateString(),
    createdAt: Number(entry.createdAt) || Date.now(),
  };
}

function sortLeaderboard(board) {
  return board
    .map(cleanLeaderboardEntry)
    .filter(Boolean)
    .sort((a, b) => a.total - b.total || b.points - a.points || a.createdAt - b.createdAt)
    .slice(0, 10);
}

function mergeLeaderboards(localBoard, cloudBoard) {
  const seen = new Set();
  return sortLeaderboard([...localBoard, ...cloudBoard].filter((entry) => {
    const clean = cleanLeaderboardEntry(entry);
    if (!clean) return false;
    const key = `${clean.name.toLowerCase()}|${clean.total}|${clean.points}|${clean.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }));
}

function storeLeaderboard(courseIndex, board) {
  localStorage.setItem(leaderboardKeyForCourse(courseIndex), JSON.stringify(sortLeaderboard(board)));
}

function getLeaderboard(courseIndex = currentCourseIndex) {
  try {
    return JSON.parse(localStorage.getItem(leaderboardKeyForCourse(courseIndex)) || "[]");
  } catch {
    return [];
  }
}

function setLeaderboardStatus(text, state = "neutral") {
  if (!leaderboardStatus) return;
  setText(leaderboardStatus, text);
  leaderboardStatus.className = `leaderboard-status ${state}`;
}

async function loadCloudLeaderboard(courseIndex = currentCourseIndex, rerender = true) {
  if (!navigator.onLine) {
    setLeaderboardStatus("Offline: records saved on this device only.", "warn");
    return;
  }
  if (cloudLeaderboardRequests.has(courseIndex)) return;
  cloudLeaderboardRequests.add(courseIndex);
  try {
    const response = await fetch(firebaseLeaderboardUrl(courseIndex), { cache: "no-store" });
    if (!response.ok) throw new Error(`Firebase read failed ${response.status}`);
    const data = await response.json();
    const cloudBoard = Object.values(data || {}).map(cleanLeaderboardEntry).filter(Boolean);
    storeLeaderboard(courseIndex, mergeLeaderboards(getLeaderboard(courseIndex), cloudBoard));
    setLeaderboardStatus("Cloud leaderboard connected.", "good");
    if (rerender && courseIndex === currentCourseIndex) renderLeaderboard(false);
    if (rerender) renderMenuRecords(false);
  } catch (error) {
    console.warn("Cloud leaderboard unavailable", error);
    setLeaderboardStatus("Cloud leaderboard blocked. Local scores still save on this device.", "bad");
  } finally {
    cloudLeaderboardRequests.delete(courseIndex);
  }
}

async function saveCloudLeaderboardEntry(entry, courseIndex = currentCourseIndex) {
  if (!navigator.onLine) {
    setLeaderboardStatus("Saved locally only. No internet for cloud save.", "warn");
    return;
  }
  try {
    const response = await fetch(firebaseLeaderboardUrl(courseIndex), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Firebase write failed ${response.status} ${detail}`);
    }
    setLeaderboardStatus("Score saved to cloud leaderboard.", "good");
    loadCloudLeaderboard(courseIndex, true);
  } catch (error) {
    console.warn("Cloud leaderboard save failed", error);
    setLeaderboardStatus("Saved locally only. Firebase write is blocked.", "bad");
    setMessage("Leaderboard saved on this device, but cloud save is blocked. Firebase rules need write access.", 220, "roast");
  }
}

function saveLeaderboardEntry(name, total, points = 0) {
  const courseIndex = currentCourseIndex;
  const entry = cleanLeaderboardEntry({
    name,
    total,
    points,
    date: new Date().toLocaleDateString(),
    createdAt: Date.now(),
  });
  if (!entry) return;
  storeLeaderboard(courseIndex, [...getLeaderboard(courseIndex), entry]);
  setLeaderboardStatus("Saved locally. Syncing cloud leaderboard...", "warn");
  renderLeaderboard(false);
  saveCloudLeaderboardEntry(entry, courseIndex);
}

function renderLeaderboard(syncCloud = true) {
  setText(courseNameEl, courses[currentCourseIndex].name);
  if (!leaderboardList) return;
  const board = getLeaderboard();
  leaderboardList.innerHTML = "";
  if (!board.length) {
    const item = document.createElement("li");
    setText(item, "No scores yet. Be the first problem.");
    leaderboardList.appendChild(item);
    renderMenuRecords(false);
    if (syncCloud) loadCloudLeaderboard(currentCourseIndex, true);
    return;
  }
  board.forEach((entry, index) => {
    const item = document.createElement("li");
    setText(item, `${index + 1}. ${entry.name} ${entry.total} (${entry.points || 0}p)`);
    leaderboardList.appendChild(item);
  });
  renderMenuRecords(false);
  if (syncCloud) loadCloudLeaderboard(currentCourseIndex, true);
}

function renderMenuRecords(syncCloud = true) {
  if (!menuRecords) return;
  menuRecords.innerHTML = "";
  courses.forEach((course, index) => {
    const card = document.createElement("section");
    card.className = "record-card";
    const heading = document.createElement("h3");
    setText(heading, course.name);
    const list = document.createElement("ol");
    const board = getLeaderboard(index);
    if (!board.length) {
      const empty = document.createElement("li");
      setText(empty, "No records yet");
      const mark = document.createElement("em");
      setText(mark, "Be first");
      empty.appendChild(mark);
      list.appendChild(empty);
    } else {
      board.slice(0, 3).forEach((entry, place) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const score = document.createElement("em");
        setText(name, `${place + 1}. ${entry.name}`);
        setText(score, `${entry.total} / ${entry.points || 0}p`);
        item.append(name, score);
        list.appendChild(item);
      });
    }
    card.append(heading, list);
    menuRecords.appendChild(card);
    if (syncCloud) loadCloudLeaderboard(index, true);
  });
}

function showMenuTab(tabName) {
  menuTabs.forEach((button) => button.classList.toggle("active", button.dataset.menuTab === tabName));
  menuPages.forEach((page) => page.classList.toggle("active", page.id === `${tabName}-panel`));
  if (tabName === "records") renderMenuRecords();
}

function finishRound() {
  roundOver = true;
  ball.moving = false;
  if (twoPlayerMode) {
    players.forEach((player) => saveLeaderboardEntry(player.name, player.score, player.points || 0));
    const sorted = [...players].sort((a, b) => a.score - b.score);
    setMessage(`${sorted[0].name} wins at ${sorted[0].score}. ${roundSummary(sorted[0])}`, 260);
  } else {
    saveLeaderboardEntry(players[0].name, players[0].score, players[0].points || score);
    setMessage(`Round complete. ${roundSummary(players[0])}`, 240);
  }
  updateHud();
  if (startMatchButton) setText(startMatchButton, "Run It Back");
  if (startMenu) startMenu.classList.remove("hidden");
}

function roundSummary(player) {
  const points = player.points || 0;
  const rating = player.score <= 32 ? "Bloke Rating: dangerously employable." : player.score <= 42 ? "Bloke Rating: mildly employable." : "Bloke Rating: cart-path philosopher.";
  const best = player.bestShot ? ` Best shot: ${player.bestShot.label}.` : "";
  const worst = player.worstShot ? ` Worst swing: ${player.worstShot.label}.` : "";
  return `${rating} ${points} style points.${best}${worst}`;
}

function speak(text, options = {}) {
  if (!canPlayGameAudio() || !("speechSynthesis" in window)) return;
  const cleanedText = humanizeSpeech(text);
  if (!cleanedText) return;

  if (options.interrupt !== false) {
    speechQueue = [];
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    speaking = false;
  }
  if (speechQueue.length > 2) speechQueue.shift();
  speechQueue.push({ text: cleanedText, options });
  if (!speaking) playNextSpeech();
}

function getAnnouncerVoice() {
  if (announcerVoice) return announcerVoice;
  const voices = window.speechSynthesis.getVoices();
  const scoreVoice = (voice) => {
    const text = `${voice.name} ${voice.lang}`.toLowerCase();
    let score = 0;
    if (/female|woman|girl|jenny|aria|zira|susan|hazel|catherine|samantha|victoria|karen|tessa|matilda|serena|moira|fiona|natasha|ava|emma|libby|sonia|lily|olivia/.test(text)) score += 135;
    if (/en[-_]au|australia|australian|karen|lee|matilda|natasha/.test(text)) score += 95;
    if (/en[-_]gb|united kingdom|british|ireland|irish|scotland|serena|moira|hazel|susan|libby|sonia/.test(text)) score += 58;
    if (/natural|online|premium|enhanced|neural|aria|jenny/.test(text)) score += 34;
    if (/male|man|guy|daniel|arthur|oliver|william|brian|ryan|rishi|david|mark|george|james|thomas/.test(text)) score -= 190;
    if (/en[-_]/.test(text)) score += 12;
    if (voice.localService) score += 4;
    return score;
  };
  announcerVoice = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
  return announcerVoice;
}

function playNextSpeech() {
  if (!canPlayGameAudio() || !speechQueue.length || !("speechSynthesis" in window)) {
    speaking = false;
    return;
  }
  speaking = true;
  const { text, options } = speechQueue.shift();
  const utterance = new SpeechSynthesisUtterance(text);
  const jitter = rnd(-0.035, 0.035);
  utterance.rate = options.rate || 0.98 + jitter;
  utterance.pitch = options.pitch || 1.22 + rnd(-0.04, 0.05);
  utterance.volume = options.volume || 0.96;
  const preferredVoice = getAnnouncerVoice();
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.onend = () => window.setTimeout(playNextSpeech, options.pauseMs || 120);
  utterance.onerror = () => {
    speaking = false;
    speechQueue = [];
  };
  window.speechSynthesis.speak(utterance);
}

function speakImpact(clubKey, powerRatio) {
  if (!canPlayGameAudio()) return;
  const now = performance.now();
  if (now - lastSpokenLineAt < 8500 || Math.random() < 0.54) return;
  lastSpokenLineAt = now;
  const noise = line(mouthHits[clubKey] || mouthHits.wedge);
  const emphasis = powerRatio > 0.86 ? " Absolutely leathered." : powerRatio > 0.42 ? " Clean enough." : " Delicate little fella.";
  speak(`${noise}. ${emphasis}`, {
    rate: powerRatio > 0.86 ? 1.08 : 0.98,
    pitch: powerRatio > 0.86 ? 1.18 : 1.28,
    volume: 1,
    pauseMs: 70,
  });
}

function humanizeSpeech(text) {
  return String(text)
    .replace(/\+/g, " plus ")
    .replace(/\bx(\d+)/gi, "times $1")
    .replace(/\$(\d+)/g, "$1 dollars")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureAudioContext() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(frequency, start, duration, type = "sine", volume = 0.08, destination = musicGain) {
  const audio = ensureAudioContext();
  if (!audio || !destination) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.min(volume, 0.24), start + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(start);
  osc.stop(start + duration + 0.04);
  musicNodes.push(osc, gain);
}

function playNoiseBurst(start, duration, volume = 0.08, destination = musicGain, filterType = "bandpass", frequency = 1200) {
  const audio = ensureAudioContext();
  if (!audio || !destination) return;
  const sampleCount = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, sampleCount, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
  }
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, start);
  filter.Q.setValueAtTime(0.9, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(Math.min(volume, 0.28), start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(start);
  source.stop(start + duration + 0.04);
  musicNodes.push(source, filter, gain);
}

function playChoirTone(frequency, start, duration, volume = 0.05) {
  const audio = ensureAudioContext();
  if (!audio || !musicGain) return;
  const choirGain = audio.createGain();
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(frequency * 2.15, start);
  filter.Q.setValueAtTime(0.9, start);
  choirGain.gain.setValueAtTime(0.0001, start);
  const safeVolume = Math.min(volume, 0.24);
  choirGain.gain.linearRampToValueAtTime(safeVolume, start + 0.18);
  choirGain.gain.linearRampToValueAtTime(safeVolume * 0.72, start + duration * 0.7);
  choirGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  choirGain.connect(filter);
  filter.connect(musicGain);

  [-0.006, 0, 0.007].forEach((detune, index) => {
    const osc = audio.createOscillator();
    osc.type = index === 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequency * (1 + detune), start);
    osc.connect(choirGain);
    osc.start(start);
    osc.stop(start + duration + 0.04);
    musicNodes.push(osc);
  });
  musicNodes.push(choirGain, filter);
}

function playAiMonkLoop() {
  if (!canPlayGameAudio() || !musicGain) return;
  const audio = ensureAudioContext();
  if (!audio) return;
  const now = audio.currentTime + 0.03;
  const melodies = [
    [261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 392.0, 261.63],
    [293.66, 369.99, 440.0, 392.0, 329.63, 392.0, 440.0, 293.66],
    [329.63, 392.0, 523.25, 493.88, 440.0, 392.0, 349.23, 329.63],
    [246.94, 293.66, 349.23, 392.0, 349.23, 293.66, 261.63, 246.94],
  ];
  const melody = melodies[melodyIndex % melodies.length];
  melodyIndex += 1;
  melody.forEach((note, index) => {
    const start = now + index * 0.28;
    playTone(note, start, 0.2, "triangle", 0.092, musicGain);
    if (index % 2 === 0) playTone(note / 2, start, 0.24, "sine", 0.062, musicGain);
    if (index === 3 || index === 7) playTone(note * 1.5, start + 0.045, 0.14, "square", 0.034, musicGain);
  });
}

function startContinuousPad(audio) {
  return audio;
}

function chantBlokesMiniGolf() {
  return;
}

function crowdReaction(kind = "clap") {
  if (!canPlayGameAudio()) return;
  const audio = ensureAudioContext();
  if (!audio || !musicGain) return;
  const now = audio.currentTime + 0.02;
  if (kind === "boo") {
    [196, 174.61, 155.56].forEach((note, index) => {
      playTone(note, now + index * 0.16, 0.42, "sawtooth", 0.09, musicGain);
      playNoiseBurst(now + index * 0.16, 0.28, 0.075, musicGain, "lowpass", 520);
    });
    return;
  }
  const claps = kind === "huge" ? 12 : 7;
  for (let i = 0; i < claps; i += 1) {
    playNoiseBurst(now + i * 0.075 + rnd(0, 0.025), 0.055, kind === "huge" ? 0.18 : 0.13, musicGain, "bandpass", rnd(900, 1800));
  }
  if (kind === "huge") {
    [523.25, 659.25, 783.99].forEach((note, index) => playTone(note, now + 0.1 + index * 0.08, 0.28, "triangle", 0.08, musicGain));
  }
}

function musicSurge() {
  return;
}

function setMusicEnergy(mode = "cruise", duration = 2200) {
  return { mode, duration };
}

function updateMusicProximity(force = false) {
  return force;
}

function scheduleMusicLoop() {
  if (!canPlayGameAudio() || !musicGain) return;
  playAiMonkLoop();
  musicTimer = window.setTimeout(scheduleMusicLoop, 2450);
}

function startMusic() {
  if (!canPlayGameAudio()) return;
  const audio = ensureAudioContext();
  if (!audio || musicTimer) return;
  musicMaster = audio.createGain();
  musicMaster.gain.value = 1;
  musicGain = audio.createGain();
  musicGain.gain.value = 0.62;
  musicGain.connect(musicMaster);
  musicMaster.connect(audio.destination);
  scheduleMusicLoop();
}

function stopMusic() {
  if (musicTimer) window.clearTimeout(musicTimer);
  if (chantTimer) window.clearInterval(chantTimer);
  if (surgeTimer) window.clearTimeout(surgeTimer);
  musicTimer = null;
  chantTimer = null;
  surgeTimer = null;
  speechQueue = [];
  speaking = false;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (musicGain) {
    musicGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.08);
    window.setTimeout(() => {
      if (musicGain) musicGain.disconnect();
      if (musicPadGain) musicPadGain.disconnect();
      musicPadNodes.forEach((node) => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (error) {
          // Ignore already-stopped audio nodes.
        }
      });
      if (musicCompressor) musicCompressor.disconnect();
      if (musicMaster) musicMaster.disconnect();
      musicGain = null;
      musicPadGain = null;
      musicPadNodes = [];
      musicCompressor = null;
      musicMaster = null;
      musicNodes = [];
    }, 180);
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("blokes-mini-golf-sound", soundEnabled ? "on" : "off");
  updateSoundButton();
  if (soundEnabled) {
    startMusic();
    setToastOnly("Sound on.", 80);
  } else {
    stopMusic();
  }
}

function wakeSound() {
  if (canPlayGameAudio() && !musicTimer) startMusic();
}

function isEmbeddedFrame() {
  try {
    return window.self !== window.top;
  } catch (error) {
    return true;
  }
}

function canPlayGameAudio() {
  return soundEnabled && mainMenuAudioReady && !isEmbeddedFrame();
}

function updateCompactEmbedMode() {
  const embedded = isEmbeddedFrame();
  document.body.classList.toggle("compact-embed", embedded);
}

function isFullscreen() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

function isExpanded() {
  return Boolean(gameCard && gameCard.classList.contains("app-fullscreen"));
}

function updateFullscreenButton() {
  setText(fullscreenToggle, isFullscreen() || isExpanded() ? "Exit Full" : "Fullscreen");
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
}

function requestFullscreen(element = gameCard) {
  if (!element) return Promise.reject(new Error("Fullscreen is not available here."));
  if (element.requestFullscreen) return element.requestFullscreen({ navigationUI: "hide" });
  if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
  if (element.msRequestFullscreen) return element.msRequestFullscreen();
  return Promise.reject(new Error("Fullscreen is not available here."));
}

function requestBestFullscreen() {
  return requestFullscreen(gameCard).catch(() => requestFullscreen(document.documentElement));
}

function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  if (document.msExitFullscreen) return document.msExitFullscreen();
  return Promise.resolve();
}

function expandInPage(message = "Phone mode engaged.") {
  if (!gameCard) return false;
  gameCard.classList.add("app-fullscreen");
  document.body.classList.add("game-expanded");
  updateFullscreenButton();
  setMessage(message, 140, "course");
  return false;
}

function enterFullscreenOrExpand(message = "Fullscreen blocked, so we stretched it here instead.", options = {}) {
  if (!gameCard) return Promise.resolve(false);
  if (isFullscreen() || isExpanded()) {
    updateFullscreenButton();
    return Promise.resolve(true);
  }
  if (options.forceExpand) return Promise.resolve(expandInPage(message));
  return requestBestFullscreen()
    .then(() => {
      updateFullscreenButton();
      return true;
    })
    .catch(() => {
      return expandInPage(message);
    });
}

function toggleFullscreen() {
  wakeSound();
  if (isExpanded()) {
    gameCard.classList.remove("app-fullscreen");
    document.body.classList.remove("game-expanded");
    updateFullscreenButton();
    setMessage("Back to shop window mode.", 100);
    return;
  }
  if (isFullscreen()) {
    exitFullscreen().catch(() => setMessage("Fullscreen got wedged. Classic.", 120));
    return;
  }
  enterFullscreenOrExpand("Fullscreen blocked, so we stretched it here instead. On phone, tap anywhere on the grass and pull back.");
}

function createHazard(t, sideOffset, type, width = rnd(92, 158), height = rnd(38, 78)) {
  const bounds = playableBounds();
  const pos = fairwayPosition(t, sideOffset);
  const hazard = {
    x: clamp(pos.x - width / 2, 42, W - width - 42),
    y: clamp(pos.y - height / 2, 54, bounds.bottom - height - 24),
    w: width,
    h: height,
    type,
    grains: [],
    rakeLines: [],
  };
  for (let grain = 0; grain < 46; grain += 1) {
    hazard.grains.push({
      x: rnd(8, hazard.w - 8),
      y: rnd(6, hazard.h - 6),
      r: rnd(0.8, 2.2),
      dark: grain % 3 === 0,
    });
  }
  for (let rake = 0; rake < 7; rake += 1) {
    hazard.rakeLines.push({ y: hazard.h * (0.18 + rake * 0.105), bend: rnd(-0.16, 0.18) });
  }
  return hazard;
}

function hazardCorners(hazard) {
  return [
    { x: hazard.x, y: hazard.y },
    { x: hazard.x + hazard.w, y: hazard.y },
    { x: hazard.x, y: hazard.y + hazard.h },
    { x: hazard.x + hazard.w, y: hazard.y + hazard.h },
    { x: hazard.x + hazard.w / 2, y: hazard.y + hazard.h / 2 },
  ];
}

function hazardOverlapsSafeZone(hazard, padding = 18) {
  return safeZones.some((zone) => {
    const expanded = { ...zone, rx: zone.rx + padding, ry: zone.ry + padding };
    const zoneCenterInHazard =
      zone.x > hazard.x - padding &&
      zone.x < hazard.x + hazard.w + padding &&
      zone.y > hazard.y - padding &&
      zone.y < hazard.y + hazard.h + padding;
    return zoneCenterInHazard || hazardCorners(hazard).some((point) => inEllipseZone(expanded, point.x, point.y));
  });
}

function hazardOverlapsGreen(hazard, padding = 42) {
  if (hazard.type !== "water" || !Number.isFinite(target.x)) return false;
  const green = {
    x: target.x - 16,
    y: target.y + 8,
    rx: target.r * 5.9 + padding,
    ry: target.r * 3.9 + padding,
    angle: -0.2,
  };
  return hazardCorners(hazard).some((point) => inEllipseZone(green, point.x, point.y)) ||
    inEllipseZone(green, hazard.x + hazard.w / 2, hazard.y + hazard.h / 2);
}

function rectsOverlap(a, b, padding = 20) {
  return !(
    a.x + a.w + padding < b.x ||
    b.x + b.w + padding < a.x ||
    a.y + a.h + padding < b.y ||
    b.y + b.h + padding < a.y
  );
}

function pointInHazardShape(hazard, x, y, padding = 0) {
  const cx = hazard.x + hazard.w / 2;
  const cy = hazard.y + hazard.h / 2;
  const rx = hazard.w * 0.56 + padding;
  const ry = hazard.h * 0.6 + padding;
  return ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1;
}

function decorationOverlapsHazard(item, hazard, padding = 24) {
  if (!item || item.type !== "gum" || !hazard) return false;
  const s = item.s || 1;
  const treePoints = [
    { x: item.x, y: item.y + 12 * s, r: 13 * s },
    { x: item.x, y: item.y - 20 * s, r: 24 * s },
    { x: item.x - 15 * s, y: item.y - 6 * s, r: 18 * s },
    { x: item.x + 14 * s, y: item.y - 6 * s, r: 20 * s },
    { x: item.x + 2 * s, y: item.y + 4 * s, r: 17 * s },
  ];
  return treePoints.some((point) => pointInHazardShape(hazard, point.x, point.y, padding + point.r));
}

function hazardOverlapsDecoration(hazard, padding = 24) {
  return decorations.some((item) => decorationOverlapsHazard(item, hazard, padding));
}

function removeDecorationsOverHazards() {
  decorations = decorations.filter((item) => !hazards.some((hazard) => decorationOverlapsHazard(item, hazard, 18)));
}

function addHazard(t, sideOffset, type, width, height) {
  let candidate = createHazard(t, sideOffset, type, width, height);
  for (let attempt = 0; attempt < 42; attempt += 1) {
    const clean =
      !hazardOverlapsSafeZone(candidate) &&
      !hazardOverlapsGreen(candidate) &&
      !hazardOverlapsDecoration(candidate) &&
      !hazards.some((hazard) => rectsOverlap(hazard, candidate));
    if (clean) {
      hazards.push(candidate);
      return candidate;
    }
    const widenedSide = sideOffset + rnd(-92, 92) + Math.sign(sideOffset || rnd(-1, 1)) * attempt * 4;
    candidate = createHazard(
      clamp(t + rnd(-0.12, 0.12), 0.14, 0.9),
      widenedSide,
      type,
      width,
      height
    );
  }
  const routeSide = sideOffset < 0 ? -1 : 1;
  candidate = createHazard(clamp(t, 0.14, 0.9), routeSide * 175, type, width, height);
  if (
    !hazardOverlapsSafeZone(candidate) &&
    !hazardOverlapsGreen(candidate) &&
    !hazardOverlapsDecoration(candidate, 14) &&
    !hazards.some((hazard) => rectsOverlap(hazard, candidate, 10))
  ) {
    hazards.push(candidate);
  }
  return candidate;
}

function addStrategicWaterTraps() {
  const heroBands = [
    { t: 0.58, side: rnd(-22, 22), w: rnd(122, 166), h: rnd(38, 56) },
    { t: 0.83, side: rnd(-18, 18), w: rnd(112, 152), h: rnd(36, 54) },
  ];
  heroBands.forEach((band, index) => {
    if (hole < 2 && index > 0) return;
    const hazard = addHazard(band.t, band.side, "water", band.w, band.h);
    if (hazard) hazard.strategy = index === 0 ? "layup-check" : "hero-landing";
  });
}

function addGreenCarryWater() {
  const tangent = pathTangentAt(0.94);
  const side = { x: -tangent.y, y: tangent.x };
  const pools = [
    { ahead: 70, side: hole % 2 ? -48 : 48, w: 58, h: 26 },
    { ahead: 28, side: hole % 3 === 0 ? 58 : -58, w: 48, h: 22 },
  ];
  pools.forEach((pool, index) => {
    if (index > 0 && hole < 5) return;
    const w = pool.w + rnd(-8, 7);
    const h = pool.h + rnd(-4, 5);
    const x = target.x - tangent.x * pool.ahead + side.x * pool.side - w / 2;
    const y = target.y - tangent.y * pool.ahead + side.y * pool.side - h / 2;
    const candidate = {
      x: clamp(x, 50, W - w - 50),
      y: clamp(y, 58, playableBounds().bottom - h - 28),
      w,
      h,
      type: "water",
      greenCarry: true,
    };
    const cupClear = Math.hypot(candidate.x + candidate.w / 2 - target.x, candidate.y + candidate.h / 2 - target.y) > target.r * 3.0;
    const trueLineClear = !trueLineZone || !inEllipseZone(trueLineZone, candidate.x + candidate.w / 2, candidate.y + candidate.h / 2);
    if (cupClear && trueLineClear && !hazardOverlapsDecoration(candidate, 12) && !hazards.some((hazard) => rectsOverlap(hazard, candidate, 8))) {
      hazards.push(candidate);
    }
  });
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    announcerVoice = null;
    getAnnouncerVoice();
  };
}

function newHole(keepStreak = true) {
  seedCourseRandom();
  const course = courses[currentCourseIndex];
  const bounds = playableBounds();
  transitioning = false;
  const bendOptions = [-1, 1, 0, -1, 1];
  courseBend = bendOptions[(hole + currentCourseIndex) % bendOptions.length];
  const lengthBias = clamp((hole + currentCourseIndex * 1.5) / 10, 0, 1);
  teePosition = {
    x: rnd(bounds.left + 38, bounds.left + 112),
    y: rnd(bounds.bottom - 86, bounds.bottom - 34),
  };
  trail = [];
  shotFlash = 0;
  holeGhostShot = null;
  lastReleaseFeedback = null;
  aimHints = [];
  aimTarget = null;
  doglegPoint = {
    x: rnd(W * 0.42, W * 0.64) + lengthBias * 36,
    y: rnd(bounds.top + 190, bounds.bottom - 150),
  };
  if (courseBend) {
    doglegPoint.x = clamp(doglegPoint.x + courseBend * rnd(145, 235), bounds.left + 185, bounds.right - 205);
    doglegPoint.y = clamp(doglegPoint.y + rnd(-74, 74), bounds.top + 126, bounds.bottom - 118);
  } else {
    doglegPoint.x = clamp(doglegPoint.x + rnd(18, 88), bounds.left + 220, bounds.right - 225);
  }
  target = {
    x: rnd(bounds.right - 190, bounds.right - 92),
    y: rnd(bounds.top + 84, bounds.top + 214),
    r: Math.max(12, 23 - hole * 0.68 + course.cupBonus * 0.38),
  };
  greenBreak = makeGreenBreak();
  makeSafeZones();
  makeBreakZones();
  makeBreakArrows();
  makeYardageMarkers();
  makeDecorations();
  hazards = [];
  bumpers = [];

  const hazardCount = clamp(Math.floor((hole - 3) / 5) + course.hazardBonus, 0, 3);
  addHazard(rnd(0.34, 0.46), rnd(-12, 12), "sand", rnd(104, 138), rnd(40, 62));
  if (hole > 2 || course.hazardBonus > 0) addHazard(rnd(0.58, 0.72), rnd(-24, 24), "sand", rnd(92, 126), rnd(36, 58));
  if (hole % 3 === 0 || course.hazardBonus > 1) addHazard(rnd(0.54, 0.74), rnd(-48, 48), "water", rnd(104, 150), rnd(36, 58));
  addStrategicWaterTraps();
  addGreenCarryWater();
  for (let i = 0; i < hazardCount; i++) {
    const side = i % 2 ? 1 : -1;
    const t = rnd(0.25, 0.88);
    const sideOffset = i % 3 === 0 ? side * rnd(72, 126) : side * rnd(122, 188);
    addHazard(t, sideOffset, i % 3 === 1 ? "water" : "sand");
  }
  removeDecorationsOverHazards();

  const bumperCount = clamp(Math.floor((hole - 6) / 4), 0, 1);
  for (let i = 0; i < bumperCount; i++) {
    bumpers.push({
      x: rnd(265, W - 265),
      y: rnd(90, H - 120),
      r: rnd(18, 34),
    });
  }

  par = calculatePar();
  courseRandomActive = false;
  resetPlayerBalls();
  if (!keepStreak) streak = 1;
  updateHud();
  const bendLine = courseBend < 0
    ? "Dogleg right. Land safe or the side rough gets personal."
    : courseBend > 0
      ? "Dogleg left. Don't let the driver write checks your thumb can't cash."
      : "Straighter hole. The break is still very much a problem.";
  tutorialQueue = [];
  if (hole === 1) {
    setMessage(line(openers), 92, "course");
    queueFirstHoleRundown(bendLine);
  } else {
    setMessage(`${bendLine} ${line(courseLines)}`, 220, "course");
  }
}

function resetBallForCurrentHole() {
  transitioning = false;
  ball = players[activePlayerIndex].ball;
  trail = [];
  shotFlash = 0;
  aimHints = [];
  aimTarget = null;
  strokes = players[activePlayerIndex].currentStrokes;
  updateHud();
  setMessage(`${players[activePlayerIndex].name}, same hole. Try to look employable.`);
}

function updateHud() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("blokes-hole-best", String(bestScore));
  }
  setText(scoreEl, score);
  setText(bestEl, `Best ${bestScore}`);
  setText(holeEl, hole);
  setText(matchHoleEl, hole);
  strokes = players[activePlayerIndex].currentStrokes;
  setText(strokesEl, liveRoundStrokes(players[activePlayerIndex]));
  setText(parEl, par);
  setText(matchParEl, par);
  setText(streakEl, `x${streak}`);
  setText(bucksEl, `$${Math.floor(score / 10)}`);
  syncPlayerUi();
  updateShotStats();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches ? event.touches[0] : event.changedTouches ? event.changedTouches[0] : event;
  return {
    x: ((touch.clientX - rect.left) / rect.width) * W,
    y: ((touch.clientY - rect.top) / rect.height) * H,
  };
}

function canShoot() {
  return !roundOver && !transitioning && !ball.moving && Math.hypot(ball.vx, ball.vy) < 0.08;
}

function beginAim(event) {
  wakeSound();
  const p = canvasPoint(event);
  if (!canShoot()) return;
  const trigger = swingAnchor();
  if (!aimTarget || !pointInSwingStart(p)) {
    setAimTarget(p);
    if (event.pointerId !== undefined && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer may not have been captured yet.
      }
    }
    event.preventDefault();
    return;
  }
  aiming = true;
  aimAnchor = { x: trigger.x, y: trigger.y };
  aimStart = aimAnchor;
  pointer = p;
  aimStartedAt = performance.now();
  lastPullGainAt = aimStartedAt;
  lastAimPoint = { x: p.x, y: p.y, pull: Math.max(0, p.y - aimAnchor.y), time: aimStartedAt };
  swingTrace = [{ x: p.x, y: p.y, life: 1 }];
  swingTraceTimer = 0;
  lastReleaseFeedback = null;
  flickSpeed = 0;
  setMusicEnergy("aim", 1200);
  setToastOnly("Pull into green, yellow, or red. Hold too long and it leaks power.", 110);
  if (event.pointerId !== undefined && canvas.setPointerCapture) {
    canvas.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
}

function moveAim(event) {
  if (!aiming) return;
  recordAimPointer(canvasPoint(event));
  updateAimHints();
  const shot = shotVector();
  if (powerBar) powerBar.style.width = `${Math.round(clamp(effectivePowerRatio(shot), 0, 1) * 100)}%`;
  event.preventDefault();
}

function endAim(event) {
  if (!aiming || !pointer) return;
  if (event && (event.clientX !== undefined || event.changedTouches?.length || event.touches?.length)) {
    recordAimPointer(canvasPoint(event));
  }
  aiming = false;
  swingTraceTimer = 1;
  const shotClubKey = selectedClubKeyForShot();
  const club = clubs[shotClubKey];
  const shot = shotVector();
  clubSwing = {
    clubKey: shotClubKey,
    angle: shot.baseAngle,
    t: 0,
    life: 26,
  };
  const pull = shot.pull;
  const distanceToCup = distance(ball, target);
  const driverNearGreen = selectedClub === "driver" && distanceToCup < 260;
  const swingMs = performance.now() - aimStartedAt;
  const timingSpray = driverNearGreen ? (swingMs > 1350 ? 0.08 : swingMs < 260 ? 0.1 : 0.02) : 0;
  const spray = driverNearGreen ? club.spray + 0.32 + timingSpray : 0;
  const shotShape = shotShapeFromVector(shot, selectedClub === "driver" && !driverNearGreen ? 0.16 : 0.28);
  const driverWander = driverNearGreen ? rnd(-0.2, 0.2) : 0;
  const releaseAngle = shot.releaseSteer * (selectedClub === "putter" ? 0.16 : selectedClub === "driver" ? 0.2 : 0.18);
  const angle = shot.baseAngle + releaseAngle + shotShape * 0.05 + driverWander + rnd(-spray, spray);
  const powerRatio = clamp(effectivePowerRatio(shot), 0, 1);
  let power = powerRatio * club.power;
  const hazard = currentHazard();
  const lie = lieState(ball);
  let lieCurvePenalty = 0;

  if (hazard && hazard.type === "sand") {
    if (isWedgeKey(shotClubKey)) {
      if (shotClubKey === "wedgeChip") {
        power *= 0.7 + clamp(powerRatio - 0.5, 0, 0.62) * 0.72;
        setMessage("Rusty Flirt chip digs it out low. Controlled, not heroic.", 150, "good");
      } else {
        power *= 0.72 + clamp(powerRatio - 0.62, 0, 0.5) * 0.74;
        setMessage(powerRatio > 0.86 ? line(greatMechanicLines) : "Sand wedge pops it out. Not far, but alive. Full fling gets the grown-up version.", 170, "good");
      }
    } else {
      power *= selectedClub === "driver" ? 1.02 : 0.55;
      lieCurvePenalty = selectedClub === "driver" ? rnd(-0.34, 0.34) : rnd(-0.1, 0.1);
      setMessage(line(sandRoasts), 170, "roast");
    }
  } else if (isWedgeKey(shotClubKey)) {
    const insideApproach = distanceToCup < 350;
    if (shotClubKey === "wedgeChip") {
      power *= (insideApproach ? 0.95 : 0.78) + clamp(powerRatio - 0.46, 0, 0.68) * 0.58;
    } else {
      power *= (insideApproach ? 0.98 : 0.9) + clamp(powerRatio - 0.55, 0, 0.57) * 0.48;
    }
  } else if (selectedClub === "putter") {
    if (lie.onGreenPatch || lie.safe) {
      power *= 1.02;
    } else if (lie.inRough) {
      power *= 0.18;
      lieCurvePenalty += rnd(-0.035, 0.035);
    } else if (lie.inFringe) {
      power *= 0.32;
    } else {
      power *= 0.42;
    }
  }

  if (power > 0.18) {
    players[activePlayerIndex].currentStrokes += 1;
    strokes = players[activePlayerIndex].currentStrokes;
    const grade = shotGradeInfo(shot, powerRatio, shotClubKey, distanceToCup);
    const choiceBonus = clubChoiceBonus(shotClubKey, lie, hazard, distanceToCup, powerRatio);
    lastReleaseFeedback = {
      powerRatio,
      grade: grade.label,
      edgeRatio: shot.edgeRatio,
      clubKey: shotClubKey,
      zone: swingZoneLabel(shot.ratio),
      holdPenalty: swingHoldPenalty(shot),
    };
    const player = players[activePlayerIndex];
    if (player) {
      player.cleanStreak = shot.edgeRatio < 0.28 ? player.cleanStreak + 1 : 0;
      if (grade.points >= 55 || choiceBonus) markHelpfulResult(true);
      if (!player.bestShot || grade.points > player.bestShot.points) player.bestShot = { label: grade.label, points: grade.points };
      if (!player.worstShot || grade.points < player.worstShot.points) player.worstShot = { label: grade.label, points: grade.points };
    }
    ball.vx = Math.cos(angle) * power;
    ball.vy = Math.sin(angle) * power;
    ball.vz = club.loft ? (power / club.power) * club.loft : 0;
    ball.z = club.loft ? 2 : 0;
    ball.airborne = club.loft > 0;
    ball.curveSpin = clamp(shotShape * 0.17 + driverWander * 0.12 + lieCurvePenalty, -0.13, 0.13);
    ball.clubKey = shotClubKey;
    ball.shotMeta = {
      grade,
      safeAwarded: false,
      startX: ball.x,
      startY: ball.y,
      projectedX: ball.x + Math.cos(shot.baseAngle) * estimateShotYards(shotClubKey, powerRatio) * 5,
      projectedY: ball.y + Math.sin(shot.baseAngle) * estimateShotYards(shotClubKey, powerRatio) * 5,
    };
    holeGhostShot = { x1: ball.x, y1: ball.y, x2: ball.shotMeta.projectedX, y2: ball.shotMeta.projectedY, grade: grade.label, life: 1 };
    ball.moving = true;
    trail = [{ x: ball.x, y: ball.y, life: 1, r: ball.r }];
    shotFlash = 1;
    speakImpact(shotClubKey, power / club.power);
    awardPoints(grade.points, `${grade.label} shot`, grade.mood, false);
    if (choiceBonus) awardPoints(choiceBonus.points, choiceBonus.line, "good", false);
    if (player?.cleanStreak >= 3) awardPoints(40 + player.cleanStreak * 8, `Clean pull streak x${player.cleanStreak}. Stop being competent, it's unsettling`, "good", false);
    if (distanceToCup < 190) updateMusicProximity(true);
    const badReason = hazard && hazard.type === "sand" && selectedClub !== "wedge"
      ? "club"
      : driverNearGreen
        ? "club"
        : grade.points <= 15
          ? "pull"
          : powerRatio < 0.28 && distanceToCup > 160
            ? "weak"
            : localBreakAt(ball).strength > 0.038 && shotClubKey !== "wedge"
              ? "break"
              : "";
    const reminder = badReason ? struggleReminder(badReason) : "";
    if (hazard && hazard.type === "sand" && selectedClub !== "wedge") {
      // Message already set above.
      if (reminder) setMessage(reminder, 190, "roast");
    } else if (choiceBonus && grade.points >= 55) {
      setMessage(`${grade.line} ${choiceBonus.line} +${grade.points + choiceBonus.points}`, 190, "good");
    } else if (reminder) {
      setMessage(`${grade.line} ${reminder}`, 190, "roast");
    } else if (driverNearGreen) {
      setMessage("Driver near the green. Bold. Stupid. Expensive. Leave runoff room or pay idiot tax.", 170, "roast");
    } else if (grade.points <= 15) {
      setMessage(`${grade.line} +${grade.points}`, 170, "roast");
    } else if (power > club.power * 0.88) {
      setMessage(`${line(shotLines.hard)} ${grade.label} +${grade.points}`, 160, "talk");
    } else if (power > club.power * 0.42) {
      setMessage(`${line(shotLines.medium)} ${grade.label} +${grade.points}`, 160, "talk");
    } else {
      setMessage(`${line(shotLines.soft)} ${grade.label} +${grade.points}`, 150, "talk");
    }
  }

  aimHints = [];
  lastAimPoint = null;
  lastPullGainAt = 0;
  flickSpeed = 0;
  aimTarget = null;
  if (powerBar) powerBar.style.width = "0%";
  updateHud();
  event.preventDefault();
}

function resetRound() {
  currentCourseIndex = Number(courseSelect ? courseSelect.value : currentCourseIndex);
  hole = 1;
  strokes = 0;
  score = 0;
  streak = 1;
  roundOver = false;
  players[0].score = 0;
  players[1].score = 0;
  players[0].points = 0;
  players[1].points = 0;
  players[0].currentStrokes = 0;
  players[1].currentStrokes = 0;
  players[0].holed = false;
  players[1].holed = false;
  players[0].cleanStreak = 0;
  players[1].cleanStreak = 0;
  players[0].safeStreak = 0;
  players[1].safeStreak = 0;
  players[0].frustrationStreak = 0;
  players[1].frustrationStreak = 0;
  players[0].lastReminderStroke = -4;
  players[1].lastReminderStroke = -4;
  players[0].bestShot = null;
  players[1].bestShot = null;
  players[0].worstShot = null;
  players[1].worstShot = null;
  activePlayerIndex = 0;
  ball = players[0].ball;
  confetti = [];
  trail = [];
  shotFlash = 0;
  holeGhostShot = null;
  lastReleaseFeedback = null;
  aimHints = [];
  aimTarget = null;
  tutorialQueue = [];
  tutorialDelay = 0;
  newHole(false);
  renderLeaderboard();
}

function nextHole() {
  if (transitioning) return;
  transitioning = true;
  strokes = players[activePlayerIndex].currentStrokes;
  const parDelta = par - strokes;
  const parBonus = Math.max(0, parDelta) * 90;
  const skillBonus = Math.max(25, Math.round((220 - distance(ball, target)) * 0.8));
  const aceBonus = strokes === 1 ? 300 : 0;
  const overParPenalty = Math.min(180, Math.max(0, -parDelta) * 45);
  const holeScore = Math.max(40, Math.round((140 + parBonus + skillBonus - overParPenalty) * streak));
  awardPoints(holeScore + aceBonus, "", "good", false);
  players[activePlayerIndex].score += strokes;
  players[activePlayerIndex].holed = true;
  streak = strokes <= 2 ? Math.min(streak + 1, 9) : 1;
  burst(target.x, target.y);
  setMusicEnergy("climax", 3600);
  musicSurge();
  crowdReaction(strokes === 1 || parDelta >= 1 ? "huge" : parDelta < -1 ? "boo" : "clap");
  const playerName = players[activePlayerIndex].name;
  setMessage(strokes === 1 ? `${playerName}: ${line(aceLines)} +${holeScore + aceBonus}` : `${playerName}: ${line(sinkLines)} +${holeScore}`, 220, strokes === 1 ? "ace" : "good");
  setTimeout(() => {
    const nextIndex = players.findIndex((player) => !player.holed);
    if (twoPlayerMode && nextIndex !== -1) {
      setActivePlayer(nextIndex);
      resetBallForCurrentHole();
      return;
    }
    if (hole >= 9) {
      finishRound();
      return;
    }
    hole += 1;
    if (twoPlayerMode) activePlayerIndex = 0;
    syncPlayerUi();
    newHole(true);
  }, 900);
  updateHud();
}

function recoverToSafeLie() {
  const bounds = playableBounds();
  const zone = ball.lastSafeZone || safeZones[0];
  if (!zone) return;
  players[activePlayerIndex].currentStrokes += 2;
  players[activePlayerIndex].safeStreak = 0;
  players[activePlayerIndex].cleanStreak = 0;
  strokes = players[activePlayerIndex].currentStrokes;
  ball.x = clamp(zone.x, bounds.left + ball.r, bounds.right - ball.r);
  ball.y = clamp(zone.y, bounds.top + ball.r, bounds.bottom - ball.r);
  ball.vx = 0;
  ball.vy = 0;
  ball.z = 0;
  ball.vz = 0;
  ball.airborne = false;
  ball.moving = false;
  ball.curveSpin = 0;
  ball.shotMeta = null;
  trail = [];
  updateHud();
  const reminder = struggleReminder("club");
  const message = reminder || line(roastLines);
  if (!passTurnAfterShot(message)) setMessage(message, 170, "roast");
}

function waterDropPoint(waterPoint = ball) {
  const bounds = playableBounds();
  const start = { x: waterPoint.x, y: waterPoint.y };
  const dx = teePosition.x - start.x;
  const dy = teePosition.y - start.y;
  for (let i = 1; i <= 96; i += 1) {
    const t = i / 96;
    const point = {
      x: clamp(start.x + dx * t, bounds.left + ball.r + 4, bounds.right - ball.r - 4),
      y: clamp(start.y + dy * t, bounds.top + ball.r + 4, bounds.bottom - ball.r - 4),
      r: ball.r,
    };
    const onFairway = fairwaySideMiss(point) <= 0.015;
    const clearHazards = !hazards.some((hazard) => hazardContainsBall(hazard, point));
    if (onFairway && clearHazards) return point;
  }
  const routePoint = pathPointAt(nearestRouteT(start));
  return {
    x: clamp(routePoint.x, bounds.left + ball.r + 4, bounds.right - ball.r - 4),
    y: clamp(routePoint.y, bounds.top + ball.r + 4, bounds.bottom - ball.r - 4),
    r: ball.r,
  };
}

function recoverFromWater(waterPoint = ball) {
  const drop = waterDropPoint(waterPoint);
  players[activePlayerIndex].currentStrokes += 1;
  players[activePlayerIndex].safeStreak = 0;
  players[activePlayerIndex].cleanStreak = 0;
  strokes = players[activePlayerIndex].currentStrokes;
  ball.x = drop.x;
  ball.y = drop.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.z = 0;
  ball.vz = 0;
  ball.airborne = false;
  ball.moving = false;
  ball.curveSpin = 0;
  ball.shotMeta = null;
  trail = [];
  updateHud();
  const reminder = struggleReminder("club");
  const message = reminder || "Splash tax. Dropped back on the fairway line toward the WACKIN BOX.";
  if (!passTurnAfterShot(message)) setMessage(message, 170, "roast");
}

function recoverOutOfBounds(exitPoint = ball) {
  const bounds = playableBounds();
  const drop = {
    x: clamp(exitPoint.x, bounds.left + ball.r + 3, bounds.right - ball.r - 3),
    y: clamp(exitPoint.y, bounds.top + ball.r + 3, bounds.bottom - ball.r - 3),
  };
  players[activePlayerIndex].currentStrokes += 1;
  players[activePlayerIndex].safeStreak = 0;
  players[activePlayerIndex].cleanStreak = 0;
  strokes = players[activePlayerIndex].currentStrokes;
  ball.x = drop.x;
  ball.y = drop.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.z = 0;
  ball.vz = 0;
  ball.airborne = false;
  ball.moving = false;
  ball.curveSpin = 0;
  ball.shotMeta = null;
  ball.lastSafeZone = null;
  trail = [];
  updateHud();
  const reminder = struggleReminder("ob");
  const message = reminder || line(obRoasts);
  if (!passTurnAfterShot(message)) setMessage(message, 170, "roast");
}

function greenRunoffSave(previousPosition, speed) {
  if (ball.airborne) return false;
  const activeClubKey = ball.clubKey || selectedClub;
  const finishTangent = pathTangentAt(0.92);
  const prevOverrun = (previousPosition.x - target.x) * finishTangent.x + (previousPosition.y - target.y) * finishTangent.y;
  const currentOverrun = (ball.x - target.x) * finishTangent.x + (ball.y - target.y) * finishTangent.y;
  const sideX = -finishTangent.y;
  const sideY = finishTangent.x;
  const lateralMiss = Math.abs((ball.x - target.x) * sideX + (ball.y - target.y) * sideY);
  const behindGreen = currentOverrun > -18 && prevOverrun < 210;
  const playableRunout = currentOverrun < 135 && lateralMiss < 132;
  const nearGreen = distance(previousPosition, target) < 230 || distance(ball, target) < 230 || behindGreen;
  const recoverableSpeed = activeClubKey === "driver" ? speed < 9.4 : speed < 8.1;
  if (!nearGreen || !behindGreen || !playableRunout || !recoverableSpeed) return false;
  const bounds = playableBounds();
  ball.x = clamp(ball.x, bounds.left + ball.r + 6, bounds.right - ball.r - 6);
  ball.y = clamp(ball.y, bounds.top + ball.r + 6, bounds.bottom - ball.r - 6);
  ball.vx *= 0.28;
  ball.vy *= 0.28;
  ball.curveSpin *= 0.35;
  setMessage("Back fringe caught it. Good drive, tiny warning. Thirty more yards and you'd be paying the idiot tax.", 165, "talk");
  return true;
}

function cupCatch(activeClubKey, speed) {
  const cupDistance = distance(ball, target);
  const driverBounceDrop = activeClubKey === "driver" && cupDistance < target.r * 0.86 && ball.z < 58 && speed < 15.5;
  const normalDrop = cupDistance < target.r && !ball.airborne && speed < 3.8;
  if (!driverBounceDrop && !normalDrop) return false;
  ball.x = target.x;
  ball.y = target.y;
  ball.z = 0;
  ball.vx = 0;
  ball.vy = 0;
  ball.vz = 0;
  ball.airborne = false;
  ball.moving = false;
  setMessage(driverBounceDrop ? "Drive caught the black hole clean. I am screaming. That's a good line, menace." : line(tapInLines), 150, driverBounceDrop ? "ace" : "good");
  nextHole();
  return true;
}

function burst(x, y) {
  for (let i = 0; i < 42; i++) {
    confetti.push({
      x,
      y,
      vx: rnd(-4, 4),
      vy: rnd(-7, 1),
      life: rnd(38, 72),
      color: ["#fff9e9", "#b88a37", "#1f6d3a", "#a4422d"][Math.floor(rnd(0, 4))],
    });
  }
}

function inRectCircle(rect, c) {
  const nx = clamp(c.x, rect.x, rect.x + rect.w);
  const ny = clamp(c.y, rect.y, rect.y + rect.h);
  return Math.hypot(c.x - nx, c.y - ny) < c.r;
}

function circleHitResponse(cx, cy, r, bounce = 0.62) {
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const d = Math.hypot(dx, dy);
  if (d >= ball.r + r) return false;
  const nx = dx / (d || 1);
  const ny = dy / (d || 1);
  const dot = ball.vx * nx + ball.vy * ny;
  ball.vx -= 2 * dot * nx;
  ball.vy -= 2 * dot * ny;
  ball.vx *= bounce;
  ball.vy *= bounce;
  ball.x = cx + nx * (ball.r + r + 0.8);
  ball.y = cy + ny * (ball.r + r + 0.8);
  ball.curveSpin *= 0.45;
  return true;
}

function rectHitResponse(rect, bounce = 0.55) {
  const nx = clamp(ball.x, rect.x, rect.x + rect.w);
  const ny = clamp(ball.y, rect.y, rect.y + rect.h);
  const dx = ball.x - nx;
  const dy = ball.y - ny;
  const d = Math.hypot(dx, dy);
  if (d >= ball.r) return false;
  const axisX = Math.abs(dx) > Math.abs(dy);
  const normalX = axisX ? Math.sign(dx || ball.vx || 1) : 0;
  const normalY = axisX ? 0 : Math.sign(dy || ball.vy || 1);
  const dot = ball.vx * normalX + ball.vy * normalY;
  ball.vx -= 2 * dot * normalX;
  ball.vy -= 2 * dot * normalY;
  ball.vx *= bounce;
  ball.vy *= bounce;
  if (axisX) ball.x = nx + normalX * (ball.r + 0.8);
  else ball.y = ny + normalY * (ball.r + 0.8);
  ball.curveSpin *= 0.45;
  return true;
}

function collideTree(item) {
  if (!item || item.type !== "gum") return false;
  const s = item.s || 1;
  if (ball.z > 68 * s) return false;
  const trunk = {
    x: item.x - 4 * s,
    y: item.y - 2 * s,
    w: 8 * s,
    h: 28 * s,
  };
  if (rectHitResponse(trunk, 0.48)) return true;
  const canopy = [
    [0, -20, 24],
    [-15, -6, 18],
    [14, -6, 20],
    [2, 4, 17],
  ];
  return canopy.some(([x, y, r]) => circleHitResponse(item.x + x * s, item.y + y * s, r * s, 0.58));
}

function collideTreeObstacles() {
  if (ball.airborne && ball.z > 68) return false;
  return decorations.some((item) => collideTree(item));
}

function updatePhysics(dt) {
  if (!ball.moving) return;

  const bounds = playableBounds();
  const activeClubKey = ball.clubKey || selectedClub;
  const club = clubs[activeClubKey];
  const speed = Math.hypot(ball.vx, ball.vy);
  const safeZone = currentSafeZone();
  if (safeZone) {
    ball.lastSafeZone = safeZone;
    if (ball.shotMeta && !ball.shotMeta.safeAwarded && speed < 9.5) {
      ball.shotMeta.safeAwarded = true;
      const player = players[activePlayerIndex];
      if (player) player.safeStreak = (player.safeStreak || 0) + 1;
      const streakBonus = player?.safeStreak >= 2 ? 30 + player.safeStreak * 12 : 0;
      const layupLine = isWedgeKey(activeClubKey) && nearestRouteT(ball) < 0.68
        ? "Smart layup. Rusty Flirt found the flat bit and made you look planned"
        : "Safe zone hit. The ball found therapy";
      awardPoints(95 + streakBonus, player?.safeStreak >= 2 ? `Safe zone streak x${player.safeStreak}. Boring landing, sexy result` : layupLine, "good", true);
    }
  }
  if (distance(ball, target) < 145 && speed > 0.5 && !ball.airborne && performance.now() - lastMusicPulse > 1400) {
    lastMusicPulse = performance.now();
    setMusicEnergy("near", 1800);
  }
  const previousPosition = { x: ball.x, y: ball.y };

  if (ball.airborne) {
    ball.vz -= 1.28 * dt;
    ball.z += ball.vz * dt;
    if (ball.z <= 0) {
      ball.z = 0;
      ball.airborne = false;
      const landedSafe = currentSafeZone();
      const closeDriver = activeClubKey === "driver" && distance(ball, target) < 260;
      const bouncePower = (landedSafe ? club.bounce * 0.62 : club.bounce) * (closeDriver ? 1.85 : 1);
      if (club.bounce > 0.1 && speed > 2.2) {
        ball.vx *= 0.88 + bouncePower * 0.12;
        ball.vy *= 0.88 + bouncePower * 0.12;
        ball.vz = speed * bouncePower * 0.82;
        if (ball.vz > 2.2) ball.airborne = true;
      }
      if (landedSafe) setMessage(Math.random() > 0.45 ? line(greatMechanicLines) : line(goodBlokeLines), 170, "good");
    }
  }

  const rough = roughPenalty();
  const sideMiss = fairwaySideMiss(ball);
  const localBreak = localBreakAt(ball);
  const safeDamping = safeZone ? 0.06 : 1.18;
  let greenCollarInfluence = 1;
  if (localBreak.greenCollar) {
    greenCollarInfluence = activeClubKey === "wedgeChip"
      ? 1.42
      : activeClubKey === "wedge"
        ? 0.58
        : activeClubKey === "driver"
          ? 1.18
          : 0.48;
  }
  const rollingInfluence = ball.airborne ? 0 : clamp(2.15 - speed / 7.8, 0.42, 1.55) * rough * safeDamping * club.check * greenCollarInfluence;
  ball.vx += localBreak.x * localBreak.strength * club.spin * rollingInfluence * dt;
  ball.vy += localBreak.y * localBreak.strength * club.spin * rollingInfluence * dt;
  if (sideMiss > 0 && !ball.airborne) {
    const overkill = clamp((speed - 7.2) / 5.4, 0, 1);
    const roughGrab = sideMiss * (0.18 - overkill * 0.075);
    ball.vx *= Math.pow(1 - roughGrab, dt);
    ball.vy *= Math.pow(1 - roughGrab, dt);
    ball.curveSpin += sideMiss * (0.0038 + overkill * 0.0016) * dt * (ball.x < W / 2 ? -1 : 1);
    const fringe = nearestFringePoint(ball);
    const fringePull = sideMiss * clamp(1.7 - speed / 4.6, 0.24, 1.2);
    ball.vx += (fringe.x - ball.x) * 0.0034 * fringePull * dt;
    ball.vy += (fringe.y - ball.y) * 0.0034 * fringePull * dt;
  }
  if (ball.curveSpin && speed > 0.35) {
    const nx = -ball.vy / (speed || 1);
    const ny = ball.vx / (speed || 1);
    ball.vx += nx * ball.curveSpin * speed * 0.03 * dt;
    ball.vy += ny * ball.curveSpin * speed * 0.03 * dt;
    ball.curveSpin *= Math.pow(0.985, dt);
  }
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  const wentOut =
    ball.x < bounds.left + ball.r ||
    ball.x > bounds.right - ball.r ||
    ball.y < bounds.top + ball.r ||
    ball.y > bounds.bottom - ball.r;
  if (wentOut && !ball.airborne) {
    if (greenRunoffSave(previousPosition, speed)) return;
    recoverOutOfBounds(boundaryExitPoint(previousPosition, ball, bounds));
    return;
  }
  if (speed > 0.24) {
    trail.push({ x: ball.x, y: ball.y, z: ball.z, life: 1, r: clamp(speed * 0.55, 3, 12) });
    if (trail.length > 52) trail.shift();
  }
  if (cupCatch(activeClubKey, speed)) return;
  const roughSlowdown = !safeZone && sideMiss > 0.08 ? 0.056 + sideMiss * 0.078 : 0;
  const drag = safeZone ? 0.97 : Math.min(0.99, club.drag + 0.002 - roughSlowdown);
  ball.vx *= Math.pow(drag, dt);
  ball.vy *= Math.pow(drag, dt);
  if (!ball.airborne && speed < 0.62) {
    ball.vx *= Math.pow(0.94, dt);
    ball.vy *= Math.pow(0.94, dt);
  }
  if (sideMiss > 0.22 && !ball.airborne && speed < 2.2) {
    ball.vx *= Math.pow(0.68, dt);
    ball.vy *= Math.pow(0.68, dt);
  }
  if (sideMiss > 0.18 && !ball.airborne && speed < 0.42) {
    const fringe = nearestFringePoint(ball);
    ball.x += (fringe.x - ball.x) * 0.18 * dt;
    ball.y += (fringe.y - ball.y) * 0.18 * dt;
    ball.vx *= Math.pow(0.5, dt);
    ball.vy *= Math.pow(0.5, dt);
  }

  if (ball.x < bounds.left + ball.r || ball.x > bounds.right - ball.r) {
    if (greenRunoffSave(previousPosition, speed)) return;
    recoverOutOfBounds(boundaryExitPoint(previousPosition, ball, bounds));
    return;
  }
  if (ball.y < bounds.top + ball.r || ball.y > bounds.bottom - ball.r) {
    if (greenRunoffSave(previousPosition, speed)) return;
    recoverOutOfBounds(boundaryExitPoint(previousPosition, ball, bounds));
    return;
  }

  for (const hazard of hazards) {
    if (hazardContainsBall(hazard)) {
      if (ball.airborne || ball.z > 0) continue;
      const slow = hazard.type === "sand" ? (isWedgeKey(activeClubKey) ? 0.9 : activeClubKey === "driver" ? 0.84 : 0.56) : 0.34;
      ball.vx *= Math.pow(slow, dt);
      ball.vy *= Math.pow(slow, dt);
      if (hazard.type === "water" && !ball.airborne && speed < 4.2) {
        recoverFromWater({ x: ball.x, y: ball.y, r: ball.r });
        return;
      }
    }
  }

  if (collideTreeObstacles()) return;

  for (const bumper of bumpers) {
    const dx = ball.x - bumper.x;
    const dy = ball.y - bumper.y;
    const d = Math.hypot(dx, dy);
    if (d < ball.r + bumper.r) {
      const nx = dx / (d || 1);
      const ny = dy / (d || 1);
      const dot = ball.vx * nx + ball.vy * ny;
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;
      ball.vx *= 0.8;
      ball.vy *= 0.8;
      ball.x = bumper.x + nx * (ball.r + bumper.r + 1);
      ball.y = bumper.y + ny * (ball.r + bumper.r + 1);
    }
  }

  if (distance(ball, target) < target.r && !ball.airborne) {
    ball.vx *= 0.72;
    ball.vy *= 0.72;
    if (cupCatch(activeClubKey, Math.hypot(ball.vx, ball.vy))) return;
  }

  if (!ball.airborne && Math.hypot(ball.vx, ball.vy) < 0.11) {
    ball.vx = 0;
    ball.vy = 0;
    ball.z = 0;
    ball.vz = 0;
    ball.airborne = false;
    ball.moving = false;
    const trappedOnEdge =
      ball.x <= bounds.left + ball.r + 4 ||
      ball.x >= bounds.right - ball.r - 4 ||
      ball.y <= bounds.top + ball.r + 4 ||
      ball.y >= bounds.bottom - ball.r - 4;
    if (trappedOnEdge && distance(ball, target) > 120) {
      recoverToSafeLie();
    } else {
      const nearCup = distance(ball, target) < 64;
      const stopLine = nearCup
        ? line(tapInLines)
        : hole <= 4 && Math.random() <= 0.35
          ? line(mechanicTipLines)
          : line(missLines);
      if (!passTurnAfterShot(stopLine)) setMessage(stopLine, 170, nearCup ? "talk" : "roast");
    }
  }
}

function drawCourse() {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#48ad65");
  grad.addColorStop(0.46, "#23884c");
  grad.addColorStop(1, "#155934");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let x = -60; x < W + 80; x += 48) {
    const stripe = ctx.createLinearGradient(x, 0, x + 90, H);
    stripe.addColorStop(0, "rgba(255,249,233,0)");
    stripe.addColorStop(0.5, "rgba(255,249,233,0.18)");
    stripe.addColorStop(1, "rgba(255,249,233,0)");
    ctx.fillStyle = stripe;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 46, 0);
    ctx.lineTo(x + 112, H);
    ctx.lineTo(x + 66, H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  safeDraw(drawRoughTexture);
  safeDraw(drawSidePunishZones);
  safeDraw(drawFairway);
  safeDraw(drawGreenComplex);
  safeDraw(drawTeeBox);
  safeDraw(drawDecorations);

  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 2;
  for (let y = -120; y < H + 120; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(W * 0.35, y + 62, W * 0.65, y - 62, W, y + 18);
    ctx.stroke();
  }

  safeDraw(drawBreakZones);
  safeDraw(drawTrueLine);
  safeDraw(drawBreakArrows);
  safeDraw(drawSafeZones);
  safeDraw(drawYardageMarkers);

  ctx.fillStyle = "rgba(255, 249, 233, 0.2)";
  ctx.beginPath();
  ctx.ellipse(target.x - 20, target.y + 10, target.r * 3.3, target.r * 2.2, -0.25, 0, Math.PI * 2);
  ctx.fill();

  for (const hazard of hazards) safeDraw(() => drawHazard(hazard));
  for (const bumper of bumpers) safeDraw(() => drawBumper(bumper));
  safeDraw(drawOutOfBoundsStakes);
  safeDraw(drawCup);
  safeDraw(drawVignette);
}

function safeDraw(drawFn) {
  try {
    drawFn();
  } catch (error) {
    console.error(error);
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = `Draw error: ${error.message || error}`;
      toast.classList.add("show");
    }
    try {
      ctx.restore();
    } catch {
      // Ignore unmatched restore attempts.
    }
  }
}

function drawDecorations() {
  for (const item of decorations) {
    if (item.type === "gum") drawTree(item.x, item.y, item.s, "#2f6f43");
    if (item.type === "lantern") drawLantern(item.x, item.y, item.s);
    if (item.type === "scrap") drawScrap(item.x, item.y, item.s, item.flip);
    if (item.type === "party") drawPartyJunk(item.x, item.y, item.s);
  }
}

function drawTree(x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(4, 20, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6f4b2f";
  ctx.fillRect(-4, -2, 8, 28);
  ctx.fillStyle = color;
  for (const blob of [[0, -20, 24], [-15, -6, 18], [14, -6, 20], [2, 4, 17]]) {
    ctx.beginPath();
    ctx.arc(blob[0], blob[1], blob[2], 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLantern(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "rgba(24,32,22,0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 24);
  ctx.lineTo(0, -30);
  ctx.quadraticCurveTo(20, -32, 22, -14);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 211, 110, 0.52)";
  ctx.beginPath();
  ctx.arc(22, -8, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a281c";
  ctx.fillRect(14, -17, 16, 20);
  ctx.restore();
}

function drawScrap(x, y, s, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * flip, s);
  ctx.rotate(-0.15);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(-24, 18, 54, 7);
  ctx.fillStyle = "#b88a37";
  ctx.fillRect(-24, -6, 48, 13);
  ctx.fillStyle = "#7b2f22";
  ctx.fillRect(-7, -20, 34, 12);
  ctx.strokeStyle = "#fff9e9";
  ctx.lineWidth = 2;
  ctx.strokeRect(-24, -6, 48, 13);
  ctx.restore();
}

function drawPartyJunk(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(0, 20, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(-20, -2, 14, 28);
  ctx.fillStyle = "#a4422d";
  ctx.fillRect(-18, -10, 10, 10);
  ctx.fillStyle = "#326f89";
  ctx.beginPath();
  ctx.arc(14, 6, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8e3ad";
  ctx.fillRect(6, 2, 16, 5);
  ctx.restore();
}

function drawRoughTexture() {
  ctx.save();
  ctx.strokeStyle = "rgba(10, 43, 26, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 90; i++) {
    const x = (i * 73) % W;
    const y = (i * 47) % H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 8, y - 5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFairway() {
  if (![teePosition.x, teePosition.y, doglegPoint.x, doglegPoint.y, target.x, target.y].every(Number.isFinite)) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const route = new Path2D();
  route.moveTo(teePosition.x, teePosition.y);
  route.lineTo(doglegPoint.x, doglegPoint.y);
  route.lineTo(target.x, target.y);
  ctx.shadowColor = "rgba(255, 244, 178, 0.16)";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "rgba(91, 170, 91, 0.2)";
  ctx.lineWidth = 142;
  ctx.stroke(route);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(113, 189, 95, 0.42)";
  ctx.lineWidth = 96;
  ctx.stroke(route);
  ctx.strokeStyle = "rgba(12, 54, 28, 0.28)";
  ctx.lineWidth = 102;
  ctx.stroke(route);
  ctx.strokeStyle = "rgba(113, 189, 95, 0.48)";
  ctx.lineWidth = 90;
  ctx.stroke(route);
  ctx.strokeStyle = "rgba(180, 231, 130, 0.16)";
  ctx.lineWidth = 64;
  ctx.setLineDash([38, 24]);
  ctx.stroke(route);
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255, 249, 233, 0.18)";
  ctx.lineWidth = 100;
  ctx.setLineDash([2, 22]);
  ctx.stroke(route);
  ctx.strokeStyle = "rgba(255, 249, 233, 0.12)";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 12]);
  ctx.stroke(route);
  ctx.restore();
}

function drawGreenComplex() {
  if (![target.x, target.y, target.r].every(Number.isFinite)) return;
  ctx.save();
  const greenGrad = ctx.createRadialGradient(target.x - 18, target.y - 16, target.r, target.x, target.y, target.r * 5.4);
  greenGrad.addColorStop(0, "rgba(174, 232, 119, 0.5)");
  greenGrad.addColorStop(0.58, "rgba(77, 166, 78, 0.34)");
  greenGrad.addColorStop(1, "rgba(22, 88, 51, 0)");
  ctx.fillStyle = greenGrad;
  ctx.beginPath();
  ctx.ellipse(target.x - 16, target.y + 8, target.r * 5.5, target.r * 3.6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 249, 233, 0.22)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.ellipse(target.x - 16, target.y + 8, target.r * 4.35, target.r * 2.85, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTrueLine() {
  if (!trueLineZone || ![trueLineZone.x, trueLineZone.y, trueLineZone.rx, trueLineZone.ry].every(Number.isFinite)) return;
  ctx.save();
  ctx.translate(trueLineZone.x, trueLineZone.y);
  ctx.rotate(trueLineZone.angle);
  ctx.shadowColor = "rgba(255, 249, 233, 0.2)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(255, 249, 233, 0.09)";
  ctx.strokeStyle = "rgba(255, 249, 233, 0.38)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.ellipse(0, 0, trueLineZone.rx, trueLineZone.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255, 249, 233, 0.5)";
  ctx.font = "900 10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TRUE LINE", 0, 1);
  ctx.restore();
}

function drawTeeBox() {
  if (![teePosition.x, teePosition.y].every(Number.isFinite)) return;
  ctx.save();
  ctx.translate(teePosition.x, teePosition.y);
  ctx.rotate(-0.04);
  ctx.fillStyle = "rgba(13, 34, 24, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 24, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 249, 233, 0.22)";
  roundRect(-22, -54, 44, 108, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 249, 233, 0.36)";
  ctx.lineWidth = 2;
  ctx.stroke();
  for (const y of [-34, 34]) {
    ctx.fillStyle = "#f2c14e";
    ctx.beginPath();
    ctx.arc(0, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#10261d";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(16, 38, 29, 0.72)";
  ctx.font = "900 10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("WACKIN", 0, -6);
  ctx.fillText("BOX", 0, 9);
  ctx.restore();
}

function drawSidePunishZones() {
  if (![teePosition.x, teePosition.y, doglegPoint.x, doglegPoint.y, target.x, target.y].every(Number.isFinite)) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(72, 48, 30, 0.25)";
  ctx.lineWidth = 285;
  ctx.beginPath();
  ctx.moveTo(teePosition.x, teePosition.y);
  ctx.lineTo(doglegPoint.x, doglegPoint.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(78, 96, 39, 0.24)";
  ctx.lineWidth = 230;
  ctx.stroke();
  ctx.restore();
}

function drawOutOfBoundsStakes() {
  const bounds = playableBounds();
  ctx.save();
  ctx.strokeStyle = "rgba(168, 35, 28, 0.46)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 12]);
  ctx.strokeRect(bounds.left + 4, bounds.top + 4, bounds.right - bounds.left - 8, bounds.bottom - bounds.top - 8);
  ctx.setLineDash([]);

  const stakes = [];
  for (let x = bounds.left + 42; x <= bounds.right - 42; x += 86) {
    stakes.push({ x, y: bounds.top + 13, angle: 0 });
    stakes.push({ x, y: bounds.bottom - 13, angle: Math.PI });
  }
  for (let y = bounds.top + 48; y <= bounds.bottom - 48; y += 82) {
    stakes.push({ x: bounds.left + 13, y, angle: Math.PI / 2 });
    stakes.push({ x: bounds.right - 13, y, angle: -Math.PI / 2 });
  }

  for (const stake of stakes) {
    ctx.save();
    ctx.translate(stake.x, stake.y);
    ctx.rotate(stake.angle);
    ctx.shadowColor = "rgba(255, 236, 185, 0.28)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#f7ead0";
    ctx.fillRect(-2, -14, 4, 28);
    ctx.fillStyle = "#a5221f";
    ctx.fillRect(-5, -16, 10, 7);
    ctx.beginPath();
    ctx.moveTo(-2, 14);
    ctx.lineTo(2, 14);
    ctx.lineTo(0, 20);
    ctx.closePath();
    ctx.fillStyle = "rgba(116, 50, 31, 0.9)";
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawVignette() {
  const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, W * 0.68);
  grad.addColorStop(0, "rgba(255, 244, 178, 0.05)");
  grad.addColorStop(0.62, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.16)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255, 244, 178, 0.035)";
  for (let y = 0; y < H; y += 4) {
    ctx.fillRect(0, y, W, 1);
  }
}

function drawSafeZones() {
  for (const zone of safeZones) {
    ctx.save();
    ctx.translate(zone.x, zone.y);
    ctx.rotate(zone.angle);
    ctx.fillStyle = "rgba(140, 226, 118, 0.4)";
    ctx.strokeStyle = "rgba(232, 255, 202, 0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.ellipse(0, 0, zone.rx, zone.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "900 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 249, 233, 0.3)";
    ctx.fillText("SAFE ZONE", 0, 1);
    ctx.restore();
  }
}

function drawArrow(x, y, angle, length, alpha, color = "255, 249, 233") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;
  ctx.fillStyle = `rgba(${color}, ${alpha})`;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-length / 2, 0);
  ctx.lineTo(length / 2, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(length / 2, 0);
  ctx.lineTo(length / 2 - 10, -7);
  ctx.lineTo(length / 2 - 10, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBreakArrows() {
  for (const arrow of breakArrows) {
    const meter = clamp((arrow.strength - 0.004) / 0.032, 0, 1);
    const length = 22 + meter * 38;
    const color = meter > 0.68 ? "202, 60, 36" : meter > 0.34 ? "214, 158, 54" : "82, 190, 88";
    drawArrow(arrow.x, arrow.y, arrow.angle, length, arrow.alpha + 0.05, color);
  }
}

function drawBreakZones() {
  for (const zone of breakZones) {
    if (zone.safe) continue;
    const meter = clamp((zone.strength - 0.006) / 0.034, 0, 1);
    ctx.save();
    ctx.translate(zone.x, zone.y);
    ctx.rotate(zone.angle);
    ctx.fillStyle = zone.greenCollar
      ? "rgba(202, 60, 36, 0.13)"
      : meter > 0.62
      ? "rgba(202, 60, 36, 0.09)"
      : meter > 0.32
        ? "rgba(214, 158, 54, 0.08)"
        : "rgba(82, 190, 88, 0.06)";
    ctx.beginPath();
    ctx.ellipse(0, 0, zone.rx, zone.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    if (zone.greenCollar) {
      ctx.strokeStyle = "rgba(255, 188, 112, 0.26)";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 9]);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawYardageMarkers() {
  for (const marker of yardageMarkers) {
    ctx.save();
    ctx.translate(marker.x, marker.y);
    ctx.rotate(marker.angle);
    ctx.strokeStyle = "rgba(255, 249, 233, 0.62)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 7]);
    ctx.beginPath();
    ctx.moveTo(-34, 0);
    ctx.lineTo(34, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.rotate(-marker.angle);
    ctx.font = "800 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(16, 38, 29, 0.72)";
    roundRect(-29, -15, 58, 26, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 249, 233, 0.48)";
    ctx.stroke();
    ctx.fillStyle = "#fff9e9";
    ctx.fillText(`${marker.yards}y`, 0, -1);
    ctx.restore();
  }
}

function drawPointFeed(dt) {
  pointFeed.forEach((item) => {
    item.life -= dt;
  });
  pointFeed = pointFeed.filter((item) => item.life > 0);
  const totalPoints = players[activePlayerIndex]?.points || 0;
  ctx.save();
  ctx.font = "900 13px Arial";
  const items = pointFeed.slice(0, 3);
  const width = 294;
  const height = 48 + items.length * 20;
  roundRect(16, 16, width, height, 10);
  ctx.fillStyle = "rgba(13, 32, 24, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 249, 233, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#f7d36b";
  ctx.fillText(`STYLE POINTS ${totalPoints}`, 30, 39);
  ctx.fillStyle = "rgba(255, 249, 233, 0.82)";
  ctx.font = "800 11px Arial";
  ctx.fillText("ONLINE SHOTS, SAFE LAYUPS, SMART CLUBS", 30, 58);
  items.forEach((item, index) => {
    const y = 80 + index * 20;
    ctx.fillStyle = item.mood === "roast" ? "#ffb19e" : item.mood === "talk" ? "#c9e8ff" : "#bff1a5";
    ctx.fillText(item.text.slice(0, 42), 30, y);
  });
  drawNastyMeter(16 + width + 12, 16);
  ctx.restore();
}

function drawNastyMeter(x, y) {
  const width = 184;
  const height = 76;
  const power = lastReleaseFeedback ? clamp(lastReleaseFeedback.powerRatio, 0, 1) : 0;
  const grade = lastReleaseFeedback?.grade || "No Shot";
  const zone = lastReleaseFeedback?.zone || "READY";
  const leaked = lastReleaseFeedback ? lastReleaseFeedback.holdPenalty < 0.82 : false;
  const clubKey = lastReleaseFeedback?.clubKey || selectedClubKeyForShot();
  const clubName = clubKey === "wedgeChip" ? "Chip" : clubs[clubKey]?.name || "Club";
  const color = power > 0.78 ? "#ef6f4e" : power > 0.48 ? "#f2c14e" : "#74d38a";

  roundRect(x, y, width, height, 10);
  ctx.fillStyle = "rgba(13, 32, 24, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 249, 233, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#fff9e9";
  ctx.font = "900 13px Arial";
  ctx.fillText("NASTY METER", x + 14, y + 23);
  ctx.fillStyle = "rgba(255, 249, 233, 0.76)";
  ctx.font = "800 10px Arial";
  ctx.fillText(`${zone} ${clubName.toUpperCase()}`, x + 14, y + 40);

  ctx.fillStyle = "rgba(255, 249, 233, 0.18)";
  roundRect(x + 14, y + 48, width - 28, 12, 7);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(x + 14, y + 48, (width - 28) * power, 12, 7);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = "900 13px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`${Math.round(power * 100)}%`, x + width - 14, y + 23);
  ctx.fillStyle = "rgba(255, 249, 233, 0.82)";
  ctx.font = "800 10px Arial";
  ctx.fillText(leaked ? "HOLD LEAK" : grade.toUpperCase(), x + width - 14, y + 40);
  ctx.textAlign = "left";
}

function breakSeverity(point = null) {
  const read = point && Number.isFinite(point.x)
    ? localBreakAt(point)
    : { strength: greenBreak.strength, safe: false };
  const meter = read.safe ? 0 : clamp((read.strength - 0.006) / (0.052 - 0.006), 0, 1);
  if (meter > 0.68) return { label: "nasty", meter, color: "#a4422d" };
  if (meter > 0.34) return { label: "spicy", meter, color: "#b88a37" };
  if (read.safe) return { label: "safe", meter, color: "#52be58" };
  return { label: "gentle", meter, color: "#52be58" };
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHazard(h) {
  ctx.save();
  if (h.type === "sand") {
    drawSandPit(h);
  } else {
    waterPitPath(h);
    const waterGrad = ctx.createLinearGradient(h.x, h.y, h.x + h.w, h.y + h.h);
    waterGrad.addColorStop(0, "#5aa3b5");
    waterGrad.addColorStop(0.42, "#2f8aa2");
    waterGrad.addColorStop(1, "#174b68");
    ctx.fillStyle = waterGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(191, 236, 242, 0.52)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    waterPitPath(h);
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.34)";
    ctx.lineWidth = h.greenCarry ? 1.5 : 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const y = h.y + h.h * (0.22 + i * 0.16);
      ctx.moveTo(h.x + h.w * 0.12, y);
      ctx.bezierCurveTo(
        h.x + h.w * 0.32,
        y - h.h * 0.18,
        h.x + h.w * 0.62,
        y + h.h * 0.14,
        h.x + h.w * 0.9,
        y - h.h * 0.03
      );
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255, 249, 233, 0.12)";
    ctx.beginPath();
    ctx.ellipse(h.x + h.w * 0.36, h.y + h.h * 0.3, h.w * 0.18, h.h * 0.08, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function waterPitPath(h) {
  const cx = h.x + h.w / 2;
  const cy = h.y + h.h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - h.w * 0.46, cy - h.h * 0.08);
  ctx.bezierCurveTo(cx - h.w * 0.54, cy - h.h * 0.42, cx - h.w * 0.18, cy - h.h * 0.62, cx + h.w * 0.08, cy - h.h * 0.46);
  ctx.bezierCurveTo(cx + h.w * 0.42, cy - h.h * 0.64, cx + h.w * 0.58, cy - h.h * 0.18, cx + h.w * 0.48, cy + h.h * 0.12);
  ctx.bezierCurveTo(cx + h.w * 0.54, cy + h.h * 0.48, cx + h.w * 0.1, cy + h.h * 0.6, cx - h.w * 0.16, cy + h.h * 0.42);
  ctx.bezierCurveTo(cx - h.w * 0.48, cy + h.h * 0.58, cx - h.w * 0.62, cy + h.h * 0.2, cx - h.w * 0.46, cy - h.h * 0.08);
  ctx.closePath();
}

function sandPitPath(h) {
  const cx = h.x + h.w / 2;
  const cy = h.y + h.h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - h.w * 0.46, cy - h.h * 0.04);
  ctx.bezierCurveTo(cx - h.w * 0.52, cy - h.h * 0.48, cx - h.w * 0.13, cy - h.h * 0.62, cx + h.w * 0.16, cy - h.h * 0.42);
  ctx.bezierCurveTo(cx + h.w * 0.53, cy - h.h * 0.62, cx + h.w * 0.58, cy - h.h * 0.08, cx + h.w * 0.42, cy + h.h * 0.15);
  ctx.bezierCurveTo(cx + h.w * 0.32, cy + h.h * 0.55, cx - h.w * 0.04, cy + h.h * 0.58, cx - h.w * 0.25, cy + h.h * 0.38);
  ctx.bezierCurveTo(cx - h.w * 0.55, cy + h.h * 0.45, cx - h.w * 0.63, cy + h.h * 0.12, cx - h.w * 0.46, cy - h.h * 0.04);
  ctx.closePath();
}

function drawSandPit(h) {
  const cx = h.x + h.w / 2;
  const cy = h.y + h.h / 2;
  sandPitPath(h);
  ctx.fillStyle = "#d8bf76";
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(74, 94, 42, 0.42)";
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 249, 233, 0.72)";
  ctx.stroke();

  ctx.save();
  sandPitPath(h);
  ctx.clip();

  const grad = ctx.createRadialGradient(cx - h.w * 0.12, cy - h.h * 0.15, 8, cx, cy, h.w * 0.7);
  grad.addColorStop(0, "#ead598");
  grad.addColorStop(0.68, "#d3b872");
  grad.addColorStop(1, "#b89555");
  ctx.fillStyle = grad;
  ctx.fillRect(h.x - 8, h.y - 8, h.w + 16, h.h + 16);

  ctx.strokeStyle = "rgba(105, 73, 32, 0.32)";
  ctx.lineWidth = 2;
  for (const line of h.rakeLines || []) {
    const y = h.y + line.y;
    ctx.beginPath();
    ctx.moveTo(h.x + h.w * 0.14, y);
    ctx.quadraticCurveTo(cx, y + h.h * line.bend, h.x + h.w * 0.86, y + h.h * 0.04);
    ctx.stroke();
  }

  for (const grain of h.grains || []) {
    ctx.fillStyle = grain.dark ? "rgba(83, 54, 23, 0.18)" : "rgba(255, 249, 233, 0.38)";
    ctx.beginPath();
    ctx.arc(h.x + grain.x, h.y + grain.y, grain.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(cx + h.w * 0.28, cy - h.h * 0.22);
  ctx.rotate(-0.35);
  ctx.strokeStyle = "rgba(82, 61, 32, 0.48)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(15, 0);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-13 + i * 6, 0);
    ctx.lineTo(-15 + i * 6, 8);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

function drawBumper(b) {
  ctx.save();
  const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.4, 4, b.x, b.y, b.r * 1.2);
  grad.addColorStop(0, "#9b7147");
  grad.addColorStop(1, "#5b3824");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "#fff9e9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawCup() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 249, 233, 0.18)";
  ctx.beginPath();
  ctx.arc(target.x, target.y, target.r * 1.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#101914";
  ctx.beginPath();
  ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff9e9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(target.x + target.r * 0.45, target.y);
  ctx.lineTo(target.x + target.r * 0.45, target.y - 72);
  ctx.stroke();

  ctx.fillStyle = "#a4422d";
  ctx.beginPath();
  ctx.moveTo(target.x + target.r * 0.45, target.y - 72);
  ctx.lineTo(target.x + target.r * 0.45, target.y - 38);
  ctx.lineTo(target.x + target.r * 2.35, target.y - 55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,249,233,0.92)";
  ctx.font = "900 12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(hole, target.x + target.r * 1.36, target.y - 51);
  ctx.restore();
}

function currentLieInfo() {
  const hazard = currentHazard();
  if (hazard?.type === "sand") return { label: "SAND", tip: "Wedge wants a full fling", color: "#d3b872" };
  if (hazard?.type === "water") return { label: "WATER", tip: "Fly over, don't land", color: "#5aa3b5" };
  if (localBreakAt(ball).trueLine) return { label: "TRUE LINE", tip: "Break goes quiet", color: "#fff9e9" };
  if (currentSafeZone()) return { label: "SAFE", tip: "Flat-ish landing", color: "#8ce276" };
  if (distance(ball, target) < target.r * 3.9) return { label: "GREEN", tip: "Putter behaves here", color: "#aee877" };
  const miss = fairwaySideMiss(ball);
  if (miss > 0.22) return { label: "ROUGH", tip: "Putter loses power", color: "#6f7f34" };
  if (miss > 0.08) return { label: "FRINGE", tip: "More pull needed", color: "#8ea44a" };
  return { label: "FAIRWAY", tip: "Pick a landing spot", color: "#71bd5f" };
}

function drawLieBadge() {
  if (roundOver || transitioning || aiming || ball.moving || !ball || !Number.isFinite(ball.x)) return;
  const info = currentLieInfo();
  const x = clamp(ball.x + 22, 18, W - 154);
  const y = clamp(ball.y - ball.z - 42, 18, H - 76);
  ctx.save();
  ctx.font = "900 11px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const w = Math.max(106, ctx.measureText(info.tip).width + 22);
  roundRect(x, y, w, 34, 8);
  ctx.fillStyle = "rgba(16, 38, 29, 0.84)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 249, 233, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = info.color;
  ctx.fillText(info.label, x + 11, y + 13);
  ctx.fillStyle = "rgba(255, 249, 233, 0.82)";
  ctx.font = "800 10px Arial";
  ctx.fillText(info.tip, x + 11, y + 26);
  ctx.restore();
}

function drawBall(player = players[activePlayerIndex], isActive = true) {
  if (!player || !player.ball) return;
  const b = player.ball;
  if (![b.x, b.y, b.z, b.r].every(Number.isFinite)) return;
  ctx.save();
  if (isActive && shotFlash > 0) {
    ctx.strokeStyle = `rgba(255, 249, 233, ${shotFlash * 0.7})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r + 12 + (1 - shotFlash) * 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = player.holed && !isActive ? 0.56 : 1;
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = b.color || "#fffdf5";
  ctx.beginPath();
  ctx.arc(b.x, b.y - b.z, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = isActive ? "#fff9e9" : "rgba(24,32,22,0.45)";
  ctx.lineWidth = isActive ? 2.5 : 1.5;
  ctx.stroke();
  ctx.font = "900 11px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#10261d";
  if (twoPlayerMode) ctx.fillText(player.name.slice(0, 2).toUpperCase(), b.x, b.y - b.z - 15);
  ctx.restore();
}

function drawShadow(player = players[activePlayerIndex]) {
  if (!player || !player.ball) return;
  const b = player.ball;
  if (![b.x, b.y, b.z, b.r].every(Number.isFinite)) return;
  const shadowScale = clamp(1 - b.z / 110, 0.35, 1);
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${0.26 * shadowScale})`;
  ctx.beginPath();
  ctx.ellipse(b.x, b.y + 7, b.r * 1.35 * shadowScale, b.r * 0.55 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAllBalls() {
  const visiblePlayers = twoPlayerMode ? players : players.slice(0, 1);
  visiblePlayers.forEach((player) => safeDraw(() => drawShadow(player)));
  visiblePlayers.forEach((player, index) => safeDraw(() => drawBall(player, player === players[activePlayerIndex])));
}

function drawTrail(dt) {
  if (!trail.length) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < trail.length; i++) {
    const prev = trail[i - 1];
    const current = trail[i];
    const alpha = current.life * (i / trail.length) * 0.7;
    if (current.z > 8) {
      ctx.shadowColor = "rgba(255, 219, 118, 0.65)";
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = current.z > 8 ? `rgba(255, 220, 125, ${alpha})` : `rgba(255, 249, 233, ${alpha})`;
    ctx.lineWidth = current.z > 8 ? current.r + 2 : current.r;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y - (prev.z || 0));
    ctx.lineTo(current.x, current.y - (current.z || 0));
    ctx.stroke();
  }
  for (const point of trail) {
    point.life -= 0.012 * dt;
  }
  trail = trail.filter((point) => point.life > 0);
  shotFlash = Math.max(0, shotFlash - 0.035 * dt);
  ctx.restore();
}

function drawAimHints() {
  // Intentionally empty: the live aim indicator is a single clean line.
}

function drawClubShape(clubKey, scale = 1) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(-54, -4);
  ctx.stroke();
  ctx.strokeStyle = "rgba(16, 38, 29, 0.58)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(-54, -4);
  ctx.stroke();

  ctx.fillStyle = clubKey === "driver" ? "#a4422d" : isWedgeKey(clubKey) ? "#b88a37" : "#10261d";
  ctx.strokeStyle = "#fff9e9";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (clubKey === "driver") {
    ctx.ellipse(4, 0, 14, 10, 0.2, 0, Math.PI * 2);
  } else if (isWedgeKey(clubKey)) {
    ctx.moveTo(-2, -9);
    ctx.lineTo(18, -3);
    ctx.lineTo(13, 10);
    ctx.lineTo(-4, 7);
    ctx.closePath();
  } else {
    roundRect(-1, -9, 25, 14, 5);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSelectedClub(dt) {
  const visible = aiming || (clubSwing && clubSwing.life > 0);
  if (!visible || !ball || !Number.isFinite(ball.x)) return;
  const clubKey = aiming ? selectedClubKeyForShot() : clubSwing.clubKey;
  const aimShot = aiming && pointer ? shotVector() : null;
  const routeAngle = aimShot ? aimShot.baseAngle : clubSwing.angle;
  const pullRatio = aimShot ? clamp(aimShot.pull / selectedClubSpec().aim, 0, 1) : 0;
  const swingT = clubSwing && !aiming ? clamp(clubSwing.t / 1, 0, 1) : 0;
  const backswing = aiming
    ? -0.55 - pullRatio * 1.05
    : -1.35 + swingT * 2.5;
  const distanceBack = aiming ? 26 + pullRatio * 38 : 20 - swingT * 10;
  const side = -Math.PI / 2;
  const pivotX = ball.x + Math.cos(routeAngle + Math.PI) * distanceBack + Math.cos(routeAngle + side) * 20;
  const pivotY = ball.y - ball.z + Math.sin(routeAngle + Math.PI) * distanceBack + Math.sin(routeAngle + side) * 20;

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(routeAngle + backswing);
  ctx.globalAlpha = aiming ? 0.92 : Math.max(0, clubSwing.life / 26);
  ctx.shadowColor = "rgba(0, 0, 0, 0.32)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  drawClubShape(clubKey, clubKey === "driver" ? 1.12 : 1);
  ctx.restore();

  if (clubSwing && !aiming) {
    clubSwing.t += 0.22 * dt;
    clubSwing.life -= dt;
    if (clubSwing.life <= 0) clubSwing = null;
  }
}

function drawSwingTrace(dt) {
  if (!swingTrace.length) return;
  const trigger = swingAnchor();
  const active = aiming;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = active ? "rgba(255, 249, 233, 0.82)" : "rgba(255, 230, 156, 0.72)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  swingTrace.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  for (let i = 0; i < swingTrace.length; i += 1) {
    const point = swingTrace[i];
    const age = i / Math.max(1, swingTrace.length - 1);
    ctx.fillStyle = `rgba(255, 249, 233, ${0.28 + age * 0.58})`;
    ctx.strokeStyle = "rgba(16, 38, 29, 0.36)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3 + age * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (!active && swingTrace.length > 1) {
    const last = swingTrace[swingTrace.length - 1];
    const dx = last.x - trigger.x;
    const verdict = Math.abs(dx) < trigger.laneW * 0.16 ? "STRAIGHT" : dx < 0 ? "PULLED LEFT" : "PULLED RIGHT";
    const x = clamp(last.x + 12, 14, W - 120);
    const y = clamp(last.y + 12, 18, H - 42);
    ctx.font = "900 10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    roundRect(x, y, 106, 24, 7);
    ctx.fillStyle = "rgba(16, 38, 29, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 249, 233, 0.32)";
    ctx.stroke();
    ctx.fillStyle = Math.abs(dx) < trigger.laneW * 0.16 ? "#8ce276" : "#f2c14e";
    ctx.fillText(verdict, x + 9, y + 13);
  }

  ctx.restore();
}

function drawGhostShot() {
  if (!holeGhostShot || aiming || ball.moving) return;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "rgba(255, 230, 156, 0.72)";
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 10]);
  ctx.beginPath();
  ctx.moveTo(holeGhostShot.x1, holeGhostShot.y1);
  ctx.lineTo(holeGhostShot.x2, holeGhostShot.y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255, 249, 233, 0.86)";
  ctx.font = "900 10px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`LAST: ${holeGhostShot.grade}`, (holeGhostShot.x1 + holeGhostShot.x2) / 2, (holeGhostShot.y1 + holeGhostShot.y2) / 2 - 8);
  ctx.restore();
}

function drawSwingTrigger() {
  if (roundOver || transitioning || ball.moving) return;
  const trigger = swingAnchor();
  ctx.save();
  const laneX = trigger.x - trigger.laneW / 2;
  const laneY = trigger.y - 18;
  ctx.globalAlpha = aimTarget ? 0.94 : 0.72;
  const activeShot = aiming && pointer ? shotVector() : null;
  const activeZone = activeShot ? swingZoneLabel(activeShot.ratio) : "";

  const zones = [
    { label: "33%", y: laneY + trigger.laneH * 0.34, h: trigger.laneH * 0.18, color: "rgba(82, 190, 88, 0.78)", stroke: "rgba(184, 255, 160, 0.78)" },
    { label: "66%", y: laneY + trigger.laneH * 0.55, h: trigger.laneH * 0.18, color: "rgba(244, 189, 77, 0.78)", stroke: "rgba(255, 230, 156, 0.76)" },
    { label: "99%", y: laneY + trigger.laneH * 0.76, h: trigger.laneH * 0.16, color: "rgba(240, 123, 93, 0.8)", stroke: "rgba(255, 165, 140, 0.78)" },
  ];
  zones.forEach((zone) => {
    const zoneName = zone.label === "33%" ? "GREEN" : zone.label === "66%" ? "YELLOW" : "RED";
    const isActive = activeZone === zoneName;
    ctx.fillStyle = zone.color;
    ctx.strokeStyle = isActive ? "rgba(255, 249, 233, 0.92)" : zone.stroke;
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.shadowColor = isActive ? zone.stroke : "transparent";
    ctx.shadowBlur = isActive ? 12 : 0;
    roundRect(laneX + 6, zone.y, trigger.laneW - 12, zone.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(16, 38, 29, 0.82)";
    ctx.font = "900 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(zone.label, trigger.x, zone.y + zone.h / 2);
  });

  ctx.strokeStyle = "rgba(255, 249, 233, 0.26)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 9]);
  ctx.beginPath();
  ctx.moveTo(trigger.x, laneY + 6);
  ctx.lineTo(trigger.x, laneY + trigger.laneH - 6);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.setLineDash([9, 8]);
  ctx.strokeStyle = aiming ? "rgba(255, 230, 156, 0.7)" : "rgba(255, 249, 233, 0.36)";
  ctx.beginPath();
  ctx.arc(trigger.x, trigger.y, trigger.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = aiming ? "rgba(184, 138, 55, 0.22)" : "rgba(16, 38, 29, 0.11)";
  ctx.beginPath();
  ctx.arc(trigger.x, trigger.y, trigger.r - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "900 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 249, 233, 0.82)";
  ctx.fillText(aimTarget ? "SWING ZONE" : "TAP AIM", trigger.x, trigger.y - 5);
  ctx.font = "800 10px Arial";
  ctx.fillText(aimTarget ? "pull down fast" : "then swing", trigger.x, trigger.y + 12);
  ctx.restore();
}

function drawAim() {
  if (!aimTarget && (!aiming || !pointer)) return;
  const activeShot = aiming && pointer;
  const shot = activeShot ? shotVector() : null;
  const targetPoint = aimTarget || routeAimTarget(ball);

  ctx.save();
  if (activeShot && shot) {
    const powerRatio = clamp(effectivePowerRatio(shot), 0, 1);
    if (powerBar) powerBar.style.width = `${Math.round(powerRatio * 100)}%`;
    const shotClubKey = selectedClubKeyForShot();
    const powerLength = estimateShotYards(shotClubKey, Math.max(powerRatio, 0.04)) * 5;
    const dx = Math.cos(shot.baseAngle);
    const dy = Math.sin(shot.baseAngle);
    const end = {
      x: ball.x + dx * powerLength,
      y: ball.y + dy * powerLength,
    };
    const dots = clamp(Math.ceil(powerLength / 22), 2, 18);
    ctx.lineCap = "round";
    ctx.strokeStyle = selectedClub === "putter" ? "rgba(255, 250, 214, 0.72)" : "rgba(255, 230, 156, 0.66)";
    ctx.lineWidth = selectedClub === "putter" ? 4 : 3;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    for (let i = 1; i <= dots; i += 1) {
      const t = i / dots;
      const x = ball.x + dx * powerLength * t;
      const y = ball.y + dy * powerLength * t;
      const dotR = 3.4 + t * 2.8;
      ctx.fillStyle = `rgba(255, 249, 233, ${0.92 - t * 0.32})`;
      ctx.strokeStyle = `rgba(16, 38, 29, ${0.48 - t * 0.16})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.font = "900 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 249, 233, 0.92)";
    ctx.strokeStyle = "rgba(16, 38, 29, 0.72)";
    ctx.lineWidth = 4;
    const labelX = ball.x + dx * (powerLength + 22);
    const labelY = ball.y + dy * (powerLength + 22);
    const stale = swingHoldPenalty(shot) < 0.82;
    const label = stale ? `${Math.round(powerRatio * 100)}% HOLD` : `${Math.round(powerRatio * 100)}%`;
    ctx.strokeText(label, labelX, labelY);
    ctx.fillText(label, labelX, labelY);
  } else {
    ctx.strokeStyle = "rgba(255,230,156,0.76)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(targetPoint.x, targetPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "rgba(255, 230, 156, 0.96)";
  ctx.strokeStyle = "rgba(16, 38, 29, 0.62)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(targetPoint.x, targetPoint.y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawConfetti(dt) {
  for (const p of confetti) {
    p.life -= dt;
    p.vy += 0.13 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 5, 8);
  }
  confetti = confetti.filter((p) => p.life > 0);
}

function render(dt) {
  configureCanvasResolution();
  ctx.clearRect(0, 0, W, H);
  safeDraw(drawCourse);
  safeDraw(() => drawPointFeed(dt));
  safeDraw(drawGhostShot);
  safeDraw(drawSwingTrigger);
  safeDraw(() => drawSwingTrace(dt));
  safeDraw(drawAim);
  safeDraw(drawAimHints);
  safeDraw(() => drawSelectedClub(dt));
  safeDraw(() => drawTrail(dt));
  safeDraw(drawAllBalls);
  safeDraw(() => drawConfetti(dt));
  if (players.every((player) => !player.ball || !Number.isFinite(player.ball.x))) {
    drawStartupFallback();
  }
}

function drawStartupFallback() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1f7542";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fffdf5";
  ctx.beginPath();
  ctx.arc(140, H - 122, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#101914";
  ctx.beginPath();
  ctx.arc(W - 160, 145, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff9e9";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W - 150, 145);
  ctx.lineTo(W - 150, 76);
  ctx.stroke();
}

function loop(now) {
  const dt = Math.min(2.4, (now - lastTime) / 16.67);
  lastTime = now;
  updateMusicProximity();
  updatePhysics(dt);
  updateTutorialQueue(dt);
  maybeBlokeCourseComment();
  render(dt);
  if (messageTimer > 0) messageTimer -= dt;
  requestAnimationFrame(loop);
}

document.querySelectorAll(".club").forEach((button) => {
  button.addEventListener("click", () => {
    wakeSound();
    selectedClub = button.dataset.club;
    syncClubUi(true);
  });
});

shotModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    wakeSound();
    wedgeShotMode = button.dataset.shot === "chip" ? "chip" : "flop";
    selectedClub = "wedge";
    syncClubUi(true);
  });
});

menuTabs.forEach((button) => {
  button.addEventListener("click", () => {
    wakeSound();
    showMenuTab(button.dataset.menuTab);
  });
});

const restartButton = document.getElementById("restart");
if (introEnter) introEnter.addEventListener("click", () => {
  enterFullscreenOrExpand("Fullscreen blocked, so we stretched the game to fill the screen.");
  if (introGate) introGate.classList.add("hidden");
  mainMenuAudioReady = true;
  wakeSound();
  setToastOnly("Welcome to Blokes Mini Golf.", 100);
});
if (restartButton) restartButton.addEventListener("click", () => {
  mainMenuAudioReady = true;
  wakeSound();
  roundOver = true;
  if (startMenu) startMenu.classList.remove("hidden");
  setMessage("New round menu. Choose your next mistake.");
});
if (startMatchButton) startMatchButton.addEventListener("click", () => {
  mainMenuAudioReady = true;
  wakeSound();
  startTwoPlayerMatch();
});
if (leaderboardShortcut) leaderboardShortcut.addEventListener("click", () => {
  mainMenuAudioReady = true;
  wakeSound();
  showMenuTab("records");
});
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedPlayerCount = Number(button.dataset.mode);
    modeButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
    syncBallPickerVisibility();
  });
});
ballSwatches.forEach((button) => {
  button.addEventListener("click", () => {
    const player = Number(button.dataset.player);
    const color = button.dataset.color;
    if (!player || !color) return;
    chosenBallColors[player] = color;
    ballSwatches.forEach((swatch) => {
      if (Number(swatch.dataset.player) === player) swatch.classList.toggle("active", swatch === button);
    });
    const livePlayer = players[player - 1];
    if (livePlayer && livePlayer.ball) livePlayer.ball.color = color;
  });
});
if (courseSelect) courseSelect.addEventListener("change", () => {
  currentCourseIndex = Number(courseSelect.value);
  renderLeaderboard();
  setMessage(`${courses[currentCourseIndex].name}. Fresh nonsense selected.`);
});
window.addEventListener("online", updateOfflineStatus);
window.addEventListener("offline", updateOfflineStatus);
window.addEventListener("resize", updateCompactEmbedMode);
if (soundToggle) soundToggle.addEventListener("click", toggleSound);
if (fullscreenToggle) fullscreenToggle.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isExpanded()) {
    gameCard.classList.remove("app-fullscreen");
    document.body.classList.remove("game-expanded");
    updateFullscreenButton();
  }
});

if ("PointerEvent" in window) {
  canvas.addEventListener("pointerdown", beginAim);
  canvas.addEventListener("pointermove", moveAim);
  canvas.addEventListener("pointerup", endAim);
  canvas.addEventListener("pointercancel", endAim);
} else {
  canvas.addEventListener("mousedown", beginAim);
  window.addEventListener("mousemove", moveAim);
  window.addEventListener("mouseup", endAim);
  canvas.addEventListener("touchstart", beginAim, { passive: false });
  window.addEventListener("touchmove", moveAim, { passive: false });
  window.addEventListener("touchend", endAim, { passive: false });
  window.addEventListener("touchcancel", endAim, { passive: false });
}

syncBallPickerVisibility();
syncClubUi(false);
drawStartupFallback();
newHole(false);
roundOver = true;
updateSoundButton();
updateOfflineStatus();
updateCompactEmbedMode();
renderLeaderboard();
if (window.location.hash === "#records") showMenuTab("records");
requestAnimationFrame(loop);
