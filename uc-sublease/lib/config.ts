export type RightSwipeAction = "message" | "shortlist";

/**
 * ONE-LINE SWITCH.
 *  "message"   -> swiping right (or the right button / ArrowRight) opens a chat with the sublessor.
 *  "shortlist" -> swiping right saves the listing to the shortlist instead.
 * Nothing else in the app needs to change.
 */
export const RIGHT_SWIPE_ACTION: RightSwipeAction = "message";

export const DEMO_CODE = "123456";
export const UC_EMAIL_PATTERN = /^[^\s@]+@(mail\.)?uc\.edu$/i;
