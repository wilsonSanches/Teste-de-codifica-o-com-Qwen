# Aplicativo de Relatório de Atividades

Este aplicativo permite registrar atividades diárias e gerar relatórios técnicos semanais, mensais e anuais com auxílio de IA.

## Funcionalidades

- Registro de atividades diárias com descrição, data, duração e categoria
- Geração de relatórios técnicos semanais, mensais e anuais
- Download dos relatórios em formato de texto
- Uso de IA para criar relatórios técnicos detalhados

## Tecnologias Utilizadas

- Node.js
- Express
- OpenAI API
- Moment.js

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure sua chave de API do OpenAI no ambiente:
   ```bash
   export OPENAI_API_KEY=sua_chave_aqui
   ```
   
   Ou crie um arquivo `.env` com:
   ```
   OPENAI_API_KEY=sua_chave_aqui
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```

## Endpoints da API

- `POST /api/activity` - Registra uma nova atividade
  - Campos: `date`, `activity`, `description`, `duration`, `category`

- `GET /api/report/weekly/:startDate?` - Gera relatório semanal
- `GET /api/report/monthly/:year?/:month?` - Gera relatório mensal
- `GET /api/report/annual/:year?` - Gera relatório anual

## Exemplo de Uso

Para registrar uma atividade:
```bash
curl -X POST http://localhost:3000/api/activity \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-11-20",
    "activity": "Desenvolvimento de API",
    "description": "Implementação de endpoints RESTful",
    "duration": 4,
    "category": "desenvolvimento"
  }'
```

Para baixar um relatório mensal:
```bash
curl -X GET http://localhost:3000/api/report/monthly/2023/11 -o relatorio.txt
```

## Estrutura do Projeto

- `index.js` - Código principal da aplicação
- `package.json` - Dependências e scripts

## Observações

- O armazenamento atual é em memória (em produção, utilize um banco de dados real)
- A chave de API do OpenAI é necessária para a geração de relatórios técnicos
