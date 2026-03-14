import os

# Target files
FILES = [
    r"c:\Users\김훈\Desktop\프로그램 개발\260223_명리학\frontend\src\app\admin\page.tsx",
    r"c:\Users\김훈\Desktop\프로그램 개발\260223_명리학\frontend\src\app\admin\experts\ExpertsManager.tsx"
]

# Replacement mapping (Dark -> Light Tarot Theme)
REPLACEMENTS = {
    # Backgrounds
    "bg-[#0a0710]": "bg-[#FDFBFA]",
    "bg-[#1a142d]/80": "bg-white",
    "bg-[#1a142d]": "bg-white",
    "bg-[#110e1b]": "bg-gray-50",
    "bg-[#d4af37]/10": "bg-gray-100",
    "bg-[#d4af37]/20": "bg-gray-100",
    "bg-white/5": "bg-gray-50",
    "bg-white/10": "bg-gray-100",
    
    # Borders
    "border-[#d4af37]/10": "border-gray-100",
    "border-[#d4af37]/20": "border-gray-200",
    "border-[#d4af37]/30": "border-gray-300",
    "border-[#d4af37]/40": "border-gray-300",
    "border-[#d4af37]/50": "border-gray-300",
    "border-[#d4af37]/60": "border-gray-300",
    "border-[#d4af37]": "border-[#4A5568]",
    "border-white/10": "border-gray-200",
    "border-white/5": "border-gray-100",
    
    # Text colors
    "text-amber-100": "text-gray-800",
    "text-amber-200": "text-gray-700",
    "text-amber-400": "text-[#4A5568]",
    "text-[#d4af37]": "text-[#4A5568]",
    "text-white/40": "text-gray-400",
    "text-white/50": "text-gray-500",
    "text-white/60": "text-gray-500",
    "text-white/70": "text-gray-600",
    "text-white/80": "text-gray-700",
    "text-white": "text-[#2D3748]",
    
    # Primary Buttons
    "bg-[#d4af37] text-black": "bg-[#4A5568] text-white",
    "bg-[#d4af37] text-white": "bg-[#4A5568] text-white",
    "bg-[#d4af37]": "bg-[#4A5568]",
    "text-[#111]": "text-white",
    
    # Gradients
    "from-[#d4af37] to-amber-500": "from-[#4A5568] to-gray-600",
    "hover:from-amber-400 hover:to-amber-300": "hover:from-gray-600 hover:to-gray-500",
    "hover:bg-amber-400": "hover:bg-gray-600",
}

for file_path in FILES:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path} - Not found")
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Apply all replacements sequentially
    for old, new in REPLACEMENTS.items():
        content = content.replace(old, new)

    # Some manual tricky fixes to prevent text-white bleeding on dark themes
    # specifically, `text-[#2D3748]` inside a dark charcoal `#4A5568` button needs to be white
    content = content.replace("bg-[#4A5568] text-[#2D3748]", "bg-[#4A5568] text-white")
    content = content.replace("text-white/50 hover:text-[#2D3748]", "text-gray-500 hover:text-gray-800")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Successfully themed: {file_path}")

print("Theme conversion script completed.")
