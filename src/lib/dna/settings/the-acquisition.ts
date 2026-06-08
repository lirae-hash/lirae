import type { SettingSheet } from "@/types/database";

export const THE_ACQUISITION: SettingSheet & {
  id: string;
  title: string;
  trope: string;
  blurb: string;
  slots: Record<string, string>;
  vibeNotes: Record<string, string>;
  generationNotes: string[];
} = {
  id: "the-acquisition",
  title: "The Acquisition",
  trope: "enemies-to-lovers",
  blurb: "You're the heir to a media empire and the only person who's ever beaten Adrian Vale. Now his firm has launched a hostile takeover of everything you built — and thirty days locked in a room with him will decide who walks away with it all.",
  heroName: "Adrian Vale",
  setting: "High-finance Manhattan — rival family business empires",
  worldDetails: {
    timePeriod: "Contemporary",
    hisRole: "Adrian Vale — CEO of Vale Capital, old money, the most controlled man in any room. Your family's biggest rival, and the man whose company just launched a hostile takeover of yours. As the acquirer, he controls the terms — and the clock.",
    yourRole: "You are not a poor girl swept up by a rich man. You are the heir and acting CEO of your family's media empire — powerful in your own right, sharp, and the only person who's ever beaten Adrian Vale at anything. Now he's trying to take everything you built.",
    herRole: "You are not a poor girl swept up by a rich man. You are the heir and acting CEO of your family's media empire — powerful in your own right, sharp, and the only person who's ever beaten Adrian Vale at anything. Now he's trying to take everything you built.",
    theirHistory: "Five years ago, at the deal that made both your names, you outmaneuvered him publicly and cost him a billion-dollar acquisition. He's never forgotten it. Neither have you. The press calls you rivals. They don't know the half of it.",
    whatYouWant: "To defend your empire and destroy Adrian Vale's takeover — to prove, once and for all, that you are not your father's caretaker daughter but the most formidable player in the room.",
    theRealReason: "The hostile takeover isn't an attack — it's a shield. Your company is the secret target of a corporate raider who'll gut it; Adrian moved first to keep it out of their hands, intending to hand it back to you. He couldn't tell you because you'd never have believed him, and the raider was watching.",
  },
  slots: {
    // Beat 1
    "LOCATION": "A black-tie gala at the Met, the night the takeover hits the news. You see him across the room before the announcement even reaches your phone.",
    "THE DETAIL": "The way he doesn't look away when you catch him watching — unhurried, certain, like he already knows how this ends. You hate that it works on you.",

    // Beat 2
    "PROXIMITY CATALYST": "The board forces mediation: thirty days of locked-room negotiation, just the two of you and your lawyers, before either side can go to war publicly.",
    "CLOSE QUARTERS SCENE": "Hour fourteen, the lawyers sent home, just the two of you and a whiteboard and cold coffee. You both reach for the same marker; his hand closes over yours and the negotiation stops for exactly three seconds while neither of you lets go.",
    "THE THING YOU NOTICE": "That he reads you like a balance sheet — and that he's the only opponent who's ever bothered to. The precise cut of his restraint. The way he listens, fully, like every word you say is leverage he intends to keep.",

    // Beat 3
    "THE SHARED GOAL": "A leak threatens both your companies' stock; you have to coordinate a joint response in a single night or you both lose billions. You're brilliant together and you both hate how obvious it is.",
    "HIS COMPETENCE": "The speed. He sees three moves ahead and makes the call without flinching, and when you counter he doesn't argue — he adjusts, instantly. It's the most attractive thing you've ever watched a man do in a suit.",
    "YOUR COMPETENCE": "Your read on the room the market can't see — the narrative, the human angle, the headline that turns a panic into a story. You write the statement in one take and his eyebrows go up and he says nothing, which from him is a standing ovation.",
    "THE MOMENT IT SHIFTS": "4am, the stock stabilized, the two of you alone in the war room with the city going gray in the glass. He loosens his tie at last and says, \"We're very good at this together,\" and means more than the deal, and you both pretend he didn't.",

    // Beat 4
    "THE CRACK SCENE": "You find him alone in the boardroom at 3am, tie undone, staring at a photo on his phone — his late mother, who built Vale Capital from nothing. He's not the machine the press describes.",
    "WHAT YOU SEE": "Grief, and the weight of a legacy he didn't choose. The most controlled man in New York holding a cracked phone screen like it's the last warm thing he owns.",
    "YOUR CHOICE": "You could use it — a man who loved his mother is a man with a lever. You don't. You set a fresh coffee at his elbow and leave without a word. He notices that you didn't.",

    // Beat 5
    "THE ALMOST SCENE": "His penthouse, after a brutal negotiation, the city glittering below. He pours you a drink older than you are. The distance between you becomes the only thing in the room.",
    "WHO MOVES": "Neither, for the longest minute of your life. Then he sets down his glass and steps in, slow, giving you every chance to stop him. You don't.",
    "THE INTERRUPTION": "His phone — the raider's name on the screen. His face shutters. He takes the call in the other room and you let yourself out.",

    // Beat 6
    "WHAT YOU FIND": "Encrypted documents your head of security pulls — Adrian's firm has been quietly buying your debt for months. It looks like the kill shot. It looks like betrayal.",
    "THE WARM THING RECONTEXTUALISED": "The penthouse. The drink older than you. The way he stepped in like he meant it. All of it, now, reads as a man softening his mark before the strike.",
    "WHERE YOU ARE WHEN YOU FIND IT": "Your own office at midnight, your security chief's laptop open, the city you're supposed to be saving lit up and indifferent below you.",

    // Beat 7
    "WHERE THE CONFRONTATION HAPPENS": "His office at dawn, you walking in past his assistant and throwing the documents on his desk. He doesn't deny it. He just says, \"You're not seeing all of it.\"",
    "HIS UNEXPECTED RESPONSE": "No defense, no charm. He says, \"Everything I built this quarter, I built to put between you and something worse. You can keep pointing that at me, or you can let me show you what's actually coming.\"",

    // Beat 8
    "THE REAL REASON": "The takeover was never an attack — it was a shield. A corporate raider has been hunting your company to strip it for parts; Adrian moved first, buying your debt and launching the bid to lock the raider out, planning to hand control back to you once the threat cleared. He couldn't tell you — you'd never have believed him, and the raider was watching every move.",
    "THE PROOF": "He shows you the raider's full plan — and the clause in his takeover that returns full control to you the moment the threat clears. He spent a billion dollars to protect the company you built. He never meant for you to know.",
    "THE PHYSICAL SHIFT": "You come around the desk to read the clause yourself and don't step back when you're done. His hand finds the small of your back; you let it stay. Neither of you pretends it's about the document.",

    // Beat 9
    "THE SURRENDER SCENE": "Your own office, late, the city dark, the war finally over. He comes to you this time — onto your turf, which he's never done.",
    "THE FINAL CATALYST": "He says: \"I have spent five years losing to you on purpose, in every way that mattered. I'm done pretending I don't want to.\"",

    // Beat 10
    "THE CLOSING MIRROR SCENE": "Another gala, another ballroom, one year later. The press still calls you rivals. You let them. You know better.",
    "THE SEASON 2 SEED": "A merger proposal lands on both your desks — combine the empires. It would make you the most powerful couple in the country. He asks: \"Partners? Or are you still afraid you'd win?\"",
  },
  vibeNotes: {
    dark: "Dark Desire — glass towers at night, the penthouse above a glittering grid, power and shadow, the city as a held breath.",
    gold: "Golden Hour — the galas, champagne and chandeliers, gold leaf and old wealth, the warm hum of a room that runs on money.",
    rose: "Midnight Rose — the charged negotiations, the slow strip of his control, the heat under the tailoring.",
    sage: "Emerald Envy — old-money opulence, emerald and brass, leather and legacy, the weight of names carved over doors.",
  },
  generationNotes: [
    "This is the POWER-COUPLE fantasy — she has status equal to his. NEVER write her as needing rescue or financially dependent. She is a CEO and the only person who's ever beaten him.",
    "The tension is two equals who can't admit they've met their match. Razor-sharp banter — these two negotiate for a living; every line is leverage and flirtation at once.",
    "His control is the whole game. Readers crave watching it slip — make each crack cost him something.",
    "Money and power are texture, not the point. The point is two people who only feel truly seen across a negotiating table.",
  ],
};
