// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full min-h-[85vh] flex-grow flex items-center justify-center p-4">
            {children}
        </div>
    );
}