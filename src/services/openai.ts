import OpenAI from 'openai';

const getOpenAIInstance = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please add your API key to the .env file.');
  }

  if (apiKey === 'your_api_key_here') {
    throw new Error('Please replace the placeholder API key in .env with your actual OpenAI API key.');
  }

  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid API key format. OpenAI API keys should start with "sk-"');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

// Function to estimate tokens (rough estimate)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 3);
}

function splitTextIntoChunks(text: string, maxTokensPerChunk: number = 32000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  let currentTokens = 0;
  
  const sections = text.split(/\n\s*\n/);
  
  for (const section of sections) {
    const sectionTokens = estimateTokenCount(section);
    
    if (sectionTokens > maxTokensPerChunk) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }
      
      const sentences = section.split(/(?<=[.!?])\s+/);
      let tempChunk = '';
      let tempTokens = 0;
      
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokenCount(sentence);
        
        if (sentenceTokens > maxTokensPerChunk) {
          if (tempChunk) {
            chunks.push(tempChunk.trim());
            tempChunk = '';
            tempTokens = 0;
          }
          
          const words = sentence.split(' ');
          for (const word of words) {
            const wordTokens = estimateTokenCount(word + ' ');
            
            if (tempTokens + wordTokens > maxTokensPerChunk) {
              if (tempChunk) {
                chunks.push(tempChunk.trim());
                tempChunk = '';
                tempTokens = 0;
              }
            }
            
            tempChunk += word + ' ';
            tempTokens += wordTokens;
          }
          
          if (tempChunk) {
            chunks.push(tempChunk.trim());
            tempChunk = '';
            tempTokens = 0;
          }
        }
        else if (tempTokens + sentenceTokens > maxTokensPerChunk) {
          chunks.push(tempChunk.trim());
          tempChunk = sentence + ' ';
          tempTokens = sentenceTokens;
        }
        else {
          tempChunk += sentence + ' ';
          tempTokens += sentenceTokens;
        }
      }
      
      if (tempChunk) {
        chunks.push(tempChunk.trim());
      }
    }
    else if (currentTokens + sectionTokens > maxTokensPerChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = section + '\n\n';
      currentTokens = sectionTokens;
    }
    else {
      currentChunk += section + '\n\n';
      currentTokens += sectionTokens;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (error?.error?.code !== 'rate_limit_exceeded' || retries >= maxRetries) {
        throw error;
      }
      
      retries++;
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${retries} of ${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Updated regulatory context with direct references
const REGULATORY_CONTEXT = `
Texas Administrative Code, Title 30, Part 1, Chapter 336 - Radioactive Substance Rules
Location: https://texreg.sos.state.tx.us/public/readtac$ext.ViewTAC?tac_view=4&ti=30&pt=1&ch=336

Key Subchapters:
A. General Provisions (§§336.1 - 336.6)
B. Radioactive Substance Fees (§§336.101 - 336.113)
C. General Licensing Requirements (§§336.201 - 336.213)
D. Standards for Protection Against Radiation (§§336.301 - 336.368)
E. Notices, Instructions, and Reports to Workers and Inspections (§§336.401 - 336.410)
F. Licensing of Alternative Methods of Disposal of Radioactive Material (§§336.501 - 336.513)
G. Decommissioning Standards (§§336.601 - 336.629)

Critical Requirements:
1. License Requirements (§336.201):
   - No person shall engage in disposal of radioactive material unless licensed
   - Specific authorization required for receipt, storage, processing, or disposal

2. Radiation Protection Standards (§336.305):
   - Annual dose limits for occupational exposure
   - Requirements for surveys and monitoring
   - Control of access to high radiation areas

3. Safety Requirements (§336.331):
   - Posting of radiation areas
   - Labeling containers
   - Personnel monitoring

4. Waste Disposal (§336.361):
   - Approved disposal methods
   - Packaging requirements
   - Transportation regulations

5. Record Keeping (§336.343):
   - Documentation of surveys
   - Exposure records
   - Disposal records

6. Emergency Procedures (§336.351):
   - Required notifications
   - Immediate actions
   - Follow-up requirements
`;

async function analyzeChunk(
  openai: OpenAI, 
  chunk: string, 
  chunkIndex: number, 
  totalChunks: number
): Promise<string> {
  const prompt = `You are a certified Health Physicist with extensive expertise in the safe handling and use of radioactive materials. Your task is to analyze the following document section against Texas Administrative Code Chapter 336 requirements.

${REGULATORY_CONTEXT}

You are currently analyzing part ${chunkIndex + 1} of ${totalChunks}.

Document Section to Analyze:
${chunk}

Analyze this content against the Texas Administrative Code Chapter 336 requirements. Focus on:

1. Compliance Analysis:
   - Compare the document content with specific sections of Chapter 336
   - Identify any gaps or discrepancies
   - Reference specific sections of the code in your analysis

2. Technical Evaluation:
   - Assess radiation safety measures
   - Evaluate monitoring and control procedures
   - Review waste management practices

3. Documentation Review:
   - Check for required record-keeping elements
   - Verify reporting procedures
   - Assess emergency response protocols

4. Recommendations:
   - Provide specific citations to relevant code sections
   - Suggest improvements with reference to regulatory requirements
   - Prioritize safety-critical items

Format your response professionally, using clear headings and specific regulatory references.`;

  return retryWithBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a certified Health Physicist analyzing documents for regulatory compliance with Texas Administrative Code Chapter 336. Be precise and thorough in your analysis, always citing specific regulatory sections."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    return response.choices[0].message?.content || '';
  });
}

