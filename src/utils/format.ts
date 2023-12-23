export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  currency: "INR",
});
