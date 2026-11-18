import cors from 'cors';
import express from 'express';
import path from 'path';
import { db } from './db';
import { processNewOrder } from './orderService';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/products', (_request, response) => {
  response.json(db.getProducts());
});

app.post('/api/orders', (request, response) => {
  try {
    const result = processNewOrder(request.body);
    return response.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    }
  }
  return response.status(500).json({ error: 'Erro interno ao processar o pedido' });
});

app.post('/api/reset', (_request, response) => {
  db.reset();
  return response.status(200).json({ message: 'Banco em memória resetado' });
});
