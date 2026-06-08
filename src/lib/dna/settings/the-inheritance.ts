import type { SettingSheet } from "@/types/database";

export const THE_INHERITANCE: SettingSheet & {
  id: string;
  title: string;
  trope: string;
  blurb: string;
  slots: Record<string, string>;
  vibeNotes: Record<string, string>;
  generationNotes: string[];
} = {
  id: "the-inheritance",
  title: "The Inheritance",
  trope: "enemies-to-lovers",
  blurb: "You're the journalist who got too close to the Ashbournes — and now you're named in the patriarch's will, trapped inside the estate for thirty days with the dangerous man who's spent a year destroying you. He wants you gone. You don't scare.",
  heroName: "Damon Ashbourne",
  setting: "An old-money estate and the powerful, secretive family that controls it",
  worldDetails: {
    timePeriod: "Contemporary (gothic atmosphere)",
    hisRole: "Damon Ashbourne — head of the Ashbourne family, a dynasty whose wealth has very dark roots. Controlled, calculating, genuinely dangerous. He is not a nice man. He is trying to ruin you — and you don't yet know why. As executor of the will, he controls every door in the house.",
    yourRole: "You're an investigative journalist who got too close to the Ashbourne family's secrets. Now you've been named, inexplicably, in the will of the family's late patriarch — which traps you inside the estate for the reading and its aftermath, surrounded by people who want you gone. You have a spine of steel and no intention of being intimidated.",
    herRole: "You're an investigative journalist who got too close to the Ashbourne family's secrets. Now you've been named, inexplicably, in the will of the family's late patriarch — which traps you inside the estate for the reading and its aftermath, surrounded by people who want you gone. You have a spine of steel and no intention of being intimidated.",
    theirHistory: "Your reporting destroyed an Ashbourne business deal and, indirectly, exposed a family member. Damon blames you for a death. He has spent a year methodically dismantling your career — getting you blacklisted, discredited, isolated. You walked into his house anyway.",
    whatYouWant: "To find out why you're in that will, get the story that clears your name, and walk out of the Ashbourne estate with the truth — without losing yourself to the people who want to bury you in it.",
    theRealReason: "The death wasn't your fault — and Damon has known that for months. He kept ruining you because the moment he stopped, the real culprit (his own brother) would know Damon suspected him. Destroying you was the only thing keeping you alive and off the brother's radar. His cruelty was a cage he built to protect you.",
  },
  slots: {
    // Beat 1
    "LOCATION": "The will reading, in the cavernous library of Ashbourne Hall. Rain on the tall windows. He's standing by the fireplace when you walk in, and the room goes cold.",
    "THE DETAIL": "A scar along his knuckles you weren't expecting — proof this controlled man has, at some point, lost control completely. You file it away. You wish you hadn't noticed the rest of him.",

    // Beat 2
    "PROXIMITY CATALYST": "The will's terms require you to remain at the estate for thirty days to claim what you've been left — and Damon, as executor, controls every door.",
    "CLOSE QUARTERS SCENE": "A narrow servants' stair you take to avoid the family, and him coming down it at the same moment. There's no room to pass. For three steps you're chest to chest in the dark, his hand braced on the wall beside your head, and neither of you breathes.",
    "THE THING YOU NOTICE": "That the cold he wears is a performance — and that you can see the exact seam where it's stitched on. The stillness of a man holding something down with both hands.",

    // Beat 3
    "THE SHARED GOAL": "Someone tampers with the estate's accounts to frame you for theft; clearing it means the two of you working the family's secrets together, trusting no one else in the house.",
    "HIS COMPETENCE": "How completely he controls the board. He knows which servant lies, which cousin listens at doors, which lawyer is bought. He moves through his own family like a man defusing a bomb he built.",
    "YOUR COMPETENCE": "The thing that made you dangerous to him in the first place: you find the one thread no one else sees and you pull. You crack the doctored ledger in a single night because you've read a hundred like it.",
    "THE MOMENT IT SHIFTS": "Two a.m. in the records room, the frame undone, and he looks at you across the lamplight with something that isn't hatred for the first time. \"You're very good at this,\" he says — like an accusation, like a confession.",

    // Beat 4
    "THE CRACK SCENE": "You find him in the old chapel at night, not praying — just sitting, undone, in front of a memorial. The most dangerous man you know, completely alone with his grief.",
    "WHAT YOU SEE": "The weight he carries when no one's watching. Not the monster the family fears — a man being crushed slowly by something he can't put down, in front of a name carved in marble.",
    "YOUR CHOICE": "You have your recorder in your pocket. You don't reach for it. You stand in the chapel doorway until he knows you're there, and you say nothing, and you let him keep his grief unprinted.",

    // Beat 5
    "THE ALMOST SCENE": "The library again, a thunderstorm, the power out, one candle. He backs you against the shelves — not to threaten you, but because neither of you can stand the distance anymore.",
    "WHO MOVES": "He does, and then stops himself, his hand flat against the books beside your face, close enough that you feel the war he's fighting. You're the one who tips your chin up.",
    "THE INTERRUPTION": "Footsteps in the hall — his brother. Damon steps back into the dark and becomes the cold stranger again, instantly, completely.",

    // Beat 6
    "WHAT YOU FIND": "Evidence that Damon orchestrated your blacklisting personally — names, dates, payments. The man you were starting to trust has been the one destroying you all along.",
    "THE WARM THING RECONTEXTUALISED": "The chapel. The candle. The way he looked at you in the records room. Every thawing moment now reads as the long con of a man who has been engineering your ruin, in writing, the whole time.",
    "WHERE YOU ARE WHEN YOU FIND IT": "Alone in the estate's locked archive at 1am where you were never meant to be, rain on the high windows, his signature on the page in your shaking hand.",

    // Beat 7
    "WHERE THE CONFRONTATION HAPPENS": "His study, you with the proof in your hand, ready to walk out and burn his family to the ground. He doesn't deny it. He says, \"If you publish that, you'll be dead within the week. Sit down.\"",
    "HIS UNEXPECTED RESPONSE": "Not denial. Not apology. He says it flat, like a man reading you your own obituary: \"Everything I did to you, I did to keep you breathing. I needed you to be angry at me. It's the only thing that's worked.\"",

    // Beat 8
    "THE REAL REASON": "The death you were blamed for wasn't your fault — and Damon has known for months. He kept ruining you because the instant he stopped, the real culprit — his own brother — would realize Damon suspected him and come for the person who started it all: you. His cruelty was a wall. Every terrible thing he did was the only thing keeping the brother's eyes off you.",
    "THE PROOF": "He shows you the surveillance — his brother, the real culprit, and the file proving Damon's cruelty was the wall keeping you off the brother's radar. Every terrible thing he did to you was the only thing keeping you breathing.",
    "THE PHYSICAL SHIFT": "When you finally understand, the fight goes out of both of you at once. He closes the distance he's policed for thirty days and rests his forehead against yours, and lets you feel, for one second, exactly what it has cost him to be hated by you.",

    // Beat 9
    "THE SURRENDER SCENE": "The estate at night, the brother finally handled, the danger broken. For the first time the cage is open and neither of you has to perform anymore.",
    "THE FINAL CATALYST": "He says: \"I made the whole world believe I wanted you destroyed. It was the only way to keep you. I'm not sorry. Hate me if you want — but you're alive.\"",

    // Beat 10
    "THE CLOSING MIRROR SCENE": "The library where it started. Same rain, same fire. But the doors are open now, and you're choosing to stay.",
    "THE SEASON 2 SEED": "Your editor wants the Ashbourne exposé — the story that would make your career and end his family. He says: \"Write it. I'll stand beside you when it runs. Or don't. But decide who you are before you do.\"",
  },
  vibeNotes: {
    dark: "Dark Desire — the gothic estate, candlelight and cold rooms, storms against tall glass, shadow and real danger. This is the native vibe.",
    gold: "Golden Hour — the rare warm moments that cut through the cold: firelight, a single lamp, a held breath. They hit harder here for being so few.",
    rose: "Midnight Rose — the forbidden, dangerous intimacy of wanting the one person you absolutely should not.",
    sage: "Emerald Envy — old-money darkness, emerald and black, secrets in the walls, the green-black hush of a house that has buried things.",
  },
  generationNotes: [
    "This is the DARK / morally-gray one. Damon is genuinely dangerous and actually does bad things — NOT a softie pretending. Keep him morally gray.",
    "CONTENT CEILING: stay at the spice ceiling — charged, dangerous tension, fade to black — never explicit.",
    "NEVER glorify genuine abuse. His cruelty must ultimately resolve as protection, and SHE always keeps her agency and her spine. No doormat heroine; no romanticizing real harm.",
    "The fantasy is intensity and obsession safely contained — a powerful, controlled man who is a wreck for her underneath the cold.",
    "Ashbourne Hall is a character: rain, candlelight, locked doors, marble and old wood, the constant sense of being watched.",
  ],
};
