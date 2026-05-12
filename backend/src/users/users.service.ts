import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  // Selects password explicitly (hidden by default via select: false)
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async createWithPassword(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<User> {
    const exists = await this.usersRepo.findOne({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = this.usersRepo.create({ ...data, password: hashed });
    return this.usersRepo.save(user);
  }

  // Finds or creates user from Google profile; links accounts on matching email
  async findOrCreateFromGoogle(profile: {
    googleId: string;
    email: string;
    name?: string;
    avatar?: string;
  }): Promise<User> {
    let user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.googleId')
      .where('user.googleId = :googleId', { googleId: profile.googleId })
      .getOne();

    if (user) return user;

    // Same email → link accounts
    user = await this.usersRepo.findOne({ where: { email: profile.email } });
    if (user) {
      await this.usersRepo.update(user.id, { googleId: profile.googleId });
      return user;
    }

    // New user via Google
    return this.usersRepo.save(
      this.usersRepo.create({
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        googleId: profile.googleId,
      }),
    );
  }

  async saveHashedRefreshToken(userId: string, token: string): Promise<void> {
    const hashed = await bcrypt.hash(token, SALT_ROUNDS);
    await this.usersRepo.update(userId, { hashedRefreshToken: hashed });
  }

  async validateRefreshToken(userId: string, token: string): Promise<User> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.hashedRefreshToken')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user?.hashedRefreshToken) throw new ForbiddenException('Access denied');

    const valid = await bcrypt.compare(token, user.hashedRefreshToken);
    if (!valid) throw new ForbiddenException('Access denied');

    // Return user without sensitive fields
    const { hashedRefreshToken: _h, ...safe } = user as any;
    return safe as User;
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersRepo.update(userId, { hashedRefreshToken: null });
  }
}
