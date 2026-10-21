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
    prefsSaved: "Saved. We'll rank places by fit",
    compareLimit: (n: number) => `You can compare up to ${n} places at a time`,
  },
  signin: {
    notUc:
      "Please use your UC email (@mail.uc.edu or @uc.edu). Roost is just for the UC community.",
    wrongCode: "Hmm, that code isn't right. Give it another go.",
    tooMany: "That's a lot of codes. Wait a minute and try again.",
    badEmail: "That doesn't look like an email address.",
    notReady: "We can't email that address yet. Try again later or ask the Roost team.",
    failed: "We couldn't send the code. Check your connection and try again.",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    offline: "We couldn't reach Roost. Check your connection and try again.",
    load: "We couldn't load your data. Pull to refresh or try again in a moment.",
    notSetUp: "Roost isn't connected to its database yet. Add the Supabase keys and reload.",
    sendFailed: "That message didn't send. Try again.",
    postFailed: "We couldn't post that listing. Try again.",
    photoFailed: "A photo didn't upload. Try again or remove it.",
    photos: "Add at least one photo so people can see the place.",
  },
  post: {
    title: "Give your listing a short headline.",
    rent: "How much is rent each month?",
    utilities: "Roughly how much are utilities? Or switch on “included”.",
    start: "When does it start?",
    end: "When does it end?",
    endBeforeStart: "The end date has to come after the start date.",
    consent: "We need this one before you can post. It keeps everyone safe.",
    address:
      "Pick your address from the list so we can measure the distance from UC.",
    fee: "Enter the sublet fee, or leave it at 0 if there isn't one.",
  },
  empty: {
    deckDone: {
      title: "You're all caught up",
      body: "That's every place for now. Start over, or browse the full list.",
    },
    noMatches: {
      title: "No places match yet",
      body: "Try widening your dates, budget or distance.",
    },
    weakFits: {
      title: "The rest are weaker fits",
      body: (n: number) =>
        `${n} more ${n === 1 ? "place doesn't" : "places don't"} match your roommate preferences. Tap Show all to see them anyway.`,
    },
    saved: {
      title: "No saved places yet",
      body: "Tap the bookmark on any place to keep it here.",
    },
    mine: {
      title: "No listings yet",
      body: "Heading out on co-op? Post your place in about a minute.",
    },
    inbox:
      "No messages yet. Say hi to a sublessor and the chat will show up here.",
    sample: "Sample listing: the host here is made up and replies automatically.",
    pickChat: {
      title: "Your messages",
      body: "Pick a chat, or message a sublessor from any listing.",
    },
    startChat: "Say hi! We drafted a first message for you.",
    retention: "Chats are kept for 30 days for safety, then deleted.",
    notFound: {
      title: "We can't find that listing",
      body: "It may have been rented. Browse what's available instead.",
    },
    pageNotFound: {
      title: "We can't find that page",
      body: "The link may be old or mistyped. Head back to browsing.",
    },
    crashed: {
      title: "Something went wrong",
      body: "That page hit a snag. Try again, or head back to browsing.",
    },
  },
  report: { prompt: "What's the issue?" },
} as const;
