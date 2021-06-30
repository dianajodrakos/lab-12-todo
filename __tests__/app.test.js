require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('creates todos', async() => {
      const expectation = [
        {
          id: 4,
          todo: 'pay rent',
          completed: false,
          owner_id: 2,
        },
        {
          id: 5,
          todo: 'water plants',
          completed: false,
          owner_id: 2,
        },
        {
          id: 6,
          todo: 'text bae',
          completed: false,
          owner_id: 2,
        }
      ];

      for(let item of expectation) {
        await fakeRequest(app)
          .post('/api/todos')
          .send(item)
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
        ;}

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns todos', async() => {

      const expectation = [
        {
          id: 4,
          todo: 'pay rent',
          completed: false,
          owner_id: 2,
        },
        {
          id: 5,
          todo: 'water plants',
          completed: false,
          owner_id: 2,
        },
        {
          id: 6,
          todo: 'text bae',
          completed: false,
          owner_id: 2,
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('completes todos', async() => {

      const expectation = [
        {
          id: 4,
          todo: 'pay rent',
          completed: false,
          owner_id: 2,
        },
        {
          id: 6,
          todo: 'text bae',
          completed: false,
          owner_id: 2,
        },
        {
          id: 5,
          todo: 'water plants',
          completed: true,
          owner_id: 2,
        }
      ];

      await fakeRequest(app)
        .put('/api/todos/5')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
