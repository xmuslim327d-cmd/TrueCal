import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from "react-native";

const OPS = ["+", "−", "×", "÷"];

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

function calculate(a, op, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return NaN;
  if (op === "+") return x + y;
  if (op === "−") return x - y;
  if (op === "×") return x * y;
  if (op === "÷") return y === 0 ? NaN : x / y;
  return y;
}

export default function App() {
  const { width } = useWindowDimensions();
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [expression, setExpression] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);
  const [error, setError] = useState(false);
  const pressTimer = useRef(null);

  const buttonSize = Math.min((width - 52) / 4, 86);

  const clear = () => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setWaiting(false);
    setExpression("");
    setJustCalculated(false);
    setError(false);
  };

  const inputDigit = (digit) => {
    setError(false);
    if (waiting || justCalculated) {
      setDisplay(digit);
      setWaiting(false);
      setJustCalculated(false);
      return;
    }
    setDisplay(display === "0" ? digit : display.length < 14 ? display + digit : display);
  };

  const inputDecimal = () => {
    setError(false);
    if (waiting || justCalculated) {
      setDisplay("0.");
      setWaiting(false);
      setJustCalculated(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const chooseOperator = (nextOp) => {
    setError(false);
    const value = Number(display);
    if (!Number.isFinite(value)) return;

    if (operator && stored !== null && !waiting) {
      const result = calculate(stored, operator, value);
      if (!Number.isFinite(result)) {
        setDisplay("Error");
        setError(true);
        return;
      }
      setStored(result);
      setDisplay(formatNumber(result));
    } else {
      setStored(value);
    }

    setOperator(nextOp);
    setWaiting(true);
    setJustCalculated(false);
    setExpression(`${formatNumber(value)} ${nextOp}`);
  };

  const equals = () => {
    if (!operator || stored === null || error) return;
    const value = Number(display);
    const result = calculate(stored, operator, value);

    if (!Number.isFinite(result)) {
      setDisplay("Error");
      setExpression("");
      setError(true);
      return;
    }

    setExpression(`${formatNumber(stored)} ${operator} ${formatNumber(value)}`);
    setDisplay(formatNumber(result));
    setStored(null);
    setOperator(null);
    setWaiting(false);
    setJustCalculated(true);
  };

  const toggleSign = () => {
    if (error) return;
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  };

  const percent = () => {
    if (error) return;
    const value = Number(display);
    if (Number.isFinite(value)) setDisplay(formatNumber(value / 100));
  };

  const backspace = () => {
    if (error || waiting || justCalculated) return clear();
    const next = display.length > 1 ? display.slice(0, -1) : "0";
    setDisplay(next === "-" ? "0" : next);
  };

  const onPressIn = () => {
    pressTimer.current = setTimeout(() => {}, 1);
  };

  const onPressOut = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const rows = useMemo(
    () => [
      [
        { label: "AC", type: "utility", action: clear },
        { label: "⌫", type: "utility", action: backspace },
        { label: "%", type: "utility", action: percent },
        { label: "÷", type: "operator", action: () => chooseOperator("÷") },
      ],
      [
        { label: "7", action: () => inputDigit("7") },
        { label: "8", action: () => inputDigit("8") },
        { label: "9", action: () => inputDigit("9") },
        { label: "×", type: "operator", action: () => chooseOperator("×") },
      ],
      [
        { label: "4", action: () => inputDigit("4") },
        { label: "5", action: () => inputDigit("5") },
        { label: "6", action: () => inputDigit("6") },
        { label: "−", type: "operator", action: () => chooseOperator("−") },
      ],
      [
        { label: "1", action: () => inputDigit("1") },
        { label: "2", action: () => inputDigit("2") },
        { label: "3", action: () => inputDigit("3") },
        { label: "+", type: "operator", action: () => chooseOperator("+") },
      ],
      [
        { label: "±", type: "utility", action: toggleSign },
        { label: "0", action: () => inputDigit("0"), wide: true },
        { label: ".", action: inputDecimal },
        { label: "=", type: "equals", action: equals },
      ],
    ],
    [display, stored, operator, waiting, justCalculated, error]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#05070A" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>TRUECAL</Text>
            <Text style={styles.subtitle}>PRECISION CALCULATOR</Text>
          </View>
          <View style={styles.offlinePill}>
            <View style={styles.dot} />
            <Text style={styles.offlineText}>OFFLINE</Text>
          </View>
        </View>

        <View style={styles.displayCard}>
          <Text style={styles.expression} numberOfLines={1}>
            {expression || "Ready"}
          </Text>
          <Text
            style={[styles.display, display.length > 10 && styles.displaySmall]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {display}
          </Text>
        </View>

        <View style={styles.keypad}>
          {rows.map((row, rowIndex) => (
            <View style={styles.row} key={rowIndex}>
              {row.map((button) => {
                const widthStyle = button.wide ? { width: buttonSize * 2 + 12 } : { width: buttonSize };
                return (
                  <Pressable
                    key={button.label}
                    onPress={button.action}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={({ pressed }) => [
                      styles.button,
                      widthStyle,
                      button.type === "utility" && styles.utility,
                      button.type === "operator" && styles.operator,
                      button.type === "equals" && styles.equals,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.type === "utility" && styles.utilityText,
                        button.type === "operator" && styles.operatorText,
                        button.type === "equals" && styles.equalsText,
                      ]}
                    >
                      {button.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TRUEDEVS / TRUECAL</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#05070A" },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#05070A",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brand: {
    color: "#F5F7FA",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 3,
  },
  subtitle: {
    color: "#6D7785",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginTop: 3,
  },
  offlinePill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#18242D",
    backgroundColor: "#0A0F13",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 99,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#25D98A",
    marginRight: 6,
  },
  offlineText: {
    color: "#8A96A3",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  displayCard: {
    flex: 1,
    minHeight: 180,
    maxHeight: 320,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#111A21",
    backgroundColor: "#080C10",
    marginBottom: 18,
  },
  expression: {
    color: "#596673",
    fontSize: 16,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  display: {
    color: "#F5F7FA",
    fontSize: 54,
    fontWeight: "300",
    letterSpacing: -1,
  },
  displaySmall: { fontSize: 42 },
  keypad: { gap: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    height: 68,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D1318",
    borderWidth: 1,
    borderColor: "#151E26",
  },
  utility: { backgroundColor: "#111820", borderColor: "#1B2832" },
  operator: { backgroundColor: "#0C2025", borderColor: "#123E47" },
  equals: { backgroundColor: "#00C2D7", borderColor: "#1FE1F2" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
  buttonText: { color: "#E7EDF2", fontSize: 24, fontWeight: "600" },
  utilityText: { color: "#A8B4BF", fontSize: 20 },
  operatorText: { color: "#59E4F0", fontSize: 27, fontWeight: "500" },
  equalsText: { color: "#031014", fontSize: 28, fontWeight: "800" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  footerText: {
    color: "#3E4A55",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  version: { color: "#34404A", fontSize: 9, fontWeight: "700" },
});
