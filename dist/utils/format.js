"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyFormatter = void 0;
exports.currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currency: "INR",
});
