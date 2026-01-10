import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { Course } from '@/lib/types';

const COURSES_KEY = 'campus-courses';

// Helper function to serialize Course dates to strings for storage
// Handles both Date objects and ISO strings (which come from JSON.parse)
function serializeDateField(value: any): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    // Already a string (from JSON.parse), validate it's a valid ISO string
    // If it's already a valid ISO string, return as-is
    return value;
  }
  // If it's something else, try to convert to Date first, then to ISO string
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Ignore conversion errors
  }
  return undefined;
}

function serializeCourse(course: any): any {
  return {
    ...course,
    createdAt: serializeDateField(course.createdAt),
    courseLaunchDate: serializeDateField(course.courseLaunchDate),
  };
}

// Helper function to deserialize Course dates from strings
function deserializeCourse(courseData: any): Course {
  return {
    ...courseData,
    createdAt: courseData.createdAt ? new Date(courseData.createdAt) : undefined,
    courseLaunchDate: courseData.courseLaunchDate ? new Date(courseData.courseLaunchDate) : undefined,
  };
}

// GET method - Fetch all courses from KV
export async function GET() {
  try {
    const courses = await kv.get<Course[]>(COURSES_KEY);
    
    // If no courses exist, return empty array
    if (!courses) {
      return NextResponse.json([]);
    }
    
    // Deserialize dates for all courses
    const deserializedCourses = courses.map(deserializeCourse);
    
    return NextResponse.json(deserializedCourses);
  } catch (error) {
    console.error('Error fetching courses from KV:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST method - Save courses to KV
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate that body is an array
    if (!Array.isArray(body)) {
      console.error('POST /api/courses: Request body is not an array', { bodyType: typeof body });
      return NextResponse.json(
        { success: false, error: 'Request body must be an array of courses' },
        { status: 400 }
      );
    }
    
    console.log(`POST /api/courses: Received ${body.length} courses to save`);
    
    // Serialize dates for all courses before storing
    // At this point, dates from JSON.parse are already strings, serializeCourse handles both Date objects and strings
    const serializedCourses = body.map((course) => {
      try {
        return serializeCourse(course);
      } catch (courseError) {
        console.error('Error serializing course:', courseError, { courseId: course?.id, courseName: course?.name });
        throw courseError;
      }
    });
    
    // Save to KV
    await kv.set(COURSES_KEY, serializedCourses);
    
    console.log(`POST /api/courses: Successfully saved ${serializedCourses.length} courses to KV`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully saved ${serializedCourses.length} courses`,
      count: serializedCourses.length,
    });
  } catch (error) {
    console.error('Error saving courses to KV:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
