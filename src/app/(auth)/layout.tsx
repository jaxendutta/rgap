// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full flex-grow flex items-center justify-center p-4">
            {children}
        </div>
    );
}