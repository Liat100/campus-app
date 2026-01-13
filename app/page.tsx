"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCourses } from "@/lib/hooks/useCourses";
import { getMissingMandatoryFields, isCourseReadyForLaunch } from "@/lib/courseValidation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CheckCircle2, XCircle, LayoutGrid, List, Pencil, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const router = useRouter();
  const { courses, isLoading, deleteCourse } = useCourses();
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("name");

  const handleNewCourse = () => {
    router.push("/courses/new");
  };

  const handleDeleteCourse = async (courseId: number, courseName: string) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את הקורס "${courseName}"?`)) {
      try {
        await deleteCourse(courseId);
        // Courses will automatically update from the hook
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("שגיאה במחיקת הקורס. נסה שוב.");
      }
    }
  };

  // Filter and sort courses
  const sortedCourses = useMemo(() => {
    // Filter courses by search query
    const filtered = courses.filter((course) =>
      course.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort courses
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "", "he");
      } else if (sortBy === "date") {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA; // Newest first
      } else if (sortBy === "status") {
        const isReadyA = isCourseReadyForLaunch(a);
        const isReadyB = isCourseReadyForLaunch(b);
        if (isReadyA === isReadyB) return 0;
        return isReadyA ? -1 : 1; // Ready first
      }
      return 0;
    });
  }, [courses, searchQuery, sortBy]);

  return (
    <div className="relative min-h-screen bg-gray-50 p-8 overflow-hidden" dir="rtl">
      {/* Global light triangles in the page background - scattered behind cards */}
      <div className="pointer-events-none absolute -top-10 left-10 w-32 h-32 rotate-6 bg-indigo-400/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-1/3 -left-8 w-40 h-40 -rotate-8 bg-purple-300/12 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-28 h-28 rotate-3 bg-indigo-400/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-36 h-36 -rotate-10 bg-purple-300/12 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute bottom-[-4rem] right-1/3 w-32 h-32 rotate-8 bg-indigo-400/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      {/* Additional scattered triangles */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 w-24 h-24 rotate-12 bg-blue-400/6 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-2/3 left-1/2 w-30 h-30 -rotate-15 bg-purple-400/7 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 w-26 h-26 rotate-20 bg-indigo-300/6 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/2 w-22 h-22 -rotate-12 bg-purple-300/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-3/4 left-2/3 w-20 h-20 rotate-25 bg-blue-300/7 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-1/5 right-1/3 w-18 h-18 -rotate-18 bg-indigo-400/6 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12">
          <div className="relative w-full overflow-hidden rounded-2xl bg-indigo-50 bg-gradient-to-l from-indigo-200 via-indigo-100 to-transparent py-12 px-8 min-h-[160px] block">
            {/* Minimalist geometric triangles with glass effect */}
            <div className="pointer-events-none absolute top-4 left-10 w-20 h-20 rotate-3 bg-indigo-400/10 opacity-60 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute bottom-4 left-40 w-24 h-24 -rotate-6 bg-purple-300/15 opacity-50 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute -top-10 left-1/2 w-16 h-16 rotate-12 bg-indigo-400/10 opacity-40 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute -bottom-12 right-12 w-20 h-20 -rotate-12 bg-purple-300/15 opacity-45 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute top-1/2 right-0 w-16 h-16 rotate-6 bg-indigo-400/10 opacity-35 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            {/* Extra scattered triangles for richer composition */}
            <div className="pointer-events-none absolute -top-6 right-24 w-12 h-12 rotate-12 bg-purple-300/15 opacity-40 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute top-24 left-1/3 w-10 h-10 -rotate-8 bg-indigo-400/10 opacity-35 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-16 h-16 rotate-3 bg-purple-300/15 opacity-30 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute top-1 bottom-1/2 right-1/3 w-14 h-14 rotate-[-10deg] bg-indigo-400/10 opacity-30 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />

            {/* Title & subtitle */}
            <div className="relative text-right">
              <h1 className="text-4xl font-extrabold tracking-tight text-indigo-950">
                צ'ק ליסט עליה לאוויר - קמפוס IL
              </h1>
              <p className="mt-2 text-indigo-950">
                ניהול ומעקב אחר סטטוס קורסים להשקה
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="חפש לפי שם קורס..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 w-full"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Select value={sortBy} onValueChange={(value: "name" | "date" | "status") => setSortBy(value)}>
                  <SelectTrigger className="w-[180px] text-right">
                    <SelectValue placeholder="מיין לפי" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="name" className="text-right">שם קורס</SelectItem>
                    <SelectItem value="date" className="text-right">תאריך יצירה</SelectItem>
                    <SelectItem value="status" className="text-right">סטטוס</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setIsGridView(!isGridView)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {isGridView ? (
                    <>
                      <List className="h-4 w-4" />
                      תצוגת רשימה
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="h-4 w-4" />
                      תצוגת רשת
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleNewCourse} 
                className="px-6"
              >
                <Plus className="ml-2 h-4 w-4" />
                קורס חדש
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">טוען קורסים...</div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 mb-6">אין קורסים במערכת</p>
            <Button 
              onClick={handleNewCourse}
            >
              צור קורס ראשון
            </Button>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 mb-6">לא נמצאו קורסים התואמים לחיפוש</p>
          </div>
        ) : (
          <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
            {sortedCourses.map((course) => {
              const missingFields = getMissingMandatoryFields(course);
              const isReady = isCourseReadyForLaunch(course);

              return (
                <Card 
                  key={course.id} 
                  className={`border-gray-200 bg-white hover:border-gray-400 transition-all text-right ${!isGridView ? "w-full" : ""}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/courses/${course.id}`} className="flex-1 hover:opacity-80 transition-opacity">
                        <CardTitle className="text-lg font-bold text-gray-900 leading-tight cursor-pointer">
                          {course.name || "ללא שם קורס"}
                        </CardTitle>
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-700 bg-white hover:bg-gray-50 text-gray-700"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteCourse(course.id, course.name || "ללא שם קורס");
                          }}
                          title="מחק קורס"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Link href={`/courses/${course.id}`} title="לחץ לעריכה">
                          <Button 
                            variant="outline"
                            size="icon"
                            className="border-gray-700 bg-white hover:bg-gray-50 text-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-start gap-2 text-sm">
                      <span className="text-gray-400">סוג קורס:</span>
                      <span className="font-medium">
                        {course.type === "certificate" ? "עם תעודה" : "ללא תעודה"}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">סטטוס משימות:</span>
                          <span className={isReady ? "text-gray-900" : "text-gray-500"}>
                            {isReady ? "הושלם" : `${missingFields.length} חסרים`}
                          </span>
                        </div>
                        {isReady ? (
                          <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100 border-none flex items-center gap-1.5 shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            מוכן
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-900 hover:bg-red-100 border-none flex items-center gap-1.5 shrink-0">
                            <XCircle className="h-4 w-4 text-red-600" />
                            בטיפול
                          </Badge>
                        )}
                      </div>

                      {!isReady && missingFields.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">פרטים להשלמה:</p>
                          <div className="flex flex-wrap gap-1">
                            {missingFields.slice(0, 3).map((field, i) => (
                              <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                                {field}
                              </span>
                            ))}
                            {missingFields.length > 3 && (
                              <span className="text-xs text-gray-400 self-center mr-1">+{missingFields.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}