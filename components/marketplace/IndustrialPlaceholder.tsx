interface IndustrialPlaceholderProps {
    className?: string;
}

export default function IndustrialPlaceholder({
    className = "",
}: IndustrialPlaceholderProps) {
    return (
        <div
            className={`flex items-center justify-center bg-movek-navy ${className}`}
        >
            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 opacity-30"
            >
                {/* Gear */}
                <path
                    d="M100 60C78 60 60 78 60 100C60 122 78 140 100 140C122 140 140 122 140 100C140 78 122 60 100 60ZM100 125C86.2 125 75 113.8 75 100C75 86.2 86.2 75 100 75C113.8 75 125 86.2 125 100C125 113.8 113.8 125 100 125Z"
                    fill="#1E3A5F"
                />
                <path
                    d="M112 92H108V88C108 86.9 107.1 86 106 86H94C92.9 86 92 86.9 92 88V92H88C86.9 92 86 92.9 86 94V106C86 107.1 86.9 108 88 108H92V112C92 113.1 92.9 114 94 114H106C107.1 114 108 113.1 108 112V108H112C113.1 108 114 107.1 114 106V94C114 92.9 113.1 92 112 92Z"
                    fill="#1E3A5F"
                />
                {/* Wrench */}
                <path
                    d="M155 45L145 55C140 50 133 48 126 50L140 64L136 68L122 54C120 61 122 68 127 73L117 83L121 87L131 77C136 82 143 84 150 82L136 68L140 64L154 78C161 71 162 60 155 53L155 45Z"
                    fill="#1E3A5F"
                    opacity="0.5"
                />
                {/* Base line */}
                <rect x="30" y="150" width="140" height="4" rx="2" fill="#1E3A5F" />
                <rect x="45" y="145" width="4" height="10" rx="1" fill="#1E3A5F" />
                <rect x="75" y="145" width="4" height="10" rx="1" fill="#1E3A5F" />
                <rect x="120" y="145" width="4" height="10" rx="1" fill="#1E3A5F" />
                <rect x="150" y="145" width="4" height="10" rx="1" fill="#1E3A5F" />
            </svg>
        </div>
    );
}
