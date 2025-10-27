export class User {
  constructor({ userName, email, passwordHash, createdAt }) {
    this.userName = userName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt || new Date();
  }
}
