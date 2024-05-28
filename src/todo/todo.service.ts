import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTodoDto, EditTodoDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: number, dto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        userId,
        ...dto,
      },
    });

    return todo;
  }

  async getTodos(userId: number) {
    return await this.prisma.todo.findMany({
      where: {
        userId,
      },
    });
  }

  async getTodoById(userId: number, todoId: number) {
    return await this.prisma.todo.findFirst({
      where: {
        id: todoId,
        userId,
      },
    });
  }

  async editTodoById(userId: number, todoId: number, dto: EditTodoDto) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    if (!todo || todo.userId !== userId)
      throw new ForbiddenException('Access Forbidden');

    return await this.prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteTodoById(userId: number, todoId: number) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    if (!todo || todo.userId !== userId)
      throw new ForbiddenException('Access Forbidden');

    return await this.prisma.todo.delete({
      where: {
        id: todoId,
      },
    });
  }
}
