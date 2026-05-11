import { motion } from "framer-motion";

export default function GradientButton({
  children,
  onClick,
  className = "",
  size = "md",
  variant = "primary",
  disabled = false,
  type = "button",
  ...props
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white shadow-lg shadow-primary-500/25",
    secondary:
      "bg-surface-800 hover:bg-surface-700 text-white border border-surface-600",
    ghost:
      "bg-transparent hover:bg-white/10 text-white",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`
        ${sizes[size]} ${variants[variant]}
        rounded-xl font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}
