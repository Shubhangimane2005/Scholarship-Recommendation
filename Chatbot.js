import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en');
  const [scholarships, setScholarships] = useState([]);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const welcomeMessages = {
    en: 'Hello! I am your Scholarship Assistant. Ask me about scholarships you want to know about!',
    hi: 'नमस्ते! मैं आपका छात्रवृत्ति सहायक हूं। मुझसे उन छात्रवृत्तियों के बारे में पूछें जिनके बारे में जानना चाहते हैं!',
    mr: 'नमस्कार! मी तुमचा शिष्यवृत्ती सहाय्यक आहे. मला त्या शिष्यवृत्त्याबद्दल विचारा ज्याबद्दल तुम्हाला माहिती हवी आहे!'
  };

  useEffect(() => {
    setMessages([{ text: welcomeMessages[language], sender: 'bot', language: language }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/scholarships');
        setScholarships(response.data);
      } catch (error) {
        console.log('Error fetching scholarships:', error);
      }
    };
    fetchScholarships();
  }, []);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { text, sender: 'user', language };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const response = await getScholarshipResponse(text.toLowerCase(), language, scholarships);
    const botMessage = { text: response, sender: 'bot', language };
    setMessages(prev => [...prev, botMessage]);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setTimeout(() => handleSend(transcript), 0);
      };
    }
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    // Start fresh chat with new language welcome message
    setMessages([{ text: welcomeMessages[newLang], sender: 'bot', language: newLang }]);
    setInput('');
  };

  const findScholarshipsByLevel = (query, scholarshipList) => {
    const lowerQuery = query.toLowerCase();
    
    const levelPatterns = {
      'junior_kg': ['junior kg', 'jr kg', 'jr. kg', 'lkg', 'ukg', 'kindergarten', 'sr kg', 'senior kg', 'pre school', 'pre-school', 'केजी', 'किंडरगार्टन'],
      '1_to_10': ['1 to 10', '1 to 5', '1 to 8', 'class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'class 6', 'class 7', 'class 8', 'class 9', 'class 10', '1st class', '2nd class', '3rd class', '4th class', '5th class', '6th class', '7th class', '8th class', '9th class', '10th class', 'pre-matric', 'इयत्ता 1', 'इयत्ता 2', 'इयत्ता 3', 'इयत्ता 4', 'इयत्ता 5', 'इयत्ता 6', 'इयत्ता 7', 'इयत्ता 8', 'इयत्ता 9', 'इयत्ता 10'],
      '11_to_12': ['11 to 12', 'class 11', 'class 12', '11th class', '12th class', 'hsc', '11th', '12th', 'intermediate', 'plus 2', 'higher secondary', 'इयत्ता 11', 'इयत्ता 12'],
      'diploma': ['diploma', 'polytechnic', 'डिप्लोमा', 'इंजीनियरिंग'],
      'graduate': ['graduate', 'graduation', 'ug', 'undergraduate', 'bcom', 'bsc', 'ba', 'bca', 'bba', 'b.ed', 'बीकॉम', 'बीएससी', 'बीए', 'बीसीए', 'बीबीए', 'स्नातक'],
      'post_graduate': ['post graduate', 'postgraduate', 'pg', 'mcom', 'msc', 'ma', 'mca', 'mba', 'm.ed', 'एमकॉम', 'एमएससी', 'एमए', 'एमसीए', 'एमबीए', 'स्नातकोत्तर'],
      'master': ['master', 'masters', 'm.phil', 'mphil', ' abroad', 'foreign', 'विदेश', 'परदेश'],
      'phd': ['phd', 'ph.d', 'doctorate', 'research']
    };

    for (const [level, keywords] of Object.entries(levelPatterns)) {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        let results = [];
        
        if (level === 'junior_kg') {
          results = scholarshipList.filter(s => s.level === 'junior_kg');
        } else if (level === '1_to_10') {
          results = scholarshipList.filter(s => s.level === '1st_to_10th');
        } else if (level === '11_to_12') {
          results = scholarshipList.filter(s => s.level === '11th_12th');
        } else if (level === 'diploma') {
          results = scholarshipList.filter(s => s.level === 'diploma');
        } else if (level === 'graduate') {
          results = scholarshipList.filter(s => s.level === 'graduate');
        } else if (level === 'post_graduate') {
          results = scholarshipList.filter(s => s.level === 'post_graduate');
        } else if (level === 'master') {
          results = scholarshipList.filter(s => s.level === 'master');
        } else if (level === 'phd') {
          results = scholarshipList.filter(s => s.level === 'phd');
        }
        
        if (results.length > 0) {
          return { results, level: level };
        }
      }
    }

    const castePatterns = {
      'sc': ['sc', 'scheduled caste', 'अनुसूचित जाति'],
      'st': ['st', 'scheduled tribe', 'अनुसूचित जनजाति'],
      'obc': ['obc', 'other backward class', 'ओबीसी'],
      'ews': ['ews', 'economically weaker', 'ईडब्ल्यूएस'],
      'nt': ['nt', 'nomadic tribe', 'खानवासी'],
      'minority': ['minority', 'अल्पसंख्यक'],
      'open': ['open', 'general', 'सामान्य', 'सर्व']
    };

    for (const [caste, keywords] of Object.entries(castePatterns)) {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        const results = scholarshipList.filter(s => s.caste && s.caste.includes(caste));
        if (results.length > 0) {
          return { results, level: 'caste_' + caste };
        }
      }
    }

    const nameResults = scholarshipList.filter(s => 
      s.name.toLowerCase().includes(lowerQuery.split(' ')[0]) ||
      lowerQuery.includes(s.name.toLowerCase().split(' ')[0])
    );
    
    if (nameResults.length > 0) {
      return { results: nameResults, level: 'name' };
    }

    return { results: [], level: null };
  };

  const formatScholarshipDetails = (scholarship, lang) => {
    const isHindi = lang === 'hi';
    const isMarathi = lang === 'mr';
    
    let details = '';
    
    if (scholarship.name) {
      details += '📌 ' + scholarship.name + '\n';
    }
    
    if (scholarship.description) {
      details += '\n📝 ' + (isHindi ? 'विवरण' : isMarathi ? 'वर्णन' : 'Description') + ': ' + scholarship.description + '\n';
    }
    
    if (scholarship.amount) {
      details += '💰 ' + (isHindi ? 'राशि' : isMarathi ? 'रक्कम' : 'Amount') + ': ₹' + scholarship.amount.toLocaleString() + '\n';
    }
    
    if (scholarship.eligibility) {
      details += '✅ ' + (isHindi ? 'पात्रता' : isMarathi ? 'पात्रता' : 'Eligibility') + ': ' + scholarship.eligibility + '\n';
    }
    
    if (scholarship.documents_required && scholarship.documents_required.length > 0) {
      const docs = Array.isArray(scholarship.documents_required) ? scholarship.documents_required.join(', ') : scholarship.documents_required;
      details += '📄 ' + (isHindi ? 'आवश्यक दस्तावेज' : isMarathi ? 'आवश्यक कागदपत्रे' : 'Required Docs') + ': ' + docs + '\n';
    }
    
    if (scholarship.deadline) {
      details += '📅 ' + (isHindi ? 'समय सीमा' : isMarathi ? 'मुदत' : 'Deadline') + ': ' + new Date(scholarship.deadline).toLocaleDateString() + '\n';
    }
    
    if (scholarship.provider) {
      details += '🏛️ ' + (isHindi ? 'प्रदाता' : isMarathi ? 'प्रदाता' : 'Provider') + ': ' + scholarship.provider + '\n';
    }
    
    if (scholarship.apply_link) {
      details += '\n🔗 ' + (isHindi ? 'आवेदन के लिए लिंक' : isMarathi ? 'अर्जासाठी लिंक' : 'Apply Link') + ': ' + scholarship.apply_link + '\n';
    }
    
    return details;
  };

  const getLevelName = (level, lang) => {
    const isHindi = lang === 'hi';
    const isMarathi = lang === 'mr';
    
    const levelNames = {
      'junior_kg': isHindi ? 'जूनियर केजी' : isMarathi ? 'जूनियर केजी' : 'Junior KG',
      '1_to_10': isHindi ? 'कक्षा 1 से 10' : isMarathi ? 'इयत्ता 1 ते 10' : 'Class 1 to 10',
      '11_to_12': isHindi ? 'कक्षा 11 से 12' : isMarathi ? 'इयत्ता 11 ते 12' : 'Class 11 to 12',
      'diploma': isHindi ? 'डिप्लोमा' : isMarathi ? 'डिप्लोमा' : 'Diploma',
      'graduate': isHindi ? 'स्नातक (Graduate)' : isMarathi ? 'पदवीधर (Graduate)' : 'Graduate',
      'post_graduate': isHindi ? 'स्नातकोत्तर (Post Graduate)' : isMarathi ? 'पदव्युत्तर (Post Graduate)' : 'Post Graduate',
      'master': isHindi ? 'मास्टर्स / विदेश' : isMarathi ? 'मास्टर्स / परदेश' : 'Masters / Abroad',
      'phd': isHindi ? 'पीएचडी' : isMarathi ? 'पीएचडी' : 'PhD',
      'caste_sc': isHindi ? 'एससी' : isMarathi ? 'एससी' : 'SC',
      'caste_st': isHindi ? 'एसटी' : isMarathi ? 'एसटी' : 'ST',
      'caste_obc': isHindi ? 'ओबीसी' : isMarathi ? 'ओबीसी' : 'OBC',
      'caste_ews': isHindi ? 'ईडब्ल्यूएस' : isMarathi ? 'ईडब्ल्यूएस' : 'EWS',
      'caste_minority': isHindi ? 'अल्पसंख्यक' : isMarathi ? 'अल्पसंख्यक' : 'Minority',
      'caste_open': isHindi ? 'ओपन / सामान्य' : isMarathi ? 'ओपन / सामान्य' : 'Open / General',
      'name': isHindi ? 'छात्रवृत्ति' : isMarathi ? 'शिष्यवृत्ती' : 'Scholarship'
    };
    
    return levelNames[level] || (isHindi ? 'छात्रवृत्ति' : isMarathi ? 'शिष्यवृत्ती' : 'Scholarship');
  };

  const getScholarshipResponse = async (query, lang, scholarshipList) => {
    const isHindi = lang === 'hi';
    const isMarathi = lang === 'mr';
    
    const { results, level } = findScholarshipsByLevel(query, scholarshipList);
    
    if (results.length > 0) {
      let response = '';
      
      const levelName = getLevelName(level, lang);
      response += (isHindi ? '🎓 ' + levelName + ' के लिए छात्रवृत्तियां:' : isMarathi ? '🎓 ' + levelName + ' साठी शिष्यवृत्त्या:' : '🎓 Scholarships for ' + levelName + ':\n\n');
      
      results.slice(0, 5).forEach(scholarship => {
        response += formatScholarshipDetails(scholarship, lang);
        response += '\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
      });
      
      if (results.length > 5) {
        response += isHindi ? '\n📊 कुल ' + results.length + ' छात्रवृत्तियां उपलब्ध हैं।' :
                    isMarathi ? '\n📊 एकूण ' + results.length + ' शिष्यवृत्त्या उपलब्ध आहेत.' :
                    '\n📊 Total ' + results.length + ' scholarships available.';
      }
      
      return response;
    }
    
    if (query.includes('help') || query.includes('मदत') || query.includes('सहाय्य')) {
      return getHelpResponse(lang);
    }
    if (query.includes('hello') || query.includes('hi') || query.includes('नमस्ते') || query.includes('नमस्कार')) {
      return welcomeMessages[lang];
    }
    
    return isHindi ?
      '⚠️ मुझे इस के लिए कोई छात्रवृत्ति नहीं मिली।\n\nआप इनमें से पूछ सकते हैं:\n• Jr KG, Sr KG\n• Class 1 to 10\n• Class 11 to 12\n• Diploma\n• Graduate\n• Post Graduate\n• Masters / Abroad\n• SC, ST, OBC, EWS\n\nया अपना शिक्षा स्तर बताएं!' :
      isMarathi ?
      '⚠️ मला त्यासाठी शिष्यवृत्ती सापडली नाही.\n\nतुम्ही विचारू शकता:\n• Jr KG, Sr KG\n• Class 1 to 10\n• Class 11 to 12\n• Diploma\n• Graduate\n• Post Graduate\n• Masters / Abroad\n• SC, ST, OBC, EWS' :
      '⚠️ I could not find scholarships for that.\n\nYou can ask about:\n• Jr KG, Sr KG\n• Class 1 to 10\n• Class 11 to 12\n• Diploma\n• Graduate\n• Post Graduate\n• Masters / Abroad\n• SC, ST, OBC, EWS\n\nOr tell me your education level!';
  };

  const getHelpResponse = (lang) => {
    const isHindi = lang === 'hi';
    const isMarathi = lang === 'mr';
    
    return isHindi ?
      'मैं आपकी इनमें से मदद कर सकता हूं:\n\n🔍 बस पूछें:\n• "Jr KG के लिए छात्रवृत्ति"\n• "Class 1 to 10 छात्रवृत्ति"\n• "Class 11 to 12 छात्रवृत्ति"\n• "Diploma छात्रवृत्ति"\n• "Graduate छात्रवृत्ति"\n• "Post Graduate छात्रवृत्ति"\n• "Masters छात्रवृत्ति"\n• "SC छात्रवृत्ति" / "ST छात्रवृत्ति"\n• "OBC छात्रवृत्ति"' :
      isMarathi ?
      'मी मदत करू शकतो:\n\n🔍 फक्त विचारा:\n• "Jr KG साठी शिष्यवृत्ती"\n• "Class 1 to 10 शिष्यवृत्ती"\n• "Class 11 to 12 शिष्यवृत्ती"\n• "Diploma शिष्यवृत्ती"\n• "Graduate शिष्यवृत्ती"\n• "Post Graduate शिष्यवृत्ती"\n• "Masters शिष्यवृत्ती"\n• "SC शिष्यवृत्ती"' :
      'I can help! Just ask like:\n\n🔍 Ask me:\n• "scholarships for Jr KG"\n• "scholarships for Class 1 to 10"\n• "scholarships for Class 11 to 12"\n• "scholarships for Diploma"\n• "scholarships for Graduate"\n• "scholarships for Post Graduate"\n• "scholarships for Masters"\n• "SC scholarships" / "ST scholarships"\n• "OBC scholarships"';
  };

  return (
    <>
      <div className="chatbot-container">
        <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)} title="Chat with us">
          💬
        </button>
        {isOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <span>🎓 Scholarship Assistant</span>
              <div className="language-selector">
                <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => handleLanguageChange('en')}>EN</button>
                <button className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => handleLanguageChange('hi')}>HI</button>
                <button className={`lang-btn ${language === 'mr' ? 'active' : ''}`} onClick={() => handleLanguageChange('mr')}>MR</button>
              </div>
              <button 
                className="chatbot-close-btn" 
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                ✕
              </button>
            </div>
            <div className="chatbot-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-input-container">
              <input
                type="text"
                className="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'hi' ? 'छात्रवृत्ति के बारे में पूछें...' : language === 'mr' ? 'शिष्यवृत्तीबद्दल विचारा...' : 'Ask about scholarships...'}
              />
              <button className="chatbot-send" onClick={() => handleSend()} title="Send">
                ➤
              </button>
              <button 
                className={`chatbot-mic ${isListening ? 'listening' : ''}`} 
                onClick={startListening} 
                disabled={isListening}
                title={isListening ? 'Listening...' : 'Click to speak'}
              >
                {isListening ? '🔊' : '🎙️'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chatbot;