export async function analyzeDocuments(documentText: string, documentName: string) {
  console.log('=== Document Analysis Started ===');
  console.log('Document length:', documentText?.length || 0);
  console.log('Document name:', documentName);
  
  const fileNameWithoutExtension = documentName.replace(/\.[^/.]+$/, '');
  
  if (!documentText?.trim()) {
    console.error('Document is empty');
    throw new Error('Document is empty or invalid.');
  }
  
  try {
    console.log('\nInitializing OpenAI client...');
    const openai = getOpenAIInstance();

    const chunks = splitTextIntoChunks(documentText);
    console.log(`Document split into ${chunks.length} chunks`);
    
    chunks.forEach((chunk, index) => {
      const tokenCount = estimateTokenCount(chunk);
      console.log(`Chunk ${index + 1} estimated tokens: ${tokenCount}`);
    });

    let chunkAnalyses: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const analysis = await analyzeChunk(openai, chunks[i], i, chunks.length);
      chunkAnalyses.push(analysis);
      
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const finalAnalysis = await retryWithBackoff(async () => {
      const prompt = `You are a certified Health Physicist with extensive expertise in the safe handling and use of radioactive materials. Based on the following analysis sections, generate a comprehensive compliance report.

${REGULATORY_CONTEXT}

Analysis Sections:
${chunkAnalyses.join('\n\n=== Next Section ===\n\n')}

Generate a comprehensive report for the following document:

${fileNameWithoutExtension}

Include the following information:
- Document details (prepared by, date, etc.)
- Executive summary
- Regulatory framework analysis
- Document review
- Technical assessment
- Findings and recommendations
- Conclusion

Requirements:
- Write in formal, professional tone
- Provide specific regulatory references
- Include actionable recommendations
- Prioritize safety-critical items
- Use clear, precise language
- Support findings with specific examples
- Maintain objective analysis perspective`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a certified Health Physicist expert in radioactive materials safety and regulatory compliance. Create a comprehensive analysis report that identifies compliance gaps and provides actionable recommendations based on Texas Administrative Code Chapter 336 requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Failed to generate analysis. The API response was empty.');
      }

      return response.choices[0].message.content;
    });

    sessionStorage.setItem('documentAnalysis', finalAnalysis);
    console.log('Analysis completed and stored');

    return finalAnalysis;
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    if (error?.error?.type === 'invalid_request_error') {
      if (error?.error?.code === 'invalid_api_key') {
        throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
      }
      if (error?.error?.code === 'token_expired') {
        throw new Error('API key has expired. Please update your OpenAI API key.');
      }
      throw new Error(`Invalid API request: ${error?.error?.message || 'Unknown error'}`);
    }
    
    if (error?.error?.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    }

    if (error?.error?.code === 'insufficient_quota') {
      throw new Error('API quota exceeded. Please check your OpenAI account balance.');
    }

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }

    if (error.status === 401) {
      throw new Error('Authentication failed. Please check your API key.');
    }

    if (error.status === 403) {
      throw new Error('Access forbidden. Please check your API key permissions.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred during analysis. Please try again.');
  }
}