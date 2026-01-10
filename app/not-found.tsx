import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8" dir="rtl">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-wide mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">הדף לא נמצא</p>
        <Link href="/">
          <Button>חזרה לדשבורד</Button>
        </Link>
      </div>
    </div>
  );
}
