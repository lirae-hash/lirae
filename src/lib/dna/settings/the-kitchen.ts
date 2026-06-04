import type { SettingSheet } from "@/types/database";

export const THE_KITCHEN: SettingSheet & {
  id: string;
  title: string;
  trope: string;
  blurb: string;
  slots: Record<string, string>;
  vibeNotes: Record<string, string>;
  generationNotes: string[];
} = {
  id: "the-kitchen",
  title: "The Kitchen",
  trope: "enemies-to-lovers",
  blurb: "A pastry chef with a score to settle. The chef who destroyed her reputation. One Michelin-starred kitchen. Paris.",
  heroName: "Julian Voss",
  setting: "Michelin-starred restaurant world, Paris",
  worldDetails: {
    timePeriod: "Contemporary",
    hisRole: "Executive Chef and sole owner of Le Sorel — three Michelin stars, year-long waitlists, his face on every magazine that covers food as art. He runs his kitchen with exacting precision. He is not cruel, just exact. Nothing gets past him.",
    yourRole: "Newly hired Head Pastry Chef. Your desserts have made your reputation in London — technically extraordinary, emotionally devastating. You came to Paris because it was the best offer you had after the Lyon situation. You do not know yet that he engineered your being here.",
    herRole: "Newly hired Head Pastry Chef. Your desserts have made your reputation in London — technically extraordinary, emotionally devastating. You came to Paris because it was the best offer you had after the Lyon situation. You do not know yet that he engineered your being here.",
    theirHistory: "Two years ago at a culinary competition in Lyon, he was the lead judge. You were the frontrunner. He scored your signature dish a 7 — precise enough to be defensible, low enough to cost you first place. In his published notes he wrote: \"technically impressive but emotionally empty.\" The phrase followed you everywhere. You rebuilt your career around proving it wrong.",
    whatYouWant: "To prove him wrong. To make something at Le Sorel so undeniably brilliant that his words become a footnote. To show the culinary world — and yourself — that \"emotionally empty\" was the lie of a man who couldn't handle what he tasted.",
    theRealReason: "He scored you honestly as he saw it that day — but what he saw was that your work was reaching for something his couldn't. The note was self-protection dressed as criticism. He has thought about that dish every week since. He hired you because he needed to know if he was right. He already suspects he wasn't.",
  },
  slots: {
    // Beat 1
    "LOCATION": "The tasting kitchen at Le Sorel. Your first day. Late October afternoon, the kitchen not yet lit for service.",
    "THE DETAIL": "His hands. You notice them before his face — the way he handles a small knife while talking to a sous chef, without looking down, the way someone does when a tool has been part of them for thirty years. You wish you hadn't noticed.",

    // Beat 2
    "PROXIMITY CATALYST": "The restaurant's previous pastry chef quit four days before you arrived — a fact no one mentioned in your interview. The relaunch tasting menu goes live in three weeks. He needs you in the kitchen from 7am to midnight, every day, until it's ready. There is no professional distance in a kitchen this size.",
    "CLOSE QUARTERS SCENE": "The kitchen pass at 11pm after a long test service. Everyone else has gone. You're the last two plating a dessert component. You turn from the counter and his chest is five inches from your shoulder. He doesn't step back. Neither do you. He reaches past you for a spoon.",
    "THE THING YOU NOTICE": "The way he moves through the kitchen — never rushed, never wasted motion, like the space was designed around him.",

    // Beat 3
    "THE SHARED GOAL": "A Michelin inspector has made an unannounced visit — word travels fast in Paris kitchens. You have four days to rebuild the dessert section of the tasting menu from scratch. He pulls you into his office and says: \"Tell me what you need.\" It is the first time he's asked you anything.",
    "HIS COMPETENCE": "His palate. The way he can taste a component and know exactly what's missing without being told what it's supposed to be.",
    "YOUR COMPETENCE": "Your instinct for emotion in food. The way you build a dessert that tells a story without explaining it.",
    "THE MOMENT IT SHIFTS": "Night two, 2am. You've made something new — not on the plan, just an instinct. He walks through, stops, picks up the spoon without asking. Tastes it. Closes his eyes for three full seconds. Sets the spoon down and walks out without saying a word. You watch him go. That silence is the first honest thing between you.",

    // Beat 4
    "THE CRACK SCENE": "You arrive at 6am to find him in the walk-in cold room, sitting on an overturned milk crate, still in his street clothes, staring at nothing. He doesn't hear you come in. You have never seen him not in motion before. You back out without speaking. He never mentions it.",
    "WHAT YOU SEE": "Exhaustion. Real exhaustion, not the performative kind chefs wear like medals. Something weighing on him that has nothing to do with the kitchen.",
    "YOUR CHOICE": "You don't mention it. You don't use it. You just know.",

    // Beat 5
    "THE ALMOST SCENE": "The inspector's dinner is finished. The review will be good — you know it from the way the room felt. The kitchen empties in twenty minutes, everyone heading to the bar two streets over. He doesn't go. You don't go. He opens a bottle you've never seen on the shelf — something old, something he's been saving — and pours two glasses at the pass. The kitchen lights are down to half. He says your name. Your first name. Not Chef. You realize it's the first time you've heard it in his voice.",
    "WHO MOVES": "Neither. Both. The space between you shrinks without anyone stepping.",
    "THE INTERRUPTION": "His phone. His business partner calling from New York. His face closes like a shutter. He sets the glass down, picks up the call, turns a quarter away. You look at the wine for a moment. Then you pick up your coat and your bag and walk out, quietly, while he's still talking.",

    // Beat 6
    "WHAT YOU FIND": "A printed email in the office printer tray — you only see it because you're looking for paper. His business partner, written two months before you were hired: \"Are you sure about the Lyon woman? It'll be complicated.\" His reply: \"She'll either prove me right or prove me wrong. Either way I want her in my kitchen to find out.\"",
    "THE WARM THING RECONTEXTUALISED": "The tasting. The silence. The wine. All of it was research.",
    "WHERE YOU ARE WHEN YOU FIND IT": "Standing at the printer. The kitchen is loud thirty feet away. You read it three times. You put it back exactly where you found it and finish your shift.",

    // Beat 7
    "WHERE THE CONFRONTATION HAPPENS": "The roof of the building at 5am, after the worst service of the month. A supplier failure, a disaster mid-course, a table that complained. Both of you are standing in the cold with nowhere left to perform. Paris is pale below you. You say: \"The Lyon email. The printer.\" He doesn't deny it.",
    "HIS UNEXPECTED RESPONSE": "He doesn't justify. He doesn't explain. He says: \"I know what I wrote about you in Lyon. I need you to understand I meant it at the time. I don't anymore.\"",

    // Beat 8
    "THE REAL REASON": "He takes you to Lyon. To the competition archive — they keep recordings. You watch yourself plate the dish on a laptop screen in a café. Then he turns the screen toward himself and watches his own face while he tasted it. You see the moment in the recording when his expression changes. He doesn't explain it. He says: \"I was afraid of you. I've been afraid of you since the first mouthful. I wrote the only thing that would make me feel less afraid.\"",
    "THE PROOF": "The recording. His face. The moment you can see him recognize something in your work that threatened him.",
    "THE PHYSICAL SHIFT": "On the train back to Paris, you fall asleep. When you wake up, your head is on his shoulder. He hasn't moved.",

    // Beat 9
    "THE SURRENDER SCENE": "Your section of the kitchen. Midnight. The restaurant is dark. You're finishing the last component of a new dish — the first one at Le Sorel that is entirely yours, that you designed from nothing. He comes in through the back. You don't hear him until he's at the counter. \"You're still here,\" you say. \"So are you,\" he says. You push the plate toward him.",
    "THE FINAL CATALYST": "He tastes it. He sets the spoon down. He looks at you. He says: \"This is the dish I should have given a ten.\" You turn around fully. He is very close. You say: \"I know.\"",

    // Beat 10
    "THE CLOSING MIRROR SCENE": "The tasting kitchen, late October afternoon. One year later. The same low light you walked into on your first day. The same steel and quiet. You are putting on your apron. He walks in, stops, looks at you the way he looked at you that first day — but different now. You know what he sees.",
    "THE SEASON 2 SEED": "Le Sorel has been offered a location in Tokyo. He has accepted. He is going in March. He asks you across the pass, very simply: \"Bring your knives or stay. But tell me now, because I need to know before I book two seats.\"",
  },
  vibeNotes: {
    dark: "The kitchen after service — industrial steel, low light, shared exhaustion. The intimacy of two people who have spent twelve hours doing something hard together.",
    gold: "Paris visible through high windows. Morning light through the kitchen's small skylight during the first hour. The warmth of a place that runs on discipline and love simultaneously.",
    rose: "The pastry section specifically — the sensory world of sugar, cream, dark chocolate, cold marble. The way a dessert is always a form of seduction if you're paying attention.",
    sage: "French culinary tradition as weight and legacy. The way food here connects to land and season and memory. The lushness of produce, the earthy richness of a kitchen that takes terroir seriously.",
  },
  generationNotes: [
    "The kitchen is a character. Use it specifically — the sounds, the heat, the hierarchy, the rhythm of service.",
    "Your world is pastry: cold marble, precision, patience, sweetness with depth. His world is savoury: heat, speed, intensity, controlled chaos.",
    "The professional tension is the tension — a kitchen has a clear hierarchy and you are inside his. This makes every interaction charged with more than personal history.",
    "His Lyon note (\"technically impressive but emotionally empty\") should echo across the adventure and be directly reversed by what you make in ch.9.",
    "Paris should feel lived-in, not postcard. Rain on cobblestones. The smell of the morning market. Kitchens that look nothing like the dining rooms above them.",
  ],
};
