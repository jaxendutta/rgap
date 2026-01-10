// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            {/* This centers the card in the middle of the screen */}
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}