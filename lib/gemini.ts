const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface TransactionSummary {
  period: string
  totalIncome: number
  totalExpense: number
  totalInvestment: number
  netCashFlow: number
  savingsRate: number
  topExpenseCategories: Array<{ name: string; total: number; percentage: number }>
  topIncomeCategories: Array<{ name: string; total: number }>
  topInvestmentCategories: Array<{ name: string; total: number }>
  monthlyTrend?: Array<{ month: string; income: number; expense: number; investment: number }>
}

export async function generateAIInsights(data: TransactionSummary): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const prompt = `Kamu adalah analis keuangan pribadi yang berpengalaman. Analisis data keuangan berikut dan berikan insight yang actionable dalam Bahasa Indonesia.

DATA KEUANGAN (${data.period}):
- Total Pendapatan: Rp ${formatNumber(data.totalIncome)}
- Total Pengeluaran: Rp ${formatNumber(data.totalExpense)}
- Total Investasi: Rp ${formatNumber(data.totalInvestment)}
- Arus Kas Bersih: Rp ${formatNumber(data.netCashFlow)}
- Tingkat Tabungan: ${data.savingsRate.toFixed(1)}%

KATEGORI PENGELUARAN TERBESAR:
${data.topExpenseCategories.map(c => `- ${c.name}: Rp ${formatNumber(c.total)} (${c.percentage.toFixed(1)}%)`).join('\n')}

SUMBER PENDAPATAN:
${data.topIncomeCategories.map(c => `- ${c.name}: Rp ${formatNumber(c.total)}`).join('\n')}

INVESTASI:
${data.topInvestmentCategories.map(c => `- ${c.name}: Rp ${formatNumber(c.total)}`).join('\n')}

${data.monthlyTrend ? `TREN BULANAN:
${data.monthlyTrend.map(m => `- ${m.month}: Pendapatan Rp ${formatNumber(m.income)}, Pengeluaran Rp ${formatNumber(m.expense)}`).join('\n')}` : ''}

Berikan analisis dalam format JSON dengan struktur berikut (HANYA JSON, tanpa markdown):
{
  "insights": [
    {
      "title": "judul singkat insight",
      "description": "penjelasan detail dan saran actionable (2-3 kalimat)",
      "type": "warning|success|info|tip"
    }
  ],
  "summary": "ringkasan kondisi keuangan dalam 1-2 kalimat",
  "healthScore": angka 0-100
}

Berikan 4-6 insight yang benar-benar spesifik berdasarkan data, bukan saran umum. Gunakan type: warning untuk kondisi perlu perhatian, success untuk pencapaian baik, info untuk informasi netral, tip untuk saran praktis.`

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error: ${err}`)
  }

  const result = await response.json()
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No response from Gemini')

  return text
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(num))
}
