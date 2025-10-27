export class User {
  constructor({ userName, email, passwordHash, avatar, user_phone, role, status, createdAt }) {
    this.userName = userName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.avatar = avatar;
    this.user_phone = user_phone;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
  }
}
