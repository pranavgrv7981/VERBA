const MODEL = 'google/gemini-flash-1.5';

export async function buildSentence(signs) {
  if (!signs || signs.length === 0) return null;

  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('OpenRouter API key not found. Add VITE_OPENROUTER_API_KEY to .env.local');
      return null;
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 80,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are an ASL-to-English translator in a real-time accessibility app for mute users.
Convert detected ASL sign sequences into natural English sentences.
Rules:
- Single letters are fingerspelling — join into words where they make sense.
- Phrases like Hello/Yes/No/Thank you are complete units.
- Output ONLY the final English sentence. No explanation, no quotes.
- If it's just one letter: "Letter [X]"`
          },
          {
            role: 'user',
            content: `Signs: ${signs.join(' ')}\nTranslate:`
          }
        ]
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('sentenceBuilder:', err);
    return null;
  }
}
