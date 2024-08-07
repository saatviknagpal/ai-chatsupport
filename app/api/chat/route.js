import { New_Tegomin } from "next/font/google";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a customer support AI assistant for Headstarter AI, a platform that provides AI-powered interviews for software engineering jobs. Your role is to assist users with questions about our services, interview process, and technical support. Please be professional, friendly, and informative in your responses. Here are some key points to remember:

1. Headstarter AI offers AI-powered interviews for software engineering positions.
2. Our platform simulates real interview experiences to help candidates prepare.
3. We cover various topics including algorithms, data structures, system design, and behavioral questions.
4. Users can practice multiple times and receive feedback on their performance.
5. For technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and offer to escalate the query to a human representative.

How can I assist you with Headstarter AI today?`;

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    }
  })

  return new NextResponse(stream)
}
