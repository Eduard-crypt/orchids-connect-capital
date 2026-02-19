"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, Book, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiDocsContent = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'curl' | 'node' | 'python'>('curl');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const endpoints = [
    {
      id: 'create-checkout',
      title: 'Create Checkout Session',
      method: 'POST',
      endpoint: '/api/payments/create-checkout-session',
      description: 'Create a new Stripe Checkout Session for payment processing',
      curl: `curl -X POST https://connectcapitals.com/api/payments/create-checkout-session \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "currency": "eur",
    "description": "Business listing fee",
    "metadata": {
      "userId": "user_123",
      "listingId": "listing_456"
    }
  }'`,
      node: `const stripe = require('stripe')('YOUR_API_KEY');

const session = await fetch('https://connectcapitals.com/api/payments/create-checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 50000,
    currency: 'eur',
    description: 'Business listing fee',
    metadata: {
      userId: 'user_123',
      listingId: 'listing_456'
    }
  })
});

const data = await session.json();
console.log(data);`,
      python: `import requests

url = 'https://connectcapitals.com/api/payments/create-checkout-session'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
payload = {
    'amount': 50000,
    'currency': 'eur',
    'description': 'Business listing fee',
    'metadata': {
        'userId': 'user_123',
        'listingId': 'listing_456'
    }
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`
    },
    {
      id: 'create-escrow',
      title: 'Create Escrow Transaction',
      method: 'POST',
      endpoint: '/api/escrow/create',
      description: 'Initialize a new escrow transaction for business acquisition',
      curl: `curl -X POST https://connectcapitals.com/api/escrow/create \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "listingId": "listing_456",
    "buyerId": "user_123",
    "sellerId": "user_789",
    "amount": 850000,
    "currency": "eur",
    "milestones": [
      {
        "name": "Initial deposit",
        "percentage": 20,
        "dueDate": "2024-02-01"
      },
      {
        "name": "Final payment",
        "percentage": 80,
        "dueDate": "2024-03-01"
      }
    ]
  }'`,
      node: `const response = await fetch('https://connectcapitals.com/api/escrow/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    listingId: 'listing_456',
    buyerId: 'user_123',
    sellerId: 'user_789',
    amount: 850000,
    currency: 'eur',
    milestones: [
      {
        name: 'Initial deposit',
        percentage: 20,
        dueDate: '2024-02-01'
      },
      {
        name: 'Final payment',
        percentage: 80,
        dueDate: '2024-03-01'
      }
    ]
  })
});

const escrow = await response.json();
console.log(escrow);`,
      python: `import requests

url = 'https://connectcapitals.com/api/escrow/create'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
payload = {
    'listingId': 'listing_456',
    'buyerId': 'user_123',
    'sellerId': 'user_789',
    'amount': 850000,
    'currency': 'eur',
    'milestones': [
        {
            'name': 'Initial deposit',
            'percentage': 20,
            'dueDate': '2024-02-01'
        },
        {
            'name': 'Final payment',
            'percentage': 80,
            'dueDate': '2024-03-01'
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`
    },
    {
      id: 'get-transaction',
      title: 'Get Transaction Status',
      method: 'GET',
      endpoint: '/api/orders/{orderId}',
      description: 'Retrieve the current status and details of a transaction',
      curl: `curl -X GET https://connectcapitals.com/api/orders/txn_123456 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      node: `const response = await fetch('https://connectcapitals.com/api/orders/txn_123456', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const transaction = await response.json();
console.log(transaction);`,
      python: `import requests

url = 'https://connectcapitals.com/api/orders/txn_123456'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get(url, headers=headers)
print(response.json())`
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'OAuth 2.0 and API keys with rate limiting and IP whitelisting'
    },
    {
      icon: Zap,
      title: 'Real-time Webhooks',
      description: 'Instant notifications for payment events and transaction updates'
    },
    {
      icon: Globe,
      title: 'Multi-currency Support',
      description: 'Process payments in 135+ currencies with automatic conversion'
    },
    {
      icon: Book,
      title: 'Comprehensive Docs',
      description: 'Detailed documentation with examples in multiple languages'
    }
  ];

  return (
    <main className="bg-[#F8F9FA]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A73E8] to-[#0D3A7A] text-white py-24">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container max-w-[1280px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Code className="h-5 w-5" />
              <span className="text-sm font-semibold">RESTful API • v2.0 • Fully Documented</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Payment API Documentation
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Integrate secure payments into your application with our developer-friendly REST API. Complete with code examples and testing tools.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#F8F9FA] to-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#1A73E8] hover:shadow-lg transition-all"
              >
                <div className="bg-[#1A73E8]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#1A73E8]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#222222]">{feature.title}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-12">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#1A73E8] hover:shadow-2xl transition-all"
              >
                <div className="bg-gradient-to-r from-[#F8F9FA] to-white p-6 border-b-2 border-[#E5E7EB]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-[#1A73E8] text-white text-xs font-bold rounded-lg">
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-[#222222]">{endpoint.endpoint}</code>
                      </div>
                      <h3 className="text-2xl font-bold text-[#222222] mb-2">{endpoint.title}</h3>
                      <p className="text-[#666666]">{endpoint.description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {(['curl', 'node', 'python'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLanguage(lang)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          activeLanguage === lang
                            ? 'bg-[#1A73E8] text-white'
                            : 'bg-[#F8F9FA] text-[#666666] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        {lang === 'curl' ? 'cURL' : lang === 'node' ? 'Node.js' : 'Python'}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <pre className="bg-[#1E1E1E] text-[#D4D4D4] p-6 rounded-xl overflow-x-auto">
                      <code className="text-sm font-mono">{endpoint[activeLanguage]}</code>
                    </pre>
                    <Button
                      onClick={() => copyToClipboard(endpoint[activeLanguage], `${endpoint.id}-${activeLanguage}`)}
                      size="sm"
                      variant="outline"
                      className="absolute top-4 right-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {copiedId === `${endpoint.id}-${activeLanguage}` ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#1A73E8] to-[#00C48C] text-white">
        <div className="container max-w-[1280px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Integrate?</h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Get your API keys and start building with our payment infrastructure today. Full sandbox environment available for testing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-8 bg-white text-[#1A73E8] hover:bg-white/90 font-bold rounded-xl shadow-2xl"
              >
                Get API Keys
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold rounded-xl"
              >
                View Full Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ApiDocsContent;
