export function fmt(n: number) {
  return "₪" + (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""));
}

export const FF = "'Google Sans','Heebo',sans-serif";
