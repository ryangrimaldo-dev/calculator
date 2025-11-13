/*
  Simple Calculator
  - Supports: add, subtract, multiply, divide
  - Buttons: digits, ., +, -, *, /, =, C, ⌫
  - Keyboard: 0–9, ., +, -, *, /, Enter, Backspace, Escape
  - No inline handlers; all JS here
*/

// DOM references
const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keysEl = document.querySelector(".keys");
const easterEl = document.getElementById("easter");
let hideTimerId = null;
let resultHideTimerId = null;

// Calculator state
let expression = "0";        // current input/expression string
let justEvaluated = false;   // flag to manage chaining vs starting new

// Utility: update both display lines
function updateDisplay() {
  expressionEl.textContent = expression || "0";
  // result shown only after evaluation; keep previous result until cleared or next evaluation
}

// Utility: test if a character is an operator
function isOperator(ch) {
  return ch === "+" || ch === "-" || ch === "*" || ch === "/";
}

// Utility: get current number token (right of last operator)
function currentNumberToken(expr) {
  // Split by operators to isolate the current number chunk
  const parts = expr.split(/([+\-*/])/);
  return parts.length ? parts[parts.length - 1] : expr;
}

// Clear everything
function clearAll() {
  expression = "0";
  resultEl.textContent = "";
  justEvaluated = false;
  updateDisplay();
}

// Backspace: remove last character safely
function backspace() {
  if (justEvaluated) {
    // If we just evaluated, backspace should operate on the expression/result text
    justEvaluated = false;
  }
  if (expression.length <= 1) {
    expression = "0";
  } else {
    expression = expression.slice(0, -1);
    // Avoid trailing solitary "-" as sole content
    if (!/[0-9.]/.test(expression[expression.length - 1]) && expression.replace(/[+\-*/.]/g, "").length === 0) {
      expression = "0";
    }
  }
  updateDisplay();
}

// Append a digit
function appendDigit(d) {
  if (justEvaluated) {
    // After equals: starting with a number begins a new expression
    expression = d;
    justEvaluated = false;
  } else if (expression === "0") {
    expression = d;
  } else {
    expression += d;
  }
  updateDisplay();
}

// Append dot with single-dot-per-number guard
function appendDot() {
  const token = currentNumberToken(expression);
  if (token.includes(".")) return; // ignore extra dots in the same number
  if (justEvaluated) {
    expression = "0.";
    justEvaluated = false;
  } else if (expression === "0" || isOperator(expression.slice(-1))) {
    expression += (expression === "0" ? "." : "0.");
  } else {
    expression += ".";
  }
  updateDisplay();
}

// Append or replace operator
function appendOperator(op) {
  const last = expression.slice(-1);
  if (justEvaluated) {
    // Allow chaining operations using the evaluated result
    justEvaluated = false;
  }
  if (isOperator(last)) {
    // Replace trailing operator
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }
  updateDisplay();
}

// Sanitize expression before evaluation to prevent unsafe input
function sanitize(expr) {
  // Allow digits, operators, decimal, and spaces; strip anything else
  const safe = expr.replace(/[^0-9+\-*/. ]/g, "");
  // Trim trailing operators to avoid SyntaxError
  return safe.replace(/[+\-*/. ]+$/g, "");
}

// Evaluate expression; show result
function evaluateExpression() {
  const safeExpr = sanitize(expression);
  if (!safeExpr) return;
  try {
    // Use Function constructor for basic evaluation after strict sanitization
    const result = Function(`"use strict"; return (${safeExpr})`)();
    justEvaluated = true;
    resultEl.textContent = "SOLVE IT URSELF NIGGA";
  } catch {
    resultEl.textContent = "SOLVE IT URSELF NIGGA";
  }
  if (resultHideTimerId) { clearTimeout(resultHideTimerId); }
  resultHideTimerId = setTimeout(() => {
    resultEl.textContent = "";
    resultHideTimerId = null;
  }, 3000);
  if (easterEl) {
    if (hideTimerId) { clearTimeout(hideTimerId); }
    easterEl.classList.add("visible");
    hideTimerId = setTimeout(() => {
      easterEl.classList.remove("visible");
      hideTimerId = null;
    }, 3000);
  }
  updateDisplay();
}

// Central input handler (clicks and keys)
function handleInput(input) {
  if (input === "clear") {
    clearAll();
  } else if (input === "backspace") {
    backspace();
  } else if (input === "=" || input === "Enter") {
    evaluateExpression();
  } else if (input === ".") {
    appendDot();
  } else if (isOperator(input)) {
    appendOperator(input);
  } else if (/^\d$/.test(input)) {
    appendDigit(input);
  }
}

// Event delegation for button clicks
keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button.key");
  if (!btn) return;
  const key = btn.getAttribute("data-key");
  if (!key) return;
  handleInput(key);
});

// Keyboard support
window.addEventListener("keydown", (e) => {
  const k = e.key;
  // Prevent default on Enter/Backspace to avoid form submissions or browser nav
  if (k === "Enter" || k === "Backspace") e.preventDefault();
  if (/^\d$/.test(k) || isOperator(k) || k === "." || k === "Enter") {
    handleInput(k);
  } else if (k === "Escape") {
    handleInput("clear");
  } else if (k === "Backspace") {
    handleInput("backspace");
  }
});

// Initialize display on load
updateDisplay();