import React from "react";

interface PriceProps {
  amount: string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
}

const Price: React.FC<PriceProps> = ({
  amount,
  className = "",
  currencyCode = "EUR",
  currencyCodeClassName = "",
}) => {
  // We force the Euro symbol as requested and standard European format
  const formattedAmount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "symbol",
  }).format(parseFloat(amount));

  return <p className={className}>{formattedAmount}</p>;
};

export default Price;
