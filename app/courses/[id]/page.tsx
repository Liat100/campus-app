"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { ArrowRight, AlertCircle, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, RotateCcw, Trash2 } from "lucide-react";

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const isNewCourse = courseId === "new";
  
  const { getCourseById, createCourse, updateCourse, isLoading } = useCourses();
  
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
    courseFolderLink: "",
  });

  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImageSizes, setShowImageSizes] = useState(false);
  const [showCourseFolder, setShowCourseFolder] = useState(false);
  const [showMissingFieldsDetails, setShowMissingFieldsDetails] = useState(false);
  const [hasEstimatedLaunchDate, setHasEstimatedLaunchDate] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        courseFolderLink: existingCourse.courseFolderLink || "",
      });
    }
  }, [existingCourse]);

  // Update hasEstimatedLaunchDate based on courseLaunchDate
  useEffect(() => {
    if (course.courseLaunchDate) {
      setHasEstimatedLaunchDate(true);
    } else {
      setHasEstimatedLaunchDate(false);
    }
  }, [course.courseLaunchDate]);

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

  const clearField = (field: keyof Course) => {
    handleInputChange(field, "");
  };

  // Auto-save function (only for existing courses) - triggered on blur
  const handleAutoSave = useCallback(async () => {
    if (isNewCourse || isLoading || !existingCourse) {
      return; // Don't auto-save new courses or while loading
    }

    try {
      await updateCourse(Number(courseId), {
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
        courseFolderLink: course.courseFolderLink,
      });
    } catch (error) {
      console.error("Error auto-saving course:", error);
    }
  }, [course, courseId, isNewCourse, isLoading, existingCourse, updateCourse]);

  const isFieldMissing = (fieldName: string) => {
    return missingFields.includes(fieldName);
  };

  const hasError = (field: string) => {
    return errors[field] !== undefined;
  };

  const isFieldComplete = (fieldName: string) => {
    return !isFieldMissing(fieldName);
  };

  const handleOpenCourseFolder = (fieldName: keyof Course) => {
    if (course.courseFolderLink) {
      window.open(course.courseFolderLink, '_blank');
      // Mark the field as completed by setting it to a non-empty value
      handleInputChange(fieldName, "uploaded");
    }
  };

  const showCertificateFields = course.type === "certificate";
  const showNewNameField = course.nameChangeRequired;

  const handleSendEmail = () => {
    const email = "liatk@experteam.co.il";
    const subject = `עדכון קורס: ${course.name || "ללא שם"}`;
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoLink;
  };

  const handleSave = async () => {
    // Validate with Zod
    const result = courseSchema.safeParse(course);
    if (!result.success) {
      console.error("Validation failed:", result.error.errors);
      return;
    }

    try {
      if (isNewCourse) {
        // Create new course
        const newCourse = await createCourse({
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
          courseFolderLink: course.courseFolderLink,
        });

        console.log("=== Course Created ===");
        console.log("Course ID:", newCourse.id);
        console.log("Course Data:", JSON.stringify(newCourse, null, 2));
        console.log("Ready for Launch:", isReady);
        console.log("======================");

        alert(`קורס חדש נשמר בהצלחה!\n\nשם הקורס: ${newCourse.name}\nID: ${newCourse.id}`);
      } else {
        // Update existing course
        const updatedCourse = await updateCourse(Number(courseId), {
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
          courseFolderLink: course.courseFolderLink,
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
    } catch (error) {
      console.error("Error saving course:", error);
      alert("שגיאה בשמירת הקורס. נסה שוב.");
    }
  };

  // Auto-save effect (only for existing courses, with debounce)
  useEffect(() => {
    if (isNewCourse || isLoading || !existingCourse) {
      return; // Don't auto-save new courses or while loading
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateCourse(Number(courseId), {
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
          courseFolderLink: course.courseFolderLink,
        });
      } catch (error) {
        console.error("Error auto-saving course:", error);
      }
    }, 2000); // Auto-save 2 seconds after last change

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [course, courseId, isNewCourse, isLoading, existingCourse, updateCourse]);

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
                <p className="text-sm font-medium text-indigo-950/80">
                  {existingCourse ? "עדכון פרטי עליה לאוויר עבור קורס:" : "קורס חדש"}
                </p>
                {existingCourse && course.name && (
                  <h1 className="text-2xl font-extrabold tracking-tight text-indigo-950">
                    {course.name}
                  </h1>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Explanation paragraph */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-right" dir="rtl">
          <p className="text-sm text-gray-700 leading-relaxed">
            זהו טופס עליה לאוויר עבור קורס {course.name ? <span className="font-semibold">{course.name}</span> : "חדש"}. יש למלא את שדות החובה בטופס ולשמור בכפתור בתחתית העמוד. ניתן לעדכן על סיום המילוי או על שאלות ביניים בכפתור שליחת מייל בתחתית העמוד.
          </p>
        </div>

        {/* Status Banner */}
        {isReady ? (
          <Card className="mb-6 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">הקורס מוכן להשקה! ✅</p>
                  <p className="text-sm text-emerald-700">
                    כל השדות החובה מולאו בהצלחה
                  </p>
                </div>
                {missingFields.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMissingFieldsDetails(!showMissingFieldsDetails)}
                    className="gap-2"
                  >
                    לפרטים החסרים
                    {showMissingFieldsDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">הקורס עדיין לא מוכן להשקה ❌</p>
                  {missingFields.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-red-700">
                        חסרים {missingFields.length} שדות חובה
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMissingFieldsDetails(!showMissingFieldsDetails)}
                        className="gap-1 h-7 px-2 text-xs"
                      >
                        לפרטים החסרים
                        {showMissingFieldsDetails ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {showMissingFieldsDetails && missingFields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-2">שדות חסרים:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                  שם הקורס <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("שם הקורס") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="name"
                    value={course.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={handleAutoSave}
                    className={
                      isFieldMissing("שם הקורס") || hasError("name")
                        ? "border-red-500"
                        : ""
                    }
                    placeholder="הכנס שם קורס"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => clearField("name")}
                    className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                    title="מחק את השדה"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {hasError("name") && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  האם נדרש לקורס שינוי שם?
                </Label>
                <div className="flex items-center gap-6 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="nameChangeNo"
                      name="nameChangeRequired"
                      value="no"
                      checked={!course.nameChangeRequired}
                      onChange={() => handleInputChange("nameChangeRequired", false)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="nameChangeNo" className="cursor-pointer">
                      לא
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="nameChangeYes"
                      name="nameChangeRequired"
                      value="yes"
                      checked={course.nameChangeRequired === true}
                      onChange={() => handleInputChange("nameChangeRequired", true)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="nameChangeYes" className="cursor-pointer">
                      כן
                    </Label>
                  </div>
                </div>
              </div>

              {showNewNameField && (
                <div className="mr-4 space-y-2 border-r-2 pr-4">
                  <Label htmlFor="newName">
                    שם חדש <span className="text-gray-500 font-normal">(שדה רשות)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="newName"
                      value={course.newName || ""}
                      onChange={(e) => handleInputChange("newName", e.target.value)}
                      onBlur={handleAutoSave}
                      placeholder="הכנס שם חדש"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => clearField("newName")}
                      className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                      title="מחק את השדה"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
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
                  סוג קורס <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={course.type && course.type !== "no_certificate" ? "text-emerald-500" : "text-red-500"}>*</span>
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
                        פירוט על מודל הציונים <span className="text-gray-500 font-normal">(חובה למלא אחד מהשדות)</span>
                      </Label>
                      <div className="flex items-start gap-2">
                        <Textarea
                          id="gradingPercentages"
                          value={course.gradingPercentages || ""}
                          onChange={(e) => handleInputChange("gradingPercentages", e.target.value)}
                          onBlur={handleAutoSave}
                          className={
                            isFieldMissing("מודל ציונים (חובה לקורס עם תעודה)")
                              ? "border-red-500"
                              : ""
                          }
                          placeholder="לדוגמא: 70% מבחן, 10% מטלה 1, 10% מטלה 2, 10% מטלה 3"
                          rows={3}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => clearField("gradingPercentages")}
                          className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 mt-1"
                          title="מחק את השדה"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {hasError("gradingPercentages") && (
                        <p className="text-sm text-red-500">{errors.gradingPercentages}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>או העלה קובץ מודל ציונים <span className="text-gray-500 font-normal">(חובה למלא אחד מהשדות)</span></Label>
                      <p className="text-sm text-gray-500">אנא העלה את הקובץ לתיקיית הקורס שבדרייב</p>
                      <Button
                        type="button"
                        onClick={() => handleOpenCourseFolder("gradingFile")}
                        disabled={!course.courseFolderLink}
                        variant="outline"
                        className="h-10 px-4 text-sm"
                      >
                        <ExternalLink className="ml-2 h-4 w-4" />
                        פתח תיקיית קורס
                      </Button>
                    </div>
                  </div>

                  {/* Certificate Logo and Signature */}
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-gray-700">פרטים הנדרשים לתעודה:</h4>
                    
                    <div className="space-y-4">
                      <h5 className="text-sm text-gray-700">פרטי החותם על התעודה:</h5>
                      <div className="space-y-2">
                        <Label htmlFor="signerRole">
                          תפקיד החותם והאירגון: <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("תפקיד החותם (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="signerRole"
                            type="text"
                            value={course.signerRole || ""}
                            onChange={(e) => handleInputChange("signerRole", e.target.value)}
                            onBlur={handleAutoSave}
                            placeholder="לדוגמה: מנכ&quot;ל במשרד הרווחה"
                            className={hasError("signerRole") ? "border-red-500" : ""}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => clearField("signerRole")}
                            className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                            title="מחק את השדה"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {hasError("signerRole") && (
                          <p className="text-sm text-red-500">{errors.signerRole}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signerName">
                          שם החותם: <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("שם החותם (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="signerName"
                            type="text"
                            value={course.signerName || ""}
                            onChange={(e) => handleInputChange("signerName", e.target.value)}
                            onBlur={handleAutoSave}
                            placeholder="לדוגמה: יוסף כהן"
                            className={hasError("signerName") ? "border-red-500" : ""}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => clearField("signerName")}
                            className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                            title="מחק את השדה"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {hasError("signerName") && (
                          <p className="text-sm text-red-500">{errors.signerName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          קובץ החתימה <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("חתימה על התעודה (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                        </Label>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className={isFieldComplete("חתימה על התעודה (חובה לקורס עם תעודה)") ? "text-emerald-500" : "text-red-500"}>*</span> יש לעלות את חתימת החותם על רקע שקוף
                        </p>
                        <p className="text-sm text-gray-500 mb-2">אנא העלה את הקובץ לתיקיית הקורס שבדרייב</p>
                        <Button
                          type="button"
                          onClick={() => handleOpenCourseFolder("certificateSignature")}
                          disabled={!course.courseFolderLink}
                          variant="outline"
                          className="h-10 px-4 text-sm"
                        >
                          <ExternalLink className="ml-2 h-4 w-4" />
                          פתח תיקיית קורס
                        </Button>
                      </div>

                      {/* Client Logo - optional */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          האם נדרש לוגו לקוח על התעודה? <span className="text-gray-500 font-normal">(שדה רשות)</span>
                        </Label>
                        <div className="flex items-center gap-6 space-x-reverse">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="radio"
                              id="clientLogoNo"
                              name="clientLogoRequired"
                              value="no"
                              checked={!course.clientLogoRequired}
                              onChange={() => handleInputChange("clientLogoRequired", false)}
                              className="cursor-pointer"
                            />
                            <Label htmlFor="clientLogoNo" className="cursor-pointer">
                              לא
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="radio"
                              id="clientLogoYes"
                              name="clientLogoRequired"
                              value="yes"
                              checked={course.clientLogoRequired === true}
                              onChange={() => handleInputChange("clientLogoRequired", true)}
                              className="cursor-pointer"
                            />
                            <Label htmlFor="clientLogoYes" className="cursor-pointer">
                              כן
                            </Label>
                          </div>
                        </div>
                        {course.clientLogoRequired && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500">אנא העלה את הקובץ לתיקיית הקורס בדרייב</p>
                            <Button
                              type="button"
                              onClick={() => {
                                if (course.courseFolderLink) {
                                  window.open(course.courseFolderLink, '_blank');
                                }
                              }}
                              disabled={!course.courseFolderLink}
                              variant="outline"
                              className="h-10 px-4 text-sm"
                            >
                              <ExternalLink className="ml-2 h-4 w-4" />
                              פתח תיקיית קורס
                            </Button>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800">
                                דורש בירור מול קמפוס
                              </p>
                            </div>
                          </div>
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
              <div className="space-y-4">
                <div className="flex items-center space-x-4 space-x-reverse">
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
                
                <div className="flex items-center space-x-4 space-x-reverse">
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
                
                <div className="flex items-center space-x-4 space-x-reverse">
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
                  <Label>
                    קובץ פרטי עמוד הבית <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("קובץ פרטי עמוד הבית (חובה כאשר נבחרה אפשרות זו)") ? "text-emerald-500" : "text-red-500"}>*</span>
                  </Label>
                  <p className="text-sm text-gray-500">אנא העלה את הקובץ לתיקיית הקורס שבדרייב</p>
                  <Button
                    type="button"
                    onClick={() => handleOpenCourseFolder("homePageFile")}
                    disabled={!course.courseFolderLink}
                    variant="outline"
                    className="h-10 px-4 text-sm"
                  >
                    <ExternalLink className="ml-2 h-4 w-4" />
                    פתח תיקיית קורס
                  </Button>
                </div>
              )}

              {course.homePageOption === "aboutFile" && (
                <div className="space-y-2">
                  <Label>
                    קובץ עמוד אודות <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("קובץ עמוד אודות (חובה כאשר נבחרה אפשרות זו)") ? "text-emerald-500" : "text-red-500"}>*</span>
                  </Label>
                  <p className="text-sm text-gray-500">אנא העלה את הקובץ לתיקיית הקורס שבדרייב</p>
                  <Button
                    type="button"
                    onClick={() => handleOpenCourseFolder("aboutFile")}
                    disabled={!course.courseFolderLink}
                    variant="outline"
                    className="h-10 px-4 text-sm"
                  >
                    <ExternalLink className="ml-2 h-4 w-4" />
                    פתח תיקיית קורס
                  </Button>
                </div>
              )}

              {course.homePageOption === "aboutLink" && (
                <div className="space-y-2">
                  <Label htmlFor="aboutPageLink">
                    קישור עמוד אודות <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("קישור עמוד אודות (חובה כאשר נבחרה אפשרות זו)") ? "text-emerald-500" : "text-red-500"}>*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="aboutPageLink"
                      type="text"
                      value={course.aboutPageLink || ""}
                      onChange={(e) => handleInputChange("aboutPageLink", e.target.value)}
                      onBlur={handleAutoSave}
                      placeholder="לדוגמה: https://example.com/about"
                      className={
                        isFieldMissing("קישור עמוד אודות (חובה כאשר נבחרה אפשרות זו)") ||
                        hasError("aboutPageLink")
                          ? "border-red-500"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => clearField("aboutPageLink")}
                      className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                      title="מחק את השדה"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {hasError("aboutPageLink") && (
                    <p className="text-sm text-red-500">{errors.aboutPageLink}</p>
                  )}
                </div>
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
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  האם יש לקורס תמונות שיווקיות מוכנות? <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("תמונות שיווקיות (חובה לסמן)") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
                <div className="flex items-center gap-6 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="marketingImagesNo"
                      name="marketingImagesAvailable"
                      value="no"
                      checked={!course.marketingImagesAvailable}
                      onChange={() => handleInputChange("marketingImagesAvailable", false)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="marketingImagesNo" className="cursor-pointer">
                      לא
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="marketingImagesYes"
                      name="marketingImagesAvailable"
                      value="yes"
                      checked={course.marketingImagesAvailable === true}
                      onChange={() => handleInputChange("marketingImagesAvailable", true)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="marketingImagesYes" className="cursor-pointer">
                      כן
                    </Label>
                  </div>
                </div>
              </div>

              {course.marketingImagesAvailable && (
                <div className="space-y-2">
                  <Label htmlFor="marketingImagesLink">קישור לתמונות שיווקיות <span className="text-gray-500 font-normal">(שדה רשות)</span></Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="marketingImagesLink"
                      type="url"
                      value={course.marketingImagesLink || ""}
                      onChange={(e) => handleInputChange("marketingImagesLink", e.target.value)}
                      onBlur={handleAutoSave}
                      placeholder="https://example.com/images"
                      className={hasError("marketingImagesLink") ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => clearField("marketingImagesLink")}
                      className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                      title="מחק את השדה"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {hasError("marketingImagesLink") && (
                    <p className="text-sm text-red-500">{errors.marketingImagesLink}</p>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => setShowImageSizes(!showImageSizes)}
                  className="mb-2 h-8 px-3 text-xs bg-gray-500 text-white hover:bg-gray-600"
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
                  פרטי יצירת קשר <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("פרטי לשונית תמיכה (חובה למלא)") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="supportContact"
                    type="text"
                    value={course.supportContact || ""}
                    onChange={(e) => handleInputChange("supportContact", e.target.value)}
                    onBlur={handleAutoSave}
                    placeholder="לדוגמה: support@example.com"
                    className={
                      isFieldMissing("פרטי לשונית תמיכה (חובה למלא)") || hasError("supportContact")
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => clearField("supportContact")}
                    className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                    title="מחק את השדה"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
              <CardTitle>הוספת סקרי שביעות רצון</CardTitle>
              <CardDescription>מעקב אחר הוספת סקרי שביעות רצון לקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  האם סקרי שביעות רצון הוכנסו לקורס? <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("הוספת סקרי שביעות רצון (חובה להוסיף לקורס ולאשר אחרי הוספה)") ? "text-emerald-500" : "text-red-500"}>*</span>
                </Label>
                <div className="flex items-center gap-6 space-x-reverse">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <input
                      type="radio"
                      id="surveysNo"
                      name="surveysAdded"
                      value="no"
                      checked={!course.surveysAdded}
                      onChange={() => handleInputChange("surveysAdded", false)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="surveysNo" className="cursor-pointer">
                      לא
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <input
                      type="radio"
                      id="surveysYes"
                      name="surveysAdded"
                      value="yes"
                      checked={course.surveysAdded === true}
                      onChange={() => handleInputChange("surveysAdded", true)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="surveysYes" className="cursor-pointer">
                      כן
                    </Label>
                  </div>
                </div>
                {course.surveysAdded === false && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      יש לזכור להוסיף סקרי שביעות רצון לפני עליה לאוויר
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Syllabus */}
          <Card>
            <CardHeader>
              <CardTitle>סילבוס קורס</CardTitle>
              <CardDescription>פרטי תכנית הלימודים של הקורס</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  האם יש צורך לעלות קובץ סילבוס מעוצב לעמוד הבית של הקורס? <span className="text-gray-500 font-normal">(שדה רשות)</span>
                </Label>
                <div className="flex items-center gap-6 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="syllabusNo"
                      name="syllabusRequired"
                      value="no"
                      checked={!course.syllabusRequired}
                      onChange={() => handleInputChange("syllabusRequired", false)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="syllabusNo" className="cursor-pointer">
                      לא
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="syllabusYes"
                      name="syllabusRequired"
                      value="yes"
                      checked={course.syllabusRequired === true}
                      onChange={() => handleInputChange("syllabusRequired", true)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="syllabusYes" className="cursor-pointer">
                      כן
                    </Label>
                  </div>
                </div>
              </div>

              {course.syllabusRequired && (
                <>
                  <div className="space-y-2">
                    <Label>
                      העלה מסמך סילבוס הכולל שעות לימוד לכל פרק ואחוז מהציון (במקרה של תעודה) <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)") ? "text-emerald-500" : "text-red-500"}>*</span>
                    </Label>
                    <p className="text-sm text-gray-500 mb-2">אנא העלה את הקובץ לתיקיית הקורס שבדרייב</p>
                    <Button
                      type="button"
                      onClick={() => handleOpenCourseFolder("syllabusFile")}
                      disabled={!course.courseFolderLink}
                      variant="outline"
                      className="h-10 px-4 text-sm"
                    >
                      <ExternalLink className="ml-2 h-4 w-4" />
                      פתח תיקיית קורס
                    </Button>
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="learningHours">
                        במידת הצורך פרט כאן על שעות הלמידה בקורס <span className="text-gray-500 font-normal">(שדה חובה)</span> <span className={isFieldComplete("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)") ? "text-emerald-500" : "text-red-500"}>*</span>
                      </Label>
                      <div className="flex items-start gap-2">
                        <Textarea
                          id="learningHours"
                          value={course.learningHours || ""}
                          onChange={(e) => handleInputChange("learningHours", e.target.value)}
                          onBlur={handleAutoSave}
                          placeholder="דוגמה: סה&quot;כ שעות 300 שעות, 20 שעות פרק 1, 50 שעות פרק 2, 30 שעות פרק 3, 40 שעות פרק 4..."
                          className={
                            isFieldMissing("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)")
                              ? "border-red-500"
                              : ""
                          }
                          rows={4}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => clearField("learningHours")}
                          className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 mt-1"
                          title="מחק את השדה"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                  <p className="text-sm text-gray-600 mt-2">
                    ניתן לספק אחת מהאופציות - לא נדרש למלא את שתיהן
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 8: Course Launch Date */}
          <Card>
            <CardHeader>
              <CardTitle>תאריך פתיחת קורס ללומדים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  האם יש צורך בתאריך משוער לפתיחת הקורס ללומדים? <span className="text-gray-500 font-normal">(שדה רשות)</span>
                </Label>
                <div className="flex items-center gap-6 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="hasEstimatedDateNo"
                      name="hasEstimatedLaunchDate"
                      value="no"
                      checked={!hasEstimatedLaunchDate}
                      onChange={() => {
                        setHasEstimatedLaunchDate(false);
                        handleInputChange("courseLaunchDate", undefined);
                      }}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="hasEstimatedDateNo" className="cursor-pointer">
                      לא
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="radio"
                      id="hasEstimatedDateYes"
                      name="hasEstimatedLaunchDate"
                      value="yes"
                      checked={hasEstimatedLaunchDate}
                      onChange={() => setHasEstimatedLaunchDate(true)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="hasEstimatedDateYes" className="cursor-pointer">
                      כן
                    </Label>
                  </div>
                </div>
                {hasEstimatedLaunchDate && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="courseLaunchDate">
                      באיזה תאריך יש לפתוח את הקורס ללומדים? <span className="text-gray-500 font-normal">(שדה רשות)</span>
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
                        className="w-auto"
                      />
                    </div>
                  </div>
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
                  פרטים נוספים <span className="text-gray-500 font-normal">(שדה רשות)</span>
                </Label>
                <div className="flex items-start gap-2">
                  <Textarea
                    id="additionalNotes"
                    value={course.additionalNotes || ""}
                    onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                    onBlur={handleAutoSave}
                    placeholder="הוסף פרטים נוספים, הערות או מידע נוסף על הקורס..."
                    className="min-h-[100px]"
                    dir="rtl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => clearField("additionalNotes")}
                    className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 mt-1"
                    title="מחק את השדה"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Folder Link Section - Collapsible */}
          <Card>
            {!showCourseFolder ? (
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                onClick={() => setShowCourseFolder(!showCourseFolder)}
              >
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCourseFolder(!showCourseFolder);
                    }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            ) : (
              <>
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg"
                  onClick={() => setShowCourseFolder(!showCourseFolder)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-normal">אין צורך לעדכן לשימוש פנימי בלבד</CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCourseFolder(!showCourseFolder);
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-right">
                  <div className="space-y-2">
                    <Label htmlFor="courseFolderLink">
                      קישור לתיקיית Drive <span className={isFieldComplete("קישור לתיקיית Drive") ? "text-emerald-500" : "text-gray-400"}>*</span>
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="courseFolderLink"
                        type="url"
                        value={course.courseFolderLink || ""}
                        onChange={(e) => handleInputChange("courseFolderLink", e.target.value)}
                        onBlur={handleAutoSave}
                        placeholder="https://drive.google.com/drive/folders/..."
                        className="flex-1"
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => clearField("courseFolderLink")}
                        className="h-8 w-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                        title="מחק את השדה"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (course.courseFolderLink) {
                            window.open(course.courseFolderLink, '_blank');
                          }
                        }}
                        disabled={!course.courseFolderLink}
                        variant="outline"
                        className="h-10 px-4 text-sm"
                      >
                        <ExternalLink className="ml-2 h-4 w-4" />
                        פתח תיקיית קורס
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSendEmail}
              className="px-6 font-semibold"
            >
              שלח עדכון למייל
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 font-semibold"
            >
              שמור
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
