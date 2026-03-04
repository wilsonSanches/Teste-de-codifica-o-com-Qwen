document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário de atividade
    const activityForm = document.getElementById('activity-form');
    const dateInput = document.getElementById('date');
    
    // Elementos dos relatórios
    const weeklyReportBtn = document.getElementById('weekly-report-btn');
    const monthlyReportBtn = document.getElementById('monthly-report-btn');
    const annualReportBtn = document.getElementById('annual-report-btn');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const weeklyParams = document.getElementById('weekly-params');
    const monthlyParams = document.getElementById('monthly-params');
    const annualParams = document.getElementById('annual-params');
    
    // Definir data padrão como hoje
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Event listener para o formulário de atividade
    activityForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const formData = new FormData(activityForm);
        const activityData = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/api/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData)
            });
            
            if (response.ok) {
                alert('Atividade registrada com sucesso!');
                activityForm.reset();
                dateInput.value = today; // Resetar para data de hoje
            } else {
                const error = await response.json();
                alert('Erro ao registrar atividade: ' + error.error);
            }
        } catch (error) {
            alert('Erro de conexão: ' + error.message);
        }
    });
    
    // Funções para mostrar/ocultar parâmetros de relatório
    function hideAllParams() {
        weeklyParams.style.display = 'none';
        monthlyParams.style.display = 'none';
        annualParams.style.display = 'none';
        generateReportBtn.style.display = 'none';
    }
    
    // Event listeners para botões de tipo de relatório
    weeklyReportBtn.addEventListener('click', function() {
        hideAllParams();
        weeklyParams.style.display = 'block';
        generateReportBtn.style.display = 'block';
        generateReportBtn.onclick = generateWeeklyReport;
    });
    
    monthlyReportBtn.addEventListener('click', function() {
        hideAllParams();
        monthlyParams.style.display = 'block';
        generateReportBtn.style.display = 'block';
        generateReportBtn.onclick = generateMonthlyReport;
    });
    
    annualReportBtn.addEventListener('click', function() {
        hideAllParams();
        annualParams.style.display = 'block';
        generateReportBtn.style.display = 'block';
        generateReportBtn.onclick = generateAnnualReport;
    });
    
    // Funções para geração de relatórios
    async function generateWeeklyReport() {
        const startDate = document.getElementById('weekly-start-date').value || today;
        window.location.href = `/api/report/weekly/${startDate}`;
    }
    
    async function generateMonthlyReport() {
        const year = document.getElementById('monthly-year').value || new Date().getFullYear();
        const month = document.getElementById('monthly-month').value || (new Date().getMonth() + 1);
        window.location.href = `/api/report/monthly/${year}/${month}`;
    }
    
    async function generateAnnualReport() {
        const year = document.getElementById('annual-year').value || new Date().getFullYear();
        window.location.href = `/api/report/annual/${year}`;
    }
});