const express = require('express');
const cors = require('cors');
const multer = require('multer');
const moment = require('moment');
const { OpenAI } = require('openai');

const app = express();
const upload = multer();

// Configuração do OpenAI - substitua pela sua chave real
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

app.use(cors());
app.use(express.json());

// Banco de dados simples em memória (em produção, use um banco de dados real)
let activities = [];

// Rota para registrar uma nova atividade
app.post('/api/activity', upload.none(), (req, res) => {
  try {
    const { date, activity, description, duration, category } = req.body;
    
    // Validação básica dos campos
    if (!date || !activity || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes: date, activity, description' });
    }
    
    // Formatação da data
    const formattedDate = moment(date).format('YYYY-MM-DD');
    
    // Criação do objeto de atividade
    const newActivity = {
      id: Date.now().toString(),
      date: formattedDate,
      activity,
      description,
      duration: duration || 0,
      category: category || 'general'
    };
    
    // Adiciona ao array de atividades
    activities.push(newActivity);
    
    res.status(201).json({ success: true, activity: newActivity });
  } catch (error) {
    console.error('Erro ao adicionar atividade:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar atividade' });
  }
});

// Função para gerar relatório técnico usando IA
async function generateTechnicalReport(periodActivities, periodType) {
  try {
    // Agrupar atividades por categoria
    const activitiesByCategory = {};
    periodActivities.forEach(activity => {
      if (!activitiesByCategory[activity.category]) {
        activitiesByCategory[activity.category] = [];
      }
      activitiesByCategory[activity.category].push({
        activity: activity.activity,
        description: activity.description,
        duration: activity.duration
      });
    });

    // Criar prompt para a IA
    let periodLabel;
    switch(periodType) {
      case 'weekly':
        periodLabel = 'semanal';
        break;
      case 'monthly':
        periodLabel = 'mensal';
        break;
      case 'annual':
        periodLabel = 'anual';
        break;
      default:
        periodLabel = 'personalizado';
    }

    const prompt = `Gere um relatório técnico detalhado sobre as atividades ${periodLabel} com base nas seguintes informações:

Atividades registradas:
${Object.entries(activitiesByCategory).map(([category, acts]) => 
  `${category.toUpperCase()}:\n${acts.map(act => `- ${act.activity}: ${act.description} (${act.duration ? act.duration + ' horas' : 'sem duração definida'})`).join('\n')}`
).join('\n\n')}

O relatório deve conter:
1. Resumo executivo
2. Análise das atividades por categoria
3. Métricas e indicadores principais
4. Conclusão e recomendações

Formato: Documento técnico profissional, bem estruturado.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você é um assistente especializado em geração de relatórios técnicos profissionais." },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar relatório com IA:', error);
    throw new Error('Falha na geração do relatório por IA');
  }
}

// Rota para obter relatório semanal
app.get('/api/report/weekly/:startDate?', async (req, res) => {
  try {
    const startDateParam = req.params.startDate || moment().startOf('week').format('YYYY-MM-DD');
    const startDate = moment(startDateParam);
    const endDate = moment(startDate).endOf('week');
    
    const weeklyActivities = activities.filter(activity => {
      const activityDate = moment(activity.date);
      return activityDate.isBetween(startDate, endDate, null, '[]');
    });
    
    if (weeklyActivities.length === 0) {
      return res.status(404).json({ error: 'Nenhuma atividade encontrada para esta semana' });
    }
    
    const report = await generateTechnicalReport(weeklyActivities, 'weekly');
    
    res.setHeader('Content-Disposition', `attachment; filename="relatorio_semanal_${startDate.format('YYYY-MM-DD')}_a_${endDate.format('YYYY-MM-DD')}.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(report);
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório semanal' });
  }
});

// Rota para obter relatório mensal
app.get('/api/report/monthly/:year?/:month?', async (req, res) => {
  try {
    const year = req.params.year || moment().year();
    const month = req.params.month || moment().month() + 1; // Moment retorna mês 0-indexado
    
    const startDate = moment(`${year}-${month}-01`);
    const endDate = moment(startDate).endOf('month');
    
    const monthlyActivities = activities.filter(activity => {
      const activityDate = moment(activity.date);
      return activityDate.isBetween(startDate, endDate, null, '[]');
    });
    
    if (monthlyActivities.length === 0) {
      return res.status(404).json({ error: 'Nenhuma atividade encontrada para este mês' });
    }
    
    const report = await generateTechnicalReport(monthlyActivities, 'monthly');
    
    res.setHeader('Content-Disposition', `attachment; filename="relatorio_mensal_${year}_${String(month).padStart(2, '0')}.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(report);
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório mensal' });
  }
});

// Rota para obter relatório anual
app.get('/api/report/annual/:year?', async (req, res) => {
  try {
    const year = req.params.year || moment().year();
    
    const startDate = moment(`${year}-01-01`);
    const endDate = moment(`${year}-12-31`);
    
    const annualActivities = activities.filter(activity => {
      const activityDate = moment(activity.date);
      return activityDate.isBetween(startDate, endDate, null, '[]');
    });
    
    if (annualActivities.length === 0) {
      return res.status(404).json({ error: 'Nenhuma atividade encontrada para este ano' });
    }
    
    const report = await generateTechnicalReport(annualActivities, 'annual');
    
    res.setHeader('Content-Disposition', `attachment; filename="relatorio_anual_${year}.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(report);
  } catch (error) {
    console.error('Erro ao gerar relatório anual:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório anual' });
  }
});

// Rota para obter todas as atividades (para debug)
app.get('/api/activities', (req, res) => {
  res.json({ activities });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Relatório de Atividades',
    endpoints: {
      'POST /api/activity': 'Registrar nova atividade',
      'GET /api/report/weekly/:startDate?': 'Relatório semanal',
      'GET /api/report/monthly/:year?/:month?': 'Relatório mensal',
      'GET /api/report/annual/:year?': 'Relatório anual'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});