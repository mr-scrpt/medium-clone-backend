import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign, verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({
      email,
    });
  }
  async getUserByEmailWithPassword(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      select: ['id', 'email', 'username', 'bio', 'image', 'password'],
      where: { email },
    });
  }

  async getUserById(id: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({
      id,
    });
  }

  async getUserByUserName(username: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({
      username,
    });
  }
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.getUserByEmail(createUserDto.email);
    const userByUserName = await this.getUserByUserName(createUserDto.username);

    if (userByEmail || userByUserName) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.getUserById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { email, password } = loginUserDto;
    const user = await this.getUserByEmailWithPassword(email);
    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const checkPass = await compare(password, user.password);

    if (!checkPass) {
      throw new HttpException(
        'email or password incorrect',
        HttpStatus.NOT_FOUND,
      );
    }
    delete user.password;

    return user;
  }

  genJWT(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }
  verifyJWT(token: string): Promise<UserEntity> {
    return verify(token, JWT_SECRET);
  }
  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.genJWT(user),
      },
    };
  }
}
