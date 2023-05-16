import { NextApiHandler } from 'next';

import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { codeBlock, oneLine } from 'common-tags';
import GPT3Tokenizer from 'gpt3-tokenizer';

import { createClient } from '@supabase/supabase-js';

const handler: NextApiHandler = async (req, res) => {
  const query = req.body.question;

  if (typeof query !== 'string' || query.length === 0) {
    res.status(400).json({ error: 'Invalid query' });
    return;
  }
  const sanitizedQuery = query.trim().replaceAll('\n', ' ');

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
    res.status(500).json({ error: 'Missing environment variables' });
    return;
  }

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

    const embeddingResponse = await embeddings.embedQuery(sanitizedQuery);

    const { error: embeddingError, data: pageSections } = await supabaseClient.rpc('match_page_sections', {
      embedding: embeddingResponse,
      match_threshold: 0.78,
      match_count: 10,
      min_content_length: 50,
    });

    if (embeddingError) {
      throw new Error(embeddingError.message);
    }

    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
    let tokenCount = 0;
    let contextText = '';

    for (let i = 0; i < pageSections.length; i++) {
      const pageSection = pageSections[i];
      const content = pageSection.content;
      const encoded = tokenizer.encode(content);
      tokenCount += encoded.text.length;

      if (tokenCount >= 1500) {
        break;
      }

      contextText += `${content.trim()}\n---\n`;
    }

    const prompt = codeBlock`
  ${oneLine`
    You are a very enthusiastic The Guild representative who loves
    to help people! Given the following sections from the The Guild
    documentation, answer the question using only that information,
    outputted in markdown format. If you are unsure and the answer
    is not explicitly written in the documentation, say
    "Sorry, I don't know how to help with that."
  `}

  Context sections:
  ${contextText}

  Question: """
  ${sanitizedQuery}
  """

  Answer as markdown (including related code snippets if available),
  and provide links to the GraphQL Code Generator docs (https://the-guild.dev/graphql/codegen) if applicable:
`;

    const model = new OpenAI({
      openAIApiKey: OPENAI_API_KEY,
      temperature: 0,
      maxTokens: 512,
      streaming: true,
      modelName: 'text-davinci-003',
    });

    const response = await model.call(prompt);
    const answer = response;

    res.status(200).json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default handler;
