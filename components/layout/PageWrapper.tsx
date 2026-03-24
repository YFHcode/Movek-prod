interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
    /** Remove default max-width constraint */
    fullWidth?: boolean;
    /** Remove default padding */
    noPadding?: boolean;
}

export default function PageWrapper({
    children,
    className = "",
    fullWidth = false,
    noPadding = false,
}: PageWrapperProps) {
    return (
        <main
            className={`min-h-[calc(100vh-4rem)] ${fullWidth ? "" : "mx-auto max-w-7xl"
                } ${noPadding ? "" : "px-4 py-8 sm:px-6 lg:px-8"} ${className}`}
        >
            {children}
        </main>
    );
}
