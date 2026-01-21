import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { Course } from '@/lib/types';

export const dynamic = 'force-dynamic';

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
    // Check if KV environment variables are set
    const hasKvUrl = process.env.KV_REST_API_URL || process.env.KV_URL;
    if (!hasKvUrl) {
      console.error('[API GET] KV environment variables not set!');
      console.error('[API GET] KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'SET' : 'NOT SET');
      console.error('[API GET] KV_URL:', process.env.KV_URL ? 'SET' : 'NOT SET');
      return NextResponse.json(
        {
          success: false,
          error: 'KV environment variables not configured',
        },
        { status: 500 }
      );
    }

    console.log('[API GET] Fetching courses from KV...');
    const courses = await kv.get<Course[]>(COURSES_KEY);
    
    // If no courses exist, return empty array
    if (!courses) {
      console.log('[API GET] No courses found in KV');
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }
    
    console.log(`[API GET] Found ${courses.length} courses in KV`);
    
    // Deserialize dates for all courses
    const deserializedCourses = courses.map(deserializeCourse);
    
    return NextResponse.json(deserializedCourses, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[API GET] Error fetching courses from KV:', error);
    console.error('[API GET] Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[API GET] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}

// POST method - Save courses to KV
export async function POST(request: Request) {
  try {
    // Check if KV environment variables are set
    const hasKvUrl = process.env.KV_REST_API_URL || process.env.KV_URL;
    if (!hasKvUrl) {
      console.error('[API POST] KV environment variables not set!');
      console.error('[API POST] KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'SET' : 'NOT SET');
      console.error('[API POST] KV_URL:', process.env.KV_URL ? 'SET' : 'NOT SET');
      return NextResponse.json(
        {
          success: false,
          error: 'KV environment variables not configured',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate that body is an array
    if (!Array.isArray(body)) {
      console.error('[API POST] Request body is not an array', { bodyType: typeof body });
      return NextResponse.json(
        { success: false, error: 'Request body must be an array of courses' },
        { status: 400 }
      );
    }
    
    console.log(`[API POST] Received ${body.length} courses to save`);
    
    // Serialize dates for all courses before storing
    // At this point, dates from JSON.parse are already strings, serializeCourse handles both Date objects and strings
    const serializedCourses = body.map((course) => {
      try {
        return serializeCourse(course);
      } catch (courseError) {
        console.error('[API POST] Error serializing course:', courseError, { courseId: course?.id, courseName: course?.name });
        throw courseError;
      }
    });
    
    console.log('[API POST] Attempting to save to KV...');
    
    // Save to KV
    await kv.set(COURSES_KEY, serializedCourses);
    
    console.log(`[API POST] Successfully saved ${serializedCourses.length} courses to KV`);
    
    // Verify the save
    const verify = await kv.get<Course[]>(COURSES_KEY);
    console.log(`[API POST] Verification: ${verify?.length || 0} courses found in KV after save`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully saved ${serializedCourses.length} courses`,
      count: serializedCourses.length,
    });
  } catch (error) {
    console.error('[API POST] Error saving courses to KV:', error);
    console.error('[API POST] Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[API POST] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
