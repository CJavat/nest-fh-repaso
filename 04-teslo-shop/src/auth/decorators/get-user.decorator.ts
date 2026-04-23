import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user: User = request.user as User;

    if (!user)
      throw new InternalServerErrorException('User not found in request');

    return !data ? user : user[data];
  },
);
