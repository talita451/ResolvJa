// tests/apiResolvJa.test.js
// Testes de Caixa Preta (API) com Supertest nas rotas reais do ResolvJá

const request = require('supertest');
const app = require('../server');

describe('Caixa Preta - Rotas da API ResolvJá', () => {
  test('GET /ResolvJa/status-banco - Deve confirmar conexão ativa com o PostgreSQL', async () => {
    const res = await request(app).get('/ResolvJa/status-banco');

    expect(res.statusCode).toBe(200);
    expect(res.body.conectado).toBe(true);
    expect(res.body).toHaveProperty('hora_banco');
  });

  test('GET /ResolvJa/servicos - Deve retornar status 200 e a lista de serviços', async () => {
    const res = await request(app).get('/ResolvJa/servicos');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /ResolvJa/prestadores - Deve retornar status 200 e a lista de prestadores', async () => {
    const res = await request(app).get('/ResolvJa/prestadores');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /ResolvJa/avaliacoes-site - Deve retornar status 200 e lista de avaliações', async () => {
    const res = await request(app).get('/ResolvJa/avaliacoes-site');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /ResolvJa/rota-inexistente - Deve retornar status 404', async () => {
    const res = await request(app).get('/ResolvJa/rota-inexistente');

    expect(res.statusCode).toBe(404);
  });
});
const pool = require('../banco');

afterAll(async () => {
  await pool.end();
});