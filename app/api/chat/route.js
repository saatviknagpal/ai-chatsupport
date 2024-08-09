import { New_Tegomin } from "next/font/google";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a customer support AI assistant for the 75 Hard Challenge, a mental toughness program that helps individuals transform their lives through discipline and consistency. Your role is to assist users with questions about the challenge, daily tasks, and technical support. Please be professional, friendly, and informative in your responses. Here are some key points to remember:

1. The 75 Hard Challenge is a mental toughness program that lasts for 75 days.
2. Participants must complete the following daily tasks:
- Follow a diet with no cheat meals or alcohol.
- Complete two 45-minute workouts, one of which must be outdoors.
- Drink one gallon of water.
- Read 10 pages of a non-fiction book.
- Take a progress photo.
3. Users must start over from day one if they miss any of the tasks.
4. The program aims to build discipline, grit, and mental toughness.
5. For technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and offer to escalate the query to a human representative.

How can I assist you with the 75 Hard Challenge today?`;

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
