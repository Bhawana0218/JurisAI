import { Code2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const snippets = [
  { lang: "JavaScript", code: `import { JurisAI } from '@jurisai/sdk';

const client = new JurisAI({
  apiKey: 'your-api-key'
});

const response = await client.agents.execute({
  agentId: 'legal-researcher',
  query: 'What are the elements of negligence?'
});

console.log(response.result);` },
  { lang: "Python", code: `from jurisai import JurisAI

client = JurisAI(api_key='your-api-key')

response = client.agents.execute(
    agent_id='legal-researcher',
    query='What are the elements of negligence?'
)

print(response.result)` },
  { lang: "cURL", code: `curl -X POST https://api.jurisai.io/v1/agents \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "legal-researcher",
    "query": "What are the elements of negligence?"
  }'` },
];

export default function SdkDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/docs" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Documentation
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SDK Reference</h1>
      <p className="mt-2 text-gray-500">Integrate JurisAI using our official SDKs</p>

      <div className="mt-12 space-y-8">
        {snippets.map((s) => (
          <div key={s.lang}>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">{s.lang}</h2>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>{s.code}</code></pre>
          </div>
        ))}
      </div>
    </div>
  );
}
