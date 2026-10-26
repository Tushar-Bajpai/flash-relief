import { dark } from "@clerk/themes";

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#00e5ff",
    colorBackground: "#081a21",
    colorInputBackground: "#051217",
    colorInputText: "#eaf5f4",
    colorText: "#eaf5f4",
    colorTextSecondary: "#72d9e8",
    colorNeutral: "#eaf5f4",
    colorDanger: "#ff785f",
    colorSuccess: "#10b981",
    colorWarning: "#f4c969",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
  },
  elements: {
    modalBackdrop: {
      backgroundColor: "rgba(3, 11, 15, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    },
    modalContent: {
      border: "1px solid rgba(0, 229, 255, 0.25)",
      borderRadius: "16px",
      boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 229, 255, 0.15)",
      overflow: "hidden",
    },
    card: {
      background: "linear-gradient(180deg, #091e26 0%, #06151b 100%)",
      border: "1px solid rgba(0, 229, 255, 0.22)",
      boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 229, 255, 0.12)",
      borderRadius: "16px",
    },
    headerTitle: {
      fontFamily: "inherit",
      fontSize: "1.35rem",
      fontWeight: "700",
      letterSpacing: "-0.02em",
      color: "#eaf5f4",
      textShadow: "0 0 20px rgba(0, 229, 255, 0.35)",
    },
    headerSubtitle: {
      fontSize: "0.86rem",
      color: "#72d9e8",
      letterSpacing: "-0.01em",
      marginTop: "4px",
    },
    socialButtonsBlockButton: {
      backgroundColor: "rgba(14, 40, 50, 0.75)",
      border: "1px solid rgba(0, 229, 255, 0.25)",
      borderRadius: "10px",
      color: "#eaf5f4",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      "&:hover": {
        backgroundColor: "rgba(20, 56, 70, 0.9)",
        borderColor: "#00e5ff",
        boxShadow: "0 0 16px rgba(0, 229, 255, 0.25)",
        transform: "translateY(-1px)",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#eaf5f4",
      fontWeight: "500",
      fontSize: "0.88rem",
    },
    dividerLine: {
      background: "linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.35), transparent)",
      height: "1px",
    },
    dividerText: {
      color: "rgba(234, 245, 244, 0.5)",
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: "600",
    },
    formFieldLabel: {
      color: "#eaf5f4",
      fontSize: "0.78rem",
      fontWeight: "600",
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      marginBottom: "6px",
    },
    formFieldInput: {
      backgroundColor: "#051217",
      border: "1px solid rgba(0, 229, 255, 0.25)",
      borderRadius: "10px",
      color: "#eaf5f4",
      fontSize: "0.92rem",
      padding: "10px 14px",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: "#00e5ff",
        boxShadow: "0 0 0 2px rgba(0, 229, 255, 0.3)",
      },
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)",
      color: "#041014",
      fontWeight: "700",
      fontSize: "0.9rem",
      letterSpacing: "0.02em",
      borderRadius: "10px",
      border: "none",
      boxShadow: "0 0 22px rgba(0, 229, 255, 0.4)",
      transition: "all 0.2s ease",
      "&:hover": {
        background: "linear-gradient(135deg, #33ebff 0%, #00c8e6 100%)",
        boxShadow: "0 0 30px rgba(0, 229, 255, 0.65)",
        transform: "translateY(-1px)",
      },
    },
    footer: {
      backgroundColor: "rgba(5, 18, 23, 0.85)",
      borderTop: "1px solid rgba(0, 229, 255, 0.15)",
    },
    footerActionText: {
      color: "rgba(234, 245, 244, 0.65)",
      fontSize: "0.84rem",
    },
    footerActionLink: {
      color: "#00e5ff",
      fontWeight: "600",
      fontSize: "0.84rem",
      "&:hover": {
        color: "#72d9e8",
        textDecoration: "underline",
        textShadow: "0 0 10px rgba(0, 229, 255, 0.5)",
      },
    },
    identityPreview: {
      backgroundColor: "#051217",
      border: "1px solid rgba(0, 229, 255, 0.25)",
      borderRadius: "10px",
    },
    identityPreviewText: {
      color: "#eaf5f4",
    },
    identityPreviewEditButton: {
      color: "#00e5ff",
      "&:hover": {
        color: "#72d9e8",
      },
    },
  },
};

export const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to FlashRelief",
      subtitle: "Public Ledger & Civic Flood Disbursal System",
      actionLink: "Sign up",
    },
  },
  signUp: {
    start: {
      title: "Create FlashRelief Operator Seat",
      subtitle: "Decentralized Flood Intelligence & Multi-Sig Quorum",
      actionLink: "Sign in",
    },
  },
};
