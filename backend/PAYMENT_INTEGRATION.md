# Payment Gateway Integration

This document describes the payment gateway integration implementation for the e-commerce platform, supporting COD (Cash on Delivery), MoMo, and VNPay payment methods.

## Overview

The payment system is designed to handle multiple payment methods with a unified API interface. Each payment method has its own processing logic while maintaining consistent data structures and error handling.

## Supported Payment Methods

### 1. Cash on Delivery (COD)
- **Description**: Payment collected upon delivery
- **Status**: Pending until delivery confirmation
- **Confirmation**: Manual confirmation by admin when order is delivered

### 2. MoMo Wallet
- **Description**: Vietnamese mobile wallet payment
- **Integration**: REST API with webhook notifications
- **Flow**: Redirect to MoMo → Payment → Webhook notification → Status update

### 3. VNPay
- **Description**: Vietnamese payment gateway
- **Integration**: URL-based payment with return URL
- **Flow**: Redirect to VNPay → Payment → Return URL → Status update

## API Endpoints

### Payment Processing
```
POST /api/payment/process
POST /api/payment/cod
POST /api/payment/momo  
POST /api/payment/vnpay
```

### Payment Status
```
GET /api/payment/status/{orderId}
GET /api/payment/transaction/{transactionId}
```

### Webhooks & Callbacks
```
POST /api/payment/momo/notify     (MoMo webhook)
GET /api/payment/vnpay/return     (VNPay return URL)
POST /api/payment/cod/confirm/{orderId}  (COD confirmation)
```

## Configuration

Payment gateway configurations are defined in `application.yml`:

```yaml
payment:
  momo:
    partner-code: ${MOMO_PARTNER_CODE}
    access-key: ${MOMO_ACCESS_KEY}
    secret-key: ${MOMO_SECRET_KEY}
    endpoint: ${MOMO_ENDPOINT}
    return-url: ${MOMO_RETURN_URL}
    notify-url: ${MOMO_NOTIFY_URL}
  
  vnpay:
    tmn-code: ${VNPAY_TMN_CODE}
    hash-secret: ${VNPAY_HASH_SECRET}
    url: ${VNPAY_URL}
    return-url: ${VNPAY_RETURN_URL}
    version: "2.1.0"
    command: "pay"
    order-type: "other"
```

## Environment Variables

Set the following environment variables for production:

```bash
# MoMo Configuration
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://payment.momo.vn
MOMO_RETURN_URL=https://yourapp.com/payment/momo/return
MOMO_NOTIFY_URL=https://yourapi.com/api/payment/momo/notify

# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourapp.com/payment/vnpay/return
```

## Payment Flow

### 1. COD Payment Flow
```
1. Customer selects COD
2. Order created with PENDING payment status
3. Order confirmed and shipped
4. Admin confirms payment on delivery
5. Payment status updated to PAID
```

### 2. MoMo Payment Flow
```
1. Customer selects MoMo
2. Payment request sent to MoMo API
3. Customer redirected to MoMo payment page
4. Customer completes payment
5. MoMo sends webhook notification
6. Payment status updated based on result
```

### 3. VNPay Payment Flow
```
1. Customer selects VNPay
2. Payment URL generated with signature
3. Customer redirected to VNPay
4. Customer completes payment
5. VNPay redirects to return URL
6. Payment status updated based on result
```

## Security Features

### 1. Signature Validation
- **MoMo**: HMAC-SHA256 signature validation
- **VNPay**: HMAC-SHA512 signature validation
- All webhook/callback data is validated before processing

### 2. Transaction ID Generation
- Unique transaction IDs generated for each payment
- Format: `TXN_{timestamp}_{random}`
- Prevents duplicate transactions

### 3. Amount Validation
- Payment amount must match order total
- Prevents payment manipulation

### 4. Order Status Validation
- Prevents duplicate payments for same order
- Validates order ownership

## Error Handling

### Payment Exceptions
- `PaymentException`: Custom exception for payment-related errors
- Global exception handler provides consistent error responses
- Detailed logging for debugging

### Common Error Scenarios
1. **Invalid Order**: Order not found or doesn't belong to user
2. **Amount Mismatch**: Payment amount doesn't match order total
3. **Duplicate Payment**: Order already has successful payment
4. **Gateway Error**: External payment gateway errors
5. **Signature Validation**: Invalid webhook signatures

## Database Schema

### Payment Entity
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    payment_method ENUM('COD', 'MOMO', 'VNPAY'),
    status ENUM('PENDING', 'PAID', 'FAILED'),
    amount DECIMAL(10,2) NOT NULL,
    gateway_response TEXT,
    gateway_transaction_id VARCHAR(255),
    failure_reason VARCHAR(500),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

## Testing

### Unit Tests
- Payment service logic testing
- Signature validation testing
- Error handling testing

### Integration Tests
- End-to-end payment flow testing
- Webhook handling testing
- Database transaction testing

### Mock Testing
- External gateway API mocking
- Webhook simulation
- Error scenario testing

## Monitoring & Logging

### Payment Metrics
- Payment success/failure rates
- Payment method usage statistics
- Average payment processing time
- Gateway response time monitoring

### Logging
- All payment requests logged
- Webhook notifications logged
- Error scenarios with stack traces
- Security events (invalid signatures)

## Deployment Considerations

### Production Setup
1. Configure SSL certificates for webhook endpoints
2. Set up proper firewall rules for gateway IPs
3. Configure monitoring and alerting
4. Set up backup payment methods

### Scaling
- Payment processing is stateless
- Database connection pooling for high throughput
- Async webhook processing for better performance
- Rate limiting for payment endpoints

## Troubleshooting

### Common Issues
1. **Webhook Not Received**: Check firewall, SSL, and endpoint accessibility
2. **Signature Validation Failed**: Verify secret keys and signature algorithm
3. **Payment Stuck in Pending**: Check gateway status and manual intervention
4. **Duplicate Transactions**: Implement idempotency keys

### Debug Steps
1. Check application logs for errors
2. Verify gateway configuration
3. Test webhook endpoints manually
4. Validate signature generation
5. Check database transaction status

## Security Best Practices

1. **Never log sensitive data** (secret keys, full payment details)
2. **Validate all webhook data** before processing
3. **Use HTTPS** for all payment-related endpoints
4. **Implement rate limiting** on payment endpoints
5. **Regular security audits** of payment code
6. **PCI DSS compliance** for card data handling
7. **Encrypt sensitive configuration** data

## Support & Maintenance

### Regular Tasks
- Monitor payment success rates
- Update gateway configurations
- Review and rotate secret keys
- Update payment method documentation
- Performance optimization

### Emergency Procedures
- Payment gateway outage handling
- Failed payment recovery
- Fraud detection and prevention
- Customer support escalation

For technical support or questions about the payment integration, please refer to the development team or check the API documentation at `/swagger-ui.html`.