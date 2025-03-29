import { Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(userId: number): Promise<User> {
    const user = await this.userService.findOne({
      id: userId,
    });

    // validate user here

    return user;
  }
}
