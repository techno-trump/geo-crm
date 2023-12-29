type NumberInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const NumberInput = ({ value, onChange }: NumberInputProps) => {
  return (
    <input
      value={value}
      onChange={(e) => {
        let value = e.target.value;
        value = value.replace(/[^0-9.]/g, "");

        if (
          value.charAt(0) === "0" &&
          value.charAt(1) !== "." &&
          value.length > 1
        ) {
          value = value.slice(1);
        }

        // Если введена точка первой, добавляем 0 в начало
        if (value.charAt(0) === ".") {
          value = "0" + value;
        }

        // Если введено более одной точки, оставляем только первую
        const decimalCount = value.split(".").length - 1;
        if (decimalCount > 1) {
          const parts = value.split(".");
          value = parts[0] + "." + parts.slice(1).join("");
        }
        onChange(value);
      }}
      type="text"
    />
  );
};
