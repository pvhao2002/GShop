package com.ecommerce.controller;

import com.ecommerce.dto.common.ApiResponse;
import com.ecommerce.dto.payment.PaymentRequest;
import com.ecommerce.dto.payment.PaymentResponse;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.service.PaymentService;
import com.ecommerce.util.NetworkUtils;
import com.ecommerce.util.PaymentUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse response = paymentService.processPayment(request);
        System.out.println(response.getPaymentUrl());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/cancel/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> cancelPayment(@PathVariable Long id) {
        paymentService.updatePayment(id, OrderStatus.CANCELLED);
        return ResponseEntity.ok(ApiResponse.success("Cancel order success"));
    }

    @GetMapping("/vnpay/return")
    public RedirectView handleVNPayReturn(@RequestParam Map<String, String> params) {
        String deeplink = "exp://%s:8081/--/payment/success?".formatted(NetworkUtils.getLocalIpAddress());
        String txnRef = params.get("vnp_TxnRef");
        var isValid = PaymentUtils.validateVNPaySignature(params, paymentService.getSerectKey());
        if (!isValid) {
            var o = paymentService.updatePayment(txnRef, OrderStatus.CANCELLED);
            deeplink += "orderId=" + o.getId() + "&status=success";
            return new RedirectView(deeplink);
        }

        String responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            var o = paymentService.updatePayment(txnRef, OrderStatus.PROCESSING);
            deeplink += "orderId=" + o.getId() + "&status=success";
        } else {
            var o = paymentService.updatePayment(txnRef, OrderStatus.CANCELLED);
            deeplink += "orderId=" + o.getId() + "&status=fail";
        }
        return new RedirectView(deeplink);
    }
}
