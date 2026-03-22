const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GEMINI_API_KEY = 'AIzaSyD99U-JVEf7bX9cBurxTrBHTAiTICxt16Q';

async function testGemini() {
  console.log('Testing Gemini API Key...\n');
  
  const prompt = 'Hello, respond with "API is working!" in English';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      })
    });

    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('\nFull Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      console.log('\n✅ SUCCESS! Gemini API is working!');
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else if (data.error) {
      console.log('\n❌ ERROR:', data.error.message);
    }
  } catch (error) {
    console.log('\n❌ Request Failed:', error.message);
  }
}

testGemini();
