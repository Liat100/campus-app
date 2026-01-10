"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Course, courseSchema } from "@/lib/types";
import { useCourses } from "@/lib/hooks/useCourses";
import { getMissingMandatoryFields, isCourseReadyForLaunch } from "@/lib/courseValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const isNewCourse = courseId === "new";
  
  const { getCourseById, createCourse, updateCourse, isLoading } = useCourses();
  
  // Refs for file inputs
  const gradingFileInputRef = useRef<HTMLInputElement>(null);
  const clientLogoInputRef = useRef<HTMLInputElement>(null);
  const certificateSignatureInputRef = useRef<HTMLInputElement>(null);
  const homePageFileInputRef = useRef<HTMLInputElement>(null);
  const aboutFileInputRef = useRef<HTMLInputElement>(null);
  const syllabusFileInputRef = useRef<HTMLInputElement>(null);
  
  // Find existing course or create new one
  const existingCourse = isNewCourse 
    ? null 
    : getCourseById(Number(courseId));

  const [course, setCourse] = useState<Partial<Course>>({
    name: "",
    type: "no_certificate",
    nameChangeRequired: false,
    newName: "",
    homePageOption: undefined,
    homePageFile: "",
    aboutFile: "",
    aboutPageLink: "",
    syllabusRequired: false,
    learningHours: "",
    syllabusFile: "",
    surveysAdded: false,
    gradingPercentages: "",
    gradingFile: "",
    marketingImagesAvailable: false,
    marketingImagesLink: "",
    clientLogoRequired: false,
    clientLogo: "",
    signerRole: "",
    signerName: "",
    certificateSignature: "",
    supportContact: "",
    courseLaunchDate: undefined,
    additionalNotes: "",
  });

  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImageSizes, setShowImageSizes] = useState(false);

  // Update form when existing course loads
  useEffect(() => {
    if (existingCourse) {
      setCourse({
        name: existingCourse.name || "",
        type: existingCourse.type || "no_certificate",
        nameChangeRequired: existingCourse.nameChangeRequired ?? false,
        newName: existingCourse.newName || "",
        homePageOption: existingCourse.homePageOption,
        homePageFile: existingCourse.homePageFile || "",
        aboutFile: existingCourse.aboutFile || "",
        aboutPageLink: existingCourse.aboutPageLink || "",
        syllabusRequired: existingCourse.syllabusRequired ?? false,
        learningHours: existingCourse.learningHours || "",
        syllabusFile: existingCourse.syllabusFile || "",
        surveysAdded: existingCourse.surveysAdded ?? false,
        gradingPercentages: existingCourse.gradingPercentages || "",
        gradingFile: existingCourse.gradingFile || "",
        marketingImagesAvailable: existingCourse.marketingImagesAvailable ?? false,
        marketingImagesLink: existingCourse.marketingImagesLink || "",
        clientLogoRequired: existingCourse.clientLogoRequired ?? false,
        clientLogo: existingCourse.clientLogo || "",
        signerRole: existingCourse.signerRole || "",
        signerName: existingCourse.signerName || "",
        certificateSignature: existingCourse.certificateSignature || "",
        supportContact: existingCourse.supportContact || "",
        courseLaunchDate: existingCourse.courseLaunchDate,
        additionalNotes: existingCourse.additionalNotes || "",
      });
    }
  }, [existingCourse]);

  useEffect(() => {
    const missing = getMissingMandatoryFields(course);
    setMissingFields(missing);
    setIsReady(isCourseReadyForLaunch(course));
    
    // Validate with Zod
    const result = courseSchema.safeParse(course);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        newErrors[field] = error.message;
      });
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  }, [course]);

  const handleInputChange = (field: keyof Course, value: any) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof Course, checked: boolean) => {
    setCourse((prev) => ({ ...prev, [field]: checked }));
  };

  const handleFileChange = (field: keyof Course, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange(field, file.name);
    }
  };

  const isFieldMissing = (fieldName: string) => {
    return missingFields.includes(fieldName);
  };

  const hasError = (field: string) => {
    return errors[field] !== undefined;
  };

  const isFieldComplete = (fieldName: string) => {
    return !isFieldMissing(fieldName);
  };

  const showCertificateFields = course.type === "certificate";
  const showNewNameField = course.nameChangeRequired;

  const handleSave = () => {
    // Validate with Zod
    const result = courseSchema.safeParse(course);
    if (!result.success) {
      console.error("Validation failed:", result.error.errors);
      return;
    }

    try {
      if (isNewCourse) {
        // Create new course
        const newCourse = createCourse({
          name: course.name!,
          type: course.type!,
          nameChangeRequired: course.nameChangeRequired ?? false,
          newName: course.newName,
          homePageOption: course.homePageOption,
          homePageFile: course.homePageFile,
          aboutFile: course.aboutFile,
          aboutPageLink: course.aboutPageLink,
          syllabusRequired: course.syllabusRequired ?? false,
          learningHours: course.learningHours,
          syllabusFile: course.syllabusFile,
          surveysAdded: course.surveysAdded ?? false,
          gradingPercentages: course.gradingPercentages,
          gradingFile: course.gradingFile,
          marketingImagesAvailable: course.marketingImagesAvailable ?? false,
          marketingImagesLink: course.marketingImagesLink,
          clientLogoRequired: course.clientLogoRequired ?? false,
          clientLogo: course.clientLogo,
          signerRole: course.signerRole,
          signerName: course.signerName,
          certificateSignature: course.certificateSignature,
          supportContact: course.supportContact,
          courseLaunchDate: course.courseLaunchDate,
          additionalNotes: course.additionalNotes,
        });

        console.log("=== Course Created ===");
        console.log("Course ID:", newCourse.id);
        console.log("Course Data:", JSON.stringify(newCourse, null, 2));
        console.log("Ready for Launch:", isReady);
        console.log("======================");

        alert(`קורס חדש נשמר בהצלחה!\n\nשם הקורס: ${newCourse.name}\nID: ${newCourse.id}`);
      } else {
        // Update existing course
        const updatedCourse = updateCourse(Number(courseId), {
          name: course.name,
          type: course.type,
          nameChangeRequired: course.nameChangeRequired,
          newName: course.newName,
          homePageOption: course.homePageOption,
          homePageFile: course.homePageFile,
          aboutFile: course.aboutFile,
          aboutPageLink: course.aboutPageLink,
          syllabusRequired: course.syllabusRequired,
          learningHours: course.learningHours,
          syllabusFile: course.syllabusFile,
          surveysAdded: course.surveysAdded,
          gradingPercentages: course.gradingPercentages,
          gradingFile: course.gradingFile,
          marketingImagesAvailable: course.marketingImagesAvailable,
          marketingImagesLink: course.marketingImagesLink,
          clientLogoRequired: course.clientLogoRequired,
          clientLogo: course.clientLogo,
          signerRole: course.signerRole,
          signerName: course.signerName,
          certificateSignature: course.certificateSignature,
          supportContact: course.supportContact,
          courseLaunchDate: course.courseLaunchDate,
          additionalNotes: course.additionalNotes,
        });

        if (updatedCourse) {
          console.log("=== Course Updated ===");
          console.log("Course ID:", updatedCourse.id);
          console.log("Course Data:", JSON.stringify(updatedCourse, null, 2));
          console.log("Ready for Launch:", isReady);
          console.log("======================");

          alert(`הקורס עודכן בהצלחה!\n\nשם הקורס: ${updatedCourse.name}`);
        } else {
          alert("שגיאה בעדכון הקורס");
          return;
        }
      }

      // Navigate back to dashboard
      router.push("/");
    } catch (error) {
      console.error("Error saving course:", error);
      alert("שגיאה בשמירת הקורס. נסה שוב.");
    }
  };

  // Show loading state while fetching course data
  if (!isNewCourse && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <p className="text-gray-500">טוען קורס...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 p-8 overflow-hidden">
      {/* Light triangles scattered behind cards */}
      <div className="pointer-events-none absolute -top-8 left-8 w-28 h-28 rotate-6 bg-purple-400/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-1/4 -left-6 w-36 h-36 -rotate-8 bg-indigo-300/10 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/5 w-24 h-24 rotate-3 bg-purple-400/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 -rotate-10 bg-indigo-300/10 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute bottom-[-3rem] right-1/4 w-28 h-28 rotate-8 bg-purple-400/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 w-22 h-22 rotate-12 bg-blue-400/6 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-2/3 left-2/3 w-26 h-26 -rotate-15 bg-purple-300/7 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-1/2 right-1/3 w-20 h-20 rotate-20 bg-indigo-400/6 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/2 w-24 h-24 -rotate-12 bg-purple-300/8 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="pointer-events-none absolute top-3/4 left-1/4 w-18 h-18 rotate-25 bg-blue-300/7 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button className="mb-4">
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה לדשבורד
            </Button>
          </Link>

          {/* Hero Banner for course editor - matching dashboard colors */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-indigo-50 bg-gradient-to-l from-indigo-200 via-indigo-100 to-transparent py-2 px-4 min-h-[60px] block">
            {/* Minimalist geometric triangles with glass effect - matching dashboard */}
            <div className="pointer-events-none absolute top-2 left-8 w-16 h-16 rotate-3 bg-indigo-400/10 opacity-60 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute bottom-2 left-32 w-18 h-18 -rotate-6 bg-purple-300/15 opacity-50 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute -top-6 left-1/2 w-12 h-12 rotate-12 bg-indigo-400/10 opacity-40 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute -bottom-8 right-8 w-16 h-16 -rotate-12 bg-purple-300/15 opacity-45 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute top-1/2 right-0 w-12 h-12 rotate-6 bg-indigo-400/10 opacity-35 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            {/* Extra scattered triangles for richer composition */}
            <div className="pointer-events-none absolute -top-4 right-16 w-10 h-10 rotate-12 bg-purple-300/15 opacity-40 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute top-16 left-1/3 w-8 h-8 -rotate-8 bg-indigo-400/10 opacity-35 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-12 h-12 rotate-3 bg-purple-300/15 opacity-30 backdrop-blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />

            {/* Title and course name - Right aligned, vertically centered */}
            <div className="relative flex items-center justify-start h-full text-right z-10" dir="rtl">
              <div className="space-y-1">
                <h1 className="text-xl font-extrabold tracking-tight text-indigo-950">
                  {existingCourse ? "עריכת קורס" : "קורס חדש"}
                </h1>
                {existingCourse && course.name && (
                  <p className="text-indigo-950 text-xs">
                    {course.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {isReady ? (
          <Card className="mb-6 border-emerald-200 bg-emerald-50">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-semibold text-emerald-900">הקורס מוכן להשקה! ✅</p>
                <p className="text-sm text-emerald-700">
                  כל השדות החובה מולאו בהצלחה
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">הקורס לא מוכן להשקה ❌</p>
                <p className="text-sm text-red-700">
                  {missingFields.length > 0 && (
                    <>חסרים {missingFields.length} שדות חובה: {missingFields.join(", ")}</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {/* Section 1: General Information */}
          <Card>
            <CardHeader>
              <CardTitle>מידע כללי</CardTitle>
              <CardDescription>פרטים בסיסיים על הקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="name">
                  שם הקורס <span className={isFieldComplete("שם הקורס") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
                <Input
                  id="name"
                  value={course.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={
                    isFieldMissing("שם הקורס") || hasError("name")
                      ? "border-red-500"
                      : ""
                  }
                  placeholder="הכנס שם קורס"
                />
                {hasError("name") && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="nameChangeRequired"
                  checked={course.nameChangeRequired ?? false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("nameChangeRequired", checked === true)
                  }
                />
                <Label
                  htmlFor="nameChangeRequired"
                  className={`cursor-pointer ${
                    isFieldMissing("האם נדרש שינוי שם") ? "text-red-500" : ""
                  }`}
                >
                  נדרש שינוי שם <span className={course.nameChangeRequired ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
              </div>

              {showNewNameField && (
                <div className="mr-4 space-y-2 border-r-2 pr-4">
                  <Label htmlFor="newName">
                    שם חדש <span className={isFieldComplete("שם חדש (נדרש כאשר נדרש שינוי שם)") ? "text-emerald-500" : "text-red-500"}>*</span>
                  </Label>
                  <Input
                    id="newName"
                    value={course.newName || ""}
                    onChange={(e) => handleInputChange("newName", e.target.value)}
                    className={
                      isFieldMissing("שם חדש (נדרש כאשר נדרש שינוי שם)")
                        ? "border-red-500"
                        : ""
                    }
                    placeholder="הכנס שם חדש"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Certificate Details */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי תעודה</CardTitle>
              <CardDescription>פרטי תעודה ועיצוב התעודה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="type">
                  סוג קורס <span className={course.type && course.type !== "no_certificate" ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
                <Select
                  value={course.type}
                  onValueChange={(value: "certificate" | "no_certificate") =>
                    handleInputChange("type", value)
                  }
                >
                  <SelectTrigger
                    className={`flex-row-reverse w-auto min-w-[140px] ${
                      isFieldMissing("סוג קורס") || hasError("type")
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="בחר סוג קורס" className="text-right" />
                  </SelectTrigger>
                  <SelectContent className="text-right">
                    <SelectItem value="certificate" className="text-right">עם תעודה</SelectItem>
                    <SelectItem value="no_certificate" className="text-right">ללא תעודה</SelectItem>
                  </SelectContent>
                </Select>
                {hasError("type") && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              {showCertificateFields && (
                <>
                  {/* Grading Model */}
                  <div className="mr-4 space-y-4 border-r-2 pr-4">
                    <div className="space-y-2">
                      <Label htmlFor="gradingPercentages">
                        פירוט על מודל הציונים <span className={isFieldComplete("מודל ציונים (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                      </Label>
                      <Textarea
                        id="gradingPercentages"
                        value={course.gradingPercentages || ""}
                        onChange={(e) => handleInputChange("gradingPercentages", e.target.value)}
                        className={
                          isFieldMissing("מודל ציונים (חובה לקורס עם תעודה)")
                            ? "border-red-500"
                            : ""
                        }
                        placeholder="לדוגמא: 70% מבחן, 10% מטלה 1, 10% מטלה 2, 10% מטלה 3"
                        rows={3}
                      />
                      {hasError("gradingPercentages") && (
                        <p className="text-sm text-red-500">{errors.gradingPercentages}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gradingFile">או העלה קובץ מודל ציונים</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          ref={gradingFileInputRef}
                          id="gradingFile"
                          type="file"
                          onChange={(e) => handleFileChange("gradingFile", e)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => gradingFileInputRef.current?.click()}
                          className={`h-8 px-3 text-xs bg-black text-white hover:bg-gray-800 ${
                            isFieldMissing("מודל ציונים (חובה לקורס עם תעודה)")
                              ? "border-2 border-red-500"
                              : ""
                          }`}
                        >
                          <Upload className="mr-1.5 h-3 w-3" />
                          העלאת קובץ
                        </Button>
                        {course.gradingFile && (
                          <Button
                            type="button"
                            onClick={() => {
                              // Create a temporary link to download the file
                              const link = document.createElement("a");
                              link.href = "#"; // In a real app, this would be the actual file URL
                              link.download = course.gradingFile as string;
                              link.click();
                            }}
                            className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                          >
                            <Download className="mr-1.5 h-3 w-3" />
                            הורד {course.gradingFile}
                          </Button>
                        )}
                      </div>
                      {hasError("gradingFile") && (
                        <p className="text-sm text-red-500">{errors.gradingFile}</p>
                      )}
                    </div>
                  </div>

                  {/* Certificate Logo and Signature */}
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-gray-700">פרטים הנדרשים לתעודה:</h4>
                    
                    <div className="space-y-4">
                      <h5 className="text-sm text-gray-700">פרטי החותם על התעודה:</h5>
                      <div className="space-y-2">
                        <Label htmlFor="signerRole">
                          תפקיד החותם: <span className={isFieldComplete("תפקיד החותם (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                        </Label>
                        <Input
                          id="signerRole"
                          type="text"
                          value={course.signerRole || ""}
                          onChange={(e) => handleInputChange("signerRole", e.target.value)}
                          placeholder="לדוגמה: מנהל מחלקת הדרכה"
                          className={hasError("signerRole") ? "border-red-500" : ""}
                        />
                        {hasError("signerRole") && (
                          <p className="text-sm text-red-500">{errors.signerRole}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signerName">
                          שם החותם: <span className={isFieldComplete("שם החותם (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                        </Label>
                        <Input
                          id="signerName"
                          type="text"
                          value={course.signerName || ""}
                          onChange={(e) => handleInputChange("signerName", e.target.value)}
                          placeholder="לדוגמה: יוסף כהן"
                          className={hasError("signerName") ? "border-red-500" : ""}
                        />
                        {hasError("signerName") && (
                          <p className="text-sm text-red-500">{errors.signerName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="certificateSignature">
                          קובץ החתימה <span className={isFieldComplete("חתימה על התעודה (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                        </Label>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className={isFieldComplete("חתימה על התעודה (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span> יש לעלות את חתימת החותם על רקע שקוף
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            ref={certificateSignatureInputRef}
                            id="certificateSignature"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange("certificateSignature", e)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => certificateSignatureInputRef.current?.click()}
                            className={`h-8 px-3 text-xs bg-black text-white hover:bg-gray-800 ${
                              hasError("certificateSignature") ? "border-2 border-red-500" : ""
                            }`}
                          >
                            <Upload className="mr-1.5 h-3 w-3" />
                            העלאת קובץ
                          </Button>
                          {course.certificateSignature && (
                            <Button
                              type="button"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = "#";
                                link.download = course.certificateSignature as string;
                                link.click();
                              }}
                              className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                            >
                              <Download className="mr-1.5 h-3 w-3" />
                              הורד {course.certificateSignature}
                            </Button>
                          )}
                        </div>
                        {hasError("certificateSignature") && (
                          <p className="text-sm text-red-500">{errors.certificateSignature}</p>
                        )}
                      </div>

                      {/* Client Logo - optional */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id="clientLogoRequired"
                            checked={course.clientLogoRequired ?? false}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("clientLogoRequired", checked === true)
                            }
                          />
                          <Label
                            htmlFor="clientLogoRequired"
                            className="cursor-pointer"
                          >
                            לוגו לקוח
                          </Label>
                        </div>
                        {course.clientLogoRequired && (
                          <div className="flex items-center gap-2">
                            <Input
                              ref={clientLogoInputRef}
                              id="clientLogo"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange("clientLogo", e)}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => clientLogoInputRef.current?.click()}
                              className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                            >
                              <Upload className="mr-1.5 h-3 w-3" />
                              העלאת קובץ
                            </Button>
                            {course.clientLogo && (
                              <Button
                                type="button"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = "#";
                                  link.download = course.clientLogo as string;
                                  link.click();
                                }}
                                className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                              >
                                <Download className="mr-1.5 h-3 w-3" />
                                הורד {course.clientLogo}
                              </Button>
                            )}
                          </div>
                        )}
                        {hasError("clientLogo") && (
                          <p className="text-sm text-red-500">{errors.clientLogo}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Course Home Page */}
          <Card>
            <CardHeader>
              <CardTitle>עמוד הבית</CardTitle>
              <CardDescription>תוכן עמוד הבית של הקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              {/* Radio buttons for selection */}
              <p className="text-sm text-gray-700 mb-3">
                בחר את אחת האפשרויות והעלה את הקבצים הרלוונטים <span className={isFieldComplete("בחירה בעמוד הבית (חובה לבחור אחת מהאפשרויות)") ? "text-emerald-500" : "text-red-500"}>*</span>
              </p>
              {isFieldMissing("בחירה בעמוד הבית (חובה לבחור אחת מהאפשרויות)") && (
                <p className="text-sm text-red-500 mb-2">חובה לבחור אחת מהאפשרויות</p>
              )}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="radio"
                    id="homePageFile"
                    name="homePageOption"
                    value="homePageFile"
                    checked={course.homePageOption === "homePageFile"}
                    onChange={(e) => {
                      const value = e.target.value as "homePageFile" | "aboutFile" | "aboutLink";
                      handleInputChange("homePageOption", value);
                    }}
                    className="ml-2"
                  />
                  <Label htmlFor="homePageFile" className="cursor-pointer">
                    העלאת קובץ פרטי עמוד הבית
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="radio"
                    id="aboutFile"
                    name="homePageOption"
                    value="aboutFile"
                    checked={course.homePageOption === "aboutFile"}
                    onChange={(e) => {
                      const value = e.target.value as "homePageFile" | "aboutFile" | "aboutLink";
                      handleInputChange("homePageOption", value);
                    }}
                    className="ml-2"
                  />
                  <Label htmlFor="aboutFile" className="cursor-pointer">
                    העלאת קובץ עמוד אודות
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="radio"
                    id="aboutLink"
                    name="homePageOption"
                    value="aboutLink"
                    checked={course.homePageOption === "aboutLink"}
                    onChange={(e) => {
                      const value = e.target.value as "homePageFile" | "aboutFile" | "aboutLink";
                      handleInputChange("homePageOption", value);
                    }}
                    className="ml-2"
                  />
                  <Label htmlFor="aboutLink" className="cursor-pointer">
                    הכנסת קישור עמוד אודות
                  </Label>
                </div>
              </div>

              {/* Conditional fields based on selection */}
              {course.homePageOption === "homePageFile" && (
                <div className="space-y-2">
                  <Label htmlFor="homePageFile">
                    קובץ פרטי עמוד הבית <span className={isFieldComplete("קובץ פרטי עמוד הבית (חובה כאשר נבחרה אפשרות זו)") ? "text-emerald-500" : "text-red-500"}>*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={homePageFileInputRef}
                      id="homePageFile"
                      type="file"
                      onChange={(e) => handleFileChange("homePageFile", e)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => homePageFileInputRef.current?.click()}
                      className={`h-8 px-3 text-xs bg-black text-white hover:bg-gray-800 ${
                        isFieldMissing("קובץ פרטי עמוד הבית (חובה כאשר נבחרה אפשרות זו)") ||
                        hasError("homePageFile")
                          ? "border-2 border-red-500"
                          : ""
                      }`}
                    >
                      <Upload className="mr-1.5 h-3 w-3" />
                      העלאת קובץ
                    </Button>
                    {course.homePageFile && (
                      <Button
                        type="button"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = "#";
                          link.download = course.homePageFile as string;
                          link.click();
                        }}
                        className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                      >
                        <Download className="mr-1.5 h-3 w-3" />
                        הורד {course.homePageFile}
                      </Button>
                    )}
                  </div>
                  {hasError("homePageFile") && (
                    <p className="text-sm text-red-500">{errors.homePageFile}</p>
                  )}
                </div>
              )}

              {course.homePageOption === "aboutFile" && (
                <div className="space-y-2">
                  <Label htmlFor="aboutFile">
                    קובץ עמוד אודות <span className={isFieldComplete("קובץ עמוד אודות (חובה כאשר נבחרה אפשרות זו)") ? "text-emerald-500" : "text-red-500"}>*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={aboutFileInputRef}
                      id="aboutFile"
                      type="file"
                      onChange={(e) => handleFileChange("aboutFile", e)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => aboutFileInputRef.current?.click()}
                      className={`h-8 px-3 text-xs bg-black text-white hover:bg-gray-800 ${
                        isFieldMissing("קובץ עמוד אודות (חובה כאשר נבחרה אפשרות זו)") ||
                        hasError("aboutFile")
                          ? "border-2 border-red-500"
                          : ""
                      }`}
                    >
                      <Upload className="mr-1.5 h-3 w-3" />
                      העלאת קובץ
                    </Button>
                    {course.aboutFile && (
                      <Button
                        type="button"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = "#";
                          link.download = course.aboutFile as string;
                          link.click();
                        }}
                        className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                      >
                        <Download className="mr-1.5 h-3 w-3" />
                        הורד {course.aboutFile}
                      </Button>
                    )}
                  </div>
                  {hasError("aboutFile") && (
                    <p className="text-sm text-red-500">{errors.aboutFile}</p>
                  )}
                </div>
              )}

              {course.homePageOption === "aboutLink" && (
                <div className="space-y-2">
                  <Label htmlFor="aboutPageLink">
                    קישור עמוד אודות <span className={isFieldComplete("קישור עמוד אודות (חובה כאשר נבחרה אפשרות זו)") ? "text-emerald-500" : "text-red-500"}>*</span>
                  </Label>
                  <Input
                    id="aboutPageLink"
                    type="text"
                    value={course.aboutPageLink || ""}
                    onChange={(e) => handleInputChange("aboutPageLink", e.target.value)}
                    placeholder="לדוגמה: https://example.com/about"
                    className={
                      isFieldMissing("קישור עמוד אודות (חובה כאשר נבחרה אפשרות זו)") ||
                      hasError("aboutPageLink")
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {hasError("aboutPageLink") && (
                    <p className="text-sm text-red-500">{errors.aboutPageLink}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Syllabus */}
          <Card>
            <CardHeader>
              <CardTitle>סילבוס קורס</CardTitle>
              <CardDescription>פרטי תכנית הלימודים של הקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="syllabusRequired"
                  checked={course.syllabusRequired ?? false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("syllabusRequired", checked === true)
                  }
                />
                <Label
                  htmlFor="syllabusRequired"
                  className={`cursor-pointer ${
                    isFieldMissing("תכנית לימודים נדרשת") ? "text-red-500" : ""
                  }`}
                >
                  סילבוס נדרש
                </Label>
              </div>

              {course.syllabusRequired && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="syllabusFile">
                      העלה מסמך סילבוס הכולל שעות לימוד לכל פרק ואחוז מהציון (במקרה של תעודה) <span className={isFieldComplete("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)") ? "text-emerald-500" : "text-red-500"}>*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={syllabusFileInputRef}
                        id="syllabusFile"
                        type="file"
                        onChange={(e) => handleFileChange("syllabusFile", e)}
                        className="hidden"
                      />
                        <Button
                          type="button"
                          onClick={() => syllabusFileInputRef.current?.click()}
                          className={`h-8 px-3 text-xs bg-black text-white hover:bg-gray-800 ${
                            isFieldMissing("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)")
                              ? "border-2 border-red-500"
                              : ""
                          }`}
                        >
                          <Upload className="mr-1.5 h-3 w-3" />
                          העלאת קובץ
                        </Button>
                        {course.syllabusFile && (
                          <Button
                            type="button"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = "#";
                              link.download = course.syllabusFile as string;
                              link.click();
                            }}
                            className="h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                          >
                            <Download className="mr-1.5 h-3 w-3" />
                            הורד {course.syllabusFile}
                          </Button>
                        )}
                    </div>
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="learningHours">
                        פירוט על שעות הלמידה בקורס <span className={isFieldComplete("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)") ? "text-emerald-500" : "text-red-500"}>*</span>
                      </Label>
                      <Textarea
                        id="learningHours"
                        value={course.learningHours || ""}
                        onChange={(e) => handleInputChange("learningHours", e.target.value)}
                        placeholder="דוגמה: סה&quot;כ שעות 300 שעות, 20 שעות פרק 1, 50 שעות פרק 2, 30 שעות פרק 3, 40 שעות פרק 4..."
                        className={
                          isFieldMissing("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)")
                            ? "border-red-500"
                            : ""
                        }
                        rows={4}
                      />
                    </div>

                  <p className="text-sm text-gray-600 mt-2">
                    ניתן לספק אחת מהאופציות - לא נדרש למלא את שתיהן
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 6: Marketing Images */}
          <Card>
            <CardHeader>
              <CardTitle>תמונות שיווקיות</CardTitle>
              <CardDescription>תמונות שיווקיות לקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="marketingImagesAvailable"
                  checked={course.marketingImagesAvailable ?? false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("marketingImagesAvailable", checked === true)
                  }
                  className={
                    isFieldMissing("תמונות שיווקיות (חובה לסמן)") ? "border-red-500" : ""
                  }
                />
                <Label 
                  htmlFor="marketingImagesAvailable" 
                  className={`cursor-pointer ${
                    isFieldMissing("תמונות שיווקיות (חובה לסמן)") ? "text-red-500" : ""
                  }`}
                >
                  תמונות שיווקיות זמינות <span className={isFieldComplete("תמונות שיווקיות (חובה לסמן)") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
              </div>

              {course.marketingImagesAvailable && (
                <div className="space-y-2">
                  <Label htmlFor="marketingImagesLink">קישור לתמונות שיווקיות</Label>
                  <Input
                    id="marketingImagesLink"
                    type="url"
                    value={course.marketingImagesLink || ""}
                    onChange={(e) => handleInputChange("marketingImagesLink", e.target.value)}
                    placeholder="https://example.com/images"
                    className={hasError("marketingImagesLink") ? "border-red-500" : ""}
                  />
                  {hasError("marketingImagesLink") && (
                    <p className="text-sm text-red-500">{errors.marketingImagesLink}</p>
                  )}
                  
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={() => setShowImageSizes(!showImageSizes)}
                      className="mb-2 h-8 px-3 text-xs bg-black text-white hover:bg-gray-800"
                    >
                      לחצו לראות את גדלי התמונות הנדרשים
                    </Button>
                    
                    {showImageSizes && (
                      <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-md border">
                        <p className="text-sm font-medium text-gray-700 mb-2">מידע על גדלי תמונות שיווקיות:</p>
                        <div className="text-sm text-gray-600 space-y-1 pr-4">
                          <p>תמונת הקורס: 500X250 (גודל עד 50 KB)</p>
                          <p>באנר דסקטופ: 1440X400 (גודל עד 60-80 KB)</p>
                          <p>באנר מובייל: 425X225 (גודל עד 50KB)</p>
                          <p>תמונה שיווקית: 1200X1200</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 7: Support */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי לשונית תמיכה</CardTitle>
              <CardDescription>פרטי יצירת קשר לתמיכה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="supportContact">
                  פרטי יצירת קשר <span className={isFieldComplete("פרטי לשונית תמיכה (חובה למלא)") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
                <Input
                  id="supportContact"
                  type="text"
                  value={course.supportContact || ""}
                  onChange={(e) => handleInputChange("supportContact", e.target.value)}
                  placeholder="לדוגמה: support@example.com"
                  className={
                    isFieldMissing("פרטי לשונית תמיכה (חובה למלא)") || hasError("supportContact")
                      ? "border-red-500"
                      : ""
                  }
                />
                {(isFieldMissing("פרטי לשונית תמיכה (חובה למלא)") || hasError("supportContact")) && (
                  <p className="text-sm text-red-500">
                    {errors.supportContact || "שדה זה חובה"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Surveys */}
          <Card>
            <CardHeader>
              <CardTitle>הוספת סקרי משוב</CardTitle>
              <CardDescription>מעקב אחר הוספת סקרי משוב לקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="surveysAdded"
                  checked={course.surveysAdded ?? false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("surveysAdded", checked === true)
                  }
                  className={
                    isFieldMissing("הוספת סקרי משוב (חובה לסמן)") ? "border-red-500" : ""
                  }
                />
                <Label 
                  htmlFor="surveysAdded" 
                  className={`cursor-pointer ${
                    isFieldMissing("הוספת סקרי משוב (חובה לסמן)") ? "text-red-500" : ""
                  }`}
                >
                  סקרי משוב נוספו <span className={isFieldComplete("הוספת סקרי משוב (חובה לסמן)") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Course Launch Date */}
          <Card>
            <CardHeader>
              <CardTitle>פתיחת קורס ללומדים</CardTitle>
              <CardDescription>תאריך פתיחת הקורס ללומדים</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="courseLaunchDate">
                  באיזה תאריך יש לפתוח את הקורס ללומדים?
                </Label>
                <div className="flex justify-start text-left">
                  <Input
                    id="courseLaunchDate"
                    type="date"
                    value={
                      course.courseLaunchDate
                        ? new Date(course.courseLaunchDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      handleInputChange("courseLaunchDate", date);
                    }}
                    className={`w-auto ${hasError("courseLaunchDate") ? "border-red-500" : ""}`}
                  />
                </div>
                {hasError("courseLaunchDate") && (
                  <p className="text-sm text-red-500">{errors.courseLaunchDate}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>פרטים נוספים</CardTitle>
              <CardDescription>פרטים נוספים ומידע נוסף על הקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">
                  פרטים נוספים
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={course.additionalNotes || ""}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  placeholder="הוסף פרטים נוספים, הערות או מידע נוסף על הקורס..."
                  className="min-h-[100px]"
                  dir="rtl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link href="/">
              <Button variant="outline">ביטול</Button>
            </Link>
            <Button
              onClick={handleSave}
              className="px-6 font-semibold"
            >
              שמור וחזור
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
