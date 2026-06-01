import { ArrowLeft, Terminal, Key, Code } from "lucide-react";
import Link from "next/link";

export default function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/docs" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Documentation
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Getting Started</h1>
      <p className="mt-2 text-gray-500">Get up and running with JurisAI in minutes</p>

      <div className="mt-12 space-y-12">
        <section>
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Get Your API Key</h2>
          </div>
          <p className="mt-2 text-gray-500">Sign up and navigate to Settings &gt; API Keys to create your first key.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>{`curl -X POST https://api.jurisai.io/v1/api-keys \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My First Key" }'`}</code></pre>
        </section>

        <section>
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Make Your First Request</h2>
          </div>
          <p className="mt-2 text-gray-500">Use your API key to query legal documents.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>{`curl https://api.jurisai.io/v1/agents \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "query": "What are the requirements for a valid contract?" }'`}</code></pre>
        </section>

        <section>
          <div className="flex items-center gap-3">
            <Code className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Install the SDK</h2>
          </div>
          <p className="mt-2 text-gray-500">Install the JavaScript or Python SDK.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>npm install @jurisai/sdk</code></pre>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>pip install jurisai-sdk</code></pre>
        </section>
      </div>
    </div>
  );
}
