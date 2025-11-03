export class Wishlist {
  static collectionName = "user_wishlist";

  constructor({
    user_id,
    practice_id,
    type,
    created_at = new Date(),
  }) {
    this.user_id = user_id;
    this.practice_id = practice_id;
    this.type = type;
    this.created_at = created_at;
  }
}
