import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateTodoDto, EditTodoDto } from '../src/todo/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3334);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334');
  });
  it.todo('APP Passed');

  afterAll(() => {
    app.close();
  });

  const dto: AuthDto = {
    email: 'eugeniorenna@gmail.com',
    password: 'password',
  };
  describe('Auth', () => {
    describe('signup', () => {
      it('Passed All Empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
        // .inspect();
      });
      it('Passed Password Empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto.email)
          .expectStatus(400);
        // .inspect();
      });
      it('Passed Email Empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto.password)
          .expectStatus(400);
        // .inspect();
      });
      it('Passed Signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
        // .inspect();
      });
    });
    describe('Login', () => {
      it('Passed All Empty', () => {
        return pactum
          .spec()
          .post('/auth/login')

          .expectStatus(400);
        // .inspect();
      });
      it('Passed Password Empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto.email)
          .expectStatus(400);
        // .inspect();
      });
      it('Passed Email Empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto.password)
          .expectStatus(400);
        // .inspect();
      });
      it('Passed Login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('jwt_token', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('Passed get user', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit User', () => {
      const dto: EditUserDto = {
        firstName: 'eugenio',
        lastName: 'eugenio',
      };
      it('Passed edit user', () => {
        return pactum
          .spec()
          .patch('/user')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });
  describe('Todo', () => {
    describe('Get empty todos', () => {
      it('Passed get empty todo', () => {
        return pactum
          .spec()
          .get('/todo')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create todo', () => {
      const dto: CreateTodoDto = {
        title: 'Fare la spesa',
        description: '',
        link: '',
      };
      it('Passed create codo', () => {
        return pactum
          .spec()
          .post('/todo')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('todoId', 'id');
      });
    });
    describe('Get todos', () => {
      it('Passed get todo', () => {
        return pactum
          .spec()
          .get('/todo')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get todo by id', () => {
      it('Passed get todo by id ', () => {
        return pactum
          .spec()
          .get('/todo/{id}')
          .withPathParams('id', '$S{todoId}')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{todoId}');
      });
    });
    describe('Edit todo by id', () => {
      const dto: EditTodoDto = {
        description: 'Test',
      };
      it('Passed edit todo by id ', () => {
        return pactum
          .spec()
          .patch('/todo/{id}')
          .withPathParams('id', '$S{todoId}')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.description);
      });
    });
    describe('Delete todo by id', () => {
      it('Passed delete todo by id ', () => {
        return pactum
          .spec()
          .delete('/todo/{id}')
          .withPathParams('id', '$S{todoId}')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .expectStatus(204);
      });
      it('Passed get empty todo', () => {
        return pactum
          .spec()
          .get('/todo')
          .withHeaders({
            Authorization: 'Bearer $S{jwt_token}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
