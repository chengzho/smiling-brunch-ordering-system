import { formatCurrency } from '../../utils/formatCurrency';

type CartSummaryProps = {
  totalAmount: number;
  onCheckout: () => void;
  checkoutLoading?: boolean;
};

export function CartSummary({ totalAmount, onCheckout, checkoutLoading }: CartSummaryProps) {
  return (
    <div className="cart-summary card">
      <h2 className="cart-summary-title">訂單摘要</h2>
      <div className="cart-summary-row">
        <span>小計</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
      <div className="cart-summary-divider" />
      <div className="cart-summary-row cart-summary-total">
        <span>合計</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 16 }}
        onClick={onCheckout}
        disabled={checkoutLoading || totalAmount === 0}
      >
        {checkoutLoading ? '處理中...' : '確認結帳'}
      </button>
    </div>
  );
}
