# apppay-react

A React component for accepting cryptocurrency payments with cross-chain support. Simple, secure, and powerful.

## Features

- 🚀 **Zero Configuration**: Auto-detects development vs production environments
- 🔒 **Secure**: Payment data loaded securely from AppPay servers
- 🌐 **Cross-Chain**: Support for multiple blockchains and tokens
- ⚡ **Real-Time**: Live quotes and transaction updates via WebSocket
- 🎨 **Customizable**: Light/dark themes and custom CSS styling
- 📱 **Responsive**: Works on all devices
- 🔑 **No API Keys**: Everything works with payment IDs only

[![npm version](https://badge.fury.io/js/apppay-react.svg)](https://badge.fury.io/js/apppay-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install apppay-react
```

**Note:** Thirdweb is bundled with this package - no need to install it separately!

### Key Features

- ✅ **Zero Configuration**: Just import and use - no setup required
- ✅ **Embedded ThirdwebProvider**: Wallet connectivity built-in
- ✅ **Complete Wallet Integration**: Connect button and wallet management included
- ✅ **Production Ready**: Uses `api.apppay.ai` and `ws.apppay.ai` endpoints
- ✅ **Secure**: Payment ID-based authentication
- ✅ **Customizable**: Full styling and theming support
- ✅ **TypeScript**: Full type definitions included

## Quick Start

```tsx
import { PaymentModal } from 'apppay-react';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const paymentId = 'pay_1234567890'; // Get this from your backend

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Pay Now
      </button>

      <PaymentModal
        paymentId={paymentId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPaymentComplete={(result) => {
          console.log('Payment successful:', result);
          setIsOpen(false);
        }}
        theme="dark"
        style={{
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      />
    </div>
  );
}
```

### Complete Flow

1. **Click "Pay Now"** → Modal opens
2. **Connect Wallet** → Thirdweb connect button appears if no wallet connected
3. **Find Routes** → System discovers available payment routes
4. **Select Route** → Choose preferred payment method
5. **Execute Payment** → Complete the transaction

The PaymentModal handles everything automatically - wallet connection, route discovery, and payment execution.

## API Reference

### PaymentModal Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `paymentId` | `string` | ✅ | Unique payment identifier from AppPay |
| `isOpen` | `boolean` | ✅ | Controls modal visibility |
| `onClose` | `() => void` | ❌ | Called when user closes modal |
| `onPaymentComplete` | `(result: PaymentResult) => void` | ❌ | Called on successful payment |
| `theme` | `'light' \| 'dark'` | ❌ | UI theme (default: 'light') |
| `style` | `React.CSSProperties` | ❌ | Custom styling |

### PaymentResult

```tsx
interface PaymentResult {
  paymentId: string;
  transactionHash: string;
  amount: string;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
  metadata?: Record<string, any>;
}
```

## How It Works

1. **Create Payment**: Use AppPay API to create a payment and get a `paymentId`
2. **Show Modal**: Pass the `paymentId` to the PaymentModal component
3. **Auto-Connect**: Modal automatically connects to correct API/WebSocket endpoints
4. **Load Data**: Payment details are securely loaded from AppPay servers
5. **User Pays**: Modal guides user through wallet connection and payment
6. **Success**: `onPaymentComplete` callback is triggered with transaction details

### Environment Auto-Detection

The package automatically detects your environment:

| Environment | API Endpoint | WebSocket Endpoint |
|-------------|-------------|-------------------|
| **Development** (`localhost`) | `http://localhost:3082` | `ws://localhost:3084` |
| **Production** (all others) | `https://api.apppay.ai` | `wss://ws.apppay.ai` |

**No configuration needed!** 🎉

## Creating Payments

First, create a payment using the AppPay API:

```javascript
// Example: Create payment via fetch
const response = await fetch('https://api.apppay.ai/api/mcp/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: '99.99',
    currency: 'USD',
    title: 'Premium Subscription',
    description: 'Monthly access to premium features'
  })
});

const { paymentId } = await response.json();
```

## Thirdweb Integration

ThirdwebProvider is automatically included in the PaymentModal component. You don't need to set up anything additional - just use the PaymentModal component directly in your app!

## Customization

### Themes

```tsx
<PaymentModal
  paymentId={paymentId}
  isOpen={isOpen}
  theme="dark" // or "light"
/>
```

### Custom Styling

The `style` prop accepts any valid React `CSSProperties` object and is applied to the modal container:

```tsx
<PaymentModal
  paymentId={paymentId}
  isOpen={isOpen}
  style={{
    // Modal container styling
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '500px',
    minHeight: '600px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '2px solid #e2e8f0'
  }}
/>
```

#### Advanced Styling Examples

**Rounded Corners & Shadows:**
```tsx
style={{
  borderRadius: '24px',
  boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}}
```

**Custom Colors:**
```tsx
style={{
  background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
  color: 'white'
}}
```

**Size Customization:**
```tsx
style={{
  width: '90vw',
  maxWidth: '600px',
  minHeight: '700px'
}}
```

#### Styling Notes

- **CSS Priority**: The `style` prop has higher priority than Tailwind classes
- **Theme Override**: Custom `background`/`color` will override light/dark theme
- **Responsive**: Use `vw`, `vh`, `%` for mobile compatibility
- **Z-Index**: Modal has `z-50` (z-index: 50) - use `style.zIndex` to override
- **Animation**: Framer Motion animations work with all custom styles
- **Inheritance**: Child elements inherit text color from modal container
- **Tailwind Conflicts**: Some Tailwind classes may be overridden by style prop

#### Common Style Overrides

```tsx
// Override default rounded corners
style={{ borderRadius: '8px' }} // Overrides rounded-xl

// Custom background (overrides theme)
style={{ background: '#f0f0f0' }} // Overrides bg-white/bg-slate-900

// Custom sizing
style={{ maxWidth: '400px', height: '500px' }} // Overrides max-w-md

// Custom shadows
style={{
  boxShadow: '0 10px 40px rgba(0,0,0,0.3)' // Overrides shadow-2xl
}}
```

## Advanced Usage

### Using Hooks Directly

```tsx
import { useRouteDiscovery, usePaymentExecution, AppPayAPI } from 'apppay-react';

function CustomPaymentFlow() {
  const api = new AppPayAPI();
  const { routes, discoverRoutes } = useRouteDiscovery(api);
  const { executePayment, isProcessing } = usePaymentExecution(paymentData);

  // Custom implementation...
}
```

## Error Handling

The modal handles common errors automatically:

- **No Wallet**: Prompts user to install/connect wallet
- **Network Issues**: Shows retry options
- **Insufficient Funds**: Displays helpful error messages
- **Transaction Failures**: Provides clear feedback

## Security

- ✅ **No API Keys**: Everything works with payment IDs
- ✅ **Server-Side Validation**: Payment data is validated on AppPay servers
- ✅ **Secure Communication**: HTTPS and WSS connections
- ✅ **No Sensitive Data**: Payment details stay on AppPay infrastructure

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development & Local Testing

### Local Development Workflow

For faster iteration during development, you can test your changes locally before publishing:

#### 1. Build the Package
```bash
cd npm/apppay/react
npm run build
```

#### 2. Link the Local Package
```bash
# In the npm package directory
npm run link
```

#### 3. Link in Test App
```bash
# In your test consumer app directory
npm uninstall apppay-react  # Remove npm version
npm link apppay-react       # Link local version
```

#### 4. Test Locally
```bash
# In your test consumer app directory
npm run dev
```

#### 5. Make Changes
Edit files in `npm/apppay/react/src/` and rebuild:
```bash
cd npm/apppay/react
npm run build  # Changes will appear in test app immediately
```

#### 6. Unlink When Done
```bash
# In test consumer app
npm unlink apppay-react
npm install apppay-react@latest  # Install published version
```

### Publishing Workflow

```bash
# Bump version in package.json
npm version patch  # or minor/major

# Build and publish
npm run build
npm publish

# Verify
npm view apppay-react version
```

## Contributing

This package is part of the AppPay ecosystem. For contributions or issues, please visit:

- **Repository**: [https://github.com/apppayai/react](https://github.com/apppayai/react)
- **Issues**: [https://github.com/apppayai/react/issues](https://github.com/apppayai/react/issues)
- **NPM**: [https://www.npmjs.com/package/apppay-react](https://www.npmjs.com/package/apppay-react)

## License

MIT © AppPay Team
