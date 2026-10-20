/**
 * Shared domain shapes for JavaScript editor tooling. Runtime validation lives
 * in policy.js and the route schemas. API DTOs omit database-internal fields.
 *
 * @typedef {'owner'|'admin'|'member'} CircleRole
 * @typedef {'circle'|'close_friends'|'one_person'} PostScope
 * @typedef {{type:'image',url:string}|{type:'song',track_id:string,title:string,
 *   artist:string,cover_url:string,preview_url:string,clip_start:number}} MediaAttachment
 * @typedef {{id:string, display_name:string, username:string, bio:string,
 *   avatar_emoji:string, created_at:Date, updated_at:Date}} Profile
 * @typedef {{id:string, name:string, description:string, cover_color:string,
 *   owner_id:string, revision:number, created_at:Date, updated_at:Date}} Circle
 * @typedef {{circle_id:string, user_id:string, role:CircleRole,
 *   created_at:Date, updated_at:Date}} Membership
 * @typedef {{id:string, author_id:string, circle_id:string, mood:string,
 *   mood_label:string, caption:string, scope:PostScope, audience_ids:string[],
 *   media_attachment:object|null, created_at:Date, updated_at:Date,
 *   deleted_at:Date|null}} MoodPost
 * @typedef {{post_id:string, user_id:string, reaction:string,
 *   created_at:Date, updated_at:Date}} Reaction
 * @typedef {{user_id:string, timezone:string, reactions:boolean,
 *   circle_activity:boolean}} UserPreferences
 */
export {};
