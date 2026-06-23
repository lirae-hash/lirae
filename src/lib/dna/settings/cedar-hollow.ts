import type { SettingSheet } from "@/types/database";

export const CEDAR_HOLLOW: SettingSheet & {
  id: string;
  title: string;
  trope: string;
  blurb: string;
  slots: Record<string, string>;
  vibeNotes: Record<string, string>;
  generationNotes: string[];
} = {
  id: "cedar-hollow",
  title: "Cedar Hollow",
  trope: "enemies-to-lovers",
  blurb: "You swore you'd never come back. Now you're home to settle your grandmother's estate — and the boy you left, the one who never fought for you to stay, is the only man standing between you and leaving again.",
  heroName: "Eli Crane",
  setting: "A small lakeside town in the Pacific Northwest",
  worldDetails: {
    timePeriod: "Contemporary",
    hisRole: "Eli Crane — runs the family hardware store and sits on the town council. Steady, dry-humored, deeply rooted here. The boy you grew up next to, now a man who never left. As council liaison, he has to sign off on every repair before your sale can close.",
    yourRole: "You left Cedar Hollow at eighteen and swore you'd never come back. Now you're a city architect, returned to handle your late grandmother's lakehouse — and the town council (his council) is blocking the development sale you need to close so you can leave again.",
    herRole: "You left Cedar Hollow at eighteen and swore you'd never come back. Now you're a city architect, returned to handle your late grandmother's lakehouse — and the town council (his council) is blocking the development sale you need to close so you can leave again.",
    theirHistory: "You and Eli were inseparable as kids — then, the summer before you left, something broke. He didn't fight for you to stay. He let you go without a word, and you've spent ten years telling yourself it didn't matter. He's spent ten years regretting the thing he never said.",
    whatYouWant: "To close the sale, settle your grandmother's estate, and get back to your real life in the city — to prove to yourself that leaving was the right call and this town has no hold on you anymore.",
    theRealReason: "He didn't ask you to stay because his father was dying and he couldn't ask you to give up your future to share his grief. He thought letting you go was loving you. He never told anyone.",
  },
  slots: {
    // Beat 1
    "LOCATION": "The town council meeting in the old library, your first night back. You walk in to present your sale; he's at the head of the table.",
    "THE DETAIL": "His hands around a coffee mug — the same hands that taught you to skip stones, bigger now, steadier. You look away too fast.",

    // Beat 2
    "PROXIMITY CATALYST": "The estate can't be sold until the lakehouse passes inspection — and Eli, as council liaison, has to sign off on every repair. You're stuck working alongside him for three weeks.",
    "CLOSE QUARTERS SCENE": "The lakehouse attic on a gray Saturday, the two of you wedged between your grandmother's boxes trying to brace a water-damaged beam. The space is low and close. You both reach for the same crowbar and your hand lands on top of his, and for a second too long neither of you moves.",
    "THE THING YOU NOTICE": "The way he still says your name like it's a complete sentence. The way he knows which floorboards creak without looking down.",

    // Beat 3
    "THE SHARED GOAL": "A storm damages the town dock the week of the Founders' Festival; you're the only architect for sixty miles and he's the only one who can rally the town. You rebuild it together.",
    "HIS COMPETENCE": "The way the whole town moves when he asks. He never raises his voice — he just shows up with a truck of lumber and people fall in behind him. A quiet authority you didn't expect from the boy next door.",
    "YOUR COMPETENCE": "Your eye. You look at the broken dock and see not just the repair but what it could be, and you sketch it on the back of a feed-store receipt in three minutes — and it's better than anything this town has ever had.",
    "THE MOMENT IT SHIFTS": "Sundown, the last piling set, both of you soaked and laughing before you can stop yourselves. He hands you the cap of his thermos, coffee gone lukewarm, and the festival lights flick on behind him, and for one second it's ten years ago and nothing ever broke.",

    // Beat 4
    "THE CRACK SCENE": "You find him at the cemetery at dusk, at his father's grave, talking to it quietly. He doesn't know you're there.",
    "WHAT YOU SEE": "Grief he has never let this town see. The careful, capable man undone — telling a headstone about the dock, about you being back, in a voice that keeps cracking.",
    "YOUR CHOICE": "You step back into the trees and let him have it. You don't say a word. But you can't un-hear what he said about you.",

    // Beat 5
    "THE ALMOST SCENE": "On the newly rebuilt dock after the festival, everyone gone home, the string lights still up. He almost says the thing he's held for ten years.",
    "WHO MOVES": "He does — half a step, his hand coming up like he might tuck the hair back from your face the way he used to. You don't step back.",
    "THE INTERRUPTION": "Your phone — the city firm, the job that's waiting. You answer it. He nods once and walks back up the hill.",

    // Beat 6
    "WHAT YOU FIND": "Your grandmother's letters in the attic — and one she never sent, telling you that Eli came to her every month for ten years just to ask how you were doing.",
    "THE WARM THING RECONTEXTUALISED": "Every easy, friendly, careful thing he's done these three weeks. He's been holding himself back on purpose — not because he doesn't feel it, but because he decided, again, that he won't be the reason you stay.",
    "WHERE YOU ARE WHEN YOU FIND IT": "On the attic floor at midnight, dust turning in the lamplight, your grandmother's handwriting in your lap and the half-taped moving boxes closing in around you.",

    // Beat 7
    "WHERE THE CONFRONTATION HAPPENS": "The porch of the lakehouse in the rain. You ask him why he let you leave. He finally stops being careful.",
    "HIS UNEXPECTED RESPONSE": "He doesn't dress it up. \"My father was dying. I had maybe a year of him left and no right to ask you to spend it here watching me lose him. Letting you go was the only way I knew how to love you. I'd do it again. I'd hate it again.\"",

    // Beat 8
    "THE REAL REASON": "His father was dying that last summer. He couldn't ask you to give up the future you'd planned to stay and share his grief — so he let you go without a word and told himself that was love. He never said it out loud to anyone, not even your grandmother.",
    "THE PROOF": "He takes you to the hardware store's back office and shows you a drawer of newspaper clippings — every article about your buildings, your career, ten years of them, kept.",
    "THE PHYSICAL SHIFT": "In the cramped back office there's suddenly no space left to keep. He cups your face the way he didn't on the dock; you let your forehead drop to his chest and feel him breathe.",

    // Beat 9
    "THE SURRENDER SCENE": "The lakehouse kitchen, the night before you're meant to drive back to the city. The sale papers on the table, unsigned.",
    "THE FINAL CATALYST": "He says: \"I let you go once because I thought it was the right thing. Ask me to do it again. I dare you.\"",

    // Beat 10
    "THE CLOSING MIRROR SCENE": "The council library, one season later. You walk in — but this time you're presenting a plan to restore the lakehouse, not sell it.",
    "THE SEASON 2 SEED": "The city firm offers you the partnership you always wanted — in another state. He says: \"I'm not letting you go quietly this time. So what do we do?\"",
  },
  vibeNotes: {
    gold: "Golden Hour — the lake at sunset, warm porch light, the Founders' Festival, the long gold of small-town summer evenings.",
    dark: "Dark Desire — the storm off the lake, rain hammering the porch roof, the cemetery at dusk, the ache of a town holding its breath.",
    rose: "Midnight Rose — the tender, aching intimacy of a town that knows everything about you, soft-lit and close.",
    sage: "Emerald Envy — the Pacific Northwest itself: black pines, deep water, fog in the firs, the green quiet that swallows sound.",
  },
  generationNotes: [
    "This is the WARM one — second-chance, not a power struggle. The conflict is emotional and historical, never corporate.",
    "NO miscommunication-as-plot. The distance between you came from a real, understandable choice Eli made (his dying father) — never a dumb misunderstanding one honest sentence would fix.",
    "Small-town texture everywhere: everyone knows your business — the diner, the hardware store, the festival, the lake, the gossip.",
    "He is rooted and steady; let his love show in what he does, not speeches — until the porch, where he finally says it.",
  ],
};
