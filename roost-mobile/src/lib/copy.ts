// AUTO-COPIED from uc-sublease/lib/copy.ts by `npm run sync`. Edit the web version, not this file.
// Every friendly message in one place (toasts, errors, empty states).
// Voice: warm, short, second person, contractions, no jargon. Say what happened, then what to do next.

export const COPY = {
  toast: {
    saved: "Saved to your shortlist",
    unsaved: "Removed from your shortlist",
    posted: "Your listing is live",
    confirmed: "Thanks! Marked as still available",
    rented: "Marked as rented. Congrats!",
    reported: "Thanks for flagging this. We'll take a look",
    linkCopied: "Link copied",
    compareLimit: (n: number) => `You can compare up to ${n} places at a time`,
  },
  signin: {
    notUc: "Please use your @mail.uc.edu email. Roost is just for UC students.",
    wrongCode: "Hmm, that code isn't right. Give it another go.",
  },
  post: {
    title: "Give your listing a short headline.",
    address: "Add the street address.",
    rent: "How much is rent each month?",
    utilities: "Roughly how much are utilities? Or switch on “included”.",
    start: "When does it start?",
    end: "When does it end?",
    endBeforeStart: "The end date has to come after the start date.",
    consent: "We need this one before you can post. It keeps everyone safe.",
  },
  empty: {
    deckDone: { title: "You're all caught up", body: "That's every place for now. Start over, or browse the full list." },
    noMatches: { title: "No places match yet", body: "Try widening your dates, budget or distance." },
    saved: { title: "No saved places yet", body: "Tap the bookmark on any place to keep it here." },
    mine: { title: "No listings yet", body: "Heading out on co-op? Post your place in about a minute." },
    inbox: "No messages yet. Say hi to a sublessor and the chat will show up here.",
    pickChat: { title: "Your messages", body: "Pick a chat, or message a sublessor from any listing." },
    startChat: "Say hi! We drafted a first message for you.",
    notFound: { title: "We can't find that listing", body: "It may have been rented. Browse what's available instead." },
  },
  report: { prompt: "What's the issue?" },
} as const;
