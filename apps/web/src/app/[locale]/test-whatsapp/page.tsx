'use client';

import { useState } from 'react';

export default function TestWhatsAppPage() {
  const [formData, setFormData] = useState({
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    customer_email: 'john@example.com',
    items: [
      {
        name: 'Soft Tailoring Dress',
        quantity: 1,
        price: 129000,
        color: 'Bone',
        size: 'M',
      },
    ],
    total_amount: 129000,
    currency: 'AED',
    notes: 'Test order',
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test WhatsApp Notifications</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Customer Name:
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Customer Phone:
            <input
              type="text"
              value={formData.customer_phone}
              onChange={(e) =>
                setFormData({ ...formData, customer_phone: e.target.value })
              }
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Total Amount (in cents):
            <input
              type="number"
              value={formData.total_amount}
              onChange={(e) =>
                setFormData({ ...formData, total_amount: Number(e.target.value) })
              }
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Currency:
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="AED">AED</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#ccc' : '#1A1A1A',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Create Order & Send WhatsApp'}
        </button>
      </form>

      {result && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            borderRadius: '4px',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          <h3>{result.success ? 'Success!' : 'Error'}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Setup Instructions:</h3>
        <ol>
          <li>Create a Facebook Developer Account at https://developers.facebook.com/</li>
          <li>Apply for WhatsApp Business API access</li>
          <li>Set environment variables in your .env file:</li>
          <ul>
            <li>WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id</li>
            <li>WHATSAPP_ACCESS_TOKEN=your_access_token</li>
            <li>WHATSAPP_API_VERSION=v18.0</li>
          </ul>
          <li>Run the SQL migration in Supabase Dashboard → SQL Editor</li>
          <li>Test with your phone number</li>
        </ol>
      </div>
    </div>
  );
}